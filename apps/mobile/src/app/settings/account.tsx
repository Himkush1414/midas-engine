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
import { currentUserId } from '@/lib/supabase';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { fonts, radii, spacing, useTheme } from '@/theme';

type Flow = 'link' | 'signin';

function EmailCodeForm({ flow, onDone }: { flow: Flow; onDone(): void }) {
  const { colors } = useTheme();
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
      <Text weight="semibold">{flow === 'link' ? 'Save progress to your email' : 'Sign in with email'}</Text>
      <Text variant="caption" tone="muted">
        {flow === 'link'
          ? 'We’ll email you a 6-digit code. Your ranks stay exactly as they are.'
          : 'Use the email you saved your progress to. This replaces the progress on this device.'}
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
        accessibilityLabel="Email address"
        style={inputStyle}
      />
      {sent ? (
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit code"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          accessibilityLabel="Verification code"
          style={[inputStyle, styles.code]}
        />
      ) : null}
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {sent ? (
        <Button label="Confirm code" loading={busy} disabled={!isValidCode(code)} onPress={verify} fullWidth />
      ) : (
        <Button label="Email me a code" loading={busy} disabled={!isValidEmail(email)} onPress={send} fullWidth />
      )}
    </Card>
  );
}

export default function AccountSettings() {
  const email = useAccount((s) => s.email);
  const isPro = useEntitlements((s) => s.isPro);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void currentUserId().then(setUserId);
  }, []);

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      `This permanently deletes your ranks, history, duels and leaderboard entries.${isPro ? ' It does not cancel your subscription — cancel it in the store first.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            const r = await deleteAccount();
            if (r.ok) router.replace('/');
            else Alert.alert('Couldn’t delete', r.message);
          },
        },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your progress stays saved to your email. This device will start fresh.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
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
      <BackHeader title="Account" />
      <View style={styles.stack}>
        {!backendConfigured ? (
          <Card>
            <Text tone="muted">Accounts are available in the full release. Your progress is saved on this device.</Text>
          </Card>
        ) : email ? (
          <Card style={styles.gap}>
            <Text weight="semibold">Progress saved</Text>
            <Text tone="muted">{email}</Text>
            <Text variant="caption" tone="faint">
              On a new phone, choose “Sign in with email” and enter the code we send.
            </Text>
          </Card>
        ) : flow ? (
          <EmailCodeForm flow={flow} onDone={() => setFlow(null)} />
        ) : (
          <SettingsSection title="Your progress">
            <SettingsRow first icon="mail" label="Save progress to email" detail="Recommended — keeps your rank safe" onPress={() => setFlow('link')} />
            <SettingsRow icon="logout" label="Sign in with email" detail="Already saved on another phone?" onPress={() => setFlow('signin')} />
          </SettingsSection>
        )}

        {userId ? (
          <SettingsSection title="Account ID" footer="Include this when contacting support.">
            <SettingsRow
              first
              icon="copy"
              label={`${userId.slice(0, 8)}…${userId.slice(-4)}`}
              detail="Tap to copy"
              onPress={() => {
                void Clipboard.setStringAsync(userId);
                Alert.alert('Copied', 'Account ID copied to the clipboard.');
              }}
            />
          </SettingsSection>
        ) : null}

        <SettingsSection title="Danger zone" footer="Deleting is permanent. You can also request deletion on our website.">
          {email ? <SettingsRow first icon="logout" label="Sign out" onPress={confirmSignOut} /> : null}
          <SettingsRow first={!email} icon="trash" label="Delete account" destructive onPress={confirmDelete} testID="delete-account" />
          <SettingsRow icon="external" label="Deletion help" onPress={() => void WebBrowser.openBrowserAsync(links.deleteAccount)} />
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
