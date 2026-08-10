// One-off: capture Tone page screenshots for the redesign issue.
//
// The shell can't run `screencapture` (Screen Recording is granted to
// Claude.app, but the process here is a nested claude-code bundle macOS treats
// as a different identity). Electron's own debugger has no such problem, so we
// drive the renderer over CDP instead — which is also more deterministic than
// clicking, since each shot sets its state through the app's settings API and
// reloads rather than depending on where a button happened to be.
//
// Run the dev server with --remote-debugging-port=9222 first.

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WebSocket = require(
  `${root}/node_modules/.pnpm/ws@7.5.13/node_modules/ws`,
);

const CDP_PORT = 9222;
const OUT_DIR = `${root}/specs/media`;
const API = "http://127.0.0.1:4649/api";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mainTarget() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(
    (t) => t.type === "page" && !/bar\.html|pill\.html/.test(t.url ?? ""),
  );
  if (!page) throw new Error("main renderer target not found");
  return page.webSocketDebuggerUrl;
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.on("message", (raw) => {
      const msg = JSON.parse(raw);
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      msg.error ? entry.reject(new Error(msg.error.message)) : entry.resolve(msg.result);
    });
  }
  static connect(url) {
    return new Promise((res, rej) => {
      const socket = new WebSocket(url, { perMessageDeflate: false });
      socket.on("open", () => res(new Cdp(socket)));
      socket.on("error", rej);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function setSettings(entries) {
  for (const [key, value] of Object.entries(entries)) {
    const res = await fetch(`${API}/settings/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`PUT ${key} -> ${res.status}`);
  }
}

/**
 * Screenshot the app's content area.
 *
 * `clip` is in CSS pixels relative to the viewport; captureBeyondViewport lets
 * a page taller than the window come out whole rather than cut at the fold.
 */
async function shot(cdp, name, clip) {
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { ...clip, scale: 1 },
  });
  writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(data, "base64"));
  console.log(`  wrote ${name}.png`);
}

async function goto(cdp, path, settle = 1400) {
  // The renderer is a SPA — pushState + popstate moves the router without a
  // full reload, so React state and the settings cache survive between shots.
  await cdp.send("Runtime.evaluate", {
    expression: `history.pushState({}, '', ${JSON.stringify(path)}); dispatchEvent(new PopStateEvent('popstate'));`,
  });
  await sleep(settle);
}

async function reload(cdp, path, settle = 2600) {
  await cdp.send("Runtime.evaluate", {
    expression: `location.replace(${JSON.stringify(path)})`,
  });
  await sleep(settle);
}

/**
 * Tight box around the page's centred content column.
 *
 * Clipping to `main` leaves a wide dead margin (the column is `max-w-[1060px]`
 * inside a much wider pane) and a tall one (its height is the scroll area, not
 * the content). Measuring the column and its last child gives a crop that's
 * mostly page.
 */
const PAD = 28;
async function contentBox(cdp, selector) {
  const { result } = await cdp.send("Runtime.evaluate", {
    expression: selector
      ? `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      const r = el.getBoundingClientRect();
      return JSON.stringify({
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
      });
    })()`
      : `(() => {
      const main = document.querySelector('main') ?? document.body;
      const col = main.querySelector('[class*="max-w-"]') ?? main;
      const box = col.getBoundingClientRect();
      const kids = [...col.children].filter((n) => n.getBoundingClientRect().height > 0);
      const last = kids.at(-1);
      const bottom = last ? last.getBoundingClientRect().bottom : box.bottom;
      return JSON.stringify({
        x: Math.round(box.x), y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(bottom - box.y),
      });
    })()`,
    returnByValue: true,
  });
  const b = JSON.parse(result.value);
  return {
    x: Math.max(0, b.x - PAD),
    y: Math.max(0, b.y - PAD),
    width: b.width + PAD * 2,
    height: b.height + PAD * 2,
  };
}

const PRESET_MEDIUM = process.env.SEEDED_PROMPT ?? "";

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const cdp = await Cdp.connect(await mainTarget());
  await cdp.send("Page.enable");

  // A fixed viewport keeps every shot the same width regardless of how the
  // window happens to be sized on the machine running this.
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1180,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await sleep(600);

  const shots = JSON.parse(process.env.SHOTS ?? "[]");
  for (const s of shots) {
    console.log(`${s.name}: ${s.path}`);
    if (s.settings) await setSettings(s.settings);
    await reload(cdp, s.path);
    if (s.then) await goto(cdp, s.then);
    if (s.clickSelector) {
      await cdp.send("Runtime.evaluate", {
        expression: `document.querySelector(${JSON.stringify(s.clickSelector)})?.click()`,
      });
      await sleep(700);
    }
    if (s.hover) {
      // Radix tooltips open on real pointer events, so move the mouse rather
      // than dispatching a synthetic mouseenter.
      const { result } = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const el = document.querySelector(${JSON.stringify(s.hover)});
          const r = el.getBoundingClientRect();
          return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
        })()`,
        returnByValue: true,
      });
      const p = JSON.parse(result.value);
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y });
      await sleep(1200);
    }
    if (s.click) {
      await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const label = ${JSON.stringify(s.click)};
          const el = [...document.querySelectorAll('button,[role=tab]')]
            .find((n) => n.textContent?.trim() === label);
          el?.click();
          return !!el;
        })()`,
      });
      await sleep(900);
    }
    const box = await contentBox(cdp, s.selector);
    await shot(cdp, s.name, box);
  }

  await cdp.send("Emulation.clearDeviceMetricsOverride");
  cdp.socket.close();
  console.log("done");
}

main().catch((err) => {
  console.error("capture failed:", err.message);
  process.exit(1);
});
