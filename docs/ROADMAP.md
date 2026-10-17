# ROADMAP

Status legend: ☐ planned · ◐ in progress · ☑ done. Updated 2026-10-17.

## M0 — Foundations
- ☑ npm-workspaces monorepo: `apps/mobile` (Expo SDK 57), `apps/web` (Next.js on Vercel), `packages/core` (pure TS engine), `supabase/` (migrations)
- ☑ TypeScript strict, ESLint (zero warnings), Vitest + Jest, GitHub Actions CI
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
- ☑ Schema + RLS: profiles, ratings, rating_history, sessions, game_results, daily challenges/entries, duels, push tokens, entitlements, events, deletion requests
- ☑ Anonymous auth + identity linking (email codes; Google sign-in is post-launch)
- ☑ API: submit session (server-side rating), daily leaderboard, duel create/join/result, account deletion, RevenueCat webhook
- ☑ Plausibility checks (replay verification, timing floors, quotas); per-IP rate limiting via Vercel firewall is post-launch

## M3 — Mobile app
- ☑ Design system: tokens, light/dark themes, typography, custom SVG icon set, tier badges
- ☑ Navigation (expo-router), error boundaries, crash reporting (Sentry), analytics abstraction
- ☑ Onboarding → placement → tier reveal ceremony → paywall
- ☑ Home: today's ranked session, Daily Challenge, duels, streak
- ☑ All 13 games with tutorials, Zen mode, haptics, sound
- ☑ Results screen with rating deltas, rank-up animation and sharing (text and image share card)
- ☑ Profile / stats: radar, rating history (small multiples + table); Daily Challenge percentile
- ☑ Duels: create, invite link, accept, result
- ☑ Settings: theme, sounds, haptics, reminders, accessibility, manage subscription, restore, delete account, legal links
- ☑ Offline outbox + background sync
- ☑ Notifications: daily reminder, trial reminder, duel push notifications
- ☑ Localization: English, Spanish, Portuguese (Brazil), German, French — UI, game content, notifications; follows the system/per-app language
- ☑ RevenueCat paywall (with a mock provider until keys exist)
- ☑ Opt-in weekly leagues: groups of up to 30 players per tier band, UTC Monday–Sunday, first ranked session of each UTC day scores (equal for free and Pro); Home card + table, last week's finish
- ☑ Weekly recap: this week / last week screen (local Monday–Sunday), Sunday 18:00 local notification only after weeks with play, settings toggle
- ☑ Ranked games move a domain rating by at most 75 points (a perfect player can't jump from placement to Grandmaster in one session)
- ☑ Monthly seasons (UTC calendar months, Season 1 = November 2026): one soft reset per season on device and server, season card, new-season intro, season recap with share

## M4 — Web (Vercel)
- ☑ Landing page
- ☑ Privacy policy, terms, refund policy, account-deletion page, support page
- ☑ Duel invite landing page with deep links
- ☑ Open Graph preview images for the site and duel links
- ☑ `assetlinks.json` / AASA for app links

## M5 — Store readiness
- ☑ Icon (SVG master, adaptive icon, all PNG sizes), feature graphic, screenshots — localized for es/pt/de/fr
- ☑ Store listing copy in all five languages, Data Safety answers, content-rating answers
- ☑ EAS build profiles (AAB, production), target API level current, 64-bit
- ☑ iOS: privacy manifest, universal links; Sign in with Apple not required (no social login); no ATT (no tracking)
- ☑ HANDOFF.md with exact manual steps

## Post-launch
- Live real-time duels (Supabase Realtime) once DAU supports matchmaking
- More languages (JA, KO, IT…) and localized web pages
- Word/language domain (per-locale dictionaries)
- Web version of the Daily Challenge (top-of-funnel)
