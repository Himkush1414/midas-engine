import type { MatchTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { BinaryChoice, Prompt } from './controls';

function DotGlyph({ size, cells, dim, color, frame }: { size: number; cells: number[]; dim: number; color: string; frame: string }) {
  const step = 100 / dim;
  const filled = new Set(cells);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={1} y={1} width={98} height={98} rx={14} fill="none" stroke={frame} strokeWidth={2} />
      {Array.from({ length: dim * dim }, (_, i) => {
        const cx = (i % dim) * step + step / 2;
        const cy = Math.floor(i / dim) * step + step / 2;
        return filled.has(i) ? (
          <Circle key={i} cx={cx} cy={cy} r={step * 0.32} fill={color} />
        ) : (
          <Circle key={i} cx={cx} cy={cy} r={step * 0.08} fill={frame} />
        );
      })}
    </Svg>
  );
}

export function MatchView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<MatchTrial, boolean>) {
  const { colors, domain: dc } = useTheme();
  const t = useT();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);
  const color = dc.speed;

  return (
    <View style={styles.root}>
      <Prompt>
        {t('play.sameAsk')}
      </Prompt>
      <View style={styles.pair} accessible accessibilityLabel={t('a11y.twoPatterns')}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <DotGlyph size={136} cells={trial.left} dim={trial.size} color={color} frame={colors.border} />
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <DotGlyph size={136} cells={trial.right} dim={trial.size} color={color} frame={colors.border} />
        </View>
      </View>
      <View style={styles.actions}>
        <BinaryChoice
          disabled={locked}
          left={{ label: t('play.different'), icon: 'close', tone: demo && !trial.same ? 'positive' : 'neutral' }}
          right={{ label: t('play.same'), icon: 'check', tone: demo && trial.same ? 'positive' : 'neutral' }}
          onChoose={(side) => onAnswer(side === 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  pair: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  card: { padding: spacing.md, borderRadius: radii.md },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
