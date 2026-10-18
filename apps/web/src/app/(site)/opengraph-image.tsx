import { OG_SIZE, ogCard } from '@/server/og';

export const alt = 'Mindtier — What tier is your mind?';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogCard({
    eyebrow: 'Ranked brain games',
    title: 'What tier is your mind?',
    subtitle: 'Five placement games. Iron to Grandmaster. Then climb.',
  });
}
