# Session log

## 2026-10-16

### Done
- Research and decision: Mindtier (ranked brain games) chosen over 17 alternatives (`docs/research`, `docs/DECISION.md`).
- `packages/core`: deterministic engine: PRNG, Glicko-2, tiers, staircase, 13 games with solvers, session planners, and server-side run verification (anti-cheat). Around 290 tests.
- Supabase schema with RLS, plus API functions; anonymous auth and email OTP.
- Next.js on Vercel: landing page, privacy/terms/refunds/support/delete-account pages, duel landing and OG images, and the v1 API (bootstrap, sessions, daily board, duels, events, account, deletion requests, RevenueCat webhook, push tokens).
- Expo app:
  - Flows: onboarding, placement, tier reveal, ranked sessions, Daily Challenge, duels, Zen, profile charts, settings, account linking and deletion.
  - Monetization: honest paywall behind a RevenueCat-ready interface.
  - Device features: reminders and duel push, share image card, sounds, dark/light themes, accessibility, tablet layout.
- Localization:
  - Typed i18n layer with English, Spanish, Portuguese (Brazil), German and French.
  - Game content (Clash words, Balance shapes) is localized too.
  - Languages are declared to iOS and Android (per-app language), and the app follows system language changes live.
- Store assets: 8 framed screenshots and a feature graphic per language (`store/screenshots/phone[/<lang>]`, `store/graphics/feature-graphic[-<lang>].png`).
- CI: typecheck, lint, tests, web build and a Playwright end-to-end flow (18 checks).
- EAS Android production profile; first AAB built.

### Fixed today (highlights)
- Skill radar labels clipped for longer translations.
- Placement rating cap, after a QA bot reached Grandmaster.
- Light-theme contrast for game colours.
- Timer bar under reduced motion.

### Next steps
1. Deploy the web app to Vercel once the daily deployment quota resets (2026-10-17 08:13 UTC), then smoke-test every page and API route.
2. Run a fresh EAS production build to cover the latest native modules, blocked permissions and the locale config, then inspect the AAB manifest.
3. Add localized store listing texts (es/pt/de/fr) to `docs/STORE_LISTING.md` and update `docs/HANDOFF.md` and `docs/ROADMAP.md`.
4. Visually review the paywall and settings in es/pt/fr.
5. Continue with roadmap features (seasons/leagues, weekly recap).

## 2026-10-17

### Done
- Store listing texts for Spanish, Portuguese (Brazil), German and French in `docs/STORE_LISTING.md`, using the in-app terms, with Play locale codes and asset paths. All fields are within Play's length limits.
- `docs/ROADMAP.md` and `docs/HANDOFF.md` now cover localization, image share cards and duel push notifications.
- The screenshot script has QA scenes for the settings screen and an `--out` flag, so QA captures stay out of git.
- Visual check of the paywall (es/pt/fr) and settings (es/pt/fr/de): nothing clipped or overflowing.

### Waiting on the owner
These steps publish to production, so they need the owner to run them (or allow them):
1. Web deploy, after 2026-10-17 08:13 UTC when the Vercel quota resets:
   `set -a; . ./.env.local; set +a; PATH=$HOME/.local/node-linux/bin:$PATH node scripts/deploy-web.mjs`
   Then smoke-test /, /privacy, /terms, /refunds, /delete-account, /support, /api/health, /api/v1/bootstrap (401 without a token) and /.well-known/assetlinks.json.
2. ~~Fresh Android production build~~: done, see below.

### Android build
- Production build `7d2145b5` (versionCode 3) is finished. Its manifest checks out: target SDK 36, min SDK 24, only the 10 expected permissions (INTERNET, VIBRATE, ACCESS_NETWORK_STATE, MODIFY_AUDIO_SETTINGS, RECEIVE_BOOT_COMPLETED, POST_NOTIFICATIONS, WAKE_LOCK, C2DM RECEIVE, BILLING, and the dynamic-receiver permission). None of the blocked permissions are present, the locale config lists en/es/pt/de/fr, the duel app link has autoVerify set, and the bundle includes 64-bit native libraries.

### Vercel cleanup
- The stray project `midas-engine-pggb` (the one failing on GitHub) is unlinked from the repo. It had no env vars, no custom domain and no working build. Deleting it was blocked by Claude Code's permission check; the owner can delete it in the dashboard.
- `midas-engine` is now the only project linked to the repo. Push-triggered deployments are off three ways: `vercel.json`, Settings → Git → *Create deployments* off, and *Skip unaffected projects* off. That last setting had been creating a canceled record for every mobile push; after the change, mobile pushes create nothing. Only `scripts/deploy-web.mjs` deploys.

### Seasons
- Calendar-month seasons in UTC. Season 1 is November 2026; before that it is the preseason.
- At the start of each season, ratings get one soft reset: anything above 1300 moves 10% of the way back toward 1300, and the RD is raised to at least 80. That makes early games move ratings faster without marking anyone provisional.
- The same core function runs on the device and on the server. The server applies the reset exactly once through `roll_season` (migration `0003_seasons.sql`).
- In the app: a season card on Home and Profile, a new-season intro, and a season recap screen (peak tier, sessions, games, biggest climb, per-skill change, share text, past seasons).
- **Order matters:** run `node scripts/db-migrate.mjs` before the next web deploy. `deploy-web.mjs` now refuses to deploy while migrations are pending.

### Weekly recap
- Covers the player's local Monday–Sunday week: sessions, games, days played, Daily Challenges, rating earned per skill (season resets excluded), and the biggest climb. You can switch between this week and last week.
- A local notification goes out Sunday at 18:00, only after weeks with play. Its text is updated after every session. It never asks for permission, and it can be turned off in Settings.
- The CI end-to-end flow now also checks season stats and both recap screens (21 checks).

### Later on 2026-10-17
- **Slower early climb:** a ranked game now moves a domain rating by at most 75 points, and the RD stays put while that limit applies. A perfect bot finishes placement plus one session in Master (overall 1944) instead of Grandmaster, and keeps climbing by about 45 per session. Core tests and the CI end-to-end flow both check this.
- **Database checks:** `scripts/db-check.sh` applies every migration to a throwaway Postgres 17 in Docker (with minimal Supabase stand-ins) and runs `supabase/tests/*.test.sql`. CI runs it as the `db` job.
- **Weekly leagues** (migration `0004_leagues.sql`): players opt in and are grouped with up to 30 others at their tier for a UTC Monday–Sunday week. Only the first ranked session of each UTC day scores, so Pro gives no advantage. There is a Home card, a league table and last week's finish. Group filling is serialized with an advisory lock; tested with 40 players joining at once, which produced groups of 30 and 10.
- **Website:** the landing page now covers seasons, leagues and the weekly recap, and is served in es/pt/de/fr at `/es`, `/pt`, `/de` and `/fr`, with hreflang links, a localized header and footer, and a language switcher.

- **Italian:** a full app dictionary, game content included, plus the `/it` landing page, the Play listing text, store screenshots and a feature graphic. Every language's store assets were refreshed with a mid-season date (`--now`), so none of them show the preseason, and the profile shot now frames the skill radar.
- **Weekly recap fix:** weeks with no logged sessions no longer show rating changes. Players updating mid-week would otherwise have seen "0 sessions · Speed +117".

### Next steps
1. Owner: run `node scripts/db-migrate.mjs` (applies 0003 and 0004), then `node scripts/deploy-web.mjs`, then smoke-test, including `API_SMOKE_URL=… npx vitest run src/server/api.smoke.test.ts` in apps/web, which now covers leagues.
2. Roadmap features: seasons, weekly recap, leagues.
