import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const EAS_PROJECT_ID = 'd5f3f04d-c19f-4980-a108-d9db5774a0de';
const BRAND_INK = '#0A0D1A';
/** Must match LANGUAGES in src/i18n/core.ts (the config loader can't import app code; a test keeps them in sync). */
export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'de', 'fr', 'it'];
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
    // App-level privacy manifest. No tracking; data types mirror the privacy policy.
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeUserID', NSPrivacyCollectedDataTypeLinked: true, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'] },
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress', NSPrivacyCollectedDataTypeLinked: true, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'] },
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeGameplayContent', NSPrivacyCollectedDataTypeLinked: true, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'] },
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePurchaseHistory', NSPrivacyCollectedDataTypeLinked: true, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'] },
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeProductInteraction', NSPrivacyCollectedDataTypeLinked: false, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAnalytics'] },
        { NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeCrashData', NSPrivacyCollectedDataTypeLinked: false, NSPrivacyCollectedDataTypeTracking: false, NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'] },
      ],
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
      ],
    },
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
    // Minimal permissions: drop everything libraries add that Mindtier doesn't use.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.READ_APP_BADGE',
      'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
      'com.anddoes.launcher.permission.UPDATE_COUNT',
      'com.htc.launcher.permission.READ_SETTINGS',
      'com.htc.launcher.permission.UPDATE_SHORTCUT',
      'com.huawei.android.launcher.permission.CHANGE_BADGE',
      'com.huawei.android.launcher.permission.READ_SETTINGS',
      'com.huawei.android.launcher.permission.WRITE_SETTINGS',
      'com.majeur.launcher.permission.UPDATE_BADGE',
      'com.oppo.launcher.permission.READ_SETTINGS',
      'com.oppo.launcher.permission.WRITE_SETTINGS',
      'com.sec.android.provider.badge.permission.READ',
      'com.sec.android.provider.badge.permission.WRITE',
      'com.sonyericsson.home.permission.BROADCAST_BADGE',
      'com.sonymobile.home.permission.PROVIDER_INSERT_BADGE',
      'me.everything.badger.permission.BADGE_COUNT_READ',
      'me.everything.badger.permission.BADGE_COUNT_WRITE',
    ],
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
    // Declares the in-app languages to iOS (CFBundleLocalizations) and Android 13+ per-app language settings.
    ['expo-localization', { supportedLocales: SUPPORTED_LOCALES }],
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
    // The web Daily Challenge is served from /play on the website (scripts/build-play.mjs).
    ...(process.env.WEB_BASE_URL ? { baseUrl: process.env.WEB_BASE_URL } : {}),
  },
  runtimeVersion: { policy: 'appVersion' },
  updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
  extra: {
    eas: { projectId: EAS_PROJECT_ID },
  },
});
