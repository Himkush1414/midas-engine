import { clashAnswer, type ClashTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { BinaryChoice } from './controls';
import { Shape } from './shapes';

/** Colour mode: chosen to stay distinguishable for most colour-vision types; shape mode avoids colour entirely. */
const COLOR_NAMES = ['RED', 'BLUE', 'YELLOW', 'GREEN', 'PURPLE'] as const;
const COLOR_VALUES = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7'] as const;
const SHAPE_WORDS = ['CIRCLE', 'SQUARE', 'TRIANGLE', 'STAR', 'HEXAGON'] as const;

export function ClashView({ trial, onInputOpen, onAnswer, locked, shapeMode, demo }: GameViewProps<ClashTrial, boolean>) {
  const { colors } = useTheme();
  const t = useT();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const words = shapeMode ? SHAPE_WORDS : COLOR_NAMES;
  const askLabel = trial.ask === 'ink' ? (shapeMode ? t('play.clashShape') : t('play.clashInk')) : t('play.clashMeaning');
  const answer = clashAnswer(trial);

  return (
    <View style={styles.root}>
      <View style={[styles.cue, { backgroundColor: trial.ask === 'ink' ? colors.surfaceRaised : colors.warning }]}>
        <Text variant="label" style={{ color: trial.ask === 'ink' ? colors.text : colors.textInverse }}>
          {t('play.clashAsk', { property: askLabel })}
        </Text>
      </View>
      <View
        // Ink colours need a dark stage to stay legible and recognisable in both themes.
        style={[styles.card, { backgroundColor: shapeMode ? colors.surface : '#121734', borderColor: colors.border }]}
        accessible
        accessibilityLabel={
          shapeMode
            ? t('a11y.clashShape', { word: words[trial.word] ?? '', ink: SHAPE_WORDS[trial.ink]?.toLowerCase() ?? '' })
            : t('a11y.clashColour', { word: words[trial.word] ?? '', ink: COLOR_NAMES[trial.ink]?.toLowerCase() ?? '' })
        }
      >
        {shapeMode ? (
          <View style={styles.shapeWrap}>
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.shapeCenter}>
                <Shape id={trial.ink} size={150} color={colors.textMuted} filled={false} strokeWidth={5} />
              </View>
            </View>
            <Text variant="title" align="center">
              {words[trial.word]}
            </Text>
          </View>
        ) : (
          <Text variant="hero" align="center" style={{ color: COLOR_VALUES[trial.ink] }}>
            {words[trial.word]}
          </Text>
        )}
      </View>
      <View style={[styles.card, styles.probe, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="title" align="center" accessibilityLabel={t('a11y.bottomWord', { word: words[trial.probe] ?? '' })}>
          {words[trial.probe]}
        </Text>
      </View>
      <View style={styles.actions}>
        <BinaryChoice
          disabled={locked}
          left={{ label: t('play.no'), icon: 'close', tone: demo && !answer ? 'positive' : 'neutral' }}
          right={{ label: t('play.yes'), icon: 'check', tone: demo && answer ? 'positive' : 'neutral' }}
          onChoose={(side) => onAnswer(side === 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.lg, paddingTop: spacing.md },
  cue: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  card: { height: 170, borderRadius: radii.xl, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  probe: { height: 100 },
  shapeWrap: { width: 220, height: 160, alignItems: 'center', justifyContent: 'center' },
  shapeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
