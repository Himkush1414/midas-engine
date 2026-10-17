import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { de } from './de';
import { en, type LandingCopy } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';

/** Translated landing pages live at /es, /pt, /de and /fr; English is the root. */
export const LANDING: Record<'es' | 'pt' | 'de' | 'fr', LandingCopy> = { es, pt, de, fr };
export type LandingLang = keyof typeof LANDING;

export function isLandingLang(value: string): value is LandingLang {
  return Object.hasOwn(LANDING, value);
}

/** hreflang alternates so search engines show each visitor their language. */
export function landingAlternates(current: 'en' | LandingLang): Metadata['alternates'] {
  return {
    canonical: current === 'en' ? '/' : `/${current}`,
    languages: { en: '/', ...Object.fromEntries(Object.keys(LANDING).map((l) => [l, `/${l}`])), 'x-default': '/' },
  };
}

export function landingMetadata(copy: LandingCopy): Metadata {
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: landingAlternates(copy.lang),
    openGraph: { title: copy.metaTitle, description: copy.metaDescription, url: copy.lang === 'en' ? SITE.url : `${SITE.url}/${copy.lang}`, locale: copy.lang },
  };
}

export { en };
