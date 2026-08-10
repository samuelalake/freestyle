`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app.

## 1. Before / after

| Before: Cleanup | Before: Personal | After |
|---|---|---|
| ![before cleanup](URLBASE/before-cleanup.png) | ![before personal](URLBASE/before-personal.png) | ![after](URLBASE/after-index.png) |

Before, two facets lived in one segmented control. One is cleanup, the other is how you sound
across apps. The redesign splits them into two sections.

"Cleanup" used to name a tab. The section is now "How much to fix" and the control is named
"Strength" to more accurately represent what this setting does.

The second section uses progressive disclosure and takes a preview-first approach. The root
page shows every group, the apps it covers, and what it currently sounds like. Editing happens
one level down, on the group's own page. That's the convention settings use on iOS and macOS.

---

## 2. Personal, Work, Email

| The row | The page behind it |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

Each group gets its own page holding its four options and its app list. Choosing which apps
belong to a group happens there.

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

## 4. Custom

| Before | After: the row | After: the page |
|---|---|---|
| ![before custom](URLBASE/before-cleanup-custom.png) | ![custom row](URLBASE/after-custom-row.png) | ![custom page](URLBASE/after-custom-startfrom.png) |

Custom used to open a text box that grew to fit the whole prompt. With a preset loaded that
made the page 7,694px tall, and everything else sat below the fold.

It's now `Custom…`, and selecting it takes you to its own page with the instructions of your
last preset pre-filled. That pre-fill only happens the first time, when you have nothing
written; after that your own prompt is what you come back to. Back on the root page, Custom
shows a row with the first line of your prompt.

Low, Medium and High each show a sample of what they do. Custom can't, since it runs
instructions only you write. The row says what's written and takes you to where you change
it.

The old "Reset to presets" link switched Strength back to Low and left Custom altogether.
It's now a **Start from a preset** menu: pick Low, Medium or High and that text loads into
the editor as a draft you can rework, staying in Custom. Users that want to change back to a
preset can use the control on the root page.

---

## What's in and out

**In:** the page structure, the app icons and grouping, the custom prompt page, and the
wording fixes above.

**Out.** These are product calls, not layout ones, so I left them alone:

- **The tone words.** The four groups use twelve words across four unrelated scales. "Casual"
  means three different things depending on the group.
- **The defaults.** Every group ships set to "Off", so the page does nothing until you visit
  it and turn something on.
- **One mislabelled option.** In Work, the setting saved as `friendly` displays as
  "Enthusiastic" and is described as "Upbeat and warm".
- **The "Cleanup is off" banner.** Tone shows a banner saying cleanup is off and points you
  to Models to turn it on. For Freestyle Transcribe users, Models already has it on and
  greyed out. The banner sends you to fix something you can't change. Separate bug.

Typecheck and Biome clean per `CONTRIBUTING.md`.
