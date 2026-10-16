import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { HIT_TARGET, radii, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from './icons/Icon';
import { Card, PressableScale, Text } from './ui';

export function SettingsSection({ title, children, footer }: { title: string; children: ReactNode; footer?: string }) {
  return (
    <View style={styles.section}>
      <Text variant="caption" tone="faint" weight="semibold" style={styles.sectionTitle} accessibilityRole="header">
        {title.toUpperCase()}
      </Text>
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
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          disabled={disabled}
          trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
          thumbColor="#FFFFFF"
          accessibilityLabel={label}
        />
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
            style={[styles.segment, active && { backgroundColor: colors.surfaceRaised, borderColor: colors.borderStrong }]}
          >
            <Text variant="label" tone={active ? 'default' : 'muted'}>
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
  sectionTitle: { paddingHorizontal: spacing.sm },
  footer: { paddingHorizontal: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: HIT_TARGET + 8, paddingVertical: spacing.sm },
  text: { flex: 1, gap: 2 },
  value: { maxWidth: '45%' },
  segmented: { flexDirection: 'row', borderRadius: radii.md, padding: 3, gap: 3 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radii.sm, borderWidth: 1, borderColor: 'transparent' },
});
