import Link from 'next/link';

export default function NotFound() {
  return (
    <article className="prose" style={{ textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p className="muted">That link doesn’t lead anywhere. If it was a duel invite, it may have expired.</p>
      <Link className="button" href="/">
        Back to Mindtier
      </Link>
    </article>
  );
}
