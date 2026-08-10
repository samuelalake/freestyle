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

Every setting is now on one screen. Before it took five clicks and you still couldn't see
them together.

The tab strip is gone. In its place is a list you click into, and the app's standard
segmented control for Strength. Each row reads name, then the apps it covers, then what it
sounds like. Same shape Wispr Flow and macOS System Settings use.

Choosing which apps go where used to be repeated on all four tabs. It now lives once, on the
group it applies to. The comma list of app names that ran out of room is now a row of
overlapping icons that stays a fixed width. A group set to "Off" shows faded icons and a
muted label, so you can tell it apart from one that's on without opening it.

Two smaller fixes. The four option cards were laid out horizontally on one tab and
vertically on the other four; they match now. And "Cleanup" used to name a tab, a heading, a
toggle, and a control called "Strength". The section is now "How much to fix" and the control
is "Strength".

---

## 2. Strength → Custom

| Just switched to Custom | The tooltip on Edit | The prompt page |
|---|---|---|
| ![custom seeded](URLBASE/after-custom-seeded.png) | ![tooltip](URLBASE/after-custom-tooltip.png) | ![editor](URLBASE/after-custom-startfrom.png) |

The custom prompt now has its own page at `/settings/tone/custom-prompt`. Inline it was a
large text box that pushed all four app groups off screen, for a setting most people never
open. The index keeps a preview row with an `Edit` button that links to it.

Low, Medium and High each show a sample of what they do. Custom can't, because it runs
instructions only you write. Switching to Custom copies the preset you were on, so while the
prompt is still that preset the preview shows that preset's sample. Hovering `Edit` says
which one. Edit the prompt and the preview falls back to a generic line.

The old "Reset to presets" link switched Strength back to Low and left Custom altogether. It
never prefilled anything. It's now a **Start from a preset** menu: pick Low, Medium or High
and that text loads into the editor as a draft you can rework, staying in Custom. The draft
is left unsaved, since you'll want to edit it before it counts.

You can no longer save an empty prompt.

That leaves the "no prompt yet" state mostly unreachable, since switching to Custom fills it
and you can't save it empty. It's still there for anyone who already had Custom selected with
nothing written before this change.

---

## 3. Personal, Work, Email

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

## 4. Everywhere else

![everywhere else](URLBASE/after-everywhere-else.png)

This group has no "add an app" section. You can't add an app to it. The subtitle explains
that instead. The old line said "anywhere that isn't a chat or email", which missed anything
you'd moved to another group.

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
  you touch. Out of scope here since it's a bug in how the two pages disagree, not a layout
  question.

Typecheck and Biome clean per `CONTRIBUTING.md`.
