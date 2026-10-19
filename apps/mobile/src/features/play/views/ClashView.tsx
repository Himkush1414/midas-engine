import { clashAnswer, type ClashTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme, darkPalette, onColor } from '@/theme';
import { useLanguage, useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { BinaryChoice } from './controls';
import { Shape } from './shapes';

/** Colour mode: chosen to stay distinguishable for most colour-vision types; shape mode avoids colour entirely. */
const COLOR_KEYS = ['red', 'blue', 'yellow', 'green', 'purple'] as const;
const COLOR_VALUES = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7'] as const;
const SHAPE_KEYS = ['circle', 'square', 'triangle', 'star', 'hexagon'] as const;

export function ClashView({ trial, onInputOpen, onAnswer, locked, shapeMode, demo }: GameViewProps<ClashTrial, boolean>) {
  const { colors } = useTheme();
  const t = useT();
  const lang = useLanguage();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const keys = shapeMode ? SHAPE_KEYS : COLOR_KEYS;
  const word = (i: number) => {
    const key = keys[i];
    return key ? t(`words.${key}`) : '';
  };
  const lower = (i: number) => word(i).toLocaleLowerCase(lang);
  const askLabel = trial.ask === 'ink' ? (shapeMode ? t('play.clashShape') : t('play.clashInk')) : t('play.clashMeaning');
  const answer = clashAnswer(trial);

  return (
    <View style={styles.root}>
      <View style={[styles.cue, { backgroundColor: trial.ask === 'ink' ? colors.surfaceRaised : colors.spark }]}>
        <Text variant="body" weight="bold" align="center" style={{ color: trial.ask === 'ink' ? colors.text : onColor(colors.spark) }}>
          {t('play.clashAsk', { property: askLabel })}
        </Text>
      </View>
      <View
        // Ink colours need a dark stage to stay legible and recognisable in both themes.
        style={[styles.card, { backgroundColor: shapeMode ? colors.surface : darkPalette.surface }]}
        accessible
        accessibilityLabel={
          shapeMode
            ? t('a11y.clashShape', { word: word(trial.word), ink: lower(trial.ink) })
            : t('a11y.clashColour', { word: word(trial.word), ink: lower(trial.ink) })
        }
      >
        {shapeMode ? (
          <View style={styles.shapeWrap}>
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.shapeCenter}>
                <Shape id={trial.ink} size={150} color={colors.textMuted} filled={false} strokeWidth={5} />
              </View>
            </View>
            <Text variant="title" align="center" numberOfLines={1} adjustsFontSizeToFit>
              {word(trial.word)}
            </Text>
          </View>
        ) : (
          <Text variant="hero" align="center" numberOfLines={1} adjustsFontSizeToFit style={[styles.word, { color: COLOR_VALUES[trial.ink] }]}>
            {word(trial.word)}
          </Text>
        )}
      </View>
      <View style={[styles.card, styles.probe, { backgroundColor: colors.surface }]}>
        <Text variant="title" align="center" accessibilityLabel={t('a11y.bottomWord', { word: word(trial.probe) })}>
          {word(trial.probe)}
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
  cue: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.xs },
  card: { height: 170, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  probe: { height: 100 },
  word: { paddingHorizontal: spacing.md },
  shapeWrap: { width: 220, height: 160, alignItems: 'center', justifyContent: 'center' },
  shapeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
