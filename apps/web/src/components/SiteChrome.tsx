import Link from 'next/link';
import { SITE } from '@/lib/site';
import { HomeLink, LanguageLinks, MainNav, Tagline } from './SiteNav';
import styles from './SiteChrome.module.css';

/** The Floodlight mark (brand/logo-mark.svg): a volt tier hexagon on ink with two climbing chevrons. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true">
      <rect width="1024" height="1024" rx="200" fill="#0F0D0B" />
      <g strokeLinecap="round" strokeLinejoin="round">
        <polygon points="512,170 808,341 808,683 512,854 216,683 216,341" fill="#D7FF3A" stroke="#D7FF3A" strokeWidth="40" />
        <polyline points="352,672 512,560 672,672" fill="none" stroke="#0F0D0B" strokeWidth="76" opacity="0.42" />
        <polyline points="352,528 512,416 672,528" fill="none" stroke="#0F0D0B" strokeWidth="76" />
      </g>
    </svg>
  );
}

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <HomeLink>
          <Logo />
          <span>{SITE.name}</span>
        </HomeLink>
        <MainNav />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div>
          <div className={styles.brand}>
            <Logo size={24} />
            <span>{SITE.name}</span>
          </div>
          <Tagline />
          <LanguageLinks />
        </div>
        <nav className={styles.footerNav} aria-label="Legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refunds">Refunds &amp; Cancellation</Link>
          <Link href="/delete-account">Delete your account</Link>
          <Link href="/support">Support</Link>
        </nav>
      </div>
      <div className={`container ${styles.copy}`}>
        <span className="faint">
          © 2026 {SITE.legalName}. Mindtier is a game: ranks compare skill at its puzzles and are not an IQ, medical or
          diagnostic assessment.
        </span>
      </div>
    </footer>
  );
}
