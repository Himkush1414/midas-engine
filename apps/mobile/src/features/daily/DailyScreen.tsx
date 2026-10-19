import { dailyPlan, getGame, utcDayKey } from '@mindtier/core';
import { useLanguage, useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Enter, fitDisplaySize, MAX_CONTENT_WIDTH, RollingNumber, Screen, SkeletonRows, StatusNote, Text, Ticket } from '@/components/ui';
import { dailyShareText, untilNextDaily } from './dailyShare';
import { startDaily } from '@/features/session/start';
import { syncNow } from '@/features/sync/sync';
import { track } from '@/lib/analytics';
import { api, type DailyBoard } from '@/lib/api';
import { backendConfigured } from '@/lib/config';
import { shareText } from '@/lib/share';
import { useAccount } from '@/state/account';
import { useProgress } from '@/state/progress';
import { onColor, radii, SLANT_DEG, spacing, tierColors, useTheme } from '@/theme';

export interface DailyScreenProps {
  /** Replaces the default title block (the web build shows its own brand header). */
  header?: ReactNode;
  /** Rendered after the leaderboard. */
  footer?: ReactNode;
  /** Where the "choose a name" nudge leads; null hides the nudge. Defaults to the profile tab. */
  onNamePress?: (() => void) | null;
}

/** Today's Daily Challenge: the three games, your result and the leaderboard. Shared by the tab and the web build. */
export function DailyScreen({ header, footer, onNamePress = () => router.push('/profile') }: DailyScreenProps) {
  const { colors, scheme, domain: domainColor } = useTheme();
  const t = useT();
  const locale = useLanguage();
  const { width } = useWindowDimensions();
  const today = utcDayKey(new Date());
  const plan = dailyPlan(today);
  const record = useProgress((s) => s.daily[today]);
  const displayName = useAccount((s) => s.displayName);
  const [board, setBoard] = useState<DailyBoard | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!record || !backendConfigured) return;
      let cancelled = false;
      const day = utcDayKey(new Date());
      setLoading(true);
      (async () => {
        try {
          await syncNow();
          const next = await api.dailyBoard(day);
          if (!cancelled) {
            setBoard(next);
            setOffline(false);
          }
        } catch {
          if (!cancelled) setOffline(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [record]),
  );

  const next = untilNextDaily(new Date());
  const share = () => {
    if (!record) return;
    track('share_tapped', { what: 'daily' });
    void shareText(dailyShareText(today, record.points, plan.games, record.accuracy, board?.me?.percentile));
  };

  const column = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2;
  const cardWidth = (column - CARD_GAP * 2) / 3 - spacing.md * 2;
  // The score and its unit share one line: leave room for the unit (about 56 pt) on narrow phones.
  const pointsSize = record ? fitDisplaySize(record.points.toLocaleString(locale), column - 56, 104, 64) : 104;

  return (
    <Screen scroll>
      {header ?? (
        <View style={styles.header}>
          <View style={styles.kicker}>
            <View style={[styles.tab, { backgroundColor: colors.spark }]} />
            <Text variant="micro" tone="muted">
              {t('daily.today', { day: today })}
            </Text>
          </View>
          <Text variant="title">{t('daily.title')}</Text>
          <Text tone="muted">{t('daily.subtitle')}</Text>
        </View>
      )}

      <View style={styles.stack}>
        <View style={styles.games}>
          {plan.games.map((g, i) => {
            const def = getGame(g);
            const hue = domainColor[def.domain];
            const ink = onColor(hue);
            const accuracy = record?.accuracy[i];
            return (
              <Enter key={g} index={i} style={styles.gameCell}>
                <View style={[styles.game, { backgroundColor: hue }]} accessible accessibilityLabel={`${def.name}, ${domainLabel(t, def.domain)}${accuracy !== undefined ? `, ${Math.round(accuracy * 100)}%` : ''}`}>
                  <Icon name={def.domain} size={30} color={ink} strokeWidth={2} />
                  <View style={styles.gameText}>
                    <Text variant="heading" numberOfLines={2} style={{ color: ink, fontSize: fitDisplaySize(def.name.split(' ').reduce((a, b) => (b.length > a.length ? b : a), ''), cardWidth, 26, 16), lineHeight: 24 }}>
                      {def.name}
                    </Text>
                    <Text variant="micro" weight="bold" numberOfLines={1} style={{ color: ink, fontSize: monoFit(domainLabel(t, def.domain), cardWidth) }}>
                      {domainLabel(t, def.domain)}
                    </Text>
                  </View>
                  {accuracy !== undefined ? (
                    <Text variant="heading" tabular style={{ color: ink }}>
                      {Math.round(accuracy * 100)}%
                    </Text>
                  ) : null}
                </View>
              </Enter>
            );
          })}
        </View>

        {record ? (
          <Enter index={3} style={styles.result}>
            <View style={styles.points}>
              <RollingNumber value={record.points.toLocaleString(locale)} variant="mega" style={{ fontSize: pointsSize, lineHeight: Math.round(pointsSize * 0.9) }} />
              <Text variant="heading" tone="muted" style={styles.unit}>
                {t('common.points', { points: '' }).trim()}
              </Text>
            </View>
            <Button label={t('daily.shareResult')} icon="share" variant="secondary" fullWidth onPress={share} testID="daily-share" />
            <Text variant="micro" tone="faint" align="center">
              {t('daily.next', { hours: next.hours, minutes: next.minutes })}
            </Text>
          </Enter>
        ) : (
          <Enter index={3}>
            <Button label={t('daily.play')} icon="play" size="lg" fullWidth onPress={() => startDaily()} testID="daily-play" />
          </Enter>
        )}

        {record ? (
          <Enter index={4}>
            <View style={[styles.board, { backgroundColor: colors.surface }]}>
              <View style={styles.boardHeader}>
                <Text variant="heading">{t('daily.leaderboard')}</Text>
                {board?.me?.percentile ? (
                  <View style={[styles.top, { backgroundColor: colors.spark }]}>
                    <Text variant="micro" weight="bold" style={[styles.unskew, { color: onColor(colors.spark) }]}>
                      {t('daily.topPercent', { percent: Math.max(1, 100 - board.me.percentile + 1) })}
                    </Text>
                  </View>
                ) : null}
              </View>
              {!backendConfigured ? (
                <Text tone="muted">{t('daily.unavailable')}</Text>
              ) : loading && !board ? (
                <SkeletonRows rows={5} />
              ) : offline && !board ? (
                <StatusNote message={t('daily.offline')} />
              ) : board ? (
                <>
                  {!displayName && onNamePress ? (
                    <Ticket
                      kicker={t('daily.leaderboard')}
                      title={t('daily.nameNudgeTitle')}
                      detail={t('daily.nameNudgeBody')}
                      color={colors.accent}
                      icon="edit"
                      onPress={onNamePress}
                    />
                  ) : null}
                  <Text variant="micro" tone="muted">
                    {t('daily.players', { count: board.total })}
                    {board.me ? t('daily.youAre', { place: board.me.place }) : ''}
                  </Text>
                  {board.top.slice(0, 20).map((e) => (
                    <View key={`${e.place}-${e.name}`} style={[styles.boardRow, e.me && { backgroundColor: colors.surfaceRaised }]}>
                      {e.me ? <View style={[styles.meTab, { backgroundColor: colors.primaryText }]} /> : null}
                      <Text variant="subheading" display weight="semibold" tabular style={[styles.place, e.place <= 3 && { color: PODIUM(scheme)[e.place - 1] }]}>
                        {e.place}
                      </Text>
                      <Text style={styles.flex} weight={e.me ? 'bold' : 'regular'} numberOfLines={1}>
                        {e.me ? t('daily.you', { name: e.name }) : e.name}
                      </Text>
                      <Text variant="subheading" display weight="semibold" tabular>
                        {e.points.toLocaleString(locale)}
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          </Enter>
        ) : null}
        {footer}
      </View>
    </Screen>
  );
}

const CARD_GAP = spacing.sm;
/** Places 1–3 in gold, silver and bronze: the bright metal on the dark field, the deep tone on paper. */
const PODIUM = (scheme: 'dark' | 'light') => (['gold', 'silver', 'bronze'] as const).map((m) => tierColors[m][scheme === 'dark' ? 'base' : 'deep']);

/**
 * Largest micro size (≤ 11) at which a mono label fits the card on one line: JetBrains Mono glyphs are
 * 0.6 em wide plus 1.3 pt tracking, so "LANGUAGE" or "LINGUAGGIO" never truncate on a 320 pt phone.
 */
function monoFit(label: string, width: number) {
  // 4 pt of slack: web rounds sub-pixel widths up, and a label that fits exactly still ellipsizes.
  return Math.max(8, Math.min(11, Math.floor((((width - 4) / label.length - 1.3) / 0.6) * 2) / 2));
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.xs },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tab: { width: 18, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  stack: { gap: spacing.lg },
  games: { flexDirection: 'row', gap: CARD_GAP },
  gameCell: { flex: 1 },
  game: { borderRadius: radii.md, padding: spacing.md, minHeight: 168, justifyContent: 'space-between', gap: spacing.sm },
  gameText: { gap: 2 },
  result: { gap: spacing.md },
  points: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' },
  unit: { marginBottom: spacing.sm },
  board: { borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm },
  boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  top: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radii.sm, overflow: 'hidden' },
  meTab: { position: 'absolute', left: -3, top: 0, bottom: 0, width: 7, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  place: { width: 32 },
});
