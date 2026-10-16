import * as Application from 'expo-application';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Segmented, SettingsRow, SettingsSection } from '@/components/settings';
import { Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { cancelDailyReminder, scheduleDailyReminder } from '@/lib/notifications';
import { applyEntitlement, purchases } from '@/lib/purchases';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { usePrivacy } from '@/state/privacy';
import { useSettings, type MotionPreference } from '@/state/settings';
import type { ThemePreference } from '@/theme';
import { spacing } from '@/theme';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function planLabel(plan: string | null, inTrial: boolean) {
  const name = plan === 'yearly' ? 'Yearly' : plan === 'monthly' ? 'Monthly' : plan === 'lifetime' ? 'Lifetime' : 'Pro';
  return inTrial ? `${name} · free trial` : name;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Settings() {
  const s = useSettings();
  const privacy = usePrivacy();
  const ent = useEntitlements();
  const email = useAccount((a) => a.email);

  const manageSubscription = () => {
    const url = Platform.OS === 'ios' ? links.appStoreSubscriptions : links.playSubscriptions(ent.productId ?? undefined);
    void Linking.openURL(url);
  };

  const restore = async () => {
    try {
      const e = await purchases.restore();
      applyEntitlement(e);
      Alert.alert(e.isPro ? 'Pro restored' : 'Nothing to restore', e.isPro ? 'Welcome back.' : 'No active purchase was found for this store account.');
    } catch {
      Alert.alert('Couldn’t restore', 'Check your connection and try again.');
    }
  };

  const toggleReminder = async (on: boolean) => {
    if (!on) {
      await cancelDailyReminder();
      s.setReminder(false);
      return;
    }
    const ok = await scheduleDailyReminder(s.reminderHour, s.reminderMinute);
    if (!ok) {
      Alert.alert('Notifications are off', 'Allow notifications for Mindtier in your device settings to get reminders.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    s.setReminder(true);
    track('reminder_enabled', { hour: s.reminderHour });
  };

  const shiftReminder = async (deltaHours: number) => {
    const hour = (s.reminderHour + deltaHours + 24) % 24;
    s.setReminder(s.reminderEnabled, hour, s.reminderMinute);
    if (s.reminderEnabled) await scheduleDailyReminder(hour, s.reminderMinute);
  };

  const subscriptionDetail = ent.isPro
    ? ent.plan === 'lifetime'
      ? 'Lifetime access'
      : ent.expiresAt
        ? `${ent.inTrial ? 'Trial ends' : 'Renews or ends'} ${fmtDate(ent.expiresAt)}`
        : 'Active'
    : 'Free plan';

  return (
    <Screen scroll>
      <BackHeader title="Settings" />
      <View style={styles.stack}>
        <SettingsSection title="Account">
          <SettingsRow
            first
            icon="profile"
            label={email ? 'Saved to email' : 'Save your progress'}
            detail={email ?? 'Keep your rank if you change phones'}
            onPress={() => router.push('/settings/account')}
            testID="settings-account"
          />
        </SettingsSection>

        <SettingsSection title="Mindtier Pro">
          <SettingsRow first icon="sparkle" label={ent.isPro ? planLabel(ent.plan, ent.inTrial) : 'Free'} detail={subscriptionDetail} onPress={ent.isPro ? undefined : () => router.push({ pathname: '/paywall', params: { from: 'settings' } })} />
          {ent.billingIssue ? (
            <SettingsRow icon="info" label="Payment issue" detail="Update your payment method to keep Pro" onPress={manageSubscription} destructive />
          ) : null}
          {ent.isPro && ent.plan !== 'lifetime' ? <SettingsRow icon="card" label="Manage subscription" detail="Change or cancel in the store" onPress={manageSubscription} /> : null}
          <SettingsRow icon="refresh" label="Restore purchases" onPress={restore} />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <View style={styles.padded}>
            <Segmented<ThemePreference>
              label="Theme"
              value={s.theme}
              onChange={s.setTheme}
              options={[
                { value: 'system', label: 'System' },
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
          </View>
        </SettingsSection>

        <SettingsSection title="Gameplay & accessibility" footer="Colour-free mode swaps colours for shapes in Clash. Reduced motion removes celebratory animations.">
          <SettingsRow first icon="sound" label="Sound effects" detail="Follows your phone’s silent mode" switchValue={s.sound} onSwitch={s.setSound} />
          <SettingsRow icon="vibrate" label="Haptics" switchValue={s.haptics} onSwitch={s.setHaptics} />
          <SettingsRow icon="accessibility" label="Colour-free mode" detail="Shapes instead of colours" switchValue={s.shapeMode} onSwitch={s.setShapeMode} />
          <View style={[styles.padded, styles.labelled]}>
            <Text variant="caption" tone="muted">
              Motion
            </Text>
            <Segmented<MotionPreference>
              label="Motion"
              value={s.motion}
              onChange={s.setMotion}
              options={[
                { value: 'system', label: 'System' },
                { value: 'reduced', label: 'Reduced' },
                { value: 'full', label: 'Full' },
              ]}
            />
          </View>
          <SettingsRow icon="memory" label="Games in ranked rotation" detail="Hide games you don’t enjoy" onPress={() => router.push('/settings/games')} />
        </SettingsSection>

        <SettingsSection title="Reminders" footer="One gentle reminder a day, at the time you choose. No streak guilt.">
          <SettingsRow first icon="bell" label="Daily reminder" switchValue={s.reminderEnabled} onSwitch={(v) => void toggleReminder(v)} />
          <View style={[styles.padded, styles.timeRow]}>
            <Text tone="muted">Time</Text>
            <View style={styles.timeControls}>
              <Text variant="label" tone="primary" onPress={() => void shiftReminder(-1)} accessibilityRole="button" accessibilityLabel="One hour earlier" style={styles.step}>
                −
              </Text>
              <Text variant="subheading" tabular accessibilityLabel={`Reminder at ${s.reminderHour}:${pad(s.reminderMinute)}`}>
                {pad(s.reminderHour)}:{pad(s.reminderMinute)}
              </Text>
              <Text variant="label" tone="primary" onPress={() => void shiftReminder(1)} accessibilityRole="button" accessibilityLabel="One hour later" style={styles.step}>
                +
              </Text>
            </View>
          </View>
        </SettingsSection>

        <SettingsSection title="Privacy" footer="Usage data is anonymous: no names, emails or advertising IDs. Mindtier has no ads and never sells data.">
          <SettingsRow first icon="chart" label="Share anonymous usage data" switchValue={!privacy.analyticsOptOut} onSwitch={(v) => privacy.setAnalyticsOptOut(!v)} />
          <SettingsRow icon="shield" label="Send crash reports" switchValue={!privacy.crashReportsOptOut} onSwitch={(v) => privacy.setCrashReportsOptOut(!v)} />
          <SettingsRow icon="document" label="Privacy Policy" onPress={() => void WebBrowser.openBrowserAsync(links.privacy)} />
          <SettingsRow icon="document" label="Terms of Service" onPress={() => void WebBrowser.openBrowserAsync(links.terms)} />
          <SettingsRow icon="document" label="Refunds & cancellation" onPress={() => void WebBrowser.openBrowserAsync(links.refunds)} />
        </SettingsSection>

        <SettingsSection title="Help">
          <SettingsRow first icon="help" label="Support" onPress={() => void WebBrowser.openBrowserAsync(links.support)} />
          <SettingsRow icon="info" label="Version" value={`${Application.nativeApplicationVersion ?? '1.0.0'} (${Application.nativeBuildVersion ?? 'dev'})`} />
        </SettingsSection>

        <Text variant="caption" tone="faint" align="center">
          Mindtier is a game. Ranks reflect skill at its puzzles, not intelligence or health.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.xl },
  padded: { padding: spacing.md },
  labelled: { gap: spacing.xs },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  timeControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  step: { fontSize: 24, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
