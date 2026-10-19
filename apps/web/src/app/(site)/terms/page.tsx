import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms of Service', description: 'The rules for using Mindtier and Mindtier Pro.' };

export default function Terms() {
  return (
    <article className="prose">
      <h1>Terms of Service</h1>
      <p className="faint">Effective {SITE.effectiveDate}</p>
      <p>
        These terms are an agreement between you and {SITE.legalName} (“we”) for the Mindtier app and website. By using
        Mindtier you agree to them. If you do not agree, please do not use the app.
      </p>

      <h2>1. Mindtier is a game</h2>
      <p>
        Mindtier offers puzzle games and a rating system that compares your performance at those games with other players.
        Ranks, ratings, tiers and percentiles describe skill at Mindtier’s games only. They are <strong>not</strong> an IQ
        test or a medical, psychological, educational or diagnostic assessment, and Mindtier is not intended to diagnose,
        treat or prevent any condition. We make no claim that playing improves memory, intelligence or any other ability
        outside the game.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <p>
        You must be at least 13 years old (or the minimum age in your country). An anonymous account is created when you
        first open the app; you can optionally add an email to keep your progress. You are responsible for activity on your
        account.
      </p>

      <h2>3. Fair play</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use bots, scripts, emulators or any tool to automate play or answers;</li>
        <li>tamper with the app, its network traffic or our servers, or exploit bugs to gain rating;</li>
        <li>create multiple accounts to manipulate leaderboards or duels;</li>
        <li>choose a display name that is offensive, impersonates someone, or infringes rights.</li>
      </ul>
      <p>We verify results on our servers and may reset ratings, remove leaderboard entries or suspend accounts that break these rules.</p>

      <h2>4. Mindtier Pro and billing</h2>
      <ul>
        <li>
          Mindtier Pro is offered as an auto-renewing subscription (monthly or yearly) or a one-time lifetime purchase.
          Prices are shown in the app in your local currency before you buy.
        </li>
        <li>
          Purchases are made through Google Play or the Apple App Store and are subject to their terms. Payment is charged
          to your store account when you confirm the purchase.
        </li>
        <li>
          Subscriptions renew automatically at the end of each period at the then-current price unless you cancel at least
          24 hours before the renewal date.
        </li>
        <li>
          <strong>Free trials:</strong> if a plan includes a free trial, you will not be charged during the trial. If you do
          not cancel before it ends, the subscription starts and you are charged the price shown when you started the
          trial. We send a reminder before the trial ends.
        </li>
        <li>
          You can manage or cancel at any time in the app (<em>Settings → Manage subscription</em>) or in your Google Play or
          App Store account. Cancelling stops future renewals; Pro remains active until the end of the paid period.
        </li>
        <li>
          Refunds are described in our <Link href="/refunds">Refund &amp; Cancellation Policy</Link>.
        </li>
      </ul>

      <h2>5. Free features</h2>
      <p>
        We intend to keep a free daily ranked session, the Daily Challenge and duels with friends available without
        payment, and never to show ads. We may change features over time and will give notice of material changes.
      </p>

      <h2>6. Content and licence</h2>
      <p>
        We grant you a personal, non-exclusive, non-transferable licence to use the app for your own non-commercial
        entertainment. The app, its games, artwork and software are owned by us or our licensors.
      </p>

      <h2>7. Termination</h2>
      <p>
        You may stop using Mindtier and delete your account at any time. We may suspend or end access if you seriously or
        repeatedly breach these terms. Deleting your account does not cancel a store subscription — cancel it in Google
        Play or the App Store.
      </p>

      <h2>8. Disclaimers and liability</h2>
      <p>
        The app is provided “as is”. To the extent permitted by law, we disclaim implied warranties and are not liable for
        indirect or consequential losses, and our total liability is limited to the amount you paid us in the 12 months
        before the claim. Nothing in these terms limits rights you have under consumer protection laws that cannot be
        excluded.
      </p>

      <h2>9. Changes and governing law</h2>
      <p>
        We may update these terms; the effective date above will change and material updates will be shown in the app.
        These terms are governed by the laws of the country where {SITE.legalName} is resident, without affecting mandatory protections of the
        country where you live.
      </p>

      <h2>10. Contact</h2>
      <p>
        {SITE.legalName}
        {SITE.legalAddress ? `, ${SITE.legalAddress}` : ''}. Email: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </article>
  );
}
