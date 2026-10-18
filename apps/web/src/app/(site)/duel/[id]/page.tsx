import { GAMES, isGameId } from '@mindtier/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { loadDuel } from '@/server/duels';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const duel = await loadDuel(id.toLowerCase(), null).catch(() => null);
  const who = duel?.creatorName ?? 'A friend';
  return {
    title: `${who} challenged you`,
    description: `${who} challenged you to a Mindtier duel: the same three brain games, one winner.`,
    robots: { index: false },
  };
}

export default async function Duel({ params }: Props) {
  const { id } = await params;
  const duel = await loadDuel(id.toLowerCase(), null);
  if (!duel) notFound();
  const deepLink = `mindtier://duel/${duel.id}`;

  return (
    <article className="prose" style={{ textAlign: 'center' }}>
      <p className="faint">Duel {duel.id.toUpperCase()}</p>
      <h1>{duel.creatorName} challenged you</h1>
      <p className="muted">
        You’ll both play the exact same three puzzles. Highest score wins.
        {duel.expired ? ' This duel has expired.' : ` Open until ${new Date(duel.expiresAt).toUTCString().slice(0, 16)}.`}
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {duel.games.filter(isGameId).map((g) => (
          <li key={g}>
            <strong>{GAMES[g].name}</strong> <span className="faint">· {GAMES[g].domain}</span>
          </li>
        ))}
      </ul>
      {duel.entries.length > 0 ? (
        <div className="card" style={{ margin: '24px 0' }}>
          {duel.entries.map((e) => (
            <p key={`${e.name}-${e.points}`} style={{ margin: '4px 0' }}>
              {e.name}: <strong>{e.points.toLocaleString('en-US')}</strong> pts
            </p>
          ))}
        </div>
      ) : null}
      {!duel.expired ? (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="button" href={deepLink}>
            Open in Mindtier
          </a>
          <a className="button secondary" href={SITE.playUrl}>
            Get the app
          </a>
        </div>
      ) : null}
    </article>
  );
}
