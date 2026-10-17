/** Public web origin (Vercel). Override per environment with EXPO_PUBLIC_WEB_URL. */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://midas-engine.vercel.app').replace(/\/$/, '');

export const links = {
  home: WEB_URL,
  privacy: `${WEB_URL}/privacy`,
  terms: `${WEB_URL}/terms`,
  refunds: `${WEB_URL}/refunds`,
  deleteAccount: `${WEB_URL}/delete-account`,
  support: `${WEB_URL}/support`,
  duel: (id: string) => `${WEB_URL}/duel/${encodeURIComponent(id)}`,
  /** Google Play subscription management (one tap from Settings). */
  playSubscriptions: (sku?: string) =>
    sku
      ? `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(sku)}&package=app.mindtier`
      : 'https://play.google.com/store/account/subscriptions?package=app.mindtier',
  appStoreSubscriptions: 'https://apps.apple.com/account/subscriptions',
  /** Store listing, tagged so installs from the web Daily Challenge can be counted. */
  playStore: 'https://play.google.com/store/apps/details?id=app.mindtier&referrer=utm_source%3Dweb_daily',
} as const;
