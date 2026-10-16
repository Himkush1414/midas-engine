'use client';

import { useState } from 'react';
import styles from './page.module.css';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

export function DeletionForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function submit(form: FormData) {
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/v1/deletion-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), note: form.get('note') ?? '', website: form.get('website') ?? '' }),
      });
      if (res.ok) return setState({ kind: 'done' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setState({ kind: 'error', message: body.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setState({ kind: 'error', message: 'Network error. Please try again.' });
    }
  }

  if (state.kind === 'done') {
    return (
      <div className="card" role="status">
        <h3>Request received</h3>
        <p className="muted">We’ll delete the account linked to that email and confirm by email within 30 days.</p>
      </div>
    );
  }

  return (
    <form className={`card ${styles.form}`} action={submit}>
      <label htmlFor="email">Email address linked to your Mindtier account</label>
      <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
      <label htmlFor="note">Account ID or anything that helps us find your account (optional)</label>
      <textarea id="note" name="note" rows={3} maxLength={1000} />
      <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="button" type="submit" disabled={state.kind === 'sending'}>
        {state.kind === 'sending' ? 'Sending…' : 'Request deletion'}
      </button>
      {state.kind === 'error' ? (
        <p role="alert" className={styles.error}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
