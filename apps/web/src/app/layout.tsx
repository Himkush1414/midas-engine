import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Footer, Header } from '@/components/SiteChrome';
import { SITE } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', weight: ['600', '700'], display: 'swap' });

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0D1A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F6FB' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body style={{ ['--font-body' as string]: 'var(--font-inter)', ['--font-display' as string]: 'var(--font-grotesk)' }}>
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
