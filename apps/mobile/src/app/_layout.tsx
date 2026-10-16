import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAppLifecycle } from '@/features/sync/useAppLifecycle';
import { useLanguage, useSyncDeviceLanguage } from '@/i18n';
import { initCrashReporting, reportError } from '@/lib/crash';
import { relocalizeNotifications } from '@/lib/notifications';
import { installDevHooks } from '@/lib/devHooks';
import { useProgress } from '@/state/progress';
import { useSettings } from '@/state/settings';
import { ThemeProvider, useTheme } from '@/theme';

initCrashReporting();
installDevHooks();
void SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(error, { boundary: 'root' });
  }, [error]);
  return (
    <SafeAreaProvider>
      <ThemeProvider preference={useSettings.getState().theme}>
        <ErrorScreen error={error} onRetry={retry} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppStack() {
  const { colors, scheme } = useTheme();
  const placementDone = useProgress((s) => s.placementDone);
  useAppLifecycle();
  useSyncDeviceLanguage();
  const language = useLanguage();

  useEffect(() => {
    const { reminderEnabled, reminderHour, reminderMinute } = useSettings.getState();
    void relocalizeNotifications({ enabled: reminderEnabled, hour: reminderHour, minute: reminderMinute }).catch(() => undefined);
  }, [language]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade' }}>
        <Stack.Protected guard={placementDone}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!placementDone}>
          <Stack.Screen name="welcome" />
        </Stack.Protected>
        <Stack.Screen name="session" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const theme = useSettings((s) => s.theme);
  const [loaded, error] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  // Fall back to system fonts rather than blocking the app if fonts fail to load.
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider preference={theme}>
          <AppStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
