# Mindtier — ranked brain games

**What tier is your mind?** Mindtier gives every player a competitive rating for five skills (Memory, Focus, Speed, Logic, Math). Five placement games place you on a ladder from Iron to Grandmaster; every ranked session moves your Glicko-2 rating. Add a worldwide Daily Challenge, friend duels on identical puzzles and an honest, ad-free freemium model.

- Product rationale: [`docs/DECISION.md`](docs/DECISION.md) · research: [`docs/research/`](docs/research/) · roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Store listing: [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md) · Play compliance: [`docs/PLAY_COMPLIANCE.md`](docs/PLAY_COMPLIANCE.md)
- What's left for the owner: [`docs/HANDOFF.md`](docs/HANDOFF.md)

## Repository layout

```
packages/core   Platform-independent engine (TypeScript): seeded PRNG, Glicko-2, tiers,
                adaptive staircase, 13 game generators/scorers, session planners,
                streaks, free-tier limits and server-side run verification.
apps/mobile     Expo SDK 57 / React Native app (expo-router, Reanimated, SVG).
apps/web        Next.js 16 on Vercel: landing page, legal pages, duel links and the API.
supabase/       SQL migrations (schema, row-level security, API functions).
brand/          SVG masters for the logo and adaptive icon.
store/          Play listing graphics and screenshots (generated from the real UI).
scripts/        Ship/verify, migrations, auth config, deploy, asset and screenshot pipelines.
```

## How it works

```
 app (offline-first)                     Vercel API                         Supabase
 ───────────────────                     ──────────                         ────────
 play games locally ── session upload ──▶ verifyRun(): regenerate every ──▶ submit_session()
 provisional ratings                      trial from its seed, re-score       (atomic insert,
 outbox for offline                       responses, check the difficulty     RLS everywhere)
                     ◀─ authoritative ──  path and timings, recompute
                        ratings           Glicko-2 from the server copy
```

- **Deterministic content:** every puzzle is a pure function of `(seed, trial index, level)`. Daily Challenges and duels give everyone identical puzzles, and the server can replay any game to verify it.
- **Ratings:** each game produces blocks of trials scored against item ratings (chance-corrected). Glicko-2 handles placement (high RD, fast movement) and settled players alike.
- **Monetization:** RevenueCat (Google Play Billing / App Store) behind a provider interface. Entitlements are synced server-side by a webhook. Free players get a daily ranked session, the Daily Challenge, duels and Zen; there are no ads anywhere.

## Getting started

Requirements: Node 24 (`.nvmrc`), npm 11.

```bash
npm install
cp .env.example .env.local                 # fill in values (never commit)
scripts/verify.sh                          # typecheck + lint + tests for every workspace
scripts/db-check.sh                        # apply migrations to a throwaway Postgres (Docker) and run SQL tests
```

Mobile (needs a development build, because the app uses native modules):

```bash
cd apps/mobile
npx eas-cli@latest build --profile development --platform android   # once
npx expo start --dev-client
```

Web/API:

```bash
cd apps/web
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npx next dev
```

Database:

```bash
set -a; . ./.env.local; set +a
node scripts/db-migrate.mjs        # applies supabase/migrations in order
node scripts/configure-auth.mjs    # idempotent auth settings
```

## Quality gates

- `scripts/verify.sh [core|mobile|web]` — strict typecheck, lint (zero warnings) and tests; CI runs the same on every push.
- `scripts/db-check.sh` — migrations plus `supabase/tests/*.test.sql` against Postgres 17 in Docker, with minimal Supabase stand-ins; CI runs it too.
- Core: property tests run every game at every level against its `solve()` oracle, plus the Glicko-2 reference example and replay-based anti-cheat tests.
- Web: session validation, entitlement mapping, name moderation, and an opt-in end-to-end smoke test against a running API (`API_SMOKE_URL=…`).
- Mobile: stores, sync, purchases, notifications, analytics and render tests for all 13 game views.

## Release

- Android: `cd apps/mobile && npx eas-cli@latest build -p android --profile production` (AAB, remote versionCode).
- OTA updates: `npx eas-cli@latest update --channel production`.
- Web: `node scripts/deploy-web.mjs` (git auto-deploys are disabled to respect plan limits).
- Commit and push: `scripts/ship.sh "type(scope): message" [paths…]`.
