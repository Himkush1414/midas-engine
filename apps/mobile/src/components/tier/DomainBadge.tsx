import { DOMAIN_LABELS, type Domain } from '@mindtier/core';
import { View } from 'react-native';
import { domainColors, radii } from '@/theme';
import { Icon } from '../icons/Icon';

export function DomainBadge({ domain, size = 40 }: { domain: Domain; size?: number }) {
  const color = domainColors[domain];
  return (
    <View
      accessible
      accessibilityLabel={DOMAIN_LABELS[domain]}
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
