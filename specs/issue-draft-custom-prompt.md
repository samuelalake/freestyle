Splitting this out of #1, which covers the rest of the Tone page. This part has open
questions that one doesn't.

## The problem

Custom is one of four Strength options, alongside Low, Medium and High. Picking it opens a
large text box on the Tone page that pushes all four app groups off screen, for a setting
most people never open.

Low, Medium and High each show a sample of what they do. Custom can't, because it runs
instructions only you write.

---

## What I built

| Just switched to Custom | The prompt page |
|---|---|
| ![custom seeded](URLBASE/after-custom-seeded.png) | ![editor](URLBASE/after-custom-startfrom.png) |

The prompt moves to its own page at `/settings/tone/custom-prompt`. The Tone page keeps a
preview row with an `Edit` button that links to it.

Switching to Custom copies the preset you were on into the prompt and saves it, so you start
by editing something that works. While the prompt is still that preset, the preview shows
that preset's sample with a line underneath saying which one.

The old "Reset to presets" link switched Strength back to Low and left Custom altogether. It
never prefilled anything. It's now a **Start from a preset** menu: pick Low, Medium or High
and that text loads into the editor as a draft you can rework, staying in Custom. The draft
is left unsaved, since you'll want to edit it first.

Saving an empty prompt is blocked.

---

## Open questions

**What does the preview show once you've edited the prompt?** Right now it falls back to
"Your prompt decides how much to rewrite, tighten, or preserve." That's a description of the
setting sitting in a box labelled "What lands", where every other option shows a sample of
output. It's the weakest part of this. Options: run the prompt against the sample transcript
and cache it, drop the preview for edited prompts, or replace the box with something that
isn't shaped like a result.

**Does the "no prompt yet" state need to exist?** Switching to Custom fills the prompt, and
you can't save it empty, so there's no path to reach it. It's currently kept for anyone who
already had Custom selected with nothing written. I don't know whether anyone is in that
state and have no way to check, so this may be dead UI worth deleting.

**Should an empty prompt be possible at all?** The server falls back to the Low preset when
Custom has no prompt (`resolveBaseCleanupPrompt` in `apps/server/src/lib/editor/prompts.ts`).
Blocking the save is a client-side guard over a server-side fallback. Making the server
reject it, or making the fallback visible, would be firmer.

Typecheck and Biome clean per `CONTRIBUTING.md`.
