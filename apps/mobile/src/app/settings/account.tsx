import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Button, Card, Screen, Text } from '@/components/ui';
import {
  confirmLinkCode,
  confirmSignInCode,
  deleteAccount,
  isValidCode,
  isValidEmail,
  requestLinkCode,
  requestSignInCode,
  signOut,
} from '@/features/account/account';
import { backendConfigured } from '@/lib/config';
import { links } from '@/lib/links';
import { useT } from '@/i18n';
import { currentUserId } from '@/lib/supabase';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { fonts, radii, spacing, useTheme } from '@/theme';

type Flow = 'link' | 'signin';

function EmailCodeForm({ flow, onDone }: { flow: Flow; onDone(): void }) {
  const { colors } = useTheme();
  const t = useT();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.body }];

  const send = async () => {
    setBusy(true);
    setError(null);
    const r = flow === 'link' ? await requestLinkCode(email) : await requestSignInCode(email);
    setBusy(false);
    if (r.ok) setSent(true);
    else setError(r.message);
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const r = flow === 'link' ? await confirmLinkCode(email, code) : await confirmSignInCode(email, code);
    setBusy(false);
    if (r.ok) onDone();
    else setError(r.message);
  };

  return (
    <Card style={styles.gap}>
      <Text weight="semibold">{flow === 'link' ? t('account.linkTitle') : t('account.signIn')}</Text>
      <Text variant="caption" tone="muted">
        {flow === 'link' ? t('account.linkBody') : t('account.signInBody')}
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        editable={!sent}
        placeholder="you@example.com"
        placeholderTextColor={colors.textFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        accessibilityLabel={t('account.emailA11y')}
        style={inputStyle}
      />
      {sent ? (
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          placeholder={t('account.codePlaceholder')}
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          accessibilityLabel={t('account.codeA11y')}
          style={[inputStyle, styles.code]}
        />
      ) : null}
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {sent ? (
        <Button label={t('account.confirmCode')} loading={busy} disabled={!isValidCode(code)} onPress={verify} fullWidth />
      ) : (
        <Button label={t('account.emailCode')} loading={busy} disabled={!isValidEmail(email)} onPress={send} fullWidth />
      )}
    </Card>
  );
}

export default function AccountSettings() {
  const t = useT();
  const email = useAccount((s) => s.email);
  const isPro = useEntitlements((s) => s.isPro);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void currentUserId().then(setUserId);
  }, []);

  const confirmDelete = () => {
    Alert.alert(
      t('account.deleteTitle'),
      `${t('account.deleteBody')}${isPro ? t('account.deleteSubscription') : ''}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('account.deleteForever'),
          style: 'destructive',
          onPress: async () => {
            const r = await deleteAccount();
            if (r.ok) router.replace('/');
            else Alert.alert(t('account.deleteFailed'), r.message);
          },
        },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert(t('account.signOutTitle'), t('account.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <BackHeader title={t('account.title')} />
      <View style={styles.stack}>
        {!backendConfigured ? (
          <Card>
            <Text tone="muted">{t('account.unavailable')}</Text>
          </Card>
        ) : email ? (
          <Card style={styles.gap}>
            <Text weight="semibold">{t('account.saved')}</Text>
            <Text tone="muted">{email}</Text>
            <Text variant="caption" tone="faint">
              {t('account.newPhone')}
            </Text>
          </Card>
        ) : flow ? (
          <EmailCodeForm flow={flow} onDone={() => setFlow(null)} />
        ) : (
          <SettingsSection title={t('account.yourProgress')}>
            <SettingsRow first icon="mail" label={t('account.saveToEmail')} detail={t('account.saveRecommended')} onPress={() => setFlow('link')} />
            <SettingsRow icon="logout" label={t('account.signIn')} detail={t('account.signInDetail')} onPress={() => setFlow('signin')} />
          </SettingsSection>
        )}

        {userId ? (
          <SettingsSection title={t('account.accountId')} footer={t('account.accountIdFooter')}>
            <SettingsRow
              first
              icon="copy"
              label={`${userId.slice(0, 8)}…${userId.slice(-4)}`}
              detail={t('account.tapToCopy')}
              onPress={() => {
                void Clipboard.setStringAsync(userId);
                Alert.alert(t('common.copied'), t('account.copiedBody'));
              }}
            />
          </SettingsSection>
        ) : null}

        <SettingsSection title={t('account.danger')} footer={t('account.dangerFooter')}>
          {email ? <SettingsRow first icon="logout" label={t('account.signOut')} onPress={confirmSignOut} /> : null}
          <SettingsRow first={!email} icon="trash" label={t('account.delete')} destructive onPress={confirmDelete} testID="delete-account" />
          <SettingsRow icon="external" label={t('account.deletionHelp')} onPress={() => void WebBrowser.openBrowserAsync(links.deleteAccount)} />
        </SettingsSection>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.xl },
  gap: { gap: spacing.md },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16 },
  code: { letterSpacing: 8, fontSize: 22, textAlign: 'center' },
});
