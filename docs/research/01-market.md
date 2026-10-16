# 01 — Market research

Research date: 2026-10-16. Primary target: Google Play (US first, then EN-speaking markets), App Store secondary.

## Store-level picture

| Signal | Finding | Source |
|---|---|---|
| Non-game vs games | 2025 was the first year non-game consumer spend ($82.6B) beat games ($72.2B); non-game grew 33.9% vs ~10% | Appfigures via [builtbyfoundry](https://www.builtbyfoundry.io/blog/non-game-apps-beat-games-creator-opportunity) |
| Google Play share | Games still ~65% of Play revenue; Social / Entertainment / Productivity lead non-game | [Sensor Tower forecast](https://sensortower.com/blog/sensor-tower-app-market-forecast-2026) |
| Supply | New subscription apps/month went from ~2,000 (2022) to ~14,700 (Jan 2026); Android ~3,300/month | [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps) |
| Concentration | Top 10% of subscription apps take 94.5% of revenue; median app earns ~$492/month | [Adapty 2026](https://adapty.io/state-of-in-app-subscriptions/) |

**Implication:** a "me-too" app in a crowded category will land in the median. The product must carry its own distribution (shareability, invites) and a hook competitors don't have.

## Subscription economics by category (RevenueCat SOSA 2026)

| Metric | Health & Fitness | Education | Productivity | Gaming | All |
|---|---|---|---|---|---|
| D14 revenue / install | **$0.48** | $0.30 | — | $0.08 | $0.23 |
| D60 revenue / install | **$0.66** | — | — | $0.14 | $0.34 |
| Download → paid (D35) | **2.9%** | — | — | 1.0% | 2.0% |
| Trial → paid | **37.7%** | — | — | 25.0% | — |
| Yearly RLTV / payer | $35.64 | $22.82 | $24.95 | $11.22 | $23 |
| Median yearly price | — | $44.99 | — | $24.99 | ~$34.80 |

Other findings that shape the build:

- **Paywall type:** hard paywall D14 RPI $2.32 vs freemium $0.27, and D35 conversion 10.7% vs 2.1%. Year-one retention is "nearly identical". Hard paywalls also produce most 1★ reviews in our niche (see 03), so we use a *strong-placement soft paywall* (see DECISION).
- **Trial length:** 17–32 day trials convert best (42.5%), ≤4 days worst (25.5%). 55.4% of 3-day trials are cancelled on day 0. → 7-day trial minimum, consider 14.
- **Day-0 matters:** 50.6% of conversions happen on day 0 and ~82–90% of trial starts happen on day 0. → onboarding + first-session paywall placement is the single biggest lever.
- **AI apps:** 41% more revenue per payer but 30% faster churn.
- **Google Play billing:** 31% of Play cancellations are *involuntary* (billing failures) vs 14% on iOS. → enable grace period + account hold, and show an in-app "fix payment" banner.
- **Plan mix:** weekly plans dominate utilities/gaming but are perceived as predatory in our niche (BrainGain reviews: "£6.49 a week… shocking"). Monthly + yearly + lifetime.
- **Geography:** North America RPI ~3–5× IN/SEA. Launch targeting US/UK/CA/AU first; regional pricing via Play price templates.

## Google Play US top-grossing Health & Fitness (2026-10-13, Similarweb)

1 Fitbit · 2 MyFitnessPal · 3 AllTrails · 4 Strava · **5 Finch (self-care pet)** · 6 Calm · 7 Flo · 8 MacroFactor · 9 Lose It! · 10 Fitbod · … · 20 Gravl · **22 MeAgain (GLP-1)** · **23 Impulse (brain training)** · 25 Hevy · 27 Bend · 33 WalkFit · 38 Reframe · 39 Cal AI · **46 Liftoff (ranked gym)** …

Observations:
- **Gamified, emotionally-sticky products punch above their size**: Finch (a pet) is #5, above Calm and Headspace.
- **Brain training monetizes on Android**: Impulse (launched Mar 2024) is #23 grossing with 10M+ installs and 655k ratings in ~2.5 years. BrainGain (launched Feb 2026) has already passed 500k installs.
- **"Ranked" is a working mechanic right now**: Liftoff (#46, est. $300k/month with a 2–3 person team, 1M+ installs) and GymLevels (launched Feb 2026 → 100k+ installs, 38k ratings in 8 months).

## Google Play US top-grossing overall (2026-10-13)

Google One, TikTok, ChatGPT, Amazon, MONOPOLY GO!, Roblox, Spotify, Peacock, Candy Crush, Royal Match … Claude (#26), Grok (#29), Duolingo (#41). Games and streaming dominate. These are out of reach for a solo launch, but their mechanics are studied in 02.

## Macro trends checked (and why most were rejected)

| Trend | Size / momentum | Verdict |
|---|---|---|
| GLP-1 companions | ~12% of US adults on a GLP-1 (KFF, Nov 2025); Wegovy pill launched Jan 2026 | **Red ocean on Android**: 20+ trackers, most launched in 2026, near-identical feature sets. Medical-claims risk. |
| Self-care pets | Finch 10M+, plus Amaru, Catzy, Ottopia, Tabby, CapyCare… | Saturated clones of Finch; art-heavy. |
| ADHD planners | Tiimo was iPhone App of the Year 2025 | Crowded on Play (Structured, Unique, Super Planner…); hard to differentiate. |
| Couples apps | Love8 / Between 10M+, many 1M+ | Crowded; small indies report ~$27k/yr (acquire.com listings). |
| Body doubling | dubbii 100k+ | Needs live liquidity, so the cold start problem is severe. |
| Ranked gamification | Liftoff, GymLevels growing fast | **Only exists for gym.** Not applied to cognition. |
| Brain training | Impulse, BrainGain, Elevate, Lumosity, Peak, NeuroNation | Proven willingness to pay, but incumbents are hated for ads and dark patterns (see 03). |
