import * as Application from 'expo-application';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Icon } from '@/components/icons/Icon';
import { ChoiceGrid, Segmented, SettingsRow, SettingsSection } from '@/components/settings';
import { PressableScale, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { cancelDailyReminder, ensurePermission, scheduleDailyReminder } from '@/lib/notifications';
import { refreshWeeklyRecap } from '@/features/weekly/schedule';
import { applyEntitlement, purchases } from '@/lib/purchases';
import { LANGUAGES, LANGUAGE_NAMES, useT, type LanguagePreference, type TFunction } from '@/i18n';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { usePrivacy } from '@/state/privacy';
import { useSettings, type MotionPreference } from '@/state/settings';
import type { ThemePreference } from '@/theme';
import { HIT_TARGET, radii, spacing, useTheme } from '@/theme';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function planLabel(t: TFunction, plan: string | null, inTrial: boolean) {
  const name = plan === 'yearly' ? t('paywall.yearly') : plan === 'monthly' ? t('paywall.monthly') : plan === 'lifetime' ? t('paywall.lifetime') : 'Pro';
  return inTrial ? t('settings.planTrial', { plan: name }) : name;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Settings() {
  const s = useSettings();
  const t = useT();
  const { colors } = useTheme();
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
      Alert.alert(e.isPro ? t('paywall.restoredTitle') : t('paywall.nothingTitle'), e.isPro ? t('paywall.restoredBody') : t('paywall.nothingBody', { store: Platform.OS === 'ios' ? t('paywall.appStore') : t('paywall.googlePlay') }));
    } catch {
      Alert.alert(t('paywall.restoreFailedTitle'), t('paywall.restoreFailedBody'));
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
      Alert.alert(t('settings.notifOffTitle'), t('settings.notifOffBody'), [
        { text: t('settings.notNow'), style: 'cancel' },
        { text: t('settings.openSettings'), onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    s.setReminder(true);
    track('reminder_enabled', { hour: s.reminderHour });
  };

  const toggleWeeklyRecap = async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      Alert.alert(t('settings.notifOffTitle'), t('settings.notifOffBody'), [
        { text: t('settings.notNow'), style: 'cancel' },
        { text: t('settings.openSettings'), onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    s.setWeeklyRecap(on);
    await refreshWeeklyRecap();
  };

  const shiftReminder = async (deltaHours: number) => {
    const hour = (s.reminderHour + deltaHours + 24) % 24;
    s.setReminder(s.reminderEnabled, hour, s.reminderMinute);
    if (s.reminderEnabled) await scheduleDailyReminder(hour, s.reminderMinute);
  };

  const subscriptionDetail = ent.isPro
    ? ent.plan === 'lifetime'
      ? t('settings.lifetimeAccess')
      : ent.expiresAt
        ? t(ent.inTrial ? 'settings.trialEnds' : 'settings.renews', { date: fmtDate(ent.expiresAt) })
        : t('settings.active')
    : t('settings.freePlan');

  return (
    <Screen scroll>
      <BackHeader title={t('settings.title')} />
      <View style={styles.stack}>
        <SettingsSection title={t('settings.account')}>
          <SettingsRow
            first
            icon="profile"
            label={email ? t('settings.savedTo') : t('settings.saveProgress')}
            detail={email ?? t('settings.saveDetail')}
            onPress={() => router.push('/settings/account')}
            testID="settings-account"
          />
        </SettingsSection>

        <SettingsSection title={t('settings.pro')}>
          <SettingsRow first icon="sparkle" label={ent.isPro ? planLabel(t, ent.plan, ent.inTrial) : t('settings.free')} detail={subscriptionDetail} onPress={ent.isPro ? undefined : () => router.push({ pathname: '/paywall', params: { from: 'settings' } })} />
          {ent.billingIssue ? (
            <SettingsRow icon="info" label={t('settings.paymentIssue')} detail={t('settings.paymentIssueDetail')} onPress={manageSubscription} destructive />
          ) : null}
          {ent.isPro && ent.plan !== 'lifetime' ? <SettingsRow icon="card" label={t('settings.manage')} detail={t('settings.manageDetail')} onPress={manageSubscription} /> : null}
          <SettingsRow icon="refresh" label={t('settings.restore')} onPress={restore} />
        </SettingsSection>

        <SettingsSection title={t('settings.appearance')}>
          <View style={[styles.padded, styles.labelled]}>
            <Text variant="caption" tone="muted">
              {t('settings.theme')}
            </Text>
            <Segmented<ThemePreference>
              label={t('settings.theme')}
              value={s.theme}
              onChange={s.setTheme}
              options={[
                { value: 'system', label: t('settings.themeSystem') },
                { value: 'dark', label: t('settings.themeDark') },
                { value: 'light', label: t('settings.themeLight') },
              ]}
            />
          </View>
          <View style={[styles.padded, styles.labelled]}>
            <Text variant="caption" tone="muted">
              {t('settings.language')}
            </Text>
            <ChoiceGrid<LanguagePreference>
              label={t('settings.language')}
              value={s.language}
              onChange={s.setLanguage}
              options={(['system', ...LANGUAGES] as LanguagePreference[]).map((l) => ({
                value: l,
                label: l === 'system' ? t('settings.languageSystem') : LANGUAGE_NAMES[l],
              }))}
            />
          </View>
        </SettingsSection>

        <SettingsSection title={t('settings.gameplay')} footer={t('settings.gameplayFooter')}>
          <SettingsRow first icon="sound" label={t('settings.sound')} detail={t('settings.soundDetail')} switchValue={s.sound} onSwitch={s.setSound} />
          <SettingsRow icon="vibrate" label={t('settings.haptics')} switchValue={s.haptics} onSwitch={s.setHaptics} />
          <SettingsRow icon="accessibility" label={t('settings.colourFree')} detail={t('settings.colourFreeDetail')} switchValue={s.shapeMode} onSwitch={s.setShapeMode} />
          <View style={[styles.padded, styles.labelled]}>
            <Text variant="caption" tone="muted">
              {t('settings.motion')}
            </Text>
            <Segmented<MotionPreference>
              label={t('settings.motion')}
              value={s.motion}
              onChange={s.setMotion}
              options={[
                { value: 'system', label: t('settings.themeSystem') },
                { value: 'reduced', label: t('settings.motionReduced') },
                { value: 'full', label: t('settings.motionFull') },
              ]}
            />
          </View>
          <SettingsRow icon="memory" label={t('settings.rotation')} detail={t('settings.rotationDetail')} onPress={() => router.push('/settings/games')} />
        </SettingsSection>

        <SettingsSection title={t('settings.reminders')} footer={t('settings.remindersFooter')}>
          <SettingsRow first icon="bell" label={t('settings.dailyReminder')} switchValue={s.reminderEnabled} onSwitch={(v) => void toggleReminder(v)} />
          <View style={[styles.padded, styles.timeRow]}>
            <Text tone="muted">{t('settings.time')}</Text>
            <View style={styles.timeControls}>
              <PressableScale onPress={() => void shiftReminder(-1)} accessibilityLabel={t('settings.earlier')} style={[styles.step, { backgroundColor: colors.surfaceSunken }]}>
                <Icon name="minus" size={20} color={colors.primaryText} strokeWidth={2.6} />
              </PressableScale>
              <Text variant="subheading" tabular accessibilityLabel={t('settings.reminderAt', { time: `${s.reminderHour}:${pad(s.reminderMinute)}` })}>
                {pad(s.reminderHour)}:{pad(s.reminderMinute)}
              </Text>
              <PressableScale onPress={() => void shiftReminder(1)} accessibilityLabel={t('settings.later')} style={[styles.step, { backgroundColor: colors.surfaceSunken }]}>
                <Icon name="plus" size={20} color={colors.primaryText} strokeWidth={2.6} />
              </PressableScale>
            </View>
          </View>
          <SettingsRow
            icon="daily"
            label={t('settings.weeklyRecap')}
            detail={t('settings.weeklyRecapDetail')}
            switchValue={s.weeklyRecap}
            onSwitch={(v) => void toggleWeeklyRecap(v)}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.privacy')} footer={t('settings.privacyFooter')}>
          <SettingsRow first icon="chart" label={t('settings.usageData')} switchValue={!privacy.analyticsOptOut} onSwitch={(v) => privacy.setAnalyticsOptOut(!v)} />
          <SettingsRow icon="shield" label={t('settings.crashReports')} switchValue={!privacy.crashReportsOptOut} onSwitch={(v) => privacy.setCrashReportsOptOut(!v)} />
          <SettingsRow icon="document" label={t('settings.privacyPolicy')} onPress={() => void WebBrowser.openBrowserAsync(links.privacy)} />
          <SettingsRow icon="document" label={t('settings.termsOfService')} onPress={() => void WebBrowser.openBrowserAsync(links.terms)} />
          <SettingsRow icon="document" label={t('settings.refunds')} onPress={() => void WebBrowser.openBrowserAsync(links.refunds)} />
        </SettingsSection>

        <SettingsSection title={t('settings.help')}>
          <SettingsRow first icon="help" label={t('settings.support')} onPress={() => void WebBrowser.openBrowserAsync(links.support)} />
          <SettingsRow icon="info" label={t('settings.version')} value={`${Application.nativeApplicationVersion ?? '1.0.0'} (${Application.nativeBuildVersion ?? 'dev'})`} />
        </SettingsSection>

        <Text variant="caption" tone="faint" align="center">
          {t('settings.disclaimer')}
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
  step: { width: HIT_TARGET, height: HIT_TARGET, borderRadius: radii.xs, alignItems: 'center', justifyContent: 'center' },
});
