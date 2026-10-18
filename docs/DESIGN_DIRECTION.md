# Design direction: Floodlight

Mindtier is a ranked game for your mind. The new direction treats every session like a match
under floodlights: a dark arena, chalk-white type, scoreboard numbers, and one electric "go" colour.
Tier and domain colours are the only other light on the pitch. The light theme is the same match
played by day, on warm paper.

Research behind these choices: `DESIGN_RESEARCH.md`. Tokens live in `apps/mobile/src/theme/tokens.ts`
(app and web Daily Challenge) and `apps/web/src/app/globals.css` (website).

## 1. Palette

No purple-to-blue gradients, no navy. The field is warm black, so tier metals and domain hues glow.

| Role | Dark (Floodlight) | Light (Day match) | Use |
| --- | --- | --- | --- |
| `background` (field) | `#0F0D0B` | `#F1EBE1` | Screen background |
| `surface` (stand) | `#1A1714` | `#FAF6EF` | Plates, tickets |
| `surfaceRaised` | `#25211C` | `#FFFFFF` | Pressables, the plate in front |
| `surfaceSunken` | `#090807` | `#E5DDD0` | Tracks, wells, empty segments |
| `border` / `borderStrong` | `#332D27` / `#4A4239` | `#D6CCBC` / `#B9AD9A` | Inputs and dividers only, never around surfaces |
| `text` (chalk / ink) | `#F4EFE6` | `#15120F` | Primary text |
| `textMuted` | `#B7AD9E` | `#574E44` | Secondary text |
| `textFaint` | `#958C7E` | `#6B6256` | Captions, at least 4.5:1 on the field |
| `primary` (volt) | `#D7FF3A` face, `#8FAE12` lip | `#15120F` face, `#000000` lip | The one "go" action per screen |
| `onPrimary` | `#0F0D0B` | `#D7FF3A` | Label on the primary face |
| `primaryText` | `#D7FF3A` | `#4A5E00` | Links and active states on the field |
| `flare` (danger) | `#FF5B35` | `#C2361A` | Wrong answers, streak flame, destructive actions |
| `success` | `#D7FF3A` | `#3F6B00` | Correct, rating gains (always shown with a ▲ or ✓) |
| `spark` | `#FFC93D` | `#8A5600` | Streaks, Daily Challenge, rewards |
| `accent` (ice) | `#8FE3FF` | `#0A6C8C` | Info, duels |

Tier colours (`TIER_COLORS` in `packages/core`) and domain colours stay as they are; both were
already validated for contrast and colour-blind separation. They are re-checked against the new
fields in tests (`theme.test.ts`).

**Colour-blind safety.** Volt (very light) and flare (mid-tone) differ by more than 40 L*, so they
separate for protan and deutan vision too. Right and wrong are never shown by colour alone: they
also differ in icon (✓ / ✕), sound and haptic.

## 2. Type

| Voice | Face | Where |
| --- | --- | --- |
| Display | **Big Shoulders** 800/900, uppercase | Tier names, ratings, scores, headlines, buttons |
| Body | **Instrument Sans** 400/500/600/700 | Reading text, descriptions, settings |
| Data | **JetBrains Mono** 500/700, uppercase, +12 % tracking | Micro-labels: dates, units, captions over numbers |

All three are open-source (OFL) Google Fonts, bundled with the app through `@expo-google-fonts`, and
cover the Latin Extended set our six languages need.

Scale (`fontSize/lineHeight`): `mega 96/84` (the tier on Home and the reveal), `hero 64/58`,
`title 40/38`, `heading 28/28` (display), `subheading 20/26`, `body 16/23`, `label 14/19`,
`caption 12/16` (body), `micro 11/14` (mono). Display lines are tight on purpose; numbers use
tabular figures.

**Text scaling:** display text caps at 1.3× of the system font scale, body text at 2×. Layouts wrap
rather than truncate, and long words (German compounds) shrink to fit inside fixed plates.

## 3. Spacing and radius

- 4-point grid: `2 4 8 12 16 24 32 48`, plus a 20 px screen gutter.
- Radii are tight: `4` (pips, tags), `6` (buttons, tiles), `10` (plates), `14` (sheets).
  Only avatars and toggles are round. The 24 px soft radius of the old UI is gone.

## 4. Depth

1. **Tone steps, not borders.** Field → stand → raised. Surfaces have no outline.
2. **The lip.** Every pressable sits on a solid lip, a darker shade of its face (5 px for large
   buttons, 4 px for medium, 3 px for tiles). On press the face travels down onto the lip. That is
   the game-feel press.
3. **Light.** Hero elements (the tier badge, a tier-up) carry a coloured glow in their own tier
   colour. Nothing else glows.
4. **Grain.** A 160 px noise tile at 5 % (dark) or 4 % (light) over the field, so large areas feel
   printed rather than flat.

## 5. Motif: the slant

Speed and competition are built into shapes. Progress bars are segmented and skewed −12°.
Division pips are slanted bars. Score plates and the active tab carry a slanted volt highlight.
Mindtier's tier badge keeps its hexagon, now forged: bevelled faces, an inner rim and a specular
sweep.

## 6. Motion language

All motion runs on the UI thread with Reanimated 4 worklets. Nothing animates through React state.

| Name | Spring / timing | Used for |
| --- | --- | --- |
| `press` | damping 30, stiffness 700 | The face travelling onto its lip, under one frame |
| `release` | damping 14, stiffness 380 (slight overshoot) | Popping back |
| `enter` | damping 18, stiffness 200, mass 0.9; 24 px rise + fade; 40 ms stagger, 8 items at most | Screen content arriving |
| `slam` | damping 9, stiffness 160 | A tier badge or a result number landing |
| `roll` | 700 ms per digit strip, ease-out | Ratings, points, deltas |
| `flash` | 120 ms | The correct or wrong tint of the game stage |

Ceremonies have three beats: **anticipation** (dim, a held beat, a rising tone), **impact** (slam,
flash, shard burst, heavy haptic, sound), **settle** (numbers roll, details stagger in).
- Rating gain: the delta rolls, the segmented bar fills segment by segment, and a tick haptic fires
  per segment.
- Tier-up or placement reveal: the full three beats, slanted shards in the tier's colours.
- Streak: the flame plate punches in and its count rolls up.

Celebration particles are SVG and Reanimated (at most 36 shards, gone within 1.4 s). We chose not to
add Skia: it would add about 3 MB of WebAssembly to the web Daily Challenge and slow its cold
start, and the effects we need run at 60 fps without it.

**Reduced motion** (system setting or the in-app override): movement becomes a 120 ms fade, numbers
show their final value, and ceremonies keep their haptic and sound but drop the shards. No
information is lost.

## 7. Sound and haptics

| Moment | Sound | Haptic |
| --- | --- | --- |
| Any press | `tap` (soft click) | selection |
| Correct | `correct` (bright two-note) | light impact |
| Wrong | `wrong` (low thud) | error notification |
| Countdown, number roll | `tick` (throttled to 12 per second) | selection on each bar segment |
| Rating gain lands | `correct` | success notification |
| Tier-up, placement reveal | `rankup` (rising chord) | heavy impact on the slam, then success |
| Streak extended | `tick` ×3, rising | light impact ×3 |

Sounds follow the phone's silent mode and the in-app toggle; haptics follow their own toggle.

## 8. Accessibility bar

- Text contrast at least 4.5:1, or 3:1 for display text of 24 px and up; checked in tests.
- Touch targets at least 48 dp.
- Reduced motion and text scaling as above.
- Dark and light are both designed themes: the light theme uses an ink button with a volt label,
  because volt on paper would not be legible.
- Every chart and badge has an accessible label (existing `svgA11y`).

## 9. Screen principles

- **One hero, one action.** Home leads with the tier at `mega` size and the next match. The
  primary action is the only volt element.
- **Tickets, not rows.** Games appear as tall domain-coloured tickets with their own glyph art.
- **The stage.** In a game, the playfield is centred and fills the space; the top bar is a slim
  scoreboard (progress segments, level).
- **Results are an event.** The rating gain rolls in large type before the details.
