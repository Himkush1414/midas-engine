import type { EchoTrial } from '@mindtier/core';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';
import { spacing, useTheme } from '@/theme';
import { AnswerButton } from './controls';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { Shape } from './shapes';

const SHOW_FRACTION = 0.75;

export function EchoView({ trial, onInputOpen, onAnswer, locked, reduceMotion, demo }: GameViewProps<EchoTrial, boolean[]>) {
  const { colors, domain: dc } = useTheme();
  const t = useT();
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const pressed = useRef<boolean[]>(trial.symbols.map(() => false));
  const [pressedNow, setPressedNow] = useState(false);

  useEffect(() => {
    if (demo) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const start = 700;
    timers.push(setTimeout(onInputOpen, start));
    trial.symbols.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setIndex(i);
          setVisible(true);
          setPressedNow(false);
        }, start + i * trial.intervalMs),
      );
      timers.push(setTimeout(() => setVisible(false), start + i * trial.intervalMs + trial.intervalMs * SHOW_FRACTION));
    });
    timers.push(setTimeout(() => onAnswer(pressed.current.slice()), start + trial.symbols.length * trial.intervalMs));
    return () => timers.forEach(clearTimeout);
  }, [trial, onInputOpen, onAnswer, demo]);

  const press = () => {
    if (index < 0 || locked || pressed.current[index]) return;
    haptic.tap();
    pressed.current[index] = true;
    setPressedNow(true);
  };

  const symbol = index >= 0 ? trial.symbols[index] : undefined;
  const color = dc.memory;

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        {t('play.echoHint', { count: trial.n })}
      </Text>
      <View style={[styles.stage, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {visible && symbol !== undefined ? (
          <Animated.View key={index} entering={reduceMotion ? undefined : FadeIn.duration(120)}>
            <Shape id={symbol} size={132} color={color} />
          </Animated.View>
        ) : (
          <View style={[styles.dot, { backgroundColor: colors.textFaint }]} />
        )}
      </View>
      <View style={styles.progress}>
        {trial.symbols.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              { backgroundColor: i < index ? colors.textFaint : i === index ? colors.accent : colors.surfaceRaised },
            ]}
          />
        ))}
      </View>
      <View style={styles.action}>
        <AnswerButton
          label={pressedNow ? t('play.marked') : t('play.match')}
          icon={pressedNow ? 'check' : 'memory'}
          tone={pressedNow ? 'positive' : 'neutral'}
          onPress={press}
          disabled={locked || index < 0 || pressedNow}
          height={96}
          testID="echo-match"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xl, paddingTop: spacing.lg },
  stage: { height: 220, borderRadius: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' },
  pip: { width: 10, height: 4, borderRadius: 2 },
  action: { marginTop: 'auto', marginBottom: spacing.lg },
});
