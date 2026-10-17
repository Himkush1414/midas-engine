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

### Next steps
1. Roadmap features: seasons, weekly recap, leagues.
