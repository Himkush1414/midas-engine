import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { BestPlate, GainList, StatStrip } from '@/components/recap';
import { TierBadge } from '@/components/tier';
import { Button, LipPressable, Screen, Text } from '@/components/ui';
import { SeasonShareCard } from '@/features/seasons/SeasonShareCard';
import { seasonMonth, seasonName, seasonRecap, seasonShareText } from '@/features/seasons/season';
import { useCardShare } from '@/features/share/useCardShare';
import { useLanguage, useT } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { track } from '@/lib/analytics';
import { useProgress } from '@/state/progress';
import { lips, radii, spacing, tierColors, useTheme } from '@/theme';

/** Recap of one season: the one in progress (so far) or a finished one. */
export default function SeasonScreen() {
  const { colors } = useTheme();
  const t = useT();
  const language = useLanguage();
  const params = useLocalSearchParams<{ n?: string }>();
  const current = useProgress((s) => s.ratingsSeason);
  const currentStats = useProgress((s) => s.seasonStats);
  const past = useProgress((s) => s.pastSeasons);

  const requested = Number.parseInt(params.n ?? '', 10);
  const season = Number.isFinite(requested) ? requested : current;
  const isCurrent = season === current;
  const stats = isCurrent ? (currentStats?.season === season ? currentStats : null) : (past.find((p) => p.season === season) ?? null);
  const recap = stats ? seasonRecap(stats) : null;
  const name = seasonName(t, season);
  const month = seasonMonth(season, language);

  useEffect(() => {
    track('season_recap_viewed', { season, current: isCurrent });
  }, [season, isCurrent]);

  const text = useCallback(() => (recap ? seasonShareText(t, recap) : ''), [recap, t]);
  const sharing = useCardShare((ref) => (recap ? <SeasonShareCard ref={ref} recap={recap} /> : null), text, 'season');

  return (
    <Screen scroll>
      {sharing.card}
      <BackHeader title={t('season.recapTitle', { season: name })} />
      <View style={styles.stack}>
        <Text variant="micro" tone="muted">
          {[month, isCurrent ? t('season.soFar') : t('season.finished')].filter(Boolean).join(' · ')}
        </Text>

        {recap ? (
          <>
            <View style={[styles.tiers, { backgroundColor: colors.surfaceRaised }]}>
              <View style={styles.tier}>
                <View style={[styles.glow, { boxShadow: `0 0 52px 10px ${tierColors[recap.peak.tier].base}55` }]} />
                <TierBadge info={recap.peak} size={112} showProvisional={false} shine />
                <Text variant="micro" tone="muted">
                  {t('season.peakTier')}
                </Text>
                <Text variant="heading" style={{ color: tierColors[recap.peak.tier].base }}>
                  {tierLabel(t, recap.peak)}
                </Text>
              </View>
              <View style={styles.tier}>
                <TierBadge info={recap.end} size={72} showProvisional={false} />
                <Text variant="micro" tone="muted">
                  {isCurrent ? t('season.nowTier') : t('season.endTier')}
                </Text>
                <Text variant="subheading" display weight="semibold">
                  {tierLabel(t, recap.end)}
                </Text>
              </View>
            </View>

            <StatStrip
              testID="season-stats"
              items={[
                { label: t('season.sessions'), value: recap.sessions },
                { label: t('season.games'), value: recap.games },
              ]}
            />
            {recap.best ? <BestPlate kicker={t('season.bestSkill')} domain={recap.best.domain} gain={recap.best.gain} /> : null}
            {recap.gains.length > 0 ? <GainList title={t('season.gains')} gains={recap.gains} /> : null}

            <Button
              label={t('season.share')}
              icon="share"
              variant="secondary"
              fullWidth
              onPress={() => void sharing.share()}
            />
          </>
        ) : (
          <Text tone="muted">{t('season.empty')}</Text>
        )}

        {past.length > 0 ? (
          <>
            <Text variant="heading">{t('season.past')}</Text>
            {past.map((p) => {
              const r = seasonRecap(p);
              return (
                <LipPressable
                  key={p.season}
                  onPress={() => router.setParams({ n: String(p.season) })}
                  accessibilityLabel={t('season.recapTitle', { season: seasonName(t, p.season) })}
                  face={p.season === season ? colors.surfaceRaised : colors.surface}
                  lipColor={colors.lip}
                  lip={lips.sm}
                  radius={radii.md}
                  faceStyle={styles.pastRow}
                >
                  <TierBadge info={r.peak} size={36} showProvisional={false} />
                  <Text variant="subheading" display weight="semibold" style={styles.flex}>
                    {seasonName(t, p.season)}
                  </Text>
                  <Text variant="micro" tone="muted">
                    {tierLabel(t, r.peak)}
                  </Text>
                </LipPressable>
              );
            })}
          </>
        ) : null}

        <View style={[styles.how, { backgroundColor: colors.surface }]}>
          <Text variant="micro" tone="muted">
            {t('season.howTitle')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('season.howBody')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.lg },
  tiers: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderRadius: radii.md, padding: spacing.lg },
  tier: { alignItems: 'center', gap: spacing.xs },
  glow: { position: 'absolute', top: 22, width: 68, height: 68, borderRadius: 68 },
  pastRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  how: { gap: spacing.xs, borderRadius: radii.md, padding: spacing.lg },
});
