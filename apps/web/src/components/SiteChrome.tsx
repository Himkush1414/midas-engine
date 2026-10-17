import Link from 'next/link';
import { SITE } from '@/lib/site';
import { HomeLink, LanguageLinks, MainNav, Tagline } from './SiteNav';
import styles from './SiteChrome.module.css';

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id="logo-edge" x1="226" y1="182" x2="798" y2="842" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B6CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="224" fill="#0A0D1A" />
      <g fill="none" stroke="url(#logo-edge)" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="512,182 797.8,347 797.8,677 512,842 226.2,677 226.2,347" strokeWidth="56" />
        <polyline points="352,704 512,584 672,704" strokeWidth="64" opacity="0.5" />
        <polyline points="352,584 512,464 672,584" strokeWidth="64" />
      </g>
      <circle cx="512" cy="352" r="40" fill="#FCD34D" />
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
