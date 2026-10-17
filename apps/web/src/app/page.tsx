import type { Metadata } from 'next';
import { Landing } from '@/components/Landing';
import { en, landingAlternates } from '@/lib/landing';

export const metadata: Metadata = { alternates: landingAlternates('en') };

export default function Home() {
  return <Landing copy={en} />;
}
