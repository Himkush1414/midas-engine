import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const BRAND_INK = '#0A0D1A';
const WEB_HOST = new URL(process.env.EXPO_PUBLIC_WEB_URL ?? 'https://midas-engine.vercel.app').host;

const appId = IS_DEV ? 'app.mindtier.dev' : IS_PREVIEW ? 'app.mindtier.preview' : 'app.mindtier';
const appName = IS_DEV ? 'Mindtier (Dev)' : IS_PREVIEW ? 'Mindtier (Preview)' : 'Mindtier';

// Sentry's native plugin (source maps, native crash config) is enabled once an org and project are configured.
const SENTRY_PLUGIN: [string, Record<string, string>][] =
  process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? [['@sentry/react-native/expo', { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT }]]
    : [];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: 'mindtier',
  owner: 'midas-hq',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mindtier',
  userInterfaceStyle: 'automatic',
  backgroundColor: BRAND_INK,
  ios: {
    bundleIdentifier: appId,
    supportsTablet: true,
    associatedDomains: [`applinks:${WEB_HOST}`],
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: appId,
    adaptiveIcon: {
      backgroundColor: BRAND_INK,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Duel invite links open the app directly (verified via /.well-known/assetlinks.json).
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: WEB_HOST, pathPrefix: '/duel/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#6D4CF5',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: BRAND_INK,
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
      },
    ],
    ...SENTRY_PLUGIN,
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
