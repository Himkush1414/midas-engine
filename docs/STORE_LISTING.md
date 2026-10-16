# Google Play store listing — Mindtier

Copy rules (FTC / Play policy): describe **games, ranks and challenges**. Never claim the app improves memory, intelligence or health, prevents decline, or is clinically proven. Never call the rating an IQ.

## App details

| Field | Value |
|---|---|
| App name (≤30) | **Mindtier: Ranked Brain Games** |
| Default language | English (United States) – en-US |
| App or game | App |
| Category | **Education** (alternative: Games → Puzzle) |
| Tags | Brain games, Puzzle, Logic, Memory games, Trivia & word games (pick the closest available) |
| Contact email | `[support email]` (same as `NEXT_PUBLIC_SUPPORT_EMAIL`) |
| Website | https://midas-engine.vercel.app |
| Privacy policy URL | https://midas-engine.vercel.app/privacy |
| Account deletion URL | https://midas-engine.vercel.app/delete-account |
| Contains ads | **No** |
| In-app purchases | Yes — Mindtier Pro subscriptions and a lifetime option |

## Short description (≤80)

```
Find your brain rank. Climb tiers in daily brain games. No ads, ever.
```

## Full description (≤4000)

```
What tier is your mind?

Mindtier turns brain games into a ranked ladder. Play five quick placement games — one each for Memory, Focus, Speed, Logic and Math — and get your rank, from Iron to Grandmaster. Then climb.

HOW IT WORKS
• Place: five short placement games, about four minutes, no sign-up needed.
• Climb: every ranked session moves your rating up or down. Your tier and division update as you go.
• Duel: send a friend a link. You both play the exact same puzzles — highest score wins.
• Daily Challenge: one set of three puzzles for everyone, every day, with a live leaderboard and a spoiler-free result to share.

GAMES THAT ADAPT TO YOU
Each of the 13 games is generated at your level, so it is never too easy and never impossible. Ratings use Glicko-2, the system behind many online chess sites: solve harder puzzles and your rating rises.

13 GAMES, 5 SKILLS
• Memory — Grid Recall, Path Trace, Echo
• Focus — Flank, Clash, Spot
• Speed — Snap, Match
• Logic — Pattern, Balance, Route
• Math — Quick Sum, Estimate

BUILT ON FOUR PROMISES
• No ads. Ever. Not between games, not for free players.
• Your results are yours. Your tier, history and share card are free. Pro adds more play — it never unlocks a result you already earned.
• Honest billing. Trial terms on the button, a reminder before a trial ends, and one tap to manage your subscription.
• A game, not a diagnosis. Ranks compare your skill at these puzzles with other players. They are not an IQ or medical assessment.

PLAY YOUR WAY
• Zen mode: untimed, unrated practice.
• Colour-free mode for Clash, haptics and sound toggles, reduced motion, large text support.
• Hide games you don’t enjoy from your ranked rotation.
• Earn streak shields that protect a missed day — they are never sold.

FREE
Placement and full results, one ranked session every day, the Daily Challenge and leaderboard, duels with friends, and Zen practice for five games.

MINDTIER PRO (OPTIONAL)
Unlimited ranked sessions, focus training for any skill, all 13 games in Zen, full rating history and trends, and unlimited duel challenges. Choose yearly (with a free trial), monthly, or a one-time lifetime purchase. Subscriptions renew automatically until cancelled; manage or cancel anytime in Google Play.

Mindtier is a game for entertainment. It does not diagnose, treat or prevent any condition.
```

## Graphics

| Asset | File | Spec |
|---|---|---|
| App icon | `store/graphics/play-icon-512.png` | 512×512 PNG, 32-bit |
| Feature graphic | `store/graphics/feature-graphic.png` | 1024×500 PNG |
| Phone screenshots (8) | `store/screenshots/phone/01…08-*.png` | 1080×1920 (9:16), real UI captures |
| Raw captures | `store/screenshots/raw/{dark,light}/` | Unframed, for tablets/other uses |

Regenerate everything from code:

```bash
cd apps/mobile && EXPO_PUBLIC_QA_HOOKS=1 npx expo export --platform web --output-dir ../../.qa-web && cd ../..
node scripts/screenshots.mjs --dist .qa-web            # needs Playwright Chromium
node scripts/store-graphics.mjs                         # needs Space Grotesk + Inter installed for librsvg
node scripts/render-brand.mjs                           # icons and adaptive icon layers
```

Screenshots use sample data (a demo player and sample leaderboard names) inside the real app UI.

## Subscription products (create in Play Console → Monetize → Products)

| Product ID | Type | Base plan | Offer | Reference price (US) |
|---|---|---|---|---|
| `mindtier_pro_yearly` | Subscription | `yearly` — auto-renewing, 1 year | `free-trial-7d` — 7-day free trial, new customers only | $39.99 |
| `mindtier_pro_monthly` | Subscription | `monthly` — auto-renewing, 1 month | — | $7.99 |
| `mindtier_pro_lifetime` | One-time product | — | — | $79.99 |

Use Play's price templates to set local prices in every country (Adapty data: localized pricing is the biggest LTV lever). Enable **grace period** (7 days) and **account hold** (30 days) — 31% of Play cancellations are billing failures.
