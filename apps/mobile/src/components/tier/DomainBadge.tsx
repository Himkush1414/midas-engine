import type { Domain } from '@mindtier/core';
import { useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { View } from 'react-native';
import { radii, useTheme } from '@/theme';
import { Icon } from '../icons/Icon';

export function DomainBadge({ domain, size = 40 }: { domain: Domain; size?: number }) {
  const color = useTheme().domain[domain];
  const t = useT();
  return (
    <View
      accessible
      accessibilityLabel={domainLabel(t, domain)}
      style={{
        width: size,
        height: size,
        borderRadius: radii.md,
        backgroundColor: `${color}26`,
        borderColor: `${color}66`,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={domain} size={size * 0.55} color={color} />
    </View>
  );
}
