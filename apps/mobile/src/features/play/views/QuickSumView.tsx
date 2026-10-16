import type { QuickSumTrial } from '@mindtier/core';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import type { GameViewProps } from '../types';
import { Keypad } from './controls';

export function QuickSumView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<QuickSumTrial, number>) {
  const { colors } = useTheme();
  const [entry, setEntry] = useState(demo ? String(trial.answer) : '');
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const submit = () => {
    if (locked || entry.length === 0) return;
    onAnswer(Number(entry));
  };

  const expression = trial.tokens.join(' ');

  return (
    <View style={styles.root}>
      <View style={[styles.display, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="title" tabular align="center" accessibilityLabel={`${expression.replace('−', 'minus').replace('×', 'times').replace('÷', 'divided by')} equals`}>
          {expression}
        </Text>
        <View style={[styles.entry, { borderColor: entry ? colors.primaryText : colors.border }]}>
          <Text variant="hero" tabular align="center" tone={entry ? 'default' : 'faint'} accessibilityLiveRegion="polite">
            {entry || '?'}
          </Text>
        </View>
      </View>
      <View style={styles.pad}>
        <Keypad value={entry} onChange={setEntry} onSubmit={submit} disabled={locked} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.lg, paddingTop: spacing.md },
  display: { borderRadius: radii.xl, borderWidth: 1, padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  entry: { minWidth: 140, borderBottomWidth: 2, paddingHorizontal: spacing.md },
  pad: { marginTop: 'auto', marginBottom: spacing.md },
});
