import type { BalanceEquation, BalanceTerm, BalanceTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT, type TFunction } from '@/i18n';
import type { GameViewProps } from '../types';
import { OptionGrid } from './controls';
import { SHAPE_KEYS, Shape } from './shapes';

/** Balance shape ids 0..3 map to circle, square, triangle, star. Light-theme steps keep ≥3:1 on white. */
const SHAPE_COLORS_DARK = ['#F472B6', '#60A5FA', '#FBBF24', '#34D399'] as const;
const SHAPE_COLORS_LIGHT = ['#BE185D', '#2563EB', '#B45309', '#047857'] as const;

function useShapeColors() {
  return useTheme().scheme === 'dark' ? SHAPE_COLORS_DARK : SHAPE_COLORS_LIGHT;
}

function Terms({ terms }: { terms: BalanceTerm[] }) {
  const shapeColors = useShapeColors();
  return (
    <View style={styles.terms}>
      {terms.map((t, i) => (
        <View key={i} style={styles.term}>
          <Text variant="heading" tabular>
            {t.count}
          </Text>
          <Shape id={t.shape} size={26} color={shapeColors[t.shape] ?? '#FFFFFF'} />
          {i < terms.length - 1 ? (
            <Text variant="subheading" tone="muted">
              +
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const describe = (t: TFunction, terms: BalanceTerm[]) =>
  terms.map((term) => t(`shapes.${SHAPE_KEYS[term.shape % SHAPE_KEYS.length] ?? 'circle'}`, { count: term.count })).join(` ${t('a11y.plus')} `);

function Scale({ eq }: { eq: BalanceEquation }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View
      style={[styles.scale, { backgroundColor: colors.surface }]}
      accessible
      accessibilityLabel={t('a11y.balances', { left: describe(t, eq.left), right: describe(t, eq.right) })}
    >
      <View style={styles.pan}>
        <Terms terms={eq.left} />
      </View>
      <Svg width={36} height={28} viewBox="0 0 36 28">
        <Path d="M18 4v20M6 24h24M4 10h28M4 10l-3 7h6zM32 10l-3 7h6z" stroke={colors.textMuted} strokeWidth={2} fill="none" strokeLinejoin="round" />
      </Svg>
      <View style={styles.pan}>
        <Terms terms={eq.right} />
      </View>
    </View>
  );
}

export function BalanceView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<BalanceTrial, number>) {
  const { colors, domain: dc } = useTheme();
  const shapeColors = useShapeColors();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  return (
    <View style={styles.root}>
      <View style={styles.scales}>
        {trial.equations.map((eq, i) => (
          <Scale key={i} eq={eq} />
        ))}
      </View>
      <View style={[styles.question, { borderColor: dc.logic }]}>
        <Terms terms={[trial.ask]} />
        <Text variant="subheading">=</Text>
        <Text variant="heading" tone="primary">
          ?
        </Text>
        <Shape id={trial.unit} size={26} color={shapeColors[trial.unit] ?? colors.text} />
      </View>
      <View style={styles.actions}>
        <OptionGrid
          options={trial.options}
          disabled={locked}
          onChoose={onAnswer}
          renderOption={(opt, i) => (
            <Text variant="title" tabular tone={demo && i === trial.answerIndex ? 'success' : 'default'}>
              {opt}
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.lg, paddingTop: spacing.md },
  scales: { gap: spacing.sm },
  scale: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  pan: { flex: 1, alignItems: 'center' },
  terms: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' },
  term: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  question: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, alignSelf: 'center', borderWidth: 1.5, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
