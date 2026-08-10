`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. The custom prompt work is proposed separately in #2, since it
has open questions this doesn't.

## The problem

Tone holds five settings. One cleanup strength that applies everywhere, and four voices that
apply depending on which app you're typing in.

The page shows one at a time behind a row of tabs, so it's hard to tell what the page is
actually doing. There's no high level view. You click into each segment to build a picture of
your own setup, and even then you're holding four of the five in your head.

Four of the five tabs are also the same screen with different words on it.

---

## 1. Before / after

| Before | After |
|---|---|
| ![before](URLBASE/before-index.png) | ![after](URLBASE/after-index.png) |

The before shot is one group, "Everything else", taking a full screen. The other four
settings are somewhere behind the tabs.

The new page is progressive disclosure. The root page is the preview: every group, the apps
it covers, and what it currently sounds like. Editing happens one level down, on the group's
own page. That's the pattern iOS and macOS Settings use, and it fits how people use this
page, since you read these settings far more often than you change them.

Choosing which apps go where used to repeat on all four tabs. It now lives once, on the group
it applies to. The comma list of app names that ran out of room is now a row of overlapping
icons at a fixed width. A group set to "Off" shows faded icons and a muted label, so you can
tell it apart from one that's on without opening it.

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

![everywhere else](URLBASE/after-everywhere-else.png)

This group has no "add an app" section. You can't add an app to it. The subtitle explains
that instead. The old line said "anywhere that isn't a chat or email", which missed anything
you'd moved to another group.

---

## What's in and out

**In:** the page structure, the app icons and grouping, and the wording fixes above.

**Out.** These are product calls, not layout ones, so I left them alone:

- **The custom prompt.** Proposed separately in #2.
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
