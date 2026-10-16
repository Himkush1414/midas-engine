# 03 — Competitor analysis and 1–3★ review mining

Method: `google-play-scraper` (US store, English), newest 400–600 reviews per app, filtered to ≤3★ with >40 characters. Pulled 2026-10-16. Quotes are trimmed verbatim excerpts.

## Brain-training competitor table (Google Play US)

| App | Installs | Rating (count) | IAP range | Released | Model |
|---|---|---|---|---|---|
| Impulse | 10M+ | 4.50 (655k) | $4.99–$99.99 | Mar 2024 | Ads + subscription, tests with paywalled results |
| Elevate | 10M+ | 4.57 (520k) | $0.99–$399.99 | 2014 | Trial auto-enrol, leagues |
| Peak | 10M+ | 4.37 (516k) | $0.49–$74.99 | 2015 | Limited free plays + ads |
| NeuroNation | 10M+ | 4.56 (480k) | $3.99–$400 | 2014 | Ads + subscription |
| Lumosity | 10M+ | 4.79 (325k) | $0.99–$239.99 | 2014 | 3 free games/day |
| MindPal | 1M+ | 4.47 (73k) | $3.99–$69.99 | 2020 | Subscription |
| BrainGain | 500k+ | 4.61 (8k) | $2.99–$39.99 | **Feb 2026** | Ads + weekly sub (£6.99/wk) |
| memoryOS | 100k+ | 4.82 (13k) | $0.99–$174.99 | 2022 | Memory-technique courses |
| "Brain Duel" (×5 apps) | ≤10k each | unrated | — | 2025–26 | 1v1 trivia/math; none has traction |

Adjacent "ranked" apps: **Liftoff** 1M+ (4.78, 97k), **GymLevels** 100k+ (4.49, 38k, launched Feb 2026), Gym Rank 50k+. All gym-only.

**Gap:** no brain-training app uses a real competitive rating system (Glicko/Elo with tiers and placements). The 1v1 "Brain Duel" apps are trivia clones with no rating model and no traction.

## Complaint taxonomy (counts are from the ≤3★ samples)

| # | Complaint class | Where | Representative quotes |
|---|---|---|---|
| 1 | **Ads mid-game destroy focus** | Impulse (most of its 72), BrainGain, NeuroNation, Peak | "How are you supposed to focus when you're getting ads mid-session?" · "an ad every 5 questions" · "Adverts are after each individual game… gave up" · "a DELAY to take you to an advert… that's PERVERSION not brain training" |
| 2 | **Results held hostage after effort** | Impulse, Peak, GymLevels (dominant), BrainGain | "took 30 minutes… 84 questions, when it finished, it said you need to pay to see the results" · "After taking a long test, I was asked for money to see the report" · "Paywall _after_ you've spent ages filling everything in" |
| 3 | **Hidden or forced charges, trial traps** | Elevate, NeuroNation, BrainGain, Lumosity | "automatically sets you up for a 7-day subscription, no way around it" · "charged me ~40 euros while i was expecting a free trial" · "Tell me it requires a subscription before you make me do a long input questionnaire" |
| 4 | **Cancellation dark patterns** | Impulse, NeuroNation, Lumosity | "you have to click cancel a second time. THIS BS IS WHY PEOPLE HATE APPS" · "trying to unsubscribe for months" · "can't delete account or suspend subscription" |
| 5 | **Lost purchases/progress on device switch** | Impulse, Peak, NeuroNation | "switched devices and now I can't log back in. I paid for a year subscription for NOTHING" · "premium has gone, and I cannot access to my data" · "reached level 4, suddenly it restarted to level 0" |
| 6 | **Paid users still see ads** | Impulse, Peak, NeuroNation | "paid for the yearly subscription and still have ads" |
| 7 | **Repetitive / too easy / no progression** | Peak, BrainGain, Elevate | "Extremely repetitive… not enough content" · "it just isn't challenging whatsoever" · "no way to progress" |
| 8 | **Timer, streak and league anxiety** | Elevate, Peak | "having a timer stop your progress… is very nerve-wracking" · "less emphasis on the competition… daily reminders of league standing" · "keeps removing my streak… if I am offline" |
| 9 | **Can't choose or skip games** | Lumosity, BrainGain | "some games exercise capabilities I just don't value… can't switch them" · "add a feature to turn games off" |
| 10 | **Accessibility** | Elevate, NeuroNation | "none of the memory activities can be completed without the ability to hear" · "doesn't account for dyslexic people" · "Instructions are too confusing & too small to read" · "hit boxes are too small" |
| 11 | **Pseudo-science distrust** | Lumosity | "there is no SCIENCE THAT it creates any real positive changes" (cf. FTC v. Lumos Labs, 2016, $2M) |
| 12 | **Price shock** | Lumosity, BrainGain | "£16.49 a month or £87.99 per year!!!!!" · "£6.49 a week… shocking" |
| 13 | **Crashes / bugs / slow animations** | Lumosity, Peak, NeuroNation | "keeps crashing and becomes frozen" · "animations are slow" |

## How Mindtier answers each complaint (product requirements)

| # | Requirement |
|---|---|
| 1, 6 | **No ads, ever** (not even for free users). Revenue = subscription only. |
| 2 | **Placement results are always free and complete**, and so are your tier, history and share card. Pro extends play, it never unlocks a result you already earned. |
| 3 | Store listing and first screen say "Free to play daily · optional Pro". The trial is opt-in, with the price and charge date on the button ("Start 7-day free trial, then $39.99/yr on Oct 23"), plus a local reminder notification 2 days before conversion. |
| 4 | Settings → "Manage subscription" deep-links to the Play subscription page in one tap. Account deletion in two taps, with a web fallback. |
| 5 | Anonymous account syncs to the server from day 1; linking email/Google/Apple keeps the same user id. Purchases bound to the account via RevenueCat app user id; "Restore purchases" on the paywall and in settings. |
| 7 | **Adaptive difficulty from the rating system:** every game is generated at your rating, so it is never too easy. Procedural generation means effectively infinite unique levels. |
| 8 | **Zen mode** (untimed, unrated) for every game. Streak repair is earned by play, never bought; offline play counts toward the streak (synced later). Leagues are opt-in. |
| 9 | Pick any domain to train; hide games you dislike from ranked rotation (at least one game per domain always stays on). |
| 10 | No game requires audio. Colorblind-safe palette plus a shape-coded alternative for colour games. Dynamic type up to 200%. Minimum 48dp hit targets. Reduce-motion respected. Every game has an animated, illustrated tutorial with a practice round. |
| 11 | **No cognitive-health claims.** Copy says "games", "challenge", "your rank among players"; never "improve memory", "prevent decline" or "clinically proven". Ratings are framed as *game skill*, not IQ. |
| 12 | Fair pricing: ~$4.99/mo-equivalent on yearly; regional pricing; a lifetime option for subscription-fatigued users. |
| 13 | Crash reporting, error boundaries, 60fps budget, perf tested on low-end Android. |

## Non-brain candidates also mined (summary)

- **GLP-1 trackers:** 20+ Play apps (Shotsy 100k+, MeAgain 50k+, OzemPro 100k+, Pep, Glapp, GLP AI, Tracky, Moun, Remi…). Most launched in 2026, with identical core features (dose log, medication-level curve, side effects, weight). Differentiation is possible (muscle preservation, life after stopping) but needs medical-adjacent copy and is easy to clone.
- **Self-care pets:** Finch dominates (632k ratings); clones (Amaru, Catzy, Ottopia, Tabby, CapyCare, Cub) are mostly small. Art-asset heavy.
- **Ranked gym:** strong momentum, but the #1 complaint is the hard paywall after a long questionnaire. Exercise media (video/animation for 400+ moves) is asset-heavy.
- **Couples:** Love8 and Between are 10M+; many clones with question decks.
