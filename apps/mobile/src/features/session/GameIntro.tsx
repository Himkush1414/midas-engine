import { getGame, type GameId, type GameMode } from '@mindtier/core';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Enter, fitDisplaySize, MAX_CONTENT_WIDTH, Text } from '@/components/ui';
import { useT, type TKey } from '@/i18n';
import { domainLabel, gameRules } from '@/i18n/labels';
import { onColor, radii, SLANT_DEG, spacing, type, useTheme } from '@/theme';

const MODE_NOTE: Record<GameMode, TKey> = {
  placement: 'session.modePlacement',
  ranked: 'session.modeRanked',
  daily: 'session.modeDaily',
  duel: 'session.modeDuel',
  zen: 'session.modeZen',
};

export interface GameIntroProps {
  gameId: GameId;
  mode: GameMode;
  position: number;
  total: number;
  reduceMotion: boolean;
  onStart(): void;
  onPractice(): void;
}

/**
 * The walk-out before each game: a solid slab in the domain's colour carrying its glyph, the
 * game's name at full display size and the rules set large enough to read at a glance.
 */
export function GameIntro({ gameId, mode, position, total, onStart, onPractice }: GameIntroProps) {
  const t = useT();
  const { width } = useWindowDimensions();
  const def = getGame(gameId);
  const color = useTheme().domain[def.domain];
  const ink = onColor(color);
  const column = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2;
  const nameSize = fitDisplaySize(def.name, column, type.mega[0], 48);
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Enter index={0}>
          <View style={[styles.slab, { backgroundColor: color }]}>
            <View style={styles.slabHead}>
              <Text variant="micro" weight="bold" style={{ color: ink }}>
                {domainLabel(t, def.domain)}
              </Text>
              <Text variant="micro" weight="bold" style={{ color: ink }}>
                {t('session.gameOf', { index: position, total })}
              </Text>
            </View>
            <View style={styles.glyph} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Icon name={def.domain} size={120} color={ink} strokeWidth={1.3} />
            </View>
            <View style={[styles.cut, { backgroundColor: ink }]} />
          </View>
        </Enter>
        <Enter index={1}>
          <Text variant="mega" style={{ fontSize: nameSize, lineHeight: nameSize * 0.92 }} accessibilityRole="header">
            {def.name}
          </Text>
        </Enter>
        <Enter index={2} style={styles.rules}>
          <Text variant="subheading" weight="medium">
            {gameRules(t, def.id)}
          </Text>
          <Text variant="micro" tone="muted">
            {t(MODE_NOTE[mode])}
          </Text>
        </Enter>
      </View>
      <View style={styles.actions}>
        <Button label={t('session.start')} size="lg" icon="play" onPress={onStart} fullWidth testID="intro-start" />
        <Button label={t('session.practice')} variant="ghost" onPress={onPractice} fullWidth testID="intro-practice" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between' },
  content: { gap: spacing.lg, paddingTop: spacing.md },
  slab: { borderRadius: radii.md, padding: spacing.lg, minHeight: 200, overflow: 'hidden', justifyContent: 'space-between' },
  slabHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  glyph: { alignSelf: 'flex-end', marginRight: -spacing.lg, marginBottom: -spacing.xxl, opacity: 0.9 },
  cut: { position: 'absolute', left: spacing.lg, bottom: spacing.lg, width: 56, height: 10, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  rules: { gap: spacing.md },
  actions: { gap: spacing.xs, paddingBottom: spacing.md },
});
