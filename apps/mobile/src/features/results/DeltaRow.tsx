import { DOMAIN_LABELS, getGame, tierInfo, type RatingUpdate, type Domain, type GameId } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Text } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

export function DeltaRow({
  update,
  index,
  reduceMotion,
}: {
  update: RatingUpdate & { domain: Domain; gameId: GameId };
  index: number;
  reduceMotion: boolean;
}) {
  const { colors } = useTheme();
  const after = tierInfo(update.after);
  const up = update.delta > 0;
  const flat = update.delta === 0;
  const tone = flat ? colors.textMuted : up ? colors.success : colors.danger;
  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInRight.delay(200 + index * 160).duration(320)}
      style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
      accessible
      accessibilityLabel={`${DOMAIN_LABELS[update.domain]}: ${flat ? 'no change' : `${up ? 'up' : 'down'} ${Math.abs(update.delta)}`}, now ${after.label}`}
    >
      <DomainBadge domain={update.domain} size={40} />
      <View style={styles.text}>
        <Text weight="semibold">{getGame(update.gameId).name}</Text>
        <Text variant="caption" tone="muted" tabular>
          {DOMAIN_LABELS[update.domain]} · {Math.round(update.before.rating)} → {Math.round(update.after.rating)}
        </Text>
      </View>
      <View style={styles.delta}>
        {!flat ? <Icon name={up ? 'arrowUp' : 'arrowDown'} size={16} color={tone} strokeWidth={2.4} /> : null}
        <Text weight="bold" tabular style={{ color: tone }}>
          {flat ? '±0' : `${up ? '+' : '−'}${Math.abs(update.delta)}`}
        </Text>
      </View>
      <TierBadge info={after} size={40} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: 16, padding: spacing.md },
  text: { flex: 1 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 56, justifyContent: 'flex-end' },
});
