# Google Play compliance pack — Mindtier

Answers for every Play Console declaration, derived from what the code actually does. If the code changes what it collects, update this file, the privacy policy (`apps/web/src/app/privacy/page.tsx`) and the iOS privacy manifest (`apps/mobile/app.config.ts`) together.

## 1. Data safety form

**Does your app collect or share any of the required user data types?** Yes (collects; does not share).

**Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS/TLS only).

**Do you provide a way for users to request that their data is deleted?** Yes — in-app (Settings → Account → Delete account) and on the web: https://midas-engine.vercel.app/delete-account

**Data sharing:** none. Supabase, Vercel, RevenueCat, Sentry and the email provider act as service providers processing data on our behalf, which Play does not count as sharing.

| Category → data type | Collected | Optional? | Purposes | Ephemeral? |
|---|---|---|---|---|
| Personal info → **Email address** | Yes | Optional (only if the player saves progress to email) | Account management | No |
| Personal info → **Name** (display name) | Yes | Optional | App functionality (shown in duels/leaderboards) | No |
| Personal info → **User IDs** (anonymous account ID) | Yes | Required | App functionality, Account management, Fraud prevention, security and compliance | No |
| Financial info → **Purchase history** (Pro plan + expiry, via RevenueCat) | Yes | Required for Pro buyers only | App functionality | No |
| App activity → **App interactions** (anonymous usage events) | Yes | Optional (Settings → Privacy) | Analytics | No |
| App activity → **Other actions** (game results, ratings, sessions) | Yes | Required | App functionality, Fraud prevention | No |
| App info and performance → **Crash logs** | Yes, when crash reporting is configured | Optional (Settings → Privacy) | App functionality | No |
| App info and performance → **Diagnostics** | Yes, when crash reporting is configured | Optional | App functionality | No |

Not collected: location, contacts, photos/videos, audio, files, calendar, health/fitness, messages, web history, device or advertising IDs, financial account or payment details (handled by Google Play).

> Cross-check RevenueCat's and Sentry's current Data safety guidance before submitting, in case their SDK versions add data types.

## 2. Content rating (IARC questionnaire)

- Category: **Game** → Puzzle, or **All other app types** if the app category is Education (answers are the same).
- Violence, fear, sexuality, gambling, language, drugs/alcohol/tobacco, crude humour: **No**.
- Does the app allow users to interact or exchange content? **No** chat, no messaging and no user-generated media. Display names are chosen from a filtered set and shown on leaderboards/duels. Answer "Users can interact" only if the questionnaire treats leaderboard names as interaction; if so, add that names are moderated.
- Shares user location: **No**. Digital purchases: **Yes**.
- Expected result: **Everyone / PEGI 3 / USK 0**, with the "In-App Purchases" descriptor.

## 3. Target audience and content

- Target age groups: **13–15, 16–17, 18+**. Not designed for children; outside the Designed for Families programme.
- Appeals to children? **No** (plain, non-cartoon visuals; no child-directed marketing).

## 4. Other declarations

| Declaration | Answer |
|---|---|
| Ads | **No ads** |
| App access | All functionality is available without login — no test credentials needed |
| Government app | No |
| Financial features | None |
| Health app | **No** — Mindtier is a game; it makes no health or medical claims |
| News app | No |
| COVID-19 contact tracing | No |
| Data safety → account creation | Users can play without an account; optional email sign-in. Account deletion URL above |
| Advertising ID | Not used. The manifest does not declare `AD_ID`; answer "No" |

## 5. Permissions in the release build

Verified by dumping the AAB manifest (bundletool) after blocking unused library permissions in `app.config.ts`:

| Permission | Why |
|---|---|
| `INTERNET`, `ACCESS_NETWORK_STATE` | Sync, leaderboards, duels |
| `com.android.vending.BILLING` | Google Play Billing (Mindtier Pro) |
| `POST_NOTIFICATIONS` | Optional daily reminder and trial-ending notice (runtime prompt only when enabled) |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Keep scheduled local reminders after a reboot |
| `VIBRATE` | Haptic feedback (can be turned off) |
| `com.google.android.c2dm.permission.RECEIVE` | Added by expo-notifications; no remote push is sent today |

Blocked: storage read/write, `SYSTEM_ALERT_WINDOW`, install referrer, launcher badge permissions.

## 6. Technical requirements

| Requirement | Status |
|---|---|
| Target API level | 36 (Android 16) — compileSdk 36, minSdk 24 |
| 64-bit | arm64-v8a and x86_64 native libraries included |
| Format | Android App Bundle (AAB) built by EAS (`production` profile) |
| Play App Signing | Use it; EAS holds the upload keystore |
| Subscriptions policy | Price, period, trial length and conversion date on the button; visible dismiss; "Restore purchases"; "Manage subscription" opens Play in one tap; local reminder 2 days before a trial converts |

## 7. Copy and claims checklist (FTC v. Lumos Labs lesson)

- [x] No "improves memory/IQ/focus", "prevents cognitive decline", "clinically proven", "scientifically designed" claims in the app, listing or website.
- [x] Ratings described as skill at these games compared with other players.
- [x] Disclaimer in onboarding, settings, website footer and terms.
- [x] Testimonials: none used. If added later, disclose any incentive.
