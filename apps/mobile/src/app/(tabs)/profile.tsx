import { DOMAINS, DOMAIN_LABELS, currentStreak, overallRating, tierInfo, utcDayKey } from '@mindtier/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { RatingSparkline } from '@/components/RatingSparkline';
import { SkillRadar } from '@/components/SkillRadar';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { domainSeries, windowDelta } from '@/features/profile/history';
import { ApiError, api } from '@/lib/api';
import { useTierShare } from '@/features/share/useTierShare';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { fonts, radii, spacing, useTheme } from '@/theme';

function NameEditor() {
  const { colors } = useTheme();
  const displayName = useAccount((s) => s.displayName);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const res = await api.rename(value);
      useAccount.getState().setDisplayName(res.displayName);
      setEditing(false);
    } catch (e) {
      Alert.alert('Couldn’t save name', e instanceof ApiError && e.status === 422 ? e.message : 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <PressableScale onPress={() => setEditing(true)} accessibilityLabel="Edit display name" style={styles.nameRow}>
        <Text variant="title" numberOfLines={1} style={styles.flex}>
          {displayName ?? 'Player'}
        </Text>
        <Icon name="edit" size={18} color={colors.textFaint} />
      </PressableScale>
    );
  }
  return (
    <View style={styles.nameRow}>
      <TextInput
        value={value}
        onChangeText={setValue}
        autoFocus
        maxLength={24}
        placeholder="Display name"
        placeholderTextColor={colors.textFaint}
        accessibilityLabel="Display name"
        style={[styles.input, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bodySemibold }]}
      />
      <Button label="Save" loading={busy} disabled={value.trim().length < 2} onPress={save} />
    </View>
  );
}

export default function Profile() {
  const { colors, domain: dc } = useTheme();
  const ratings = useProgress((s) => s.ratings);
  const history = useProgress((s) => s.history);
  const gamesPlayed = useProgress((s) => s.gamesPlayed);
  const streakState = useProgress((s) => s.streak);
  const isPro = useEntitlements((s) => s.isPro);
  const [table, setTable] = useState(false);
  const tierShare = useTierShare(ratings);

  const streak = currentStreak(streakState, utcDayKey(new Date()));
  const overall = overallRating(ratings);
  const info = tierInfo(overall);
  const series = DOMAINS.map((d) => ({ domain: d, ...domainSeries(history, d, { isPro, startRating: ratings[d].rating }) }));
  const truncated = series.some((s) => s.truncated);

  const stats = [
    { label: 'Games played', value: gamesPlayed },
    { label: 'Streak', value: streak.current },
    { label: 'Best streak', value: streak.best },
    { label: 'Shields', value: streak.shields },
  ];

  return (
    <Screen scroll>
      {tierShare.card}
      <View style={styles.header}>
        <Text variant="caption" tone="faint" weight="semibold">
          YOU
        </Text>
        <PressableScale onPress={() => router.push('/settings')} accessibilityLabel="Settings" style={styles.iconButton}>
          <Icon name="settings" size={24} color={colors.textMuted} />
        </PressableScale>
      </View>

      <View style={styles.stack}>
        <Card raised style={styles.gap}>
          <View style={styles.identity}>
            <TierBadge info={info} size={72} showProvisional={false} />
            <View style={styles.flex}>
              <NameEditor />
              <Text tone="muted" tabular>
                {info.label} · {Math.round(overall.rating)}
              </Text>
            </View>
          </View>
          <Button label="Share my tier" icon="share" variant="secondary" fullWidth onPress={() => void tierShare.share()} />
        </Card>

        <View style={styles.stats}>
          {stats.map((s) => (
            <Card key={s.label} style={styles.stat}>
              <Text variant="heading" tabular>
                {s.value}
              </Text>
              <Text variant="caption" tone="muted">
                {s.label}
              </Text>
            </Card>
          ))}
        </View>

        <Card style={styles.radar}>
          <SkillRadar ratings={ratings} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="subheading" weight="semibold">
            Rating history
          </Text>
          <PressableScale onPress={() => setTable((t) => !t)} accessibilityLabel={table ? 'Show charts' : 'Show as table'} hapticOnPress>
            <Text variant="caption" tone="primary" weight="semibold">
              {table ? 'Charts' : 'Table'}
            </Text>
          </PressableScale>
        </View>

        {table ? (
          <Card padded={false}>
            {series.map((s, i) => {
              const last = s.points[s.points.length - 1];
              const delta = windowDelta(s.points);
              return (
                <View key={s.domain} style={[styles.tableRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={styles.flex}>{DOMAIN_LABELS[s.domain]}</Text>
                  <Text tabular weight="semibold">
                    {last ? Math.round(last.value) : '—'}
                  </Text>
                  <Text tabular tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'muted'} style={styles.delta}>
                    {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                    {Math.abs(delta)}
                  </Text>
                  <Text variant="caption" tone="faint" style={styles.count}>
                    {s.points.length} pts
                  </Text>
                </View>
              );
            })}
          </Card>
        ) : (
          series.map((s) => {
            const delta = windowDelta(s.points);
            return (
              <Card key={s.domain} style={styles.gap}>
                <View style={styles.chartHeader}>
                  <DomainBadge domain={s.domain} size={28} />
                  <Text weight="semibold" style={styles.flex}>
                    {DOMAIN_LABELS[s.domain]}
                  </Text>
                  <Text tabular weight="semibold">
                    {Math.round(ratings[s.domain].rating)}
                  </Text>
                  <Text tabular variant="caption" tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'muted'}>
                    {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                    {Math.abs(delta)}
                  </Text>
                </View>
                <RatingSparkline data={s.points} color={dc[s.domain]} label={`${DOMAIN_LABELS[s.domain]} rating`} />
              </Card>
            );
          })
        )}

        {truncated && !isPro ? (
          <Card onPress={() => router.push({ pathname: '/paywall', params: { from: 'history' } })} accessibilityLabel="See full history with Pro">
            <Text weight="semibold">Showing the last 30 days</Text>
            <Text variant="caption" tone="muted">
              Your full history is kept. Pro shows all of it.
            </Text>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.lg },
  gap: { gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 44, borderWidth: 1.5, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { flexGrow: 1, flexBasis: '45%', gap: 2 },
  radar: { alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  delta: { minWidth: 48, textAlign: 'right' },
  count: { minWidth: 44, textAlign: 'right' },
});
