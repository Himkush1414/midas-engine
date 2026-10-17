import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Button, Card, Screen, Text } from '@/components/ui';
import { SeasonShareCard } from '@/features/seasons/SeasonShareCard';
import { seasonMonth, seasonName, seasonRecap, seasonShareText } from '@/features/seasons/season';
import { useCardShare } from '@/features/share/useCardShare';
import { useLanguage, useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { track } from '@/lib/analytics';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';

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
        <Text variant="caption" tone="faint" weight="semibold" align="center">
          {[month, isCurrent ? t('season.soFar') : t('season.finished')].filter(Boolean).join(' · ')}
        </Text>

        {recap ? (
          <>
            <Card raised style={styles.tiers}>
              <View style={styles.tier}>
                <TierBadge info={recap.peak} size={88} showProvisional={false} />
                <Text variant="caption" tone="faint" weight="semibold">
                  {t('season.peakTier')}
                </Text>
                <Text weight="semibold">{tierLabel(t, recap.peak)}</Text>
              </View>
              <View style={styles.tier}>
                <TierBadge info={recap.end} size={64} showProvisional={false} />
                <Text variant="caption" tone="faint" weight="semibold">
                  {isCurrent ? t('season.nowTier') : t('season.endTier')}
                </Text>
                <Text weight="semibold">{tierLabel(t, recap.end)}</Text>
              </View>
            </Card>

            <View style={styles.stats}>
              {[
                { label: t('season.sessions'), value: recap.sessions },
                { label: t('season.games'), value: recap.games },
              ].map((s) => (
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

            {recap.best ? (
              <Card style={styles.best}>
                <DomainBadge domain={recap.best.domain} size={36} />
                <View style={styles.flex}>
                  <Text variant="caption" tone="faint" weight="semibold">
                    {t('season.bestSkill')}
                  </Text>
                  <Text weight="semibold">{domainLabel(t, recap.best.domain)}</Text>
                </View>
                <Text tone="success" weight="semibold" tabular>
                  +{recap.best.gain}
                </Text>
              </Card>
            ) : null}

            {recap.gains.length > 0 ? (
              <>
                <Text variant="subheading" weight="semibold">
                  {t('season.gains')}
                </Text>
                <Card padded={false}>
                  {recap.gains.map((g, i) => (
                    <View key={g.domain} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <DomainBadge domain={g.domain} size={28} />
                      <Text style={styles.flex}>{domainLabel(t, g.domain)}</Text>
                      <Text tabular weight="semibold" tone={g.gain > 0 ? 'success' : g.gain < 0 ? 'danger' : 'muted'}>
                        {g.gain > 0 ? '+' : g.gain < 0 ? '−' : '±'}
                        {Math.abs(g.gain)}
                      </Text>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            <Button
              label={t('season.share')}
              icon="share"
              variant="secondary"
              fullWidth
              onPress={() => void sharing.share()}
            />
          </>
        ) : (
          <Card>
            <Text tone="muted">{t('season.empty')}</Text>
          </Card>
        )}

        {past.length > 0 ? (
          <>
            <Text variant="subheading" weight="semibold">
              {t('season.past')}
            </Text>
            <Card padded={false}>
              {past.map((p, i) => {
                const r = seasonRecap(p);
                return (
                  <Card
                    key={p.season}
                    padded={false}
                    onPress={() => router.setParams({ n: String(p.season) })}
                    accessibilityLabel={t('season.recapTitle', { season: seasonName(t, p.season) })}
                    style={[styles.row, styles.pastRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                  >
                    <TierBadge info={r.peak} size={32} showProvisional={false} />
                    <Text weight={p.season === season ? 'semibold' : 'regular'} style={styles.flex}>
                      {seasonName(t, p.season)}
                    </Text>
                    <Text tone="muted">{tierLabel(t, r.peak)}</Text>
                  </Card>
                );
              })}
            </Card>
          </>
        ) : null}

        <Card style={styles.how}>
          <Text weight="semibold">{t('season.howTitle')}</Text>
          <Text variant="caption" tone="muted">
            {t('season.howBody')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.lg },
  tiers: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  tier: { alignItems: 'center', gap: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, gap: 2 },
  best: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  pastRow: { borderWidth: 0, borderRadius: 0 },
  how: { gap: spacing.xs },
});
