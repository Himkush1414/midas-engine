# 04 — Candidate ideas and scoring

Scale 1–5 (5 = best). **Policy** is inverted risk (5 = lowest Play policy risk). **Build** = feasibility of a production-grade build by this team without bought content/assets or unavailable API keys (no LLM key, no video production).

Weights reflect the mission ("people will pay") and the solo/no-ad-budget reality: WTP ×3, Retention ×2, Virality ×2, Gap ×2, Build ×2, Policy ×1. Max = 60.

| # | Idea | WTP | Ret | Viral | Gap | Build | Policy | **Score** | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Ranked brain games** (Glicko tiers, placements, daily challenge, async duels, no ads) | 4 | 5 | 5 | 5 | 5 | 4 | **56** | Proven category WTP (Impulse/Elevate); no competitive-rating product exists; procedurally generated content; shareable rank + daily grid |
| 2 | GLP-1 companion (muscle preservation + off-ramp) | 5 | 4 | 2 | 2 | 4 | 3 | 42 | Hot market, but 20+ near-clones on Android in 2026; health-claim risk |
| 3 | Ranked calisthenics / home bodyweight | 4 | 4 | 4 | 3 | 2 | 4 | 42 | Needs an exercise animation library; Liftoff/GymLevels may expand |
| 4 | Self-care virtual pet (niche: students) | 4 | 5 | 3 | 2 | 2 | 4 | 40 | Finch dominates; art-asset heavy |
| 5 | Daily puzzle collection (NYT-style) | 2 | 5 | 5 | 3 | 5 | 5 | 47 | Great virality, weak WTP (gaming RPI $0.08) |
| 6 | Couples daily questions + games | 3 | 4 | 4 | 2 | 4 | 4 | 41 | Partner invite loop, but crowded with 10M+ incumbents |
| 7 | ADHD visual planner | 4 | 4 | 2 | 2 | 4 | 5 | 41 | Tiimo/Structured strong; differentiation weak |
| 8 | Body-doubling focus rooms | 4 | 4 | 3 | 3 | 3 | 3 | 41 | Liquidity cold start; moderation needs |
| 9 | Screen-time blocker with friction | 5 | 3 | 2 | 3 | 2 | 2 | 37 | Accessibility API declaration risk on Play; native work |
| 10 | Virtual walking journeys (documentary routes) | 3 | 4 | 3 | 3 | 3 | 5 | 40 | Conqueror dominates; content heavy |
| 11 | Mobility / stretching plans | 4 | 3 | 2 | 1 | 2 | 5 | 33 | Bend 5M+; needs video/animation |
| 12 | Quit-drinking companion | 4 | 4 | 1 | 2 | 4 | 4 | 38 | I Am Sober 10M+, Reframe; sensitive |
| 13 | Habit tracker | 2 | 4 | 2 | 1 | 5 | 5 | 35 | Saturated |
| 14 | Idle / incremental game | 2 | 5 | 3 | 2 | 4 | 5 | 39 | Ads/IAP economy; discovery hard |
| 15 | Memory palace / memorization trainer | 4 | 3 | 2 | 3 | 4 | 5 | 41 | memoryOS proves niche WTP; smaller TAM |
| 16 | Reaction-time & aim trainer for gamers | 2 | 3 | 4 | 3 | 5 | 5 | 41 | Low WTP on mobile |
| 17 | Couples / friends trivia duels | 2 | 4 | 5 | 2 | 4 | 5 | 41 | Trivia Crack saturates |
| 18 | Kids' brain games | 4 | 4 | 2 | 2 | 4 | 2 | 38 | Families policy, COPPA, teacher-approved program |

## Winner: #1 Ranked brain games, named **Mindtier**

Why it wins on every axis:

- **WTP:** brain training is a proven paid category on Android (Impulse at #23 top-grossing H&F; Lumosity, Elevate, NeuroNation and Peak each have 10M+ installs with subscriptions up to $400 lifetime).
- **Retention:** ratings are the strongest retention mechanic in games (chess.com, LoL, Clash Royale). A number that moves every session, plus seasons and placements.
- **Virality:** a rank badge is identity you show off ("I'm Diamond II in Memory"). The spoiler-free Daily Challenge grid spreads like Wordle. Async duels need a second person.
- **Gap:** zero brain-training apps use a real rating system with tiers. Incumbents are hated for ads and dark patterns, and we are ad-free and honest by design.
- **Build:** all content is procedurally generated in TypeScript (seeded RNG + difficulty parameters), so there is effectively infinite content with no asset pipeline. It works fully offline. The rating maths is well documented (Glicko-2).
- **Policy:** no sensitive permissions (no location, contacts or camera). No health claims (FTC/Lumosity lesson). Target age 13+ (not designed for children, so outside the Families program).

## The missing ingredient

> **"Find out what tier your mind is, then climb."**

Every competitor sells *self-improvement*, which is vague, slow and scientifically contested. Mindtier sells **status and the climb**, which is instant, legible and fun. The rating is honest (it measures skill at *these games*, compared with other players), so it needs no pseudo-scientific claims. Rating-driven adaptive difficulty also solves the "too easy / repetitive" complaints for free, since every round sits at your skill edge.
