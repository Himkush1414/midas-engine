import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Support', description: 'Get help with Mindtier.' };

export default function Support() {
  return (
    <article className="prose">
      <h1>Support</h1>
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> — we reply within 3 business days. Including
        your account ID (Settings → Account) helps us find your data quickly.
      </p>

      <h2>Common questions</h2>
      <h3>I got a new phone. How do I keep my rank?</h3>
      <p>
        Before switching, open Settings → Account → Save progress and add your email. On the new phone, choose “Sign in with
        email” and enter the code we send you.
      </p>
      <h3>I bought Pro but it isn’t showing.</h3>
      <p>
        Open the Pro screen and tap “Restore purchases” while signed into the same Google Play or Apple account you used to
        buy. If it still doesn’t appear, email us your order number.
      </p>
      <h3>How do I cancel?</h3>
      <p>
        See our <Link href="/refunds">Refund &amp; Cancellation Policy</Link> — it takes about 20 seconds.
      </p>
      <h3>My rating went down. Is that a bug?</h3>
      <p>
        Ratings move both ways: every game is generated at your current rating, and a weaker game lowers it a little. New
        ratings move faster while the system learns your level, then settle.
      </p>
      <h3>How do I delete my account?</h3>
      <p>
        In the app: Settings → Account → Delete account. Or use our <Link href="/delete-account">account deletion page</Link>.
      </p>
    </article>
  );
}
