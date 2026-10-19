import { DOMAINS, currentStreak, overallRating, tierInfo, utcDayKey } from '@mindtier/core';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { RatingSparkline } from '@/components/RatingSparkline';
import { SkillRadar } from '@/components/SkillRadar';
import { TierBadge } from '@/components/tier';
import { Button, Enter, fitMicroSize, MAX_CONTENT_WIDTH, PressableScale, Screen, Text, Ticket } from '@/components/ui';
import { domainSeries, windowDelta } from '@/features/profile/history';
import { SeasonCard } from '@/features/seasons/SeasonCard';
import { WeekCard } from '@/features/weekly/WeekCard';
import { ApiError, api } from '@/lib/api';
import { useTierShare } from '@/features/share/useTierShare';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { fonts, radii, SLANT_DEG, spacing, tierColors, useTheme } from '@/theme';

function NameEditor() {
  const { colors } = useTheme();
  const t = useT();
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
      Alert.alert(t('profile.nameFailed'), e instanceof ApiError && e.status === 422 ? e.message : t('profile.nameOffline'));
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <PressableScale onPress={() => setEditing(true)} accessibilityLabel={t('profile.editName')} style={styles.nameRow}>
        <Text variant="title" numberOfLines={1} style={styles.flex}>
          {displayName ?? t('profile.player')}
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
        placeholder={t('profile.namePlaceholder')}
        placeholderTextColor={colors.textFaint}
        accessibilityLabel={t('profile.namePlaceholder')}
        style={[styles.input, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bodySemibold }]}
      />
      <Button label={t('common.save')} loading={busy} disabled={value.trim().length < 2} onPress={save} />
    </View>
  );
}

export default function Profile() {
  const { colors, domain: dc } = useTheme();
  const t = useT();
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
  const tc = tierColors[info.tier];
  const series = DOMAINS.map((d) => ({ domain: d, ...domainSeries(history, d, { isPro, startRating: ratings[d].rating }) }));
  const truncated = series.some((s) => s.truncated);

  const { width } = useWindowDimensions();
  const stats = [
    { label: t('profile.gamesPlayed'), value: gamesPlayed },
    { label: t('profile.streak'), value: streak.current },
    { label: t('profile.bestStreak'), value: streak.best },
    { label: t('profile.shields'), value: streak.shields },
  ];
  // One column per stat inside the player plate: each label's longest word must fit its column.
  const statColumn = (Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - spacing.lg * 2 - spacing.sm * (stats.length - 1)) / stats.length;

  return (
    <Screen scroll>
      {tierShare.card}
      <View style={styles.header}>
        <Text variant="heading">{t('profile.you')}</Text>
        <PressableScale onPress={() => router.push('/settings')} accessibilityLabel={t('home.settings')} style={styles.iconButton}>
          <Icon name="settings" size={24} color={colors.textMuted} />
        </PressableScale>
      </View>

      <View style={styles.stack}>
        <Enter index={0}>
          <View style={[styles.player, { backgroundColor: colors.surfaceRaised }]}>
            <View style={[styles.stripe, { backgroundColor: tc.base }]} />
            <View style={styles.identity}>
              <View style={styles.badge}>
                <View style={[styles.glow, { boxShadow: `0 0 44px 8px ${tc.base}55` }]} />
                <TierBadge info={info} size={96} showProvisional={false} />
              </View>
              <View style={styles.flex}>
                <NameEditor />
                <Text variant="micro" tone="muted" tabular>
                  {tierLabel(t, info)} · {Math.round(overall.rating)}
                </Text>
              </View>
            </View>
            <View style={[styles.stats, { borderTopColor: colors.border }]}>
              {stats.map((st, i) => (
                <View key={st.label} style={styles.stat} accessible accessibilityLabel={`${st.label}: ${st.value}`}>
                  <Text variant="heading" tabular style={i === 1 && streak.current > 0 ? { color: colors.danger } : undefined}>
                    {st.value}
                  </Text>
                  <Text variant="micro" tone="muted" numberOfLines={2} style={{ fontSize: fitMicroSize(st.label, statColumn) }}>
                    {st.label}
                  </Text>
                </View>
              ))}
            </View>
            <Button label={t('profile.shareTier')} icon="share" variant="secondary" fullWidth onPress={() => void tierShare.share()} />
          </View>
        </Enter>

        <Enter index={1} style={styles.tickets}>
          <SeasonCard />
          <WeekCard />
        </Enter>

        <Enter index={2}>
          <View style={[styles.radar, { backgroundColor: colors.surface }]}>
            <SkillRadar ratings={ratings} color={tc.base} />
          </View>
        </Enter>

        <View style={styles.sectionHeader}>
          <Text variant="heading">{t('profile.history')}</Text>
          <PressableScale onPress={() => setTable((t) => !t)} accessibilityLabel={table ? t('profile.showCharts') : t('profile.showTable')} hapticOnPress style={styles.toggle}>
            <Text variant="micro" tone="primary" weight="bold">
              {table ? t('profile.charts') : t('profile.table')}
            </Text>
          </PressableScale>
        </View>

        {table ? (
          <View style={[styles.table, { backgroundColor: colors.surface }]}>
            {series.map((s, i) => {
              const last = s.points[s.points.length - 1];
              const delta = windowDelta(s.points);
              return (
                <View key={s.domain} style={[styles.tableRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={[styles.tabSmall, { backgroundColor: dc[s.domain] }]} />
                  <Text variant="subheading" display weight="semibold" style={styles.flex}>
                    {domainLabel(t, s.domain)}
                  </Text>
                  <Text variant="subheading" display weight="semibold" tabular>
                    {last ? Math.round(last.value) : '—'}
                  </Text>
                  <Text variant="micro" tabular tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'muted'} style={styles.delta}>
                    {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                    {Math.abs(delta)}
                  </Text>
                  <Text variant="micro" tone="faint" style={styles.count}>
                    {t('profile.historyPoints', { count: s.points.length })}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          series.map((s) => {
            const delta = windowDelta(s.points);
            return (
              <View key={s.domain} style={[styles.chart, { backgroundColor: colors.surface }]}>
                <View style={[styles.tab, { backgroundColor: dc[s.domain] }]} />
                <View style={styles.chartHeader}>
                  <Text variant="heading" style={styles.flex} numberOfLines={1}>
                    {domainLabel(t, s.domain)}
                  </Text>
                  <Text variant="heading" tabular>
                    {Math.round(ratings[s.domain].rating)}
                  </Text>
                  <Text variant="micro" tabular tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'muted'} style={styles.delta}>
                    {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                    {Math.abs(delta)}
                  </Text>
                </View>
                <RatingSparkline data={s.points} color={dc[s.domain]} label={domainLabel(t, s.domain)} />
              </View>
            );
          })
        )}

        {truncated && !isPro ? (
          <Ticket
            kicker={t('paywall.title')}
            title={t('profile.last30')}
            detail={t('profile.fullHistory')}
            color={colors.spark}
            icon="chart"
            onPress={() => router.push({ pathname: '/paywall', params: { from: 'history' } })}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.md },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.lg },
  player: { borderRadius: radii.md, padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.lg, overflow: 'hidden' },
  stripe: { position: 'absolute', top: 0, left: -12, right: '45%', height: 8, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 56, height: 56, borderRadius: 56 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: radii.sm, paddingHorizontal: spacing.md, fontSize: 16 },
  stats: { flexDirection: 'row', borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.sm },
  stat: { flex: 1, gap: 2 },
  tickets: { gap: spacing.sm },
  radar: { borderRadius: radii.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -spacing.sm },
  toggle: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.sm },
  chart: { borderRadius: radii.md, padding: spacing.lg, paddingLeft: spacing.xl, gap: spacing.sm, overflow: 'hidden' },
  tab: { position: 'absolute', left: -4, top: 0, bottom: 0, width: 10, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  chartHeader: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  table: { borderRadius: radii.md, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tabSmall: { width: 14, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  delta: { minWidth: 48, textAlign: 'right' },
  count: { minWidth: 44, textAlign: 'right' },
});
