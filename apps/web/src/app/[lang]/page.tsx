import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Landing } from '@/components/Landing';
import { LANDING, isLandingLang, landingMetadata } from '@/lib/landing';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LANDING).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return isLandingLang(lang) ? landingMetadata(LANDING[lang]) : {};
}

export default async function LocalizedHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLandingLang(lang)) notFound();
  return <Landing copy={LANDING[lang]} />;
}
