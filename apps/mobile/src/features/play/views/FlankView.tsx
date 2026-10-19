import { flankAnswer, type FlankDirection, type FlankTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { BinaryChoice, Prompt } from './controls';

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
  const { width } = useWindowDimensions();
  // As big as the row allows: seven arrows across the column, never more than 64 pt each.
  const size = Math.min(64, Math.floor((Math.min(width, 640) - 48) / row.length) - 2);
  const answer = flankAnswer(trial);

  return (
    <View style={styles.root}>
      <Prompt>
        {trial.reverse ? t('play.flankReverse') : t('play.flankAsk')}
      </Prompt>
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
  // Auto margins centre the arrows in the space between the prompt and the answer keys.
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, minHeight: 160, marginVertical: 'auto' },
  halo: { borderWidth: 2.5, borderRadius: 6, padding: 2 },
  actions: { marginBottom: spacing.lg },
});
