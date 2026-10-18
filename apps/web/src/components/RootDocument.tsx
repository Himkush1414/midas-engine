import type { Metadata, Viewport } from 'next';
import { Footer, Header } from '@/components/SiteChrome';
import { body, display, mono } from '@/lib/fonts';
import { SITE } from '@/lib/site';

/** Shared by every root layout (English pages, translated landing pages) and the global 404. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — What tier is your mind?`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: 'summary_large_image', title: `${SITE.name} — What tier is your mind?`, description: SITE.description },
  other: { 'google-play-app': `app-id=${SITE.androidPackage}` },
};

export const rootViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F0D0B' },
    { media: '(prefers-color-scheme: light)', color: '#F1EBE1' },
  ],
};

/** The <html> document with the page's real language, fonts and site chrome. */
export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-skip">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
