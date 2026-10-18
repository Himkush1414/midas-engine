import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';
import { HIT_TARGET, radii, SLANT_DEG, spacing, springs, useTheme } from '@/theme';
import { Icon, type IconName } from './icons/Icon';
import { Card, PressableScale, Text } from './ui';

export function SettingsSection({ title, children, footer }: { title: string; children: ReactNode; footer?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <View style={[styles.tab, { backgroundColor: colors.primaryText }]} />
        <Text variant="micro" tone="muted" accessibilityRole="header">
          {title}
        </Text>
      </View>
      <Card padded={false}>{children}</Card>
      {footer ? (
        <Text variant="caption" tone="faint" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

export interface SettingsRowProps {
  icon?: IconName;
  label: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  switchValue?: boolean;
  onSwitch?: (v: boolean) => void;
  destructive?: boolean;
  first?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function SettingsRow({ icon, label, detail, value, onPress, switchValue, onSwitch, destructive, first, disabled, testID }: SettingsRowProps) {
  const { colors } = useTheme();
  const tint = destructive ? colors.danger : colors.text;
  const content = (
    <View style={[styles.row, !first && { borderTopWidth: 1, borderTopColor: colors.border }, disabled && { opacity: 0.5 }]}>
      {icon ? <Icon name={icon} size={22} color={destructive ? colors.danger : colors.textMuted} /> : null}
      <View style={styles.text}>
        <Text style={{ color: tint }}>{label}</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text tone="muted" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {onSwitch ? (
        <Toggle value={Boolean(switchValue)} onChange={onSwitch} disabled={disabled} label={label} />
      ) : onPress ? (
        <Icon name="chevronRight" size={18} color={colors.textFaint} />
      ) : null}
    </View>
  );
  if (onPress && !onSwitch) {
    return (
      <PressableScale onPress={onPress} disabled={disabled} pressedScale={0.99} accessibilityLabel={value ? `${label}, ${value}` : label} testID={testID}>
        {content}
      </PressableScale>
    );
  }
  return content;
}

/** A slanted toggle: the thumb springs across a track that turns volt when on. */
export function Toggle({ value, onChange, disabled, label }: { value: boolean; onChange(v: boolean): void; disabled?: boolean; label: string }) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.set(reduce ? (value ? 1 : 0) : withSpring(value ? 1 : 0, springs.release));
  }, [value, reduce, on]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: on.get() * 22 }, { skewX: `${SLANT_DEG}deg` }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        haptic.tap();
        onChange(!value);
      }}
      style={[styles.toggle, { backgroundColor: value ? colors.primary : colors.surfaceSunken }]}
    >
      <Animated.View style={[styles.thumb, { backgroundColor: value ? colors.onPrimary : colors.textFaint }, thumb]} />
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange(v: T): void;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceSunken }]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={[styles.segment, active && { backgroundColor: colors.text }]}
          >
            <Text variant="label" weight="bold" numberOfLines={1} style={{ color: active ? colors.background : colors.textMuted }}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
  tab: { width: 14, height: 7, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  footer: { paddingHorizontal: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: HIT_TARGET + 8, paddingVertical: spacing.sm },
  text: { flex: 1, gap: 2 },
  value: { maxWidth: '45%' },
  segmented: { flexDirection: 'row', borderRadius: radii.sm, padding: 3, gap: 3 },
  segment: { flex: 1, minHeight: HIT_TARGET, alignItems: 'center', justifyContent: 'center', borderRadius: radii.xs, paddingHorizontal: spacing.xs },
  toggle: { width: 52, height: 30, borderRadius: radii.xs, padding: 4, justifyContent: 'center' },
  thumb: { width: 22, height: 22, borderRadius: 2 },
});
