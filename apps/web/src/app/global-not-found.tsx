import type { Metadata } from 'next';
import Link from 'next/link';
import { RootDocument } from '@/components/RootDocument';
import './globals.css';

export const metadata: Metadata = { title: 'Page not found · Mindtier', robots: { index: false } };

/** 404 for URLs that match no route at all (the site has one root layout per language). */
export default function GlobalNotFound() {
  return (
    <RootDocument lang="en">
      <article className="prose not-found">
        <p className="kicker">404</p>
        <h1>Page not found</h1>
        <p className="muted">That link doesn’t lead anywhere. If it was a duel invite, it may have expired.</p>
        <Link className="button" href="/">
          Back to Mindtier
        </Link>
      </article>
    </RootDocument>
  );
}
