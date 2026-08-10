`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. The custom prompt work is proposed separately in #2, since it
has open questions this one doesn't.

## 1. Before / after

| Before: Cleanup | Before: Personal | After |
|---|---|---|
| ![before cleanup](URLBASE/before-cleanup.png) | ![before personal](URLBASE/before-personal.png) | ![after](URLBASE/after-index.png) |

Before, two facets lived in one segmented control. One is cleanup, the other is how you
sound across apps. The redesign splits them into two sections.

The second section uses progressive disclosure and takes a preview-first approach. The root
page shows every group, the apps it covers, and what it currently sounds like. Editing
happens one level down, on the group's own page. That's the convention settings use on iOS
and macOS.

Two smaller fixes. The four option cards were laid out horizontally on one tab and vertically
on the other four; they match now. And "Cleanup" used to name a tab, a heading, a toggle, and
a control called "Strength". The section is now "How much to fix" and the control is
"Strength".

---

## 2. Personal, Work, Email

| The row | The page behind it |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

Each group gets its own page holding its four options and its app list. Choosing which apps
belong to a group happens there. Before, that control appeared on all four tabs at once, so
moving Discord from Personal to Work meant first working out which tab owned it.

The icons on the row overlap and reach a maximum size once more than five apps are added to
the group, so the row is the same width whether a group has six apps or thirty. The last app
you added shows first in the stack.

![overflow](URLBASE/after-overflow.png)

---

## 3. Everywhere else

| Before | After |
|---|---|
| ![before](URLBASE/before-index.png) | ![after](URLBASE/after-everywhere-else.png) |

This group has no "add an app" section. You can't add an app to it. The subtitle explains
that instead. The old line said "anywhere that isn't a chat or email", which missed anything
you'd moved to another group.

---

## What's in and out

**In:** the page structure, the app icons and grouping, and the wording fixes above.

**Out.** These are product calls, not layout ones, so I left them alone:

- **The custom prompt.** Proposed separately in #2. That one should land first or alongside
  this, since Custom's editor sitting inline is what pushes the app groups off screen.
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
  you touch. Out of scope here since it's a bug in how the two pages disagree, not a layout
  question.

Typecheck and Biome clean per `CONTRIBUTING.md`.
