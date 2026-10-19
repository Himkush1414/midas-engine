import { duelPlan, getGame } from '@mindtier/core';
import { useLanguage, useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, PressableScale, Screen, SkeletonRows, StatusNote, Text } from '@/components/ui';
import { playDuel, shareDuel } from '@/features/duels/actions';
import { api, type DuelInfo } from '@/lib/api';
import { normaliseDuelCode, useDuels } from '@/state/duels';
import { useProgress } from '@/state/progress';
import { onColor, radii, SLANT_DEG, spacing, useTheme } from '@/theme';

export default function DuelScreen() {
  const { colors, domain } = useTheme();
  const locale = useLanguage();
  const t = useT();
  const params = useLocalSearchParams<{ id: string }>();
  const id = normaliseDuelCode(params.id ?? '');
  const local = useDuels((s) => s.duels.find((d) => d.id === id));
  const placementDone = useProgress((s) => s.placementDone);
  const [info, setInfo] = useState<DuelInfo | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'offline'>('loading');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .duel(id)
      .then((d) => {
        if (cancelled) return;
        setInfo(d);
        setState('ready');
        const me = d.entries.find((e) => e.isMe);
        const other = d.entries.find((e) => !e.isMe);
        useDuels.getState().upsert({
          id,
          expiresAt: d.expiresAt,
          ...(me ? { myPoints: me.points } : {}),
          opponent: other ? { name: other.name, points: other.points } : null,
        });
      })
      .catch((e: { status?: number }) => {
        if (!cancelled) setState(e?.status === 404 ? 'missing' : 'offline');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!id || state === 'missing') {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="heading">{t('duels.notFound')}</Text>
          <Text tone="muted" align="center">
            {t('duels.checkCode')}
          </Text>
          <Button label={t('common.back')} variant="secondary" onPress={close} />
        </View>
      </Screen>
    );
  }

  const plan = duelPlan(id);
  const played = (local?.myPoints ?? null) !== null || Boolean(info?.entries.some((e) => e.isMe));
  const expired = info?.expired ?? false;
  const me = info?.entries.find((e) => e.isMe);
  const other = info?.entries.find((e) => !e.isMe);

  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.top}>
        <PressableScale onPress={close} accessibilityLabel={t('common.back')} style={styles.back}>
          <Icon name="back" size={24} color={colors.text} />
        </PressableScale>
        <Text variant="label" tone="faint" tabular>
          {t('duels.duelLabel', { code: id.toUpperCase() })}
        </Text>
        <View style={styles.back} />
      </View>

      <View style={styles.stack}>
        <Text variant="title">
          {info ? (local?.role === 'creator' || info.entries.find((e) => e.isMe && e.isCreator) ? t('duels.yourChallenge') : t('duels.challengedYou', { name: info.creatorName })) : t('duels.title')}
        </Text>

        <View style={styles.games}>
          {plan.games.map((g) => {
            const def = getGame(g);
            const hue = domain[def.domain];
            return (
              <View key={g} style={[styles.game, { backgroundColor: hue }]} accessible accessibilityLabel={`${def.name}, ${domainLabel(t, def.domain)}`}>
                <Icon name={def.domain} size={22} color={onColor(hue)} strokeWidth={2} />
                <Text variant="subheading" display weight="semibold" numberOfLines={2} style={{ color: onColor(hue) }}>
                  {def.name}
                </Text>
              </View>
            );
          })}
        </View>

        {state === 'loading' ? <SkeletonRows rows={2} /> : null}
        {state === 'offline' ? <StatusNote message={t('duels.offlineScores')} /> : null}

        {me && other ? (
          // The verdict, stamped like a result: volt for a win, flare for a loss.
          <View
            style={[
              styles.stamp,
              { backgroundColor: me.points > other.points ? colors.primary : me.points < other.points ? colors.danger : colors.surfaceRaised },
            ]}
          >
            <Text
              variant="subheading"
              display
              weight="semibold"
              style={[styles.unskew, { color: me.points > other.points ? colors.onPrimary : me.points < other.points ? onColor(colors.danger) : colors.text }]}
            >
              {me.points > other.points ? t('duels.youWon', { name: other.name }) : me.points < other.points ? t('duels.theyWon', { name: other.name }) : t('duels.draw')}
            </Text>
          </View>
        ) : null}

        {info && (me || other) ? (
          <View style={[styles.scores, { backgroundColor: colors.surface }]}>
            {[
              { label: t('duels.you'), points: me?.points, win: Boolean(me && other && me.points > other.points) },
              { label: (other?.name ?? t('duels.friend')).toUpperCase(), points: other?.points, win: Boolean(me && other && other.points > me.points) },
            ].map((side, i) => (
              <View key={i} style={[styles.score, i === 1 && styles.scoreRight]}>
                <Text variant="micro" tone="muted" numberOfLines={1}>
                  {side.label}
                </Text>
                <Text variant="title" tabular style={side.win ? { color: colors.success } : undefined}>
                  {side.points !== undefined ? side.points.toLocaleString(locale) : '—'}
                </Text>
              </View>
            ))}
            <View style={[styles.vs, { backgroundColor: colors.surfaceRaised }]}>
              <Text variant="subheading" display weight="semibold" style={styles.unskew}>
                {t('duels.vs')}
              </Text>
            </View>
          </View>
        ) : null}

        {me && other ? (
          <View style={[styles.breakdown, { backgroundColor: colors.surface }]}>
            <View style={styles.versus}>
              <Text variant="micro" tone="muted" style={styles.flex}>
                {t('duels.byGame')}
              </Text>
              <Text variant="micro" tone="muted" style={styles.pct}>
                {t('duels.you')}
              </Text>
              <Text variant="micro" tone="muted" numberOfLines={1} style={styles.pct}>
                {other.name}
              </Text>
            </View>
            {plan.games.map((g, i) => {
              const def = getGame(g);
              const mine = Math.round((me.accuracy[i] ?? 0) * 100);
              const theirs = Math.round((other.accuracy[i] ?? 0) * 100);
              return (
                <View key={`${g}-${i}`} style={styles.versus} accessible accessibilityLabel={`${def.name}: ${t('duels.you')} ${mine}%, ${other.name} ${theirs}%`}>
                  <View style={[styles.pip, { backgroundColor: domain[def.domain] }]} />
                  <Text variant="subheading" display weight="semibold" numberOfLines={1} style={styles.flex}>
                    {def.name}
                  </Text>
                  <Text variant="subheading" display tabular style={[styles.pct, { color: mine > theirs ? colors.success : colors.textMuted }]}>
                    {mine}%
                  </Text>
                  <Text variant="subheading" display tabular style={[styles.pct, { color: theirs > mine ? colors.text : colors.textMuted }]}>
                    {theirs}%
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {!placementDone ? (
          <Text tone="muted" align="center">
            {t('duels.placeFirst')}
          </Text>
        ) : expired ? (
          <Text tone="muted" align="center">
            {t('duels.expired')}
          </Text>
        ) : !played ? (
          <Button label={t('duels.play')} icon="play" size="lg" fullWidth onPress={() => playDuel(id)} testID="duel-play" />
        ) : null}

        <Button label={t('duels.shareLink')} icon="share" variant="secondary" fullWidth onPress={() => shareDuel(id)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.lg, paddingTop: spacing.md },
  games: { flexDirection: 'row', gap: spacing.sm },
  game: { flex: 1, borderRadius: radii.md, padding: spacing.md, minHeight: 104, justifyContent: 'space-between' },
  scores: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.md, padding: spacing.lg },
  score: { flex: 1, gap: 2 },
  scoreRight: { alignItems: 'flex-end' },
  vs: { position: 'absolute', left: '50%', marginLeft: -26, width: 52, height: 40, borderRadius: radii.xs, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  stamp: { alignSelf: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  breakdown: { borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  versus: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pip: { width: 12, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  flex: { flex: 1 },
  pct: { minWidth: 52, textAlign: 'right' },
});
