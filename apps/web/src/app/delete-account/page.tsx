import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { DeletionForm } from './DeletionForm';

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'How to delete your Mindtier account and data.',
};

export default function DeleteAccount() {
  return (
    <article className="prose">
      <h1>Delete your Mindtier account</h1>
      <p>You can delete your account and its data at any time. Deletion is permanent and cannot be undone.</p>

      <h2>In the app (instant)</h2>
      <ol>
        <li>Open Mindtier and go to the <strong>Climb</strong> tab.</li>
        <li>Tap the settings icon, then <strong>Account</strong>.</li>
        <li>
          Tap <strong>Delete account</strong> and confirm.
        </li>
      </ol>

      <h2>On the web</h2>
      <p>
        If you no longer have the app, request deletion below with the email you saved your progress to. If you never
        added an email, your account is anonymous: uninstalling the app removes local data, and you can email{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with your account ID if you still have it.
      </p>
      <DeletionForm />

      <h2>What is deleted</h2>
      <ul>
        <li>Your profile and display name, and any email linked to your sign-in</li>
        <li>Your ratings, rating history, game results and session records</li>
        <li>Your Daily Challenge leaderboard entries and duel entries</li>
        <li>Your Pro entitlement record and analytics events linked to your account</li>
      </ul>
      <h2>What is kept</h2>
      <ul>
        <li>Purchase records held by Google Play or Apple under their own policies</li>
        <li>Anonymous, aggregated statistics that cannot identify you</li>
        <li>Backups, which roll off within 30 days</li>
      </ul>
      <p>
        Deleting your account does <strong>not</strong> cancel a subscription. Cancel it in Google Play or the App Store
        first to avoid future charges.
      </p>
    </article>
  );
}
