# 02 — Dissection of category-defining apps

Goal: extract the mechanics that drive onboarding, paywall, retention and polish, then decide what Mindtier adopts. Based on hands-on product knowledge of each app's public flows as of 2026, plus the findings in 01.

| App | Onboarding | Paywall placement | Retention loop | Polish / perf lesson | Adopt in Mindtier |
|---|---|---|---|---|---|
| **Duolingo** | Value before signup: you do a lesson before creating an account. Goal-setting ("how much per day?") and a placement test | Soft. Super offered after the first lesson and at hearts depletion; the free tier is genuinely usable | Streak + streak freeze, weekly leagues with promotion/demotion, XP, push copy with personality | Micro-celebrations (sound + haptic + animation) after every lesson; sub-second transitions | Play before signup (anonymous auth). Placement test. Streak with *earned* freezes. Celebratory results screen |
| **Chess.com / Lichess** | Pick your level, then a rating is assigned and refined over the first games (provisional "?" rating) | Chess.com: limits on puzzles/lessons/reviews per day | **Rating is identity.** Every game moves a number you care about. Puzzle ratings use Glicko-style "you vs the puzzle" | Instant feedback on rating delta (+8 / −5) | **Glicko-2 rating per domain, puzzle-vs-player model, visible ± deltas, provisional ratings** |
| **League of Legends / Valorant / Clash Royale** | Placement matches, then a tier reveal ceremony | — (cosmetics) | Tiers + divisions (Iron→Challenger), promotion moments, seasons with resets and end-of-season rewards | Rank-up animations are a dopamine event; rank badges are shareable status | **Tier ladder with divisions, placement reveal ceremony, rank-up moments, seasons** |
| **Liftoff / GymLevels** | Long questionnaire, then hard paywall (GymLevels) | Hard paywall after setup. This is the main driver of its 1★ reviews | Exercise ranks, XP, social feed | Rank badge art is the product | Rank-as-identity, but **never** paywall a result the user already worked for |
| **Wordle / NYT Games / LinkedIn games** | Zero onboarding | NYT: the archive + other games are paid | One shared puzzle per day; the share grid is the growth engine (no link needed, spoiler-free) | Spoiler-free share text works in any chat app | **Daily Challenge (same seed for everyone) + spoiler-free share text + global percentile** |
| **Finch** | Name your pet, set goals; emotional attachment from minute one | Soft. Plus unlocks cosmetics, more goals | Care for the pet = care for yourself; a gentle tone, no guilt | Calm, warm copy; never shames the user | Gentle tone: no guilt-trip notifications, streak anxiety mitigations |
| **Elevate / Lumosity / Peak / Impulse** | Goal quiz, then a "personalized plan", then paywall (often with trial auto-enrolled) | Hard-ish; Impulse adds interstitial ads between games | Daily workout of 3–5 games, performance index, streak | Elevate's game feel is excellent; Impulse is ad-saturated | 3-game daily session (proven length), **zero ads**, honest trial |
| **TikTok / Instagram** | Instant content; personalization learns from behavior, not forms | Ads + creator economy | Infinite variable reward | Prefetch next item; perceived latency ~0 | Prefetch/generate next game during results screen; instant "Play again" |
| **Spotify / Netflix** | Taste picker (3 artists / titles) | Freemium / hard | Personalized home rows, "Wrapped" yearly share | Skeleton loading; aggressive caching; offline downloads | **"Mind Wrapped"-style season recap share card**; skeletons; fully offline gameplay |
| **Calm / Headspace** | Intent question then paywall with trial | Onboarding paywall with 7-day trial; restore purchases visible | Daily content, reminders at a user-chosen time | Audio-visual calm, careful typography | User-chosen reminder time; restore purchases on paywall |
| **Strava** | Connect device, find friends | Freemium (segments, analytics, routes paid) | Kudos, segments leaderboards, clubs, year in sport | Social proof via friends' activity | Friends + duel results feed (async) |
| **Candy Crush / Royal Match** | Tutorial is the first levels | IAP boosters, lives | Level map progress, lives regenerate, events | 60fps juicy animations, sound design, near-miss tuning | "Juice": particle bursts, haptics, near-miss feedback, satisfying sound |
| **ChatGPT / Claude** | Minimal: just start | Usage limits on the free tier; Plus for more and better models | Utility pull, memory | Streaming responses = perceived speed | Free daily ranked limit, Pro for unlimited (usage-limit model users already accept) |
| **Amazon** | Guest browsing | — | Personalization, 1-tap repeat | Speed is revenue; every 100ms counts | Cold-start budget: interactive < 2s on mid-range Android |
| **Roblox / Free Fire / PUBG Mobile** | Instant play, guest accounts | Cosmetics battle pass | Friends, squads, seasons/battle pass | Low-end device performance tiers | Guest-first, performant on low-end Android (Free Fire's lesson: India/SEA scale needs light apps) |

## Cross-cutting rules derived

1. **Value before account.** Anonymous session from the first launch; account linking only when the user wants to protect progress or add friends.
2. **Results are never held hostage.** The placement result is free and complete. This directly answers the #1 complaint class in 03.
3. **A number that moves every session.** A rating with visible deltas beats vague "progress".
4. **One shared moment per day.** The Daily Challenge + share grid is the organic growth engine.
5. **Respect = retention.** No ads, no fake urgency, gentle notifications, one-tap cancel path.
6. **Perceived speed.** Games run fully offline; sync happens in the background.
