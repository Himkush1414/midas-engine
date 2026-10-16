# DECISION — Mindtier: Ranked Brain Games

**Decision date:** 2026-10-16 · Evidence: [`docs/research/`](research/)

## What we are building

Mindtier gives every player a **competitive rating for their mind**. Rated games across five skill domains (Memory, Focus, Speed, Logic, Math) feed a Glicko-2 rating per domain. Players start with five *placement matches*, get a tier reveal (Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster, with divisions IV–I), and then climb. Everything is ad-free.

Pillars:
1. **Ranked:** every session moves a visible number (±Δ). Difficulty is generated *at your rating*, so you always play at the edge of your skill.
2. **Daily Challenge:** one shared seed worldwide, a global percentile, and a spoiler-free share grid.
3. **Duels:** challenge a friend by link. Both play the identical seeded set asynchronously, and the result lands in both feeds. Works from user #2, with no matchmaking liquidity needed.
4. **Zen:** untimed, unrated practice for anyone who doesn't want pressure.
5. **Honest by design:** no ads, results never paywalled, clear trial terms, one-tap cancel.

## Why this app (evidence summary)

- **People already pay for brain games on Android.** Impulse (launched 2024) is #23 top-grossing in US Health & Fitness with 10M+ installs. Lumosity, Elevate, Peak and NeuroNation each have 10M+, and BrainGain hit 500k+ in 8 months of 2026.
- **"Ranked" is the mechanic of the moment.** Liftoff (est. ~$300k/month, 2–3 people) and GymLevels (100k+ installs within 8 months of 2026) prove people pay to know and raise their rank. Nobody has applied it to cognition. The 1v1 "brain duel" apps have no rating model and <10k installs each.
- **The incumbents are vulnerable.** Review mining shows the same complaints everywhere: ads mid-game, results held hostage, trial traps, cancel mazes, lost progress, repetitive content, timer anxiety (see 03). Each one is a design requirement we satisfy.
- **Fully buildable to production quality.** Content is procedural (seeded generators), so no art/video pipeline and no external AI key are needed. It works offline, uses no sensitive permissions, and makes no health claims.

## Who pays

| Segment | Motivation | Why they pay |
|---|---|---|
| **Competitive self-improvers** (18–34, gamers, chess/puzzle players) | Status, the climb, beating friends | Unlimited ranked sessions to climb faster; full stats |
| **Daily-ritual adults** (35–65, current Elevate/Lumosity/Wordle users) | A sharp daily habit without ads | No ads plus fair price; they are already paying incumbents more |
| **Students and professionals** prepping for timed cognitive tests (aptitude, interview games) | Practice on speed/logic/math under time pressure | Domain-focused training sessions |

Primary geographies at launch: US, UK, CA, AU, IE, NZ (English), then DE/FR/ES/PT-BR after localization (Adapty: localization tests drive the largest LTV uplift).

## How much

| Plan | Price (US) | Notes |
|---|---|---|
| Free | $0 | Placement, full tier results, 1 ranked session (3 games)/day, Daily Challenge, accept unlimited duels + create 1/day, Zen in 5 games, 30-day history |
| **Mindtier Pro — Yearly** | **$39.99/yr** with **7-day free trial** | Highlighted; ~$3.33/mo. Below Elevate/Lumosity yearly |
| Pro — Monthly | $7.99/mo | No trial |
| Pro — Lifetime | $79.99 one-time | For subscription-fatigued users (23% of apps sell lifetime; RevenueCat) |

Pro unlocks: unlimited ranked sessions, domain-focus sessions, all 13 games in Zen, full rating history + percentiles + insights, unlimited duel creation, rank-card themes, season recap.

Paywall placement: after the placement tier reveal (the result is already shown in full) as "Keep climbing", at the daily ranked limit, and on Pro-only features. The dismiss button is always visible. Trial terms are printed on the CTA. A local reminder fires 2 days before the trial converts.

### Revenue model (conservative, not a promise)

| Scenario | Installs / yr | Download→paid | Blended net / payer / yr* | Annual net |
|---|---|---|---|---|
| Low (ASO only) | 50,000 | 2.0% | $28 | ~$28k |
| Base (ASO + daily-share virality) | 200,000 | 3.0% | $30 | ~$180k |
| High (one viral moment, e.g. rank cards on TikTok) | 1,000,000 | 3.0% | $30 | ~$900k |

\*After Google's 15% fee on subscriptions, blended across plans and regions. The benchmarks come from RevenueCat SOSA 2026 (freemium D35 conversion median 2.1%, top quartile 4.5%; Health & Fitness 2.9%).

## Why now

1. Ranked-gamification apps broke out in 2025–26 (GymLevels, Liftoff growth), so users already understand tiers.
2. Incumbents are monetizing harder (more ads, paywalled results), and their reviews show it. An honest, ad-free entrant is a positioning advantage.
3. Chess.com re-rated every puzzle player in Oct 2025, which reminded millions how compelling a puzzle rating is.
4. Subscription fatigue (3–4 subs per user) rewards fair pricing and a lifetime option.
5. Android gets fewer polished new entrants than iOS (77% of new subscription apps launch on iOS first), so quality stands out more on Play.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Cognitive-benefit claims (FTC v. Lumos Labs, 2016) | Copy rule: games, rank and challenge only. No "improve memory", "IQ", "prevent decline" or "clinically". Ratings are skill at these games relative to players |
| Cheating on leaderboards | Server-side validation of submitted results (plausibility bounds, trial timings, seed replay checks for the daily challenge); ranked ratings recomputed server-side |
| Empty-world cold start | Rating is player-vs-item (like puzzle ratings), so it works with one user. Duels need just two friends. Global percentiles are shown only once the population is large enough |
| Rating feels unfair | Glicko-2 provisional period with large RD, visible deltas, a "why did my rating change?" explainer |
| Copycats | Speed of iteration, season content, brand. The rating history and social graph are moats |
