import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Enter, LipPressable, Screen, Text } from '@/components/ui';
import { createAndPlayDuel } from '@/features/duels/actions';
import { useLanguage, useT, type TFunction } from '@/i18n';
import { normaliseDuelCode, useDuels, type LocalDuel } from '@/state/duels';
import { fonts, lips, radii, SLANT_DEG, spacing, useTheme } from '@/theme';

function status(t: TFunction, d: LocalDuel): { label: string; tone: 'success' | 'danger' | 'muted' | 'accent' } {
  if (d.myPoints === null) return { label: t('duels.yourTurn'), tone: 'accent' };
  if (!d.opponent) return { label: t('duels.waiting'), tone: 'muted' };
  if (d.myPoints === d.opponent.points) return { label: t('duels.draw'), tone: 'muted' };
  return d.myPoints > d.opponent.points
    ? { label: t('duels.youWon', { name: d.opponent.name }), tone: 'success' }
    : { label: t('duels.theyWon', { name: d.opponent.name }), tone: 'danger' };
}

export default function Duels() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLanguage();
  const duels = useDuels((s) => s.duels);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const parsed = normaliseDuelCode(code);

  const create = async () => {
    setBusy(true);
    await createAndPlayDuel();
    setBusy(false);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">{t('duels.title')}</Text>
        <Text tone="muted">{t('duels.subtitle')}</Text>
      </View>

      <View style={styles.stack}>
        <Enter index={0}>
          <View style={[styles.challenge, { backgroundColor: colors.surfaceRaised }]}>
            {/* Two sides of a match, split along the slant. */}
            <View style={[styles.side, styles.sideLeft, { backgroundColor: colors.accent }]} />
            <View style={[styles.side, styles.sideRight, { backgroundColor: colors.danger }]} />
            <View style={styles.versus}>
              <Text variant="hero" style={{ color: colors.text }}>
                {t('duels.vs')}
              </Text>
            </View>
            <View style={styles.challengeText}>
              <Text variant="heading">{t('duels.challengeTitle')}</Text>
              <Text tone="muted">{t('duels.challengeBody')}</Text>
            </View>
            <Button label={t('duels.newDuel')} icon="userPlus" size="lg" fullWidth loading={busy} onPress={create} testID="duel-new" />
          </View>
        </Enter>

        <Enter index={1}>
          <View style={[styles.plate, { backgroundColor: colors.surface }]}>
            <Text variant="micro" tone="muted">
              {t('duels.gotCode')}
            </Text>
            <View style={styles.row}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder={t('duels.codePlaceholder')}
                placeholderTextColor={colors.textFaint}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={80}
                accessibilityLabel={t('duels.codeA11y')}
                style={[styles.input, { color: colors.text, borderColor: parsed ? colors.primaryText : colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.displayBold }]}
              />
              <Button label={t('common.open')} variant="secondary" disabled={!parsed} onPress={() => parsed && router.push(`/duel/${parsed}`)} />
            </View>
          </View>
        </Enter>

        {duels.length > 0 ? (
          <View style={styles.list}>
            <Text variant="heading">{t('duels.yours')}</Text>
            {duels.map((d, i) => {
              const st = status(t, d);
              const chip = st.tone === 'success' ? colors.success : st.tone === 'danger' ? colors.danger : st.tone === 'accent' ? colors.accent : colors.surfaceSunken;
              return (
                <Enter key={d.id} index={2 + i}>
                  <LipPressable
                    onPress={() => router.push(`/duel/${d.id}`)}
                    accessibilityLabel={`Duel ${d.id}, ${st.label}`}
                    face={colors.surface}
                    lipColor={colors.lip}
                    lip={lips.sm}
                    radius={radii.md}
                    faceStyle={styles.duel}
                  >
                    <View style={[styles.chip, { backgroundColor: chip }]} />
                    <View style={styles.flex}>
                      <Text variant="subheading" display weight="semibold" tabular style={styles.code}>
                        {d.id.toUpperCase()}
                      </Text>
                      <Text variant="caption" tone={st.tone}>
                        {st.label}
                      </Text>
                    </View>
                    {d.myPoints !== null ? (
                      <Text variant="heading" tabular>
                        {d.myPoints.toLocaleString(locale)}
                      </Text>
                    ) : null}
                    <Icon name="chevronRight" size={18} color={colors.textFaint} />
                  </LipPressable>
                </Enter>
              );
            })}
          </View>
        ) : (
          <Text tone="faint" align="center">
            {t('duels.empty')}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.xs },
  stack: { gap: spacing.lg },
  challenge: { borderRadius: radii.md, padding: spacing.lg, paddingTop: 112, gap: spacing.lg, overflow: 'hidden' },
  side: { position: 'absolute', top: 0, height: 96, width: '60%', transform: [{ skewX: `${SLANT_DEG}deg` }], opacity: 0.9 },
  sideLeft: { left: '-12%' },
  sideRight: { right: '-12%' },
  versus: { position: 'absolute', top: 18, left: 0, right: 0, alignItems: 'center' },
  challengeText: { gap: spacing.xs },
  plate: { borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // minWidth 0: a web <input> keeps an intrinsic width of ~20 characters and would push the Open button off-screen.
  input: { flex: 1, minWidth: 0, minHeight: 52, borderWidth: 2, borderRadius: radii.sm, paddingHorizontal: spacing.md, fontSize: 22, letterSpacing: 3 },
  list: { gap: spacing.sm },
  duel: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, overflow: 'hidden' },
  chip: { width: 8, alignSelf: 'stretch', borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  code: { letterSpacing: 2 },
});
