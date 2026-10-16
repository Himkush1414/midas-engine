/** Public site constants. Legal identity values are placeholders until the owner fills them (see docs/HANDOFF.md). */
export const SITE = {
  name: 'Mindtier',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://midas-engine.vercel.app').replace(/\/$/, ''),
  tagline: 'Ranked brain games',
  description:
    'Find your brain rank in five quick placement games, then climb from Iron to Grandmaster. Adaptive puzzles, daily challenges and friend duels. No ads, ever.',
  playUrl: 'https://play.google.com/store/apps/details?id=app.mindtier',
  androidPackage: 'app.mindtier',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@example.com',
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? '[Legal entity name]',
  legalAddress: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? '[Registered address]',
  effectiveDate: '16 October 2026',
} as const;
