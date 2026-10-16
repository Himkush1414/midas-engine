import type { PatternTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { OptionGrid } from './controls';

export function PatternView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<PatternTrial, number>) {
  const { colors } = useTheme();
  const t = useT();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const longest = Math.max(...trial.sequence.map((n) => String(n).length), 2);
  const variant = longest >= 4 ? 'subheading' : 'heading';

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        {t('play.whatNext')}
      </Text>
      <View
        style={styles.sequence}
        accessible
        accessibilityLabel={`Sequence: ${trial.sequence.join(', ')}, then what?`}
      >
        {trial.sequence.map((n, i) => (
          <View key={i} style={[styles.term, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant={variant} tabular align="center">
              {n}
            </Text>
          </View>
        ))}
        <View style={[styles.term, { borderColor: colors.primaryText, borderStyle: 'dashed', backgroundColor: colors.surfaceSunken }]}>
          <Text variant={variant} tone="primary" align="center">
            ?
          </Text>
        </View>
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
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  sequence: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  term: { minWidth: 52, height: 60, paddingHorizontal: spacing.sm, borderRadius: radii.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
