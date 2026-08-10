Picking up `ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. Happy to split this — the page structure, the app-routing
facepile, and the custom-prompt move are separable PRs.

## The problem

Tone holds five values: one cleanup strength that applies everywhere, and four voices that
apply per destination. The page shows **one at a time**, behind a tab strip.

That charges a click to *read* a setting. Reading is the frequent act — "what happens when I
dictate into Slack?" — and editing is the rare one. Five clicks to answer a question about
your own configuration, and no screen ever shows the whole thing.

Four of the five tabs are also the same screen: Personal, Work, Email and Everything else
render an identical option stack plus preview, differing in three words and a row of app
icons. The tab strip asks you to navigate between four instances of one control.

Meanwhile there's room for all of it. At a 1456px window each tab left 250–370px of dead
space below the fold.

---

## 1. Before / after

| | Before | After |
|---|---|---|
| | ![before](URLBASE/before-index.png) | ![after](URLBASE/after-index.png) |
| Read all five values | 5 clicks, never on one screen | 1 screen, 0 clicks |
| Navigation | hand-rolled `TabsList` (`rounded-full` + `data-active:bg-accent`) | list + drill-down; `SegmentedControl` for the one inline control |
| App routing UI | rendered 4×, once per tab | once, on the destination it routes to |
| Option layout | horizontal 4-across on Cleanup, vertical stack on the other four | one responsive grid |
| Preview heading | "What lands" on every tab | "What lands in Messages" / "in Slack" / "in Gmail" |
| Routed apps | comma-separated prose, truncates as apps are added | facepile, fixed width, trailing `+N` |
| Current voice | inside the tab you have to open | trailing value on the row |
| Custom prompt | 160px monospace editor inline, pushing everything below the fold | its own page; index previews the result |
| "Off" state | indistinguishable from on until you open the tab | dimmed facepile + muted value |
| Cleanup vocabulary | tab "Cleanup", eyebrow "Cleanup", toggle "Cleanup", control "Strength", heading "Tidy up as I talk" | "How much to fix" → "Strength" |

The index row shape, which most of the above hangs off:

```
Personal                                          Off  ›
◉◉◉◉
```

Title, facepile beneath, current voice as the trailing value. This follows Wispr Flow's
settings rows (`Label / value / [Change]`) and macOS System Settings — the value belongs
where the eye lands, not buried in a prose subtitle.

---

## 2. Strength → Custom

Custom is the only option whose result can't be shown, because it depends on a prompt only
the user writes. Most of the thinking here is about not lying in that gap.

| Question | Decision | Why |
|---|---|---|
| Where does the prompt editor live? | Its own page, `/settings/tone/custom-prompt` | A 160px monospace editor plus preset dump outweighed every other control and pushed the four destination rows off screen — for a setting most people never open |
| What fills "What lands" then? | The **result**, same as every preset | It's the answer to "what happens when I speak". Showing the instruction there (an early build did) answers a different question |
| Which result, when the prompt is arbitrary? | The preset's sample, while the prompt is still byte-identical to the preset it was seeded from | At that moment we know exactly what it does. Once edited we can't know, so it falls back to a generic line and the tooltip says so |
| Does picking Custom seed the prompt? | Yes — from the preset you were on, **and it's saved** | Seeding avoids a blank page. Saving is the part that matters: it used to seed local draft state only, so you saw a full prompt, assumed it was live, and had nothing stored until you pressed Save |
| How do you get back to the editor? | `Edit` beside the `Custom` label, with the tooltip on it | The tooltip is what keeps the preview honest — it names the preset the sample belongs to and points at the way to change it |
| What if there's no prompt at all? | Empty state in the result column: *"Until you write one, nothing is applied."* | Reachable by clearing the prompt. Says plainly that the setting is inert rather than showing a sample that won't happen |

**Flow**

1. Strength → `Custom`. Prompt seeds from the preset you were on and saves.
2. Index shows the seeded preset's sample under "What lands", with `Custom` `[Edit]`.
3. Hovering `Edit` explains which preset the preview reflects.
4. `Edit` → prompt page. Placeholder shows the shape of a prompt; counter and Save below.
5. Edit and save → the index preview drops to the generic line, tooltip changes to match.
6. `Reset to presets` → back to Low and back to the index, since the page is then moot.

| Empty | Seeded | Editor |
|---|---|---|
| ![custom empty](URLBASE/after-custom-empty.png) | ![custom seeded](URLBASE/after-custom-seeded.png) | ![custom editor](URLBASE/after-custom-editor.png) |

---

## 3. Personal, Work, Email

Three destinations that behave identically, so one page shape serves all three
(`/settings/tone/:destination`).

| Question | Decision | Why |
|---|---|---|
| One scrolling page, or drill-down? | Drill-down, one page each | Not about space. A shared preview can only say "What lands"; a page that belongs to Personal can say **"What lands in Messages"** — the question the setting actually answers |
| Is drill-down new UI language? | No | `plugins/` already does `/plugins/:slug` with the same list → detail shape |
| Where does app routing live? | On the destination page, once | It was rendered in all four tabs. To move Discord from Personal to Work you first had to know which tab owned it — which is why `route-ownership.ts` exists |
| What shows on the index row? | Facepile of routed apps + current voice | Fixed width, so a destination with nine apps can't push its value off the edge. The old prose subtitle truncated |
| How do you tell an off destination from an on one? | Dimmed facepile + muted value | Without it, "routed and active" and "routed but silent" look identical until you open the page. See [open question](#open-questions) |
| Overflow when there are more apps than fit? | Three marks, then a trailing `+N` in its own slot | `+N` overlaid on a visible mark lies: four apps at max 3 reads "+1" while *two* are unreadable — the one it covers and the one it counts |

**Flow**

1. Index row shows name, routed apps, current voice.
2. Click → destination page: four voice options, a preview naming the app, routing below.
3. Change the voice → index reflects it on return.
4. `Where it's used` → add or remove an app; a re-add moves it from whichever group had it.

| Index row | Destination page |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

---

## 4. Everywhere else

The fallback, and the one destination that isn't like the others.

| Question | Decision | Why |
|---|---|---|
| Does it get an app-routing section? | No — removed | It's *defined* as whatever the other three don't claim. An "add an app" control there would be incoherent: adding an app is exactly what takes it out of this group |
| Then how does anyone know what it covers? | The page subtitle carries it: *"Used in every app that isn't listed under Personal, Work, or Email."* | An earlier draft said "anywhere that is not a chat or an email", which isn't encompassing — it misses anything routed away, and implies a category rather than a remainder |
| What does its index row show, with no facepile? | The same sentence, shortened | Keeps the four rows parallel without inventing icons for a group that has none |
| Does it get a per-app preview heading? | No, plain "What lands" | There's no single app to name — that's the point of the group |

**Flow**

1. Index row: name, "Any app we don't recognize", current voice.
2. Click → voice options and preview. Page ends there; nothing to route.

![everywhere else](URLBASE/after-everywhere-else.png)

---

## 5. The custom prompt is a redesign, not a new feature

Worth stating plainly since it's the one change that adds a route. Nothing new is stored or
computed:

- `cleanup_custom_prompt` already exists end to end — validated at
  `apps/server/src/routes/settings.ts:88`, consumed at
  `apps/server/src/lib/post-process.ts:125`, synced via `preferences-sync.ts`.
- The Electron editor already existed, inline in `pages/tone.tsx`.
- Mobile already has the same field inline in its own tone screen
  (`apps/mobile/src/app/(app)/(tabs)/tone.tsx`).

Same setting, same API, no migration. It does put Electron and mobile on different shapes —
mobile keeps the editor inline, which seems right for a phone, but flagging it rather than
letting it be discovered later.

---

## 6. On the "Cleanup is off" banner — kept, not removed

Easy to assume it went away: **it's unchanged, and now renders in more places than before**
(the index *and* every destination page, rather than once at the top of a page you might be
scrolled past).

There is a separate, real problem with it, which I'd rather file on its own:

- `models/index.tsx:339` passes `cleanupLocked={freestyleVoiceActive}` — cleanup is locked on
  whenever Freestyle Transcribe is the voice model, because it's included.
- `pair-card.tsx:38` therefore renders the toggle as on (`cleanupOn = cleanupLocked || llmCleanup`)
  and `pair-card.tsx:77` **disables** it.
- Tone gates on `llmCleanup` alone, so it says *"Cleanup is off. These strength and tone
  settings apply once you turn on AI cleanup in Models."*

On the **default** path, Tone tells you to go turn on a setting Models already shows as on
and won't let you touch. Reproduced live on 0.7.1. The fix is to derive "is cleanup active"
once and share it, rather than letting two pages compute it from different inputs — a bug
fix, not a design change.

---

## Open questions

**Dimming the facepile when a destination is off.** It's in because it's the only
at-a-glance signal separating "routed and active" from "routed but silent" — the trailing
value already says `Off`, but the row reads as live without it. The argument against is that
it dims real brand marks to make a point the text already makes, and at 24px the marks are
close to their legibility floor. Easy to drop (one prop) if the redundancy isn't wanted.

**Overflow cap.** Currently 3. With stock routing that puts Personal and Email at `+1`,
which hides an app to save ~24px. A cap of 4 or 5 would show every default configuration
whole and only overflow once someone adds custom routes. One constant in `AppMarkStack`.

---

## Defects this closes

03 (config never visible), 04 (global and per-destination presented as peers), 05 (routing
scattered across the tabs routing decides), 07 (tab strip bypasses the design system),
08 (four tabs are one screen), 09 (two layouts for one control), 10 (it all fits at once),
12 ("Cleanup" naming four things).

Deliberately **not** in scope — product calls rather than layout ones:

- **01** — the four destinations use twelve tone words across four unrelated ladders, and
  "Casual" means three different things. Worth collapsing onto one scale, but that changes
  stored values and needs a migration.
- **02** — every destination defaults to `off`, so the page does nothing until you visit it.
- **06** — stored `friendly` is labelled "Enthusiastic" and described "Upbeat and warm".

---

## Verification

Typecheck and Biome clean per `CONTRIBUTING.md`. Driven in the running app: index → each
destination → change a value → back, confirming the index reflects the change (both routes
mount the settings hook, so saves write through to the `["settings"]` query cache —
otherwise the index re-seeds stale). Custom seeding, the saved-seed preview, the tooltip,
the empty state, the fallback page, and off-state dimming all checked.

---
