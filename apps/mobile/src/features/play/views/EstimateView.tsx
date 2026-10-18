import type { EstimateTrial, Quantity } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PressableScale, Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { Prompt } from './controls';

function describeQuantity(t: ReturnType<typeof useT>, q: Quantity): string {
  switch (q.kind) {
    case 'dots':
      return t('a11y.dots');
    case 'fraction':
      return t('a11y.fraction', { num: q.num, den: q.den });
    case 'product':
      return t('a11y.product', { a: q.a, b: q.b });
    case 'percent':
      return t('a11y.percent', { p: q.p, of: q.of });
    case 'number':
      return String(q.value);
  }
}

function QuantityFace({ q, color }: { q: Quantity; color: string }) {
  const { colors } = useTheme();
  if (q.kind === 'dots') {
    return (
      <Svg width={140} height={140} viewBox="0 0 1 1">
        {q.points.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={0.024} fill={color} />
        ))}
      </Svg>
    );
  }
  if (q.kind === 'fraction') {
    return (
      <View style={styles.fraction}>
        <Text variant="hero" tabular>
          {q.num}
        </Text>
        <View style={[styles.bar, { backgroundColor: colors.text }]} />
        <Text variant="hero" tabular>
          {q.den}
        </Text>
      </View>
    );
  }
  const label = q.kind === 'product' ? `${q.a} × ${q.b}` : q.kind === 'percent' ? `${q.p}% of ${q.of}` : String(q.value);
  return (
    <Text variant="title" tabular align="center">
      {label}
    </Text>
  );
}

export function EstimateView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<EstimateTrial, 0 | 1>) {
  const { colors, domain: dc } = useTheme();
  const t = useT();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const sides = [trial.left, trial.right] as const;
  return (
    <View style={styles.root}>
      <Prompt>
        {t('play.larger')}
      </Prompt>
      <View style={styles.pair}>
        {sides.map((q, i) => (
          <PressableScale
            key={i}
            testID={`estimate-${i}`}
            disabled={locked}
            onPress={() => onAnswer(i as 0 | 1)}
            accessibilityLabel={t('a11y.estimateSide', { side: t(i === 0 ? 'play.left' : 'play.right'), value: describeQuantity(t, q) })}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: demo && trial.answer === i ? colors.success : colors.border,
              },
            ]}
          >
            <QuantityFace q={q} color={dc.math} />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  pair: { flexDirection: 'row', gap: spacing.md, flex: 1, maxHeight: 320 },
  card: { flex: 1, borderRadius: radii.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: spacing.sm },
  fraction: { alignItems: 'center' },
  bar: { height: 4, width: 64, borderRadius: 2, marginVertical: 4 },
});
