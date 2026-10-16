import { flankAnswer, type FlankDirection, type FlankTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/components/ui';
import { spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { BinaryChoice } from './controls';

function Arrow({ dir, color, size }: { dir: FlankDirection; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" style={{ transform: [{ scaleX: dir === 'left' ? -1 : 1 }] }}>
      <Path d="M6 24h30M24 10l14 14-14 14" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function FlankView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<FlankTrial, FlankDirection>) {
  const { colors } = useTheme();
  const t = useT();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const row = [...trial.left, trial.center, ...trial.right];
  const centerIndex = trial.left.length;
  const size = row.length > 5 ? 40 : 52;
  const answer = flankAnswer(trial);

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        {trial.reverse ? t('play.flankReverse') : t('play.flankAsk')}
      </Text>
      <View
        style={styles.row}
        accessible
        accessibilityLabel={t(trial.reverse ? 'a11y.flankRowReverse' : 'a11y.flankRow', { dir: t(trial.center === 'left' ? 'a11y.dirLeft' : 'a11y.dirRight') })}
      >
        {row.map((dir, i) => {
          const isCenter = i === centerIndex;
          const color = isCenter ? (trial.reverse ? colors.warning : colors.text) : colors.textFaint;
          return (
            <View key={i} style={isCenter && trial.reverse ? [styles.halo, { borderColor: colors.warning }] : null}>
              <Arrow dir={dir} color={color} size={size} />
            </View>
          );
        })}
      </View>
      <View style={styles.actions}>
        <BinaryChoice
          disabled={locked}
          left={{ label: t('play.left'), icon: 'back', tone: demo && answer === 'left' ? 'positive' : 'neutral' }}
          right={{ label: t('play.right'), icon: 'chevronRight', tone: demo && answer === 'right' ? 'positive' : 'neutral' }}
          onChoose={(side) => onAnswer(side === 0 ? 'left' : 'right')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, minHeight: 140 },
  halo: { borderWidth: 2, borderRadius: 14, padding: 2 },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
