# Design research

Study done on 2026-10-18 before the Floodlight redesign (see `DESIGN_DIRECTION.md`).
Sources: the react-bits component library, Awwwards (Sites of the Day, Honorable Mentions,
Games and Mobile & Apps categories) and the top-grossing games on Google Play.
We took principles, not code or layouts: nothing below is copied.

## 1. react-bits (github.com/DavidHDev/react-bits, commit 310fc73)

**License:** MIT + Commons Clause. Components may be used inside an app or website, including
commercially, as long as the copyright notice travels with the code and the components themselves
are not sold or redistributed. **Decision:** we reuse no react-bits code. Every component in Mindtier
is written from scratch for React Native and Reanimated; the library was a study reference only, so
no attribution file is needed.

What the best components do, and the principle we take from each:

| Component | How it is built | Principle for Mindtier |
| --- | --- | --- |
| Magnet, TiltedCard | A spring integrator (stiffness 170, damping 16, mass 1) runs in `requestAnimationFrame` and writes `transform` straight to the DOM. React never re-renders per frame. Pointer events only, touch ignored, passive listeners. | Animate on the UI thread only (Reanimated shared values), never through React state. Hover effects belong to pointers; touch gets press feedback instead. |
| Counter | Each digit is a vertical strip of 0–9 that springs to its target, with a short motion blur and a fade mask at the window edges. `tabular-nums` keeps the width fixed, so nothing shifts. | Ratings and points roll per digit with tabular figures. Numbers never reflow layout while they animate. |
| ClickSpark | A canvas burst of 8–32 sparks with spring, gravity and glow. It caps active bursts at 32 and shortens to 320 ms under reduced motion. | Celebrations are short, capped and physical (gravity, drag), with a reduced-motion version rather than none. |
| HoldButton | Press scales to 0.97, has a 10 px hit pad that tolerates finger drift, separates a tap from a hold at 250 ms, and fills with a wave. Keyboard works too. | Press feedback is immediate (under 1 frame) and forgiving. Destructive or important actions can use a hold. |
| SpotlightCard, ShinyText | Light is layered: a radial falloff built with `color-mix`, a border glow, SVG fractal-noise grain at about 6 %, and gamma-correct colour blending. | Depth comes from light and texture, not from more borders. A faint grain stops large dark fields from looking flat and digital. |
| Noise | A 256 px seeded noise tile, repeated, animated at 24 fps at most. | Texture is one small tile, never a full-screen image. |
| All 218 components | 221 files check `prefers-reduced-motion`. | Reduced motion is part of the design for every effect, not an afterthought. |

Dependencies they lean on (motion, GSAP, OGL/three for shaders) are web-only. In the app,
Reanimated 4 worklets give the same UI-thread spring model.

## 2. Awwwards

Pages studied: Sites of the Day (Signal-A, Square43, OFFF Forum, Overworld Audio, Neutomni,
Odyssee, twks, Jesper Landberg, The Tie Break), Honorable Mentions, the Games category (1minus1,
Orma Games, Sixes Social Cricket, SuperPlay, Think & Play quiz, Night Drive) and Mobile & Apps
(Grail, Wispr Flow, Charmling, Disko, Swsh). We visited the live sites, took screenshots at 1440 px,
and read computed type settings.

What the winners have in common:

1. **One or two confident colours on a big field.** SuperPlay fills the whole screen with hot pink,
   then purple. 1minus1 puts acid lime (`#D4FF3A`-like) on deep aubergine (`oklch(0.16 0.08 302)`).
   Neutomni uses a single red on white. None of them uses a purple-to-blue gradient on navy cards,
   which is the look our app had.
2. **Type is the image.** Headlines run at 68–200 px: Orma's 68 px weight 900 at −2 px tracking,
   SuperPlay's condensed "WINNING", Sixes' stacked "NOTHING BEATS HITTING SIXES". Display faces are
   condensed or expanded; body text is a quiet grotesk.
3. **A third, technical voice.** Small mono labels in uppercase with wide tracking (Orma: Space
   Mono; Neutomni: Fira Code; Sixes: Söhne Mono) give an editorial, instrument-panel feel
   between the loud headline and the body text.
4. **Texture and depth over borders.** Grain, real objects (Orma's handheld console, SuperPlay's
   3D coins), soft shadows on physical things. Hairline-bordered boxes are rare.
5. **Layout rhythm with tension.** Huge, bleeding type next to small precise labels. Elements break
   the grid on purpose (SuperPlay's floating photos, 1minus1's diagonal plates).
6. **Motion tells the story.** Scroll drives the reveal: text splits by line, objects arrive on
   springs, sections pin while their content changes. Interaction is tactile: magnetic buttons,
   tilt, sound toggles (Overworld's "Enter with sound").
7. **The product is shown, not described.** Game and app sites lead with the real thing (device
   mockups, gameplay video, a playable demo) above the fold.

## 3. Top-grossing games on Google Play

As of the September 2026 charts, the leaders were Roblox, Monopoly Go!, Royal Match, Honor of
Kings and Whiteout Survival. Royal Match has earned about $100M a month all year.
Patterns from those and from competitive titles (Clash Royale, Brawl Stars, chess.com, Duolingo):

- **Chunky, physical buttons.** A solid "lip" under the face (4–6 px, darker shade) that collapses
  on press. They read as tappable without a border and give the thumb a satisfying travel.
- **Reward ceremonies.** Chests open, numbers count up with ticks, a tier badge slams in with a
  flash and particles. Each win is staged in beats: anticipation, impact, settle.
- **Everything is big.** Full-bleed headers, giant numbers and art-forward tiles. A game's home
  screen is one hero action, not a list of rows.
- **Progress is always visible and segmented.** Bars are split into steps and stars; divisions are
  pips; the next reward is shown ahead.
- **Juice.** Every tap answers with scale, sound and haptics. A correct answer differs from a wrong
  one in all three channels.
- **Rating changes are an event** (chess.com, Clash Royale trophies): `+14` animates, the bar fills,
  and the rank bar crosses its threshold on screen.

## 4. What made our UI look AI-generated (audit, 2026-10-18)

Screenshots: every QA scene in `scripts/screenshots.mjs`, dark and light, captured before the
redesign.

1. **Default palette.** Navy `#0A0D1A` with violet `#6D4CF5` buttons and a violet-to-cyan
   gradient: the most common generated dark theme.
2. **Everything is a card.** Each block is a 24 px-radius surface with a 1 px border, stacked
   vertically, sometimes nested two deep. Home, Profile, Week, Season and Results look the same.
3. **Settings-style rows everywhere.** An icon in a tinted rounded square, then title, subtitle and
   chevron. That pattern suits Settings, not a game's home screen.
4. **Generic type pairing.** Inter for body and Space Grotesk for display, both at modest sizes.
   The tier name (the emotional core) is 28 px.
5. **Flat buttons.** One violet pill style with an icon. No depth, no press travel.
6. **Dashboard stats.** Grids of "number + caption" tiles (186 Games played, 12 Streak).
7. **Game screens waste the stage.** Small instruction text at the top, controls at the bottom,
   about 40 % empty navy in between. Tiles are flat rounded squares.
8. **Results don't celebrate.** A list of rows with `+21` in green; the rating gain is not an
   event. In the web Daily Challenge, the per-game rows don't even name the game.
9. **Template onboarding.** A centred stack of badge, headline, paragraph and three pill chips.
10. **No texture or light.** Large flat fields of a single navy everywhere.
11. **Smaller bugs found along the way:** localized landing pages report `<html lang="en">`.

## 5. Principles we apply

1. **Floodlight, not dashboard.** One dark arena field (light theme: daylight paper), chalk text,
   a single volt signal colour for "go", and tier and domain colours as the only other light.
2. **Type as the hero.** A condensed display face set huge and uppercase for tiers, numbers and
   headlines; a quiet grotesk for reading; mono micro-labels for data.
3. **One motif: the slant.** Progress bars, division pips, plates and highlights lean 12°. Speed and
   competition are built into every shape.
4. **Physical depth.** Pressables have a solid lip that collapses on press. No 1 px borders on
   surfaces; separation comes from tone steps, lips and light.
5. **Big and few.** Every screen has one hero element and one primary action. Lists become tickets,
   plates or ladders.
6. **Ceremony in beats.** Anticipation, impact, settle, for every win, streak, rating gain and tier-up.
7. **UI-thread motion only, honest reduced motion.** Springs run in worklets; numbers keep fixed
   widths; reduced motion swaps movement for opacity and keeps every piece of information.
8. **Show the product.** On the web, the hero shows the real app in a device and a playable demo.
