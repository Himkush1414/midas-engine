# HANDOFF — remaining manual steps

Everything that could be built, configured or deployed without your personal accounts is done. These steps need you: they involve accounts, legal identity, or payment profiles that only the owner can create. They are ordered so each unblocks the next. Values in `[brackets]` are yours to fill in.

Secrets referenced below live in your local `.env.local` (git-ignored). Nothing secret is in the repository.

---

## 0. What is already live and configured

| Piece | State |
|---|---|
| GitHub repo | `main` with CI (typecheck, lint, tests for core, mobile and web) |
| Supabase | Schema + RLS + API functions applied (`supabase/migrations`), anonymous sign-in on, 6-digit email codes (15 min) |
| Vercel | Project `midas-engine` → root `apps/web`, Node 24, env vars set. It is the only project linked to the GitHub repo. Git auto-deploy is **disabled** twice over (plan limits): `git.deploymentEnabled: false` in `vercel.json`, and Settings → Git → *Create deployments* off. Deploy with `node scripts/deploy-web.mjs` |
| EAS | Project `@midas-hq/mindtier`, remote Android keystore, env vars per environment, update channels, first production AAB built |
| Design | The **Floodlight** design system (`docs/DESIGN_DIRECTION.md`, research in `docs/DESIGN_RESEARCH.md`) across the app, the web Daily Challenge, the website, the brand mark and the store graphics. Visual QA: `node scripts/qa-sheet.mjs --out <dir> <scene…>` (dark/light contact sheets of any scene in `scripts/screenshots.mjs`) |
| Store assets | Listing copy, 8 screenshots per language, feature graphics and icon in `store/`, all in the Floodlight style — see `docs/STORE_LISTING.md` |
| Compliance | Data safety, content rating and permission answers in `docs/PLAY_COMPLIANCE.md` |

---

## 1. Vercel — publish the website (privacy, terms, deletion pages, API)

The Hobby plan allows 100 deployments per 24 h. Early in the build both git-linked projects deployed on every push and hit the limit (it reset 2026-10-17 08:13 UTC). If the site isn't live yet:

```bash
set -a; . ./.env.local; set +a
node scripts/db-migrate.mjs      # applies pending supabase/migrations (0003_seasons, 0004_leagues, 0005_language_skill, …) — always before deploying
node scripts/deploy-web.mjs      # deploys HEAD of main to production and waits for READY (refuses while migrations are pending)
# The Vercel build also exports the web Daily Challenge to /play (scripts/build-play.mjs, about 1–2 extra minutes).
# It installs the whole workspace (apps/web/vercel.json installCommand) because /play is built from apps/mobile.
curl https://midas-engine.vercel.app/api/health
```

Recommended:
1. **Delete the stray project `midas-engine-pggb`** (Vercel → midas-engine-pggb → Settings → Advanced → Delete). It was an accidental duplicate with no env vars, no custom domain and no working build. It has been unlinked from the repo (2026-10-17), so it can no longer post failing checks to GitHub; deleting it just tidies the dashboard.
2. Add legal identity env vars (Project → Settings → Environment Variables, Production and Preview), then redeploy:
   - `NEXT_PUBLIC_SUPPORT_EMAIL` = `[support@yourdomain]`
   - `NEXT_PUBLIC_LEGAL_NAME` = `[Your company or full legal name]`
   - `NEXT_PUBLIC_LEGAL_ADDRESS` = `[Registered address]`
3. In `apps/web/src/app/terms/page.tsx`, replace `[Governing jurisdiction]`.
4. Optional: a custom domain (e.g. `mindtier.app`). If you add one, update `NEXT_PUBLIC_SITE_URL` (Vercel), `EXPO_PUBLIC_WEB_URL` / `EXPO_PUBLIC_API_URL` (EAS env, all environments) and `WEB_URL` for `scripts/configure-auth.mjs`, then rebuild the app. App links read the host from `EXPO_PUBLIC_WEB_URL`.

## 2. Supabase — email delivery (needed for "Save progress to email")

Anonymous play works today. Saving progress to an email needs real email delivery: Supabase's built-in mailer only sends to project team members.

1. Create an SMTP provider account (Resend, Postmark or AWS SES) and verify your sending domain.
2. Supabase Dashboard → Authentication → SMTP Settings → enable custom SMTP; sender `no-reply@[yourdomain]`.
3. Apply the Mindtier email templates (code-style emails):
   ```bash
   set -a; . ./.env.local; set +a
   WEB_URL=https://midas-engine.vercel.app node scripts/configure-auth.mjs
   ```
4. Raise Authentication → Rate Limits → "emails sent" to fit your expected volume.

## 3. Legal

- Run a trademark search for **MINDTIER** (USPTO TESS, EUIPO, WIPO Global Brand Database; classes 9, 41, 42) before spending on marketing. Store and web checks found no conflict, but that isn't legal clearance.
- Have the privacy policy and terms reviewed for your jurisdiction. They accurately describe what the app does (see `docs/PLAY_COMPLIANCE.md`).

## 4. Google Play Console

1. Create a developer account (one-time $25). **New personal accounts must run a closed test with at least 12 testers for 14 continuous days before applying for production.** Start this early.
2. Create the app: name **Mindtier: Ranked Brain Games**, default language en-US, App, Free (with in-app purchases).
3. App integrity → **Play App Signing**: keep Google-managed signing. The EAS keystore becomes the upload key.
4. Download the latest AAB:
   ```bash
   cd apps/mobile
   npx eas-cli@latest build --platform android --profile production   # builds a fresh AAB; versionCode auto-increments
   ```
   Then upload it to **Internal testing** (download link from the EAS build page), or submit with `npx eas-cli@latest submit -p android` after step 4.9.
   The AAB built on 2026-10-18 (versionCode 5) predates the Floodlight redesign; build a fresh one so testers get the new look, icon and splash.
5. Store presence → Main store listing: paste from `docs/STORE_LISTING.md`; upload `store/graphics/play-icon-512.png`, `store/graphics/feature-graphic.png` and `store/screenshots/phone/*.png`.
   Then **Manage translations → Add your own translations** for es-419/es-ES, pt-BR, de-DE, fr-FR and it-IT: paste each language's texts from the *Localized listings* section and upload `store/graphics/feature-graphic-<lang>.png` and `store/screenshots/phone/<lang>/*.png`.
6. Policy → App content: fill in every declaration from `docs/PLAY_COMPLIANCE.md` (privacy policy URL, ads = No, app access = no login needed, content rating, target audience 13+, Data safety, account deletion URL).
7. Monetize → Products → create the subscriptions and the one-time product exactly as in the table in `docs/STORE_LISTING.md` (IDs must match). Enable grace period and account hold.
8. Payments profile → set up a merchant account (needed to sell).
9. For `eas submit`: Google Cloud → create a service account with access to the Play Console app (Release manager) → download its JSON key → `npx eas-cli@latest credentials` → Android → Google Service Account → upload. Keep the JSON out of git.

## 5. RevenueCat — turns on real purchases

The app ships with a full RevenueCat integration that switches on as soon as a key is present (until then, release builds clearly say purchases aren't available and never grant Pro).

1. Create a RevenueCat project → add an **Android app** with package `app.mindtier`, and connect Play using the service account JSON from step 4.9 (RevenueCat → App settings → Service credentials).
2. Products: import `mindtier_pro_yearly`, `mindtier_pro_monthly`, `mindtier_pro_lifetime`.
3. Entitlement: create **`pro`** and attach all three products.
4. Offering: **`default`** (current) with packages **Annual** → yearly, **Monthly** → monthly, **Lifetime** → lifetime.
5. Copy the **public Android SDK key** (`goog_…`) and add it to EAS for every environment:
   ```bash
   cd apps/mobile
   for e in production preview development; do
     npx eas-cli@latest env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value [goog_key] --environment $e --visibility plaintext --non-interactive --force
   done
   ```
6. Integrations → **Webhooks** → URL `https://midas-engine.vercel.app/api/v1/webhooks/revenuecat`, Authorization header `Bearer [REVENUECAT_WEBHOOK_SECRET from .env.local]`. Send a test event: the endpoint answers `{ ok: true }`.
7. Rebuild the app (step 4.4). The RevenueCat app user ID is the Supabase user ID, so webhook events map to accounts automatically.

## 6. Android App Links (duel links open the app)

1. Get the SHA-256 fingerprints of both certificates:
   - Upload key: `cd apps/mobile && npx eas-cli@latest credentials -p android` → Keystore → SHA256 fingerprint.
   - App signing key: Play Console → Setup → App signing → SHA-256 certificate fingerprint.
2. Vercel env `ANDROID_CERT_SHA256` = `[upload_sha256],[signing_sha256]` (colon-separated hex), then redeploy.
3. Check: `https://midas-engine.vercel.app/.well-known/assetlinks.json` lists both.

## 7. Push notifications for duels

The app asks for notification permission only when a player creates or plays a duel, registers an Expo push token and the API notifies the other player. Delivery on Android needs Firebase credentials on EAS:

1. Firebase console → create a project → add an Android app `app.mindtier` (you don't need to download google-services.json for Expo push).
2. Project settings → Service accounts → generate a private key (FCM V1).
3. `cd apps/mobile && npx eas-cli@latest credentials -p android` → Push Notifications: FCM V1 → upload that JSON. Never commit it.
4. iOS: EAS creates the APNs key during the first iOS build.
5. Test: create a duel on one phone, play it on another; the creator gets "Sam beat your score…".

## 8. Crash reporting (optional, recommended)

1. Create a Sentry project (React Native).
2. EAS env (all environments): `EXPO_PUBLIC_SENTRY_DSN=[dsn]`.
3. For readable stack traces, add EAS secrets `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` (visibility: secret), and remove `SENTRY_DISABLE_AUTO_UPLOAD` from `apps/mobile/eas.json`. `app.config.ts` enables the Sentry plugin automatically when org and project are set.
4. Players can opt out in Settings → Privacy. The privacy policy already covers crash data.

## 9. Apple App Store (secondary)

The code is iOS-ready: privacy manifest, no tracking (no ATT prompt needed), universal links, App Store subscription management link, and no third-party social login (so Sign in with Apple isn't required).

1. Apple Developer Program ($99/yr). Register the bundle ID `app.mindtier` with Associated Domains.
2. Vercel env `APPLE_TEAM_ID=[TEAMID]` → redeploy → check `/.well-known/apple-app-site-association`.
3. App Store Connect: create the app, create subscriptions matching the Android ones (same IDs), and add them to RevenueCat (iOS app + `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in EAS env).
4. `cd apps/mobile && npx eas-cli@latest build -p ios --profile production` (EAS handles certificates interactively the first time), then `eas submit -p ios`.
5. App Privacy questionnaire: mirror `NSPrivacyCollectedDataTypes` in `app.config.ts` (user ID, email, gameplay, purchases, product interaction, crash data; none used for tracking).

## 10. After launch

- Watch the funnel in Supabase (`events` table): `onboarding_started → placement_completed → paywall_viewed → purchase_completed`.
- Ship JS-only fixes over the air: `cd apps/mobile && npx eas-cli@latest update --channel production --message "…"`.
- First experiments worth running: trial length (7 vs 14 days — RevenueCat data favours longer trials), paywall timing after placement, and regional prices.
