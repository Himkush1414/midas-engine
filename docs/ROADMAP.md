# ROADMAP

Status legend: ☐ planned · ◐ in progress · ☑ done. Updated 2026-10-16.

## M0 — Foundations
- ☑ npm-workspaces monorepo: `apps/mobile` (Expo SDK 57), `apps/web` (Next.js on Vercel), `packages/core` (pure TS engine), `supabase/` (migrations)
- ☑ TypeScript strict, ESLint, Prettier, Vitest, GitHub Actions CI
- ☑ `.env.example`, environment validation, HANDOFF doc skeleton

## M1 — Core engine (`packages/core`)
- ☑ Seeded PRNG + seed derivation (daily / duel / session)
- ☑ Glicko-2 implementation with tests against the published worked example
- ☑ Tier ladder (Iron → Grandmaster, divisions) + provisional logic
- ☑ Staircase difficulty controller (1-up/1-down) and item-rating maps
- ☑ 13 game generators + scorers across 5 domains
- ☑ Session builder (ranked, placement, daily, duel, zen)
- ☑ Result validation (shared by client and server)

## M2 — Backend (Supabase + Vercel API)
- ☑ Schema + RLS: profiles, ratings, rating_history, sessions, game_results, daily challenges/entries, duels, friendships, push tokens, entitlements, events, deletion requests
- ☑ Anonymous auth + identity linking (email codes; Google sign-in is post-launch)
- ☑ API: submit session (server-side rating), daily leaderboard, duel create/join/result, account deletion, RevenueCat webhook
- ☑ Plausibility checks (replay verification, timing floors, quotas); per-IP rate limiting via Vercel firewall is post-launch

## M3 — Mobile app
- ☑ Design system: tokens, light/dark themes, typography, custom SVG icon set, tier badges
- ☑ Navigation (expo-router), error boundaries, crash reporting (Sentry), analytics abstraction
- ☑ Onboarding → placement → tier reveal ceremony → paywall
- ☑ Home: today's ranked session, Daily Challenge, duels, streak
- ☑ All 13 games with tutorials, Zen mode, haptics, sound
- ☑ Results screen with rating deltas, rank-up animation, share card
- ☑ Profile / stats: radar, rating history, percentiles
- ☑ Duels: create, invite link, accept, result
- ☑ Settings: theme, sounds, haptics, reminders, accessibility, manage subscription, restore, delete account, legal links
- ☑ Offline outbox + background sync
- ☑ Notifications: daily reminder, trial reminder (duel push notifications: post-launch)
- ☑ RevenueCat paywall (with a mock provider until keys exist)

## M4 — Web (Vercel)
- ☑ Landing page
- ☑ Privacy policy, terms, refund policy, account-deletion page, support page
- ☑ Duel invite and share-card landing pages (deep links, OG images)
- ☑ `assetlinks.json` / AASA for app links

## M5 — Store readiness
- ☑ Icon (SVG master, adaptive icon, all PNG sizes), feature graphic, screenshots
- ☑ Store listing copy, Data Safety answers, content-rating answers
- ☑ EAS build profiles (AAB, production), target API level current, 64-bit
- ☑ iOS: privacy manifest, Sign in with Apple, no ATT needed (no tracking)
- ☑ HANDOFF.md with exact manual steps

## Post-launch
- Seasons (monthly) with soft reset + season recap share
- Live real-time duels (Supabase Realtime) once DAU supports matchmaking
- Opt-in weekly leagues
- Localization: DE, FR, ES, PT-BR, JA
- Word/language domain (per-locale dictionaries)
- Web version of the Daily Challenge (top-of-funnel)
