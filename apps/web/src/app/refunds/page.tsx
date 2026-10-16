import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Refund & Cancellation Policy', description: 'How to cancel Mindtier Pro and request a refund.' };

export default function Refunds() {
  return (
    <article className="prose">
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="faint">Effective {SITE.effectiveDate}</p>

      <h2>Cancel anytime</h2>
      <p>You can cancel a Mindtier Pro subscription whenever you like:</p>
      <ul>
        <li>
          <strong>In the app:</strong> Settings → Manage subscription (opens your store’s subscription page).
        </li>
        <li>
          <strong>Google Play:</strong> Play Store app → profile icon → Payments &amp; subscriptions → Subscriptions →
          Mindtier → Cancel subscription.
        </li>
        <li>
          <strong>Apple App Store:</strong> Settings → your name → Subscriptions → Mindtier → Cancel Subscription.
        </li>
      </ul>
      <p>
        Cancel at least 24 hours before the renewal date to avoid the next charge. After cancelling you keep Pro until the
        end of the period you paid for. Cancelling during a free trial ends the trial without any charge.
      </p>

      <h2>Refunds</h2>
      <ul>
        <li>
          <strong>Google Play purchases:</strong> you can request a refund from Google within 48 hours of purchase at{' '}
          <a href="https://support.google.com/googleplay/workflow/9813244">Google Play’s refund page</a>. After 48 hours,
          email us and we will review your request — we refund accidental purchases, charges you didn’t expect after a
          trial, and cases where Pro didn’t work as described.
        </li>
        <li>
          <strong>App Store purchases:</strong> Apple handles all refunds. Request one at{' '}
          <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>.
        </li>
        <li>
          <strong>Lifetime purchases</strong> follow the same rules as subscriptions.
        </li>
      </ul>
      <p>
        Where the law in your country gives you additional rights (for example a statutory withdrawal right), those rights
        apply in addition to this policy.
      </p>

      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with your purchase order number (from your
        receipt email) and we will reply within 3 business days.
      </p>
    </article>
  );
}
