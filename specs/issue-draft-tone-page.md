`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. Happy to split into separate PRs — the page structure, the app
icons, and the custom-prompt move are independent.

## The problem

Tone holds five settings: one cleanup strength that applies everywhere, and four voices that
apply depending on which app you're typing in. The page shows one at a time behind a row of
tabs, so answering "what happens when I dictate into Slack?" costs five clicks. Reading your
settings is the thing people do often; changing them is rare. Four of the five tabs are also
the same screen, differing only in a few words and a row of app icons.

---

## 1. Before / after

| Before | After |
|---|---|
| ![before](URLBASE/before-index.png) | ![after](URLBASE/after-index.png) |

| | Before | After |
|---|---|---|
| See all five settings | 5 clicks, never on one screen | 1 screen, 0 clicks |
| Navigation | a custom-built tab strip | a list you click into, and the app's standard segmented control |
| Choosing which apps go where | repeated on all four tabs | once, on the group it applies to |
| Option layout | horizontal on one tab, vertical on the other four | one layout everywhere |
| Preview heading | "What lands", everywhere | "What lands in Messages" / "in Slack" / "in Gmail" |
| Which apps are in a group | a comma-separated list that runs out of room | overlapping icons, fixed width |
| The current voice | inside the tab you have to open | on the row, where you're already looking |
| Custom prompt | a large text box that pushed everything else off screen | its own page |
| A group set to "Off" | looks identical to one that's on | faded icons and a muted label |
| Wording | "Cleanup" named a tab, a heading, a toggle, and a control called "Strength" | "How much to fix" → "Strength" |

Every row now reads *name / the apps it covers / what it sounds like*, which is the shape
Wispr Flow and macOS System Settings both use — the answer sits where your eye already is,
instead of behind a click.

---

## 2. Strength → Custom

| Nothing written yet | Just switched to Custom | Writing the prompt |
|---|---|---|
| ![custom empty](URLBASE/after-custom-empty.png) | ![custom seeded](URLBASE/after-custom-seeded.png) | ![custom editor](URLBASE/after-custom-editor.png) |

Low, Medium and High can each show you a sample of what they do. Custom can't, because it
depends on instructions only you can write — and the honest handling of that gap is most of
the design here.

Switching to Custom copies the preset you were on into your prompt, so you start by editing
something that works rather than facing a blank page. While the prompt is still that preset,
we know exactly what it does, so the preview shows that preset's sample and a tooltip says
which one. Edit it and the preview drops to a generic line, because at that point we'd be
guessing. The prompt itself moved to its own page: as a text box on the main page it pushed
all four app groups off screen, for a setting most people never open.

One thing worth flagging: that copy is now **saved**, not held as an unsaved draft. Before,
you'd switch to Custom, see a full prompt, assume it was live — and nothing was actually
stored until you pressed Save.

---

## 3. Personal, Work, Email

| The row | The page behind it |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

These three behave identically, so they share one page design. The reason to give each its
own page isn't space — it's that a page belonging to Personal can say **"What lands in
Messages"**. A single shared page can only ever say "What lands", which is a vaguer answer to
the same question.

Choosing which apps belong to a group now happens on that group's page. Previously it
appeared on all four tabs at once, so moving Discord from Personal to Work meant first
working out which tab currently owned it.

On the row, the app icons overlap so the row stays the same width whether a group has two
apps or twenty. Apps you added yourself come first and built-in ones after, so if the list
gets long enough to collapse into "+2", the ones you chose deliberately aren't the first to
disappear.

---

## 4. Everywhere else

![everywhere else](URLBASE/after-everywhere-else.png)

This group is the catch-all, and it's the one that doesn't work like the others. It has no
"add an app" section, because adding an app to it is a contradiction — this group is defined
as everything the other three haven't claimed, so naming an app here would remove it. The
subtitle carries that instead: *"Used in every app that isn't listed under Personal, Work, or
Email."* The old wording, "anywhere that isn't a chat or email", missed anything you'd routed
elsewhere and made it sound like a category rather than a remainder.

---

## Note

**Separate bug, filing on its own.** Tone decides whether to show its "Cleanup is off"
banner from one setting, while the Models page treats cleanup as permanently on for
Freestyle Transcribe users and disables the toggle. So on the default setup, Tone tells you
to go turn on something Models won't let you touch. The fix is to work out "is cleanup
active" in one place and share it, rather than having two pages each decide for themselves.

## What's in and out

**In:** the page structure, the app icons and grouping, the custom-prompt page, and the
wording fixes above.

**Out**, because they're product decisions rather than layout ones:

- **The tone words themselves.** The four groups use twelve different words across four
  unrelated scales, and "Casual" means three different things depending on which group
  you're in. Worth collapsing onto one scale, but that changes saved settings and needs a
  migration.
- **The defaults.** Every group ships set to "Off", so the page does nothing until you visit
  it and turn something on.
- **One mislabelled option.** In Work, the setting saved as `friendly` is shown as
  "Enthusiastic" and described as "Upbeat and warm" — three different names for one thing.

Typecheck and Biome clean per `CONTRIBUTING.md`.
