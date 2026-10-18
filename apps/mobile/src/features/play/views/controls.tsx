import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/icons/Icon';
import { LipPressable, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { lips, radii, spacing, useTheme } from '@/theme';

export interface AnswerButtonProps {
  label: string;
  onPress(): void;
  disabled?: boolean;
  icon?: IconName;
  children?: ReactNode;
  tone?: 'neutral' | 'positive' | 'negative';
  height?: number;
  testID?: string;
}

/** A game answer: a raised key on a lip, labelled in the display voice. Tones colour the glyph only. */
export function AnswerButton({ label, onPress, disabled, icon, children, tone = 'neutral', height = 72, testID }: AnswerButtonProps) {
  const { colors } = useTheme();
  const glyph = tone === 'positive' ? colors.success : tone === 'negative' ? colors.danger : colors.text;
  return (
    <LipPressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      hapticOnPress={false}
      accessibilityLabel={label}
      face={colors.surfaceRaised}
      lipColor={colors.lip}
      lip={lips.md}
      radius={radii.sm}
      faceStyle={[styles.answer, { minHeight: height }]}
    >
      {children ?? (
        <View style={styles.answerRow}>
          {icon ? <Icon name={icon} size={28} color={glyph} strokeWidth={2.4} /> : null}
          <Text variant="heading" numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </LipPressable>
  );
}

/** Two big side-by-side buttons (yes/no, left/right, same/different). */
export function BinaryChoice({
  left,
  right,
  onChoose,
  disabled,
}: {
  left: { label: string; icon?: IconName; tone?: AnswerButtonProps['tone'] };
  right: { label: string; icon?: IconName; tone?: AnswerButtonProps['tone'] };
  onChoose(side: 0 | 1): void;
  disabled: boolean;
}) {
  return (
    <View style={styles.binary}>
      <View style={styles.flex}>
        <AnswerButton {...left} disabled={disabled} onPress={() => onChoose(0)} height={88} testID="choice-0" />
      </View>
      <View style={styles.flex}>
        <AnswerButton {...right} disabled={disabled} onPress={() => onChoose(1)} height={88} testID="choice-1" />
      </View>
    </View>
  );
}

/** 2×2 multiple-choice grid. */
export function OptionGrid({
  options,
  onChoose,
  disabled,
  renderOption,
}: {
  options: readonly (string | number)[];
  onChoose(index: number): void;
  disabled: boolean;
  renderOption?: (option: string | number, index: number) => ReactNode;
}) {
  return (
    <View style={styles.grid}>
      {options.map((opt, i) => (
        <View key={`${opt}-${i}`} style={styles.gridCell}>
          <AnswerButton label={String(opt)} disabled={disabled} onPress={() => onChoose(i)} height={76} testID={`option-${i}`}>
            {renderOption ? renderOption(opt, i) : undefined}
          </AnswerButton>
        </View>
      ))}
    </View>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'] as const;

/** Numeric keypad; submits on the check key. */
export function Keypad({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange(next: string): void;
  onSubmit(): void;
  disabled: boolean;
}) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.keypad}>
      {KEYS.map((k) => {
        const isAction = k === 'del' || k === 'ok';
        const label = k === 'del' ? t('play.delete') : k === 'ok' ? t('play.submit') : k;
        return (
          <View key={k} style={styles.keyCell}>
            <LipPressable
              testID={`key-${k}`}
              disabled={disabled || (k === 'ok' && value.length === 0)}
              accessibilityLabel={label}
              onPress={() => {
                if (k === 'del') onChange(value.slice(0, -1));
                else if (k === 'ok') onSubmit();
                else if (value.length < 5) onChange(value + k);
              }}
              face={k === 'ok' ? colors.primary : isAction ? colors.surface : colors.surfaceRaised}
              lipColor={k === 'ok' ? colors.primaryLip : colors.lip}
              lip={lips.sm}
              radius={radii.sm}
              faceStyle={styles.key}
            >
              {k === 'del' ? (
                <Icon name="backspace" size={26} color={colors.text} />
              ) : k === 'ok' ? (
                <Icon name="check" size={28} color={colors.onPrimary} strokeWidth={2.4} />
              ) : (
                <Text variant="title" tabular>
                  {k}
                </Text>
              )}
            </LipPressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  answer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  binary: { flexDirection: 'row', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  gridCell: { width: '50%', padding: spacing.xs },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  keyCell: { width: '33.333%', padding: spacing.xs },
  key: { height: 58, alignItems: 'center', justifyContent: 'center' },
});
