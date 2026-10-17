import type { SortTrial } from '@mindtier/core';
import { sortAnswer } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useLanguage, useT } from '@/i18n';
import { radii, spacing, useTheme } from '@/theme';
import type { GameViewProps } from '../types';
import { categoryLabel, wordLabel } from '../words';
import { BinaryChoice } from './controls';

export function SortView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<SortTrial, boolean>) {
  const { colors, domain: dc } = useTheme();
  const t = useT();
  const language = useLanguage();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);
  const member = sortAnswer(trial);
  const word = wordLabel(language, trial.word);
  const group = categoryLabel(language, trial.category);

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        {t('play.sortAsk')}
      </Text>
      <View style={[styles.group, { borderColor: dc.language, backgroundColor: colors.surface }]} accessible accessibilityLabel={t('a11y.sortTrial', { group, word })}>
        <Text variant="caption" tone="muted" weight="semibold" align="center">
          {group.toLocaleUpperCase(language)}
        </Text>
        <Text variant="title" display align="center" numberOfLines={2} adjustsFontSizeToFit>
          {word}
        </Text>
      </View>
      <View style={styles.actions}>
        <BinaryChoice
          disabled={locked}
          left={{ label: t('play.no'), icon: 'close', tone: demo && !member ? 'positive' : 'neutral' }}
          right={{ label: t('play.yes'), icon: 'check', tone: demo && member ? 'positive' : 'neutral' }}
          onChoose={(side) => onAnswer(side === 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  group: { borderWidth: 2, borderRadius: radii.xl, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, gap: spacing.md },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
