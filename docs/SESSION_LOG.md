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
