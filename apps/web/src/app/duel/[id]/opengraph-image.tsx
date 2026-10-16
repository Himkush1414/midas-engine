import { loadDuel } from '@/server/duels';
import { OG_SIZE, ogCard } from '@/server/og';

export const alt = 'A Mindtier duel invitation';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const duel = await loadDuel(id.toLowerCase(), null).catch(() => null);
  const who = duel?.creatorName ?? 'A friend';
  const score = duel?.entries.find((e) => e.isCreator)?.points;
  return ogCard({
    eyebrow: `Duel ${id.toUpperCase()}`,
    title: `${who} challenged you`,
    subtitle: score ? `Beat ${score.toLocaleString('en-US')} points on the same three puzzles.` : 'Same three puzzles. Highest score wins.',
  });
}
