'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SiteChrome.module.css';

const LANGS = ['en', 'es', 'pt', 'de', 'fr', 'it'] as const;
type Lang = (typeof LANGS)[number];

const NAMES: Record<Lang, string> = { en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch', fr: 'Français', it: 'Italiano' };

const LABELS: Record<Lang, { home: string; how: string; pricing: string; support: string; tagline: string; languages: string }> = {
  en: { home: 'Mindtier home', how: 'How it works', pricing: 'Pricing', support: 'Support', tagline: 'Ranked brain games. No ads, ever.', languages: 'Languages' },
  es: { home: 'Inicio de Mindtier', how: 'Cómo funciona', pricing: 'Precios', support: 'Soporte', tagline: 'Juegos mentales clasificados. Sin anuncios, nunca.', languages: 'Idiomas' },
  pt: { home: 'Início do Mindtier', how: 'Como funciona', pricing: 'Preços', support: 'Suporte', tagline: 'Jogos mentais ranqueados. Sem anúncios, nunca.', languages: 'Idiomas' },
  de: { home: 'Mindtier-Startseite', how: 'So funktioniert es', pricing: 'Preise', support: 'Support', tagline: 'Denkspiele mit Rang. Niemals Werbung.', languages: 'Sprachen' },
  fr: { home: 'Accueil Mindtier', how: 'Comment ça marche', pricing: 'Tarifs', support: 'Assistance', tagline: 'Jeux de réflexion classés. Jamais de pub.', languages: 'Langues' },
  it: { home: 'Home di Mindtier', how: 'Come funziona', pricing: 'Prezzi', support: 'Assistenza', tagline: 'Giochi di logica a gradi. Mai pubblicità.', languages: 'Lingue' },
};

/** Language of the page being shown: a translated landing page, or English everywhere else. */
export function langOf(pathname: string | null): Lang {
  const first = (pathname ?? '/').split('/')[1] ?? '';
  return (LANGS as readonly string[]).includes(first) && first !== 'en' ? (first as Lang) : 'en';
}

const homeOf = (lang: Lang) => (lang === 'en' ? '/' : `/${lang}`);

export function HomeLink({ children }: { children: React.ReactNode }) {
  const lang = langOf(usePathname());
  return (
    <Link href={homeOf(lang)} className={styles.brand} aria-label={LABELS[lang].home}>
      {children}
    </Link>
  );
}

export function MainNav() {
  const lang = langOf(usePathname());
  const l = LABELS[lang];
  return (
    <nav className={styles.nav} aria-label="Main" lang={lang}>
      <Link href={`${homeOf(lang)}#how`}>{l.how}</Link>
      <Link href={`${homeOf(lang)}#pricing`}>{l.pricing}</Link>
      <Link href="/support">{l.support}</Link>
    </nav>
  );
}

export function Tagline() {
  const lang = langOf(usePathname());
  return (
    <p className="faint" lang={lang}>
      {LABELS[lang].tagline}
    </p>
  );
}

export function LanguageLinks() {
  const lang = langOf(usePathname());
  return (
    <nav className={styles.languages} aria-label={LABELS[lang].languages}>
      {LANGS.map((l) => (
        <Link key={l} href={homeOf(l)} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined}>
          {NAMES[l]}
        </Link>
      ))}
    </nav>
  );
}
