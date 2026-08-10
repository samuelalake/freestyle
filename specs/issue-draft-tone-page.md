# Draft issue for freestyle-voice/freestyle

Not posted. Review, then I'll open it (or you paste it yourself).

---

**Title:** Simplify the Tone page: replace the five-tab layout with an index and per-destination pages

---

Picking up `ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

I built this out and drove it in the app; screenshots below. Happy to split it into
smaller PRs if that's easier to review — the routing/facepile work and the page-structure
work are separable.

## The problem

Tone holds five values: one cleanup strength that applies everywhere, and four voices that
apply per destination. The page shows **one at a time**, behind a tab strip.

That charges a click to *read* a setting. Reading is the frequent act here — "what happens
when I dictate into Slack?" — and editing is the rare one. Five clicks to answer a question
about your own configuration, and no screen ever shows the whole thing.

Four of the five tabs are also the same screen: Personal, Work, Email and Everything else
render an identical option stack plus preview, differing in three words and a row of app
icons. The tab strip is asking you to navigate between four instances of one control.

Meanwhile there's room for all of it. At a 1456px window each tab left 250–370px of dead
space below the fold.

## Before / after

| | Before | After |
|---|---|---|
| Read all five values | 5 clicks, never on one screen | 1 screen, 0 clicks |
| Navigation | hand-rolled `TabsList` with `rounded-full` + `data-active:bg-accent` | list + drill-down, `SegmentedControl` for the one inline control |
| App routing UI | rendered 4×, once per tab | once, on the destination it routes to |
| Option layout | horizontal 4-across on Cleanup, vertical stack on the other four | one responsive grid |
| Preview heading | "What lands" on every tab | "What lands in Messages" / "in Slack" / "in Gmail" |
| Routed apps | comma-separated prose, truncates as apps are added | facepile, fixed width, `+N` overflow |
| Current voice | inside the tab you have to open | trailing value on the row |
| "Off" state | indistinguishable from on until you open the tab | dimmed facepile + muted value |
| Cleanup vocabulary | tab "Cleanup", eyebrow "Cleanup", toggle "Cleanup", control "Strength", heading "Tidy up as I talk" | "How much to fix" → "Strength" |

## What the shape is

**Index** — `Strength` inline with its before/after (it's global; it isn't a sibling of
"Email"), then one row per destination:

```
Personal                                          Off  ›
◉◉◉◉
```

Title, facepile below it, current voice as the trailing value. This follows Wispr Flow's
settings rows (`Label / value / [Change]`) and macOS System Settings — the value belongs
where the eye lands, not buried in a prose subtitle.

**Destination page** — `/settings/tone/:destination`. Voice options, a preview that can now
name the app it's previewing, and the routing UI for that destination only.

The drill-down is not new UI language: `plugins/` already does `/plugins/:slug` with the
same list → detail shape, so this reuses a pattern the app has rather than adding one.

## Why the preview heading matters more than it looks

A shared preview on a flat page can only say "What lands". Once each destination owns a
page, it can say **"What lands in Messages"** — which is the actual question the setting
answers. That's the clearest argument for drill-down over a single scrolling page: it isn't
about space, it's that per-destination context lets the copy get specific.

## On the "Cleanup is off" banner — kept, not removed

Flagging this because it's easy to assume it went away: **the banner is unchanged and now
renders in more places than before** (the index *and* every destination page, rather than
once at the top of a page you might be scrolled past).

There is a separate, real problem with it, which I'd rather file as its own issue than
bundle here:

- `models/index.tsx:339` passes `cleanupLocked={freestyleVoiceActive}` — cleanup is locked on
  whenever Freestyle Transcribe is the voice model, because it's included.
- `pair-card.tsx:38` therefore renders the toggle as on (`cleanupOn = cleanupLocked || llmCleanup`)
  and `pair-card.tsx:77` **disables** it.
- Tone gated on `llmCleanup` alone, so it said *"Cleanup is off. These strength and tone
  settings apply once you turn on AI cleanup in Models."*

So on the **default** path, Tone tells you to go turn on a setting that Models already shows
as on and won't let you touch. Reproduced live on 0.7.1. The fix is to derive "is cleanup
active" once and share it, rather than letting two pages compute it from different inputs —
a bug fix, not a design change, and it should land on its own.

## Defects this closes

03 (config never visible), 04 (global and per-destination presented as peers), 05 (routing
scattered across the tabs routing decides), 07 (tab strip bypasses the design system),
08 (four tabs are one screen), 09 (two layouts for one control), 10 (it all fits at once),
12 ("Cleanup" naming four things).

Deliberately **not** in scope, because they're product calls rather than layout ones:

- **01** — the four destinations use twelve tone words across four unrelated ladders, and
  "Casual" means three different things. Worth collapsing onto one scale, but that changes
  stored values and needs a migration.
- **02** — every destination defaults to `off`, so the page does nothing until you visit it.
  Changing defaults is a product decision.
- **06** — stored `friendly` is labelled "Enthusiastic" and described "Upbeat and warm".
  One-line fix, but it's a copy call.

## Verification

Typecheck and Biome clean per `CONTRIBUTING.md`. Driven in the running app: index → each
destination → change a value → back, confirming the index reflects the change (the two
routes each mount the settings hook, so saves write through to the `["settings"]` query
cache — otherwise the index re-seeds stale). Custom strength, the fallback page with no
routing UI, and the off-state dimming all checked.
