import type { MisfitTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useLanguage, useT } from '@/i18n';
import { spacing } from '@/theme';
import type { GameViewProps } from '../types';
import { wordLabel } from '../words';
import { AnswerButton, Prompt } from './controls';

export function MisfitView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<MisfitTrial, number>) {
  const t = useT();
  const language = useLanguage();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  return (
    <View style={styles.root}>
      <Prompt>
        {t('play.misfitAsk')}
      </Prompt>
      <View style={styles.grid}>
        {trial.words.map((id, i) => {
          const label = wordLabel(language, id);
          return (
            <View key={`${id}-${i}`} style={styles.cell}>
              <AnswerButton
                label={label}
                disabled={locked}
                onPress={() => onAnswer(i)}
                tone={demo && i === trial.oddIndex ? 'positive' : 'neutral'}
                height={76}
                testID={`misfit-${i}`}
              >
                <Text variant="heading" align="center" numberOfLines={2} adjustsFontSizeToFit>
                  {label}
                </Text>
              </AnswerButton>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center', marginVertical: 'auto' },
  cell: { width: '47%' },
});
