import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const BRAND_INK = '#0A0D1A';

const appId = IS_DEV ? 'app.mindtier.dev' : IS_PREVIEW ? 'app.mindtier.preview' : 'app.mindtier';
const appName = IS_DEV ? 'Mindtier (Dev)' : IS_PREVIEW ? 'Mindtier (Preview)' : 'Mindtier';

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
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
