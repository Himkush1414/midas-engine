import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'What Mindtier collects, why, and how to delete it.' };

export default function Privacy() {
  return (
    <article className="prose">
      <h1>Privacy Policy</h1>
      <p className="faint">Effective {SITE.effectiveDate}</p>
      <p>
        This policy explains what {SITE.name} (“we”, “us”), operated by {SITE.legalName}, collects when you use the
        Mindtier mobile app and website, why we collect it, and the choices you have. We built Mindtier to need very
        little data: there are no ads, no advertising identifiers and no selling or sharing of personal data.
      </p>

      <h2>Summary</h2>
      <ul>
        <li>You can play without creating an account. We assign a random, anonymous account ID.</li>
        <li>We store your game results and ratings so your rank works across sessions and devices.</li>
        <li>Email is optional and only used to sign in and protect your progress.</li>
        <li>Payments are handled by Google Play or the Apple App Store. We never see your card details.</li>
        <li>You can delete your account and data at any time from the app or our website.</li>
      </ul>

      <h2>Information we collect</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Why</th>
            <th>Required?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Anonymous account ID (random identifier created on first launch)</td>
            <td>To save your ratings and results and sync them</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Gameplay data: games played, scores, accuracy, difficulty reached, ratings and their history, timestamps</td>
            <td>To calculate your rank, run the Daily Challenge leaderboard, duels and weekly leagues (if you join), and detect cheating</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Email address</td>
            <td>Only if you choose to save your progress to an email, so you can sign in on another device</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Display name</td>
            <td>Only if you set one; shown to friends in duels, on leaderboards and to your weekly league group</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Purchase status (which plan is active and when it renews or expires)</td>
            <td>To unlock Mindtier Pro on your account</td>
            <td>Only for Pro</td>
          </tr>
          <tr>
            <td>App usage events (e.g. “session completed”, “paywall viewed”), without device identifiers</td>
            <td>To understand which features work and improve the app. You can turn this off in Settings.</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Push notification token</td>
            <td>Only if you allow duel notifications; used to tell you when a friend plays your duel</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Crash diagnostics (error details, app version, device model and OS version)</td>
            <td>To find and fix crashes</td>
            <td>No — only when crash reporting is enabled in the app</td>
          </tr>
        </tbody>
      </table>
      <p>
        Individual answers are used on our servers to verify each game and are not stored; we keep the per-game
        summary. We do not collect your location, contacts, photos, microphone or camera data, and we do not use
        advertising IDs or cross-app tracking.
      </p>

      <h2>Reminders and notifications</h2>
      <p>
        Daily reminders, the weekly recap and trial-ending reminders are scheduled locally on your device. If you allow
        notifications when you create or play a duel, we store a push notification token for your device so we can tell
        you when the other player finishes. You can turn notifications off at any time in your device settings; deleting your account
        removes the token.
      </p>

      <h2>Playing in your browser</h2>
      <p>
        The Daily Challenge at <code>/play</code> works the same way as the app: it signs you in anonymously, keeps your
        progress in your browser&rsquo;s local storage and sends your verified result to the leaderboard. Clearing your
        browser data removes the local copy; to delete the server copy, use our account deletion page.
      </p>

      <h2>Service providers</h2>
      <p>We use a small number of processors who handle data on our behalf under contract:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — database and sign-in. Data is stored in the Asia-Pacific (Seoul) region.
        </li>
        <li>
          <strong>Vercel</strong> — hosts our website and the API that verifies game results.
        </li>
        <li>
          <strong>RevenueCat</strong> — manages subscription status. It receives your anonymous account ID and purchase
          receipts from the store.
        </li>
        <li>
          <strong>Google Play / Apple App Store</strong> — process payments under their own privacy policies.
        </li>
        <li>
          <strong>Email delivery provider</strong> — sends sign-in codes if you add an email.
        </li>
        <li>
          <strong>Sentry</strong> — crash reporting, when enabled.
        </li>
        <li>
          <strong>Expo push service</strong> (with Google Firebase Cloud Messaging and Apple Push Notification service) —
          delivers duel notifications if you allow them.
        </li>
      </ul>
      <p>We do not sell personal data and do not share it for advertising.</p>

      <h2>How long we keep data</h2>
      <p>
        We keep your account data while your account exists. When you delete your account, your profile, ratings,
        results, leaderboard, league and duel entries are deleted immediately from our live database, and removed from
        backups within 30 days. Aggregated statistics that cannot identify you may be kept. Requests submitted through
        our website are processed within 30 days.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example under the GDPR, UK GDPR or CCPA/CPRA), you may have the right to access,
        correct, export or delete your personal data, and to object to or restrict certain processing. You can delete
        your account yourself in <em>Settings → Account → Delete account</em> or on our{' '}
        <Link href="/delete-account">account deletion page</Link>. For anything else, email{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. You may also complain to your local data
        protection authority.
      </p>
      <p>
        Legal bases (EEA/UK): performance of a contract (running the game and your account), legitimate interests (fraud
        prevention, crash fixing and product analytics, which you can opt out of), and consent where we ask for it (for
        example notifications).
      </p>

      <h2>Children</h2>
      <p>
        Mindtier is not directed to children under 13 (or the minimum age in your country) and we do not knowingly collect
        their personal data. If you believe a child has given us data, contact us and we will delete it.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit (TLS). Access to the database is restricted by row-level security so each account can
        only read its own data; game results are verified on our servers before they affect ratings.
      </p>

      <h2>International transfers</h2>
      <p>
        Our providers may process data outside your country. Where required, transfers are protected by appropriate
        safeguards such as Standard Contractual Clauses.
      </p>

      <h2>Changes</h2>
      <p>
        We will update this policy if what we collect changes, and show the new effective date above. Material changes will
        be highlighted in the app.
      </p>

      <h2>Contact</h2>
      <p>
        {SITE.legalName}
        {SITE.legalAddress ? `, ${SITE.legalAddress}` : ''}. Email: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </article>
  );
}
