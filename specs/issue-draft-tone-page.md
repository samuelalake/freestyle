`ROADMAP.md` → Freestyle Core → 3️⃣ *"Improve the UI. Simplify the tones page."*

Built and driven in the app. Happy to split into separate PRs — page structure, app-routing
facepile, and the custom-prompt move are independent.

## The problem

Tone holds five values: one cleanup strength that applies everywhere, four voices that apply
per destination. The page shows one at a time behind a tab strip, so reading your own
configuration costs five clicks — and reading is the frequent act, not editing. Four of the
five tabs are also the same screen, differing in three words and a row of app icons.

---

## 1. Before / after

| Before | After |
|---|---|
| ![before](URLBASE/before-index.png) | ![after](URLBASE/after-index.png) |

| | Before | After |
|---|---|---|
| Read all five values | 5 clicks, never on one screen | 1 screen, 0 clicks |
| Navigation | hand-rolled `TabsList` | list + drill-down, `SegmentedControl` |
| App routing UI | rendered 4×, once per tab | once, on the destination it routes to |
| Option layout | horizontal on Cleanup, vertical on the other four | one responsive grid |
| Preview heading | "What lands" everywhere | "What lands in Messages" / "in Slack" / "in Gmail" |
| Routed apps | prose list, truncates | facepile, fixed width, trailing `+N` |
| Current voice | inside the tab you have to open | trailing value on the row |
| Custom prompt | inline editor, everything else below the fold | its own page |
| "Off" state | looks identical to on | dimmed facepile + muted value |
| Vocabulary | "Cleanup" naming a tab, an eyebrow, a toggle, and a control called "Strength" | "How much to fix" → "Strength" |

Each row becomes `title / facepile / current voice ›`, which is the Wispr Flow and macOS
System Settings shape — the value sits where the eye lands rather than inside a tab.

---

## 2. Strength → Custom

| Empty | Seeded | Editor |
|---|---|---|
| ![custom empty](URLBASE/after-custom-empty.png) | ![custom seeded](URLBASE/after-custom-seeded.png) | ![custom editor](URLBASE/after-custom-editor.png) |

| Question | Decision | Why |
|---|---|---|
| Where does the editor live? | Its own page | Inline, it pushed all four destination rows off screen for a setting most people never open |
| What fills "What lands"? | The result, same as every preset | It answers "what happens when I speak". The instruction answers a different question |
| Which result, if the prompt is arbitrary? | The preset's sample, while the prompt is still identical to the preset it was seeded from | At that point we know exactly what it does |
| Once edited? | Generic line, and the tooltip says so | We can't preview it without running the model |
| Does picking Custom seed the prompt? | Yes, and it saves | It used to seed draft state only — you saw a full prompt, assumed it was live, and had nothing stored until you hit Save |
| Way back in? | `Edit` beside `Custom`, tooltip on it | The tooltip is what keeps the preview honest |

Custom is the only option whose result can't be shown, so the design is mostly about not
lying in that gap: preview the preset while the prompt still *is* that preset, say so on
hover, and fall back to a generic line the moment it diverges.

---

## 3. Personal, Work, Email

| Index row | Destination page |
|---|---|
| ![row](URLBASE/after-row-personal.png) | ![personal](URLBASE/after-personal.png) |

| Question | Decision | Why |
|---|---|---|
| Drill-down or one long page? | One page each, `/settings/tone/:destination` | A shared preview can only say "What lands". A page that belongs to Personal can say "What lands in Messages" |
| New UI language? | No | `plugins/` already does `/plugins/:slug` |
| Where does routing live? | On the destination it routes to | It was in all four tabs — to move Discord you first had to know which tab owned it |
| Order in the pile? | Apps you added first, built-in defaults after | Defaults are ones nobody chose; a route you added by hand shouldn't be the first thing hidden |
| Overflow? | 5 marks, then a trailing `+N` in its own slot | Overlaid on a visible mark the badge lies — 4 apps at max 3 reads "+1" while *two* are unreadable |

The three named destinations behave identically, so one page shape serves all three. The
real gain isn't space — it's that a page which belongs to one destination can name the app
it's previewing.

---

## 4. Everywhere else

![everywhere else](URLBASE/after-everywhere-else.png)

| Question | Decision | Why |
|---|---|---|
| App-routing section? | Removed | It's *defined* as whatever the other three don't claim. "Add an app" there is incoherent — adding one is what removes it from this group |
| So how does anyone know what it covers? | The subtitle: *"Used in every app that isn't listed under Personal, Work, or Email."* | "Anywhere that isn't a chat or email" missed anything routed away, and implied a category rather than a remainder |
| Per-app preview heading? | No, plain "What lands" | There's no single app to name |

The fallback is the one destination that isn't like the others, so it drops the section that
would contradict it and lets the subtitle carry the explanation.

---

## Notes

**Not a new feature.** `cleanup_custom_prompt` already exists end to end — validated in
`routes/settings.ts`, consumed in `lib/post-process.ts`, and already inline in mobile's tone
screen. Same setting, same API, no migration; only the presentation moves.

**Separate bug, filing on its own.** Tone gates its "Cleanup is off" banner on `llmCleanup`,
while Models locks cleanup on for Freestyle Transcribe users and disables the toggle. So on
the default path Tone tells you to go turn on a setting Models won't let you touch. Fix is
to derive "is cleanup active" once and share it.

**Open — facepile dimming.** In because it's the only at-a-glance signal between "routed and
active" and "routed but silent". Against: it dims real brand marks to repeat what the
trailing `Off` already says. One prop to drop.

## Scope

Closes defects 03, 04, 05, 07, 08, 09, 10, 12. Deliberately out: the twelve tone words
across four unrelated ladders (needs a migration), the all-`off` defaults, and
`friendly`/"Enthusiastic" — product calls, not layout ones.

Typecheck and Biome clean per `CONTRIBUTING.md`.
