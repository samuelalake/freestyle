`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. Happy to split into separate PRs; the page structure, the app
icons, and the custom-prompt move are independent.

## The problem

Tone holds five settings: one cleanup strength that applies everywhere, and four voices that
apply depending on which app you're typing in. The page shows one at a time behind a row of
tabs, so answering "what happens when I dictate into Slack?" takes five clicks. People read
these settings far more often than they change them. Four of the five tabs are also the same
screen with different words on it.

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
| Preview heading | "What lands" | "What lands in Messages" / "in Slack" / "in Gmail" |
| Which apps are in a group | a comma list that runs out of room | overlapping icons, fixed width |
| The current voice | inside the tab you have to open | on the row |
| Custom prompt | a large text box that pushed everything else off screen | its own page |
| A group set to "Off" | looks the same as one that's on | faded icons and a muted label |
| Wording | "Cleanup" named a tab, a heading, a toggle, and a control called "Strength" | "How much to fix" → "Strength" |

Every row now reads *name / the apps it covers / what it sounds like*, the same shape Wispr
Flow and macOS System Settings use.

---

## 2. Strength → Custom

| Nothing written yet | Just switched to Custom | Writing the prompt |
|---|---|---|
| ![custom empty](URLBASE/after-custom-empty.png) | ![custom seeded](URLBASE/after-custom-seeded.png) | ![custom editor](URLBASE/after-custom-editor.png) |

Low, Medium and High each show a sample of what they do. Custom can't, because it runs
instructions only you can write.

Switching to Custom now copies the preset you were on into your prompt and saves it, so you
start by editing something that works. While the prompt is still that preset we know what it
does, so the preview shows that preset's sample and a tooltip names it. Edit the prompt and
the preview falls back to a generic line, because past that point we would be guessing.

Two behaviours changed while working on this. The copied preset is saved rather than held as
an unsaved draft, so what you see is what runs. And you can no longer save an empty prompt:
the server quietly falls back to the Low preset when Custom has nothing behind it
(`resolveBaseCleanupPrompt` in `apps/server/src/lib/editor/prompts.ts`), which is not what
choosing "Custom" leads you to expect.

I also removed the "Reset to presets" link from this page. It always reverted to Low without
saying so, and its plural label implied a choice it never offered. The Strength control on
the index picks between Low, Medium and High, and it's one click away.

---

## 3. Personal, Work, Email

| The row | The page behind it |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

Giving each group its own page lets it name the app it's previewing. A page belonging to
Personal can say **"What lands in Messages"**; one shared page can only say "What lands".

Choosing which apps belong to a group now happens on that group's page. Before, it appeared
on all four tabs at once, so moving Discord from Personal to Work meant first working out
which tab owned it.

On the row the app icons overlap, so a group with two apps and a group with twenty take the
same width. Apps you added yourself come first and built-in ones after, so the ones you chose
deliberately are the last to collapse into "+2".

---

## 4. Everywhere else

![everywhere else](URLBASE/after-everywhere-else.png)

This group is the catch-all and it has no "add an app" section, because adding an app to it
is a contradiction: the group is everything the other three haven't claimed, so naming an app
here would remove it. The subtitle says so instead. The old wording, "anywhere that isn't a
chat or email", missed anything you'd routed elsewhere and read like a category rather than a
remainder.

---

## Note

Tone decides whether to show its "Cleanup is off" banner from one setting, while the Models
page treats cleanup as permanently on for Freestyle Transcribe users and disables the toggle.
On the default setup Tone tells you to go turn on something Models won't let you touch. The
fix is to work out "is cleanup active" in one place and share it. Filing separately.

## What's in and out

**In:** the page structure, the app icons and grouping, the custom-prompt page, and the
wording fixes above.

**Out**, as product decisions rather than layout ones:

- **The tone words.** The four groups use twelve words across four unrelated scales, and
  "Casual" means three different things depending on the group. Collapsing them onto one
  scale changes saved settings and needs a migration.
- **The defaults.** Every group ships set to "Off", so the page does nothing until you visit
  it and turn something on.
- **One mislabelled option.** In Work, the setting saved as `friendly` displays as
  "Enthusiastic" and is described as "Upbeat and warm".

Typecheck and Biome clean per `CONTRIBUTING.md`.
