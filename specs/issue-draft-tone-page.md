`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. Happy to split into separate PRs. The page structure, the app
icons, and the custom prompt move are independent.

## The problem

Tone holds five settings. One cleanup strength that applies everywhere, and four voices that
apply depending on which app you're typing in.

The page shows one at a time behind a row of tabs. So "what happens when I dictate into
Slack?" takes five clicks to answer. People read these settings far more often than they
change them. Four of the five tabs are also the same screen with different words on it.

---

## 1. Before / after

| Before | After |
|---|---|
| ![before](URLBASE/before-index.png) | ![after](URLBASE/after-index.png) |

| | Before | After |
|---|---|---|
| See all five settings | 5 clicks, never on one screen | 1 screen, 0 clicks |
| Navigation | a custom-built tab strip | a list you click into, plus the app's standard segmented control |
| Choosing which apps go where | repeated on all four tabs | once, on the group it applies to |
| Option layout | horizontal on one tab, vertical on the other four | the same everywhere |
| Which apps are in a group | a comma list that runs out of room | overlapping icons, fixed width |
| The current voice | inside the tab you have to open | on the row |
| Custom prompt | a large text box that pushed everything else off screen | its own page |
| A group set to "Off" | looks the same as one that's on | faded icons and a muted label |
| Wording | "Cleanup" named a tab, a heading, a toggle, and a control called "Strength" | "How much to fix" → "Strength" |

Each row reads name, then the apps it covers, then what it sounds like. Same shape Wispr Flow
and macOS System Settings use.

---

## 2. Strength → Custom

| Nothing written yet | Just switched to Custom | Writing the prompt |
|---|---|---|
| ![custom empty](URLBASE/after-custom-empty.png) | ![custom seeded](URLBASE/after-custom-seeded.png) | ![custom editor](URLBASE/after-custom-editor.png) |

Low, Medium and High each show a sample of what they do. Custom can't. It runs instructions
only you write.

Switching to Custom now copies the preset you were on and saves it. You start by editing
something that works. While the prompt is still that preset, the preview shows that preset's
sample and a tooltip names it. Edit the prompt and the preview falls back to a generic line.

Two things changed while building this.

You can no longer save an empty prompt. The server quietly falls back to the Low preset when
Custom has nothing behind it (`resolveBaseCleanupPrompt` in
`apps/server/src/lib/editor/prompts.ts`). Choosing "Custom" and silently getting Low is not
what anyone expects.

I also removed the "Reset to presets" link. It always reverted to Low without saying so, and
the plural label implied a choice it never offered. Strength on the index picks between the
three, one click away.

---

## 3. Personal, Work, Email

| The row | The page behind it |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

Each group gets its own page holding its four options and its app list. Choosing which apps
belong to a group happens there. Before, that control appeared on all four tabs at once, so
moving Discord from Personal to Work meant first working out which tab owned it.

The icons on the row overlap, so the row is the same width whether a group has three apps or
thirty. Past five they collapse into a "+2" you can hover to read. Apps you added yourself
come first, so the built-in ones are what gets hidden:

![overflow](URLBASE/after-overflow.png)

---

## 4. Everywhere else

![everywhere else](URLBASE/after-everywhere-else.png)

This group has no "add an app" section. You can't add an app to it. The group is whatever the
other three don't cover, so naming an app here would move it out.

The subtitle explains that instead. The old line said "anywhere that isn't a chat or email",
which missed anything you'd moved to another group.

---

## What's in and out

**In:** the page structure, the app icons and grouping, the custom prompt page, and the
wording fixes above.

**Out.** These are product calls, not layout ones, so I left them alone:

- **The tone words.** The four groups use twelve words across four unrelated scales. "Casual"
  means three different things depending on the group. Collapsing them onto one scale changes
  saved settings and needs a migration.
- **The defaults.** Every group ships set to "Off", so the page does nothing until you visit
  it and turn something on.
- **One mislabelled option.** In Work, the setting saved as `friendly` displays as
  "Enthusiastic" and is described as "Upbeat and warm".
- **The "Cleanup is off" banner.** Tone decides whether to show it from one setting. The
  Models page treats cleanup as permanently on for Freestyle Transcribe users and disables
  the toggle. So on the default setup Tone tells you to turn on something Models won't let
  you touch. It's a real bug and I'm filing it separately, since the fix is to work out "is
  cleanup active" in one place rather than anything on this page.

Typecheck and Biome clean per `CONTRIBUTING.md`.
