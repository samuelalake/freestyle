# Redesign: Tone page

Status: **Proposed** (awaiting review) · Scope: renderer-only · Target files:
`apps/electron/src/renderer/src/pages/tone.tsx`,
`apps/electron/src/renderer/src/components/tone-previews/`

---

## 1. Original brief

From [`ROADMAP.md`](../ROADMAP.md), Freestyle Core, item 3️⃣:

> Improve the UI. **Simplify the tones page.**

Product requirements the page has to keep satisfying:

1. Choose how much cleanup to apply (and write a custom instruction instead).
2. Choose how Freestyle sounds in personal chat, work chat, and email.
3. Choose how it sounds everywhere else.
4. Route a specific app or website into one of those groups.

Goal: same four capabilities, far less surface. Minimalist UI, minimal code.

---

## 2. What the page costs today

**2,439 lines across 9 files** for a surface that is really "pick a cleanup level,
then pick a voice."

| Piece | Lines | Needed by spec? |
|---|---:|---|
| `tone.tsx` — 5 tab panels, 2 banners, 2 panel components | 1,189 | core, but bloated |
| `tone-previews/app-marks.tsx` — brand marks for routed apps | 477 | yes (asset-shaped) |
| `tone-previews/app-assignments.tsx` — add/remove routing UI, rendered 4× | 394 | yes, but once — not per tab |
| `tone-previews/route-ownership.ts` — computes which tab owns an app | 153 | **symptom, not requirement** |
| `email` / `work-chat` / `text-message` / `note` / `cleanup` previews | 226 | yes |

---

## 3. Defects

| # | Defect | Evidence |
|---|---|---|
| 01 | **The four surfaces use four disjoint vocabularies.** 12 tone words, no shared axis. "Casual" appears in three of them meaning three different things (light punctuation / short and conversational / relaxed and light). A user cannot form "I sound casual" and set it once — they must learn four ladders. | `cleanup-tones.ts:6–35`; `en.json` `tone.*.cards.*.title` |
| 02 | **Nothing is on by default, so the page does nothing until you visit five tabs.** All four destination tones default to `off`. Someone who opens Tone, reads the subtitle, and leaves has configured nothing. | `cleanup-tones.ts:53–56` |
| 03 | **You can never see the configuration.** The page's state is five values; the tab bar shows one at a time. "What will Freestyle do in Slack?" cannot be answered without clicking to Work and reading the routes list. | `tone.tsx:544–650` |
| 04 | **Two orthogonal concepts are presented as five peers.** Cleanup intensity applies everywhere; destination tone applies per surface. The tab strip asserts a symmetry that does not exist — `Cleanup` is not a sibling of `Email`. | `tone.tsx:550–567` |
| 05 | **Routing is scattered across the tabs that routing decides.** `AppAssignments` renders inside all four panels. To move Discord from Personal to Work you must first know which tab owns it — which is why `route-ownership.ts` exists at all. | `tone.tsx:591–648`; `route-ownership.ts` |
| 06 | **One option has three different names.** The stored value is `friendly`, the label is "Enthusiastic", the description is "Upbeat and warm". | `cleanup-tones.ts:15` vs `en.json` `tone.work.cards.friendly` |
| 07 | **The tab strip is hand-rolled against the design system.** `DESIGN.md` §6 names `SegmentedControl` for segmented options, and it is used in Settings, Plugins, Onboarding, and the upgrade modal. Tone instead styles a raw `TabsList` with `rounded-full` + `data-active:bg-accent`. | `tone.tsx:549–566`; `DESIGN.md` §6 |
| 08 | **Four of the five tabs are the same screen.** Personal, Work, Email and Everything else render an identical 4-card stack plus preview, differing only in three words and a row of app icons. The tab bar is asking the user to navigate between four instances of one control. | observed on 0.7.1; `tone.tsx:582–649` |
| 09 | **The two layouts disagree.** Cleanup lays its four options out as a horizontal 4-across row; the other four tabs stack theirs vertically. Same control, same option count, two layouts, no reason. | observed on 0.7.1 |
| 10 | **There is room for all of it at once.** At a 1456px-wide window each tab fills roughly half the viewport height and leaves 250–370px of dead space below. The information that needs five clicks to read would fit on one screen with room to spare. | observed on 0.7.1 |
| 11 | **The page can be entirely inert and still fully interactive.** With cleanup off, every control still responds and saves — the page's own first line is "Cleanup is off … Your choices are saved until then." See §3.1: on the default Freestyle Transcribe path this banner is *wrong*, and its instruction cannot be followed. | `tone.tsx:534–542` |
| 12 | **"Cleanup" names three different things on one page.** It is a tab (`tabs.cleanup`), a section eyebrow (`cleanup.eyebrow`), and an on/off toggle for the whole feature (`cleanup.toggleLabel`) — while the control the tab actually contains is called **"Strength"** (`cleanup.strengthLabel`), and the section heading renames it a fourth time to "Tidy up as I talk." So the banner can say "Cleanup is off" while the Cleanup tab shows Medium selected. Both are true; together they are incoherent. | `en.json` `tone.tabs.cleanup`, `tone.cleanup.{eyebrow,toggleLabel,strengthLabel,title}` |

Defects 01–05 and 08–12 are the ones a user feels. 06–07 are cheap to fix alongside.

Defect 12 is the clearest single symptom of defect 04: the page is trying to present a
global on/off, a global intensity, and four local voices as one flat set of peers, and the
vocabulary buckles under it. Renaming the tab to **Strength** — matching the label the code
already uses — is a one-line fix worth doing whatever happens to the rest of this proposal.

### 3.1 A dead-end path, worth fixing on its own

Tone and Models disagree about whether cleanup is on, and they disagree exactly on the
path the roadmap wants every user to take.

- `models/index.tsx:339` passes `cleanupLocked={freestyleVoiceActive}` — cleanup is
  "locked on" whenever Freestyle Transcribe is the voice model, because it's included.
- `pair-card.tsx:38` therefore renders the toggle as on: `cleanupOn = cleanupLocked || llmCleanup`,
  and `pair-card.tsx:77` **disables** it (`toggleDisabled={cleanupLocked}`).
- `tone.tsx:534` gates on `llmCleanup` alone, so Tone shows "Cleanup is off. These strength
  and tone settings apply once you turn on AI cleanup in Models."

So a Freestyle Transcribe user is told to go turn on a setting that Models already shows as
on and does not let them touch. Reproduced live on 0.7.1.

The fix is to derive "is cleanup active" once and share it, rather than letting two pages
compute it from different inputs. Worth landing as its own PR ahead of this redesign, since
it is a bug rather than a design change.

---

## 4. What comparable apps do

Rather than invent a shape, I opened the two closest competitors — both dictation apps
solving the same problem — and Apple's own answer to per-app overrides.

**superwhisper — "Modes".** The direct analogue of destination tones. Its answer is a **flat
list you drill into**, not a tab strip: every mode is visible at once, with `+ Create mode`
to add one. Inside a mode, settings are grouped `label → right-aligned control` rows —
Preset, Language, Voice Model — and crucially **"Activate for apps" lives inside the mode it
applies to**, so routing is never scattered. Rarely-used settings sit behind a collapsed
"Advanced settings" disclosure. It fits roughly nine settings in the vertical space Freestyle
spends on one.

**Wispr Flow — Settings.** Sidebar nav, no tabs. Every row is `Label / current value as
subtitle / [Change]`:

```
Shortcuts     Hold ^ Ctrl + ⌥ Opt and speak.     [Change]
Microphone    Auto-detect (Headphones)           [Change]
Languages     English                            [Change]
```

The current value is always visible without opening anything. Its onboarding also asks by
**task** — "Write a message", "Draft an email", "Take a note" — rather than by abstract
category, which sidesteps defect 01 entirely.

**macOS System Settings → Notifications.** Global settings first (Show previews, Show
Notifications when…), then an "Application Notifications" list where **every row carries its
current value as a subtitle** — `Calendar / Badges, Sounds, Desktop, Time Sensitive`,
`App Store / Off`. You can read the entire configuration by scrolling once.

**Chrome → Site Settings → Notifications.** The most explicit of the four, and the closest to
§5.3. It names both halves in the UI:

- **"Default behavior"** — "Sites automatically follow this setting when you visit them",
  then a radio list.
- **"Customized behaviors"** — "Sites listed below follow a custom setting instead of the
  default", then the exceptions grouped by outcome, each with an `Add` button.

Worth being precise about how far this transfers. Chrome's framing is right *for Chrome* —
one default, sites that deviate. Freestyle has four groups and every app belongs to one, so
"exceptions" is the wrong word and an earlier draft of this spec was wrong to borrow it (see
§5.2). What does transfer is smaller and more durable: **Chrome puts its `Add` control
directly beside the list it adds to**, never in a separate section. So does superwhisper.

Four apps, four teams, one shape. Three takeaways, all of which the proposal follows:

1. **Neither competitor uses a horizontal tab strip for settings.** Both use a sidebar or a
   list, because the set of things being configured should be visible while you configure one.
2. **Current values are visible without navigating.** Freestyle requires five clicks to read
   five values.
3. **Routing lives with the thing it routes to**, in one place, not spread across the tabs
   that routing decides.

Worth noting for the separate hotkey issue: Wispr Flow renders modifiers as **glyph plus
word** (`^ Ctrl`, `⌥ Opt`) in both its home screen and its settings — shipping precedent in
the same product category for the legibility fix.

## 5. Proposal — one page, two sections, no tabs

The page becomes a single scrolling column at the standard ~760px measure,
following the page rhythm in `DESIGN.md` §7: title → one muted sentence → card →
`mt-7` + mono eyebrow per section.

### 5.1 `HOW MUCH TO FIX` — cleanup intensity

The existing `CleanupTonePanel` moves up as its own section, unchanged in
behaviour: Low / Medium / High / Custom, with the custom-prompt textarea
revealed under Custom. This is the only setting that already has a non-`off`
default (`medium`) and the only one that applies everywhere — it earns the top
slot and it stops pretending to be a peer of "Email" (defect 04).

### 5.2 `HOW YOU SOUND` — four surfaces, each owning its own apps

Four rows in one `Card`, hairline-divided. Each row is two lines — the name and a
`SegmentedControl` (defect 07) on top, that group's apps beneath:

```
Personal                              [ Off | Casual | Polished | Very casual ]
  ⬚ Messages   ⬚ WhatsApp   ⬚ Telegram        + Add app or site

Work                                  [ Off | Direct | Enthusiastic | Formal ]
  ⬚ Slack   ⬚ LinkedIn   ⬚ Discord   ⬚ notion.so    + Add app or site

Email                                 [ Off | Casual | Warm | Formal ]
  ⬚ Gmail   ⬚ Outlook   ⬚ Apple Mail   ⬚ Proton     + Add app or site

Everywhere else                       [ Off | Casual | Neutral | Professional ]
  Anything not listed above — no need to add apps here.
```

**Routing lives on the row, not in a separate section.** An earlier draft of this spec
pulled all assignments into one "Exceptions" table at the bottom, borrowing Chrome's
"Default behavior / Customized behaviors" framing. That was wrong on two counts:

- **The model doesn't map.** Chrome has one default and sites that deviate from it.
  Freestyle has four groups and every app belongs to exactly one — membership, not
  deviation. "Exceptions" imports a mental model the feature doesn't have.
- **It made the common action worse.** Adding an app to Work went from "you're looking at
  Work, press +" to "scroll to another section, press add, then pick Work from a dropdown."
  Two decisions where there was one. The current tabbed page gets this part right, and
  superwhisper agrees — its "Activate for apps" sits inside the mode it applies to.

So the existing per-destination `AppAssignments` behaviour is kept; it just renders on a row
instead of inside a tab panel, and all four are visible simultaneously (defects 03, 05).

`+ Add app or site` opens a popover anchored to its row. The destination is already implied
by which row was clicked, so there is no destination picker. Because an app belongs to
exactly one group, an app already assigned elsewhere shows its current group inline
("Currently Personal") and choosing it **moves** it. That is the one job
`route-ownership.ts` keeps; per-tab visibility filtering (`getVisibleBuiltinRouteIds`) goes
away. Chips carry an `×` on hover; removing a built-in returns it to Everywhere else rather
than deleting it.

Preview stays, but as **one** panel below the rows that reflects the row you last
touched — instead of five previews mounted in five tabs. Same preview components,
one mount point.

This kills the tab strip, `ToneTab`, `isToneTab`, and the per-tab `TabsContent` wiring.

### 5.3 Defaults

Ship a non-`off` default so the page means something on first visit (defect 02).
Recommended: `overall: "neutral"`, the other three `off` — i.e. Freestyle has a
baseline voice everywhere, and surface-specific voices stay opt-in. This is a
one-line change per constant and is the smallest move that makes the page do
something before it is configured.

---

## 6. The open question — should the four vocabularies merge?

Defect 01 is the deepest one, and fixing it properly is a **schema** change, not
a renderer change, so it is flagged rather than assumed.

Today `overall` is a fallback bucket ("destinations we don't recognise"). The
alternative model is that it becomes a **base voice** on one shared axis —
Casual / Neutral / Formal — and Personal / Work / Email become *deltas* from it,
defaulting to "Same as your voice". A user would then make **one** decision to
configure the whole product, and three optional ones to refine it.

That is a better product and a worse diff: it changes `cleanup-tones.ts`, the
server's `destination-style.ts`, and needs a migration for existing users' four
stored enums.

**Recommendation:** land §5 first (renderer-only, no migration, immediately
better), and treat the shared axis as a follow-up once the shape is agreed. Happy
to spec the migration separately if you want it in one go.

---

## 7. Non-goals

- Changing what any tone actually does to the text — prompt content in
  `cleanup-presets.ts` and `destination-style.ts` is untouched.
- Moving cleanup enable/disable off the Models page. The two banners
  (`CleanupDisabledBanner`, `CleanupNoModelBanner`) stay as they are.
- Adding new tones, surfaces, or per-app tone values.
- Touching Remix's use of tones (`get_tones`, PR #556).
- The mobile app.

---

## 8. How this gets verified

Against `DESIGN.md`: no new hues, `SegmentedControl` over hand-rolled controls,
mono eyebrows instead of `<h2>`s, hairline dividers, one olive accent word in the
title. Before/after screenshots of the real renderer in the PR, plus a first-run
screenshot showing the page is no longer inert.
