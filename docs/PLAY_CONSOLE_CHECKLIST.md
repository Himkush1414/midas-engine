# Play Console checklist — Mindtier

Every field you fill in Google Play Console, in the order the Console asks for them, with the value ready to copy.
Long texts (descriptions, translations) live in [`STORE_LISTING.md`](STORE_LISTING.md); the reasoning behind each
declaration lives in [`PLAY_COMPLIANCE.md`](PLAY_COMPLIANCE.md). Tick the boxes as you go.

Values in `[brackets]` are yours to supply. Everything else is final.

---

## 0. Before you start

- [ ] A Google account you will keep for the lifetime of the app (it becomes the developer account owner).
- [ ] A working **support email** you read. Set it on the website too: Vercel → `NEXT_PUBLIC_SUPPORT_EMAIL`, then redeploy. The pages show `support@example.com` until you do, and Play reviewers open the privacy policy.
- [ ] Your ID document for identity verification, and a phone that can receive SMS.
- [ ] 15–20 people with Android phones who agree to stay in a test for **14 days** (you need 12; recruit spares for drop-outs).

## 1. Create the developer account

[play.google.com/console/signup](https://play.google.com/console/signup)

| Field | Value |
|---|---|
| Account type | **Yourself** (personal account) |
| Developer name (public, shown under the app title) | `Manik Rana` |
| Legal name | `Manik Rana` |
| Legal address | `[your address — must match your ID]` |
| Contact email (private, Google uses it) | `[your email]` |
| Contact phone (private) | `[your phone]` |
| Public developer email (shown on the store) | `[support email]` |
| Website (public) | `https://midas-engine.vercel.app` |
| Do you have experience publishing on Play? | Answer honestly |
| Registration fee | US$25, one-time |

- [ ] Pay the fee, then complete **identity verification** (ID upload) and **phone verification**. Verification can take a few days. You cannot publish until it is done.
- [ ] Verify you can access a physical Android device (the Console asks you to install the Play Console app and sign in on it).

> Personal accounts created after 13 November 2023 must run a **closed test with at least 12 opted-in testers for 14 consecutive days** before they can apply for production. Section 9 walks through it. Start it as soon as the app exists.

## 2. Create the app

All apps → **Create app**

| Field | Value |
|---|---|
| App name | `Mindtier: Ranked Brain Games` |
| Default language | `English (United States) – en-US` |
| App or game | **App** |
| Free or paid | **Free** (Pro is sold in-app) |
| Declarations | Tick: Developer Program Policies, US export laws (Play App Signing terms are accepted later) |

## 3. Store settings

Grow users → Store presence → **Store settings**

| Field | Value |
|---|---|
| App category | **Education** |
| Tags (up to 5) | Brain games · Puzzle · Logic · Memory games · Word games (pick the closest the picker offers) |
| Email address | `[support email]` |
| Phone number | leave empty |
| Website | `https://midas-engine.vercel.app` |
| External marketing | On (lets Google promote the app outside Play) |

## 4. Main store listing (en-US)

Grow users → Store presence → **Main store listing**

| Field | Value |
|---|---|
| App name (≤30) | `Mindtier: Ranked Brain Games` |
| Short description (≤80) | `Find your brain rank. Climb tiers in daily brain games. No ads, ever.` |
| Full description (≤4000) | Copy the block under **Full description** in [`STORE_LISTING.md`](STORE_LISTING.md#full-description-4000) |
| App icon | `store/graphics/play-icon-512.png` (512×512) |
| Feature graphic | `store/graphics/feature-graphic.png` (1024×500) |
| Phone screenshots | `store/screenshots/phone/01-reveal.png` … `08-game-clash.png`, in that order |
| 7-inch / 10-inch tablet screenshots | Optional. Skip for launch |
| Video | Leave empty |

**Translations.** Same page → *Manage translations* → **Add your own translations**. Add `es-419`, `es-ES`, `es-US`,
`pt-BR`, `de-DE`, `fr-FR`, `fr-CA` and `it-IT`. For each, paste the name, short and full description from the language's
section in [`STORE_LISTING.md`](STORE_LISTING.md#localized-listings) and upload `store/screenshots/phone/<lang>/` and
`store/graphics/feature-graphic-<lang>.png`.

- [ ] en-US listing saved
- [ ] es · pt · de · fr · it listings saved

## 5. App content (Policy → App content)

Each card below is one declaration. Answers are derived from what the code actually does.

### Privacy policy
```
https://midas-engine.vercel.app/privacy
```

### App access
**All functionality is available without special access.** No login needed: the app signs players in anonymously.

### Ads
**No, my app does not contain ads.**

### Content rating
Start questionnaire → email `[support email]` → category **All other app types** (because the app category is Education).

| Question | Answer |
|---|---|
| Violence, fear, sexuality, language, controlled substances, crude humour | **No** to every one |
| Gambling or simulated gambling | **No** |
| Users can interact or exchange content | **Yes**. Display names appear on leaderboards, duels and leagues. Names are screened for profanity and contact details. No chat, no messages, no media uploads |
| Shares the user's current physical location | **No** |
| Allows users to purchase digital goods | **Yes** |
| Web browser or search engine | **No** |

Expected rating: Everyone / PEGI 3 / USK 0, with *In-App Purchases* and *Users Interact* descriptors.

### Target audience and content
| Field | Value |
|---|---|
| Target age groups | **13–15**, **16–17**, **18 and over** |
| Could the app unintentionally appeal to children? | **No** |
| Store listing visible to children? | Not applicable once under-13 is excluded |

### News app
**No.**

### Data safety
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Which of the following methods of account creation does your app support? | **Username and other authentication** (anonymous account, optional email code) |
| Delete account URL | `https://midas-engine.vercel.app/delete-account` |
| Can users request that some data is deleted without deleting their account? | **No** |

Data types (all **Collected**, none **Shared**, none processed ephemerally):

| Data type | Required or optional | Purposes |
|---|---|---|
| Personal info → Email address | Optional | Account management |
| Personal info → Name | Optional | App functionality |
| Personal info → User IDs | Required | App functionality · Account management · Fraud prevention, security and compliance |
| Financial info → Purchase history | Optional | App functionality |
| App activity → App interactions | Optional | Analytics |
| App activity → Other actions | Required | App functionality · Fraud prevention, security and compliance |
| App info and performance → Crash logs | Optional | App functionality |
| App info and performance → Diagnostics | Optional | App functionality |
| Device or other IDs → Device or other IDs (push token) | Optional | App functionality |

Everything else: **not collected**.

### Government apps
**No.**

### Financial features
**My app doesn't provide any financial features.**

### Health apps
**My app does not have any health features.** Mindtier is a game and makes no health claims.

### Advertising ID
**No.** The app does not use the advertising ID and the manifest does not declare `AD_ID`.

### Other permission declarations
None needed. The release manifest asks only for internet, network state, billing, notifications, boot-completed,
wake lock, vibrate and FCM receive (see `PLAY_COMPLIANCE.md` §5). No photo/video, location, SMS, call log,
exact-alarm, full-screen-intent or foreground-service permissions.

- [ ] All App content cards show a green tick

## 6. App integrity and signing

Test and release → Setup → **App signing**

- [ ] Use **Google-managed Play App Signing** (default). The EAS keystore becomes your *upload key*.
- [ ] After the first upload, copy the **SHA-256 certificate fingerprint** of the app signing key into Vercel →
  `ANDROID_CERT_SHA256` together with the upload key's fingerprint (`[upload],[signing]`), then redeploy. That makes
  duel links open the app (`docs/HANDOFF.md` §6).

## 7. Monetize → Products

Create these exactly. The IDs are wired into the app and can never be reused once created.

**Subscriptions** → Create subscription

| Product ID | Name | Base plan ID | Billing period | Renewal | Price (US, then *Set prices* → templates for other countries) |
|---|---|---|---|---|---|
| `mindtier_pro_yearly` | `Mindtier Pro (Yearly)` | `yearly` | 1 year | Auto-renewing | US$39.99 |
| `mindtier_pro_monthly` | `Mindtier Pro (Monthly)` | `monthly` | 1 month | Auto-renewing | US$7.99 |

On `yearly` → **Add offer**: ID `free-trial-7d`, eligibility *New customer acquisition*, phase *Free trial, 7 days*.

Subscription benefits (shown by Play, up to 4, ≤40 characters each):
```
Unlimited ranked sessions
Focus training for any skill
All 15 games in Zen mode
Full rating history and trends
```

Subscriptions → Settings: **Grace period 7 days**, **Account hold 30 days**.

**In-app products** → Create product

| Product ID | Name | Description | Price |
|---|---|---|---|
| `mindtier_pro_lifetime` | `Mindtier Pro (Lifetime)` | `Every Pro feature, forever. One payment.` | US$79.99 |

- [ ] Payments profile set up (Setup → Payments profile). Needed before products can go live.
- [ ] Products activated.
- [ ] RevenueCat connected (`docs/HANDOFF.md` §5). Until then the app says purchases aren't available and never grants Pro.

## 8. Internal testing (optional, same day)

A quick check that the Play build installs and signs correctly, before the clock-sensitive closed test.

1. Test and release → Testing → **Internal testing** → Testers → create list `Owner` with your own Google account.
2. Create new release → upload the **AAB** (not the APK). Get one with:
   ```bash
   cd apps/mobile
   npx eas-cli@latest build --platform android --profile production
   ```
   Download it from the build page on expo.dev.
3. Release name: `1.0.0 (<versionCode>)` (filled automatically). Release notes: see §10.
4. Save → Review release → **Start rollout to Internal testing**. Open the opt-in link on your phone and install.

## 9. Closed testing — 12 testers for 14 days (required for new personal accounts)

The 14 days count only while **at least 12 testers stay opted in**. If the count drops below 12, the run restarts.

1. Test and release → Testing → **Closed testing** → *Alpha* track (or **Create track** → name `Closed beta`).
2. **Countries/regions**: add every country where your testers live (or all).
3. **Testers** tab → *Create email list* → name `Mindtier beta` → paste 15–20 Gmail addresses, comma-separated → Save.
   Alternatively use a Google Group so testers can join themselves.
4. **Feedback URL or email**: `[support email]`.
5. **Create new release** → upload the same AAB as internal testing (or *Add from library*) → release notes from §10 → **Save** → **Review release** → **Start rollout to Closed testing**.
6. Wait for review (usually hours, sometimes a few days). The track then shows *Available to selected testers*.
7. Copy the **opt-in link** (Testers tab → *How testers join your test*). Send it to every tester with these steps:
   ```
   Thanks for testing Mindtier! Two minutes:
   1. On your Android phone, open this link while signed in to the Google account I added: [opt-in link]
   2. Tap "Become a tester".
   3. Tap "Download it on Google Play" and install Mindtier.
   4. Please keep it installed for 14 days and open it every few days (the Daily Challenge takes 2 minutes).
   Feedback, bugs, anything: reply to this email.
   ```
8. Check daily: Closed testing → **Testers** shows how many have opted in. Publishing overview shows the 14-day progress.
9. During the test, ship at least one update from feedback (a new AAB to the same track). Google's production
   application asks what you changed.
10. After 14 days with ≥12 testers: Dashboard → **Apply for production**. Draft answers:

| Question | Draft answer |
|---|---|
| How did you recruit users for your closed test? | `Friends, family and colleagues with Android phones, invited by email to a Google Group / email list.` |
| How easy was it to recruit testers? | Answer honestly |
| Describe the engagement you received from testers | `Testers played the placement games, daily ranked sessions and the Daily Challenge, and sent friend duels to each other. They reported [number] issues by email, mostly about [topic].` |
| Summarise the feedback you received and how you collected it | `Feedback by email and in conversation. Main points: [1–3 points]. We fixed [what] in version [x].` |
| Who is the intended audience? | `Adults and teens (13+) who enjoy quick puzzle and brain games and like competing on rankings and leaderboards.` |
| How does your app provide value to users? | `Short, adaptive brain games that rate your skill with Glicko-2 and place you on a ranked ladder from Iron to Grandmaster, with a daily challenge, friend duels, monthly seasons and weekly leagues. No ads.` |
| How many installs do you expect in the first year? | Pick the honest range |
| What changes did you make based on the closed test? | `[list the fixes from step 9]` |
| How did you decide the app is ready for production? | `All testers completed placement and daily sessions without crashes; Play pre-launch report clean; we fixed every reported bug.` |

Google answers production applications in about 7 days.

## 10. Release notes (≤500 characters per language)

`<en-US>` block for the release form:
```
<en-US>
First release of Mindtier: find your brain rank in six quick placement games, then climb from Iron to Grandmaster. Daily Challenge, friend duels, monthly seasons and weekly leagues. No ads, ever.
</en-US>
```

## 11. Production release

1. Test and release → **Production** → Countries/regions → add all (or your launch list).
2. Create new release → *Add from library* → the AAB that passed closed testing → release notes from §10.
3. **Review release** → fix any warnings → **Start rollout to Production**. Use a staged rollout (e.g. 20 %) if you want a safety margin.
4. Publishing overview → **Send changes for review**. If *Managed publishing* is on, press **Publish** after approval.

## 12. After launch

- [ ] Website: once the listing is live, the "Get it on Google Play" buttons already point at `https://play.google.com/store/apps/details?id=app.mindtier`.
- [ ] Pre-launch report (Test and release → Pre-launch report): review crashes and accessibility findings for every new release.
- [ ] Android vitals: keep the user-perceived crash rate under 1.09 % and ANR rate under 0.47 %.
- [ ] Reply to reviews from the Console (Ratings and reviews).
