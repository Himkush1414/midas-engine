import { BADGE_INNER, BADGE_OUTER, EMBLEMS, LIGHT_TIERS, PIP_XS, PIP_Y, type TierInfo } from '@mindtier/core';
import { memo, useId } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop, Text as SvgText } from 'react-native-svg';
import { tierColors, useTheme } from '@/theme';
import { useT } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { svgA11y } from '../svgA11y';

export interface TierBadgeProps {
  info: Pick<TierInfo, 'tier' | 'division' | 'label' | 'provisional'>;
  size?: number;
  /** Show the provisional "?" state even when a tier exists. */
  showProvisional?: boolean;
}

export const TierBadge = memo(function TierBadge({ info, size = 96, showProvisional = true }: TierBadgeProps) {
  const { colors } = useTheme();
  const gradientId = `tier-${useId().replace(/:/g, '')}`;
  const t = useT();
  const provisional = showProvisional && info.provisional;
  const name = tierLabel(t, info);
  const label = provisional ? t('tiers.provisionalA11y', { label: name }) : t('tiers.rankA11y', { label: name });

  if (provisional) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" {...svgA11y(label)}>
        <Polygon
          points={BADGE_OUTER}
          fill={colors.surfaceRaised}
          stroke={colors.borderStrong}
          strokeWidth={2.5}
          strokeDasharray="6 5"
          strokeLinejoin="round"
        />
        <SvgText x={50} y={62} fontSize={36} fontWeight="700" fill={colors.textMuted} textAnchor="middle">
          ?
        </SvgText>
      </Svg>
    );
  }

  const c = tierColors[info.tier];
  const emblem = LIGHT_TIERS.has(info.tier) ? c.deep : '#FFFFFF';
  const art = EMBLEMS[info.tier];
  const filledPips = info.division === null ? 0 : 5 - info.division;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" {...svgA11y(label)}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.highlight} />
          <Stop offset="0.5" stopColor={c.base} />
          <Stop offset="1" stopColor={c.deep} />
        </LinearGradient>
      </Defs>
      <Polygon points={BADGE_OUTER} fill={`url(#${gradientId})`} stroke={c.highlight} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points={BADGE_INNER} fill="none" stroke={emblem} strokeOpacity={0.35} strokeWidth={1.5} strokeLinejoin="round" />
      {art.stroke.map((d) => (
        <Path key={d} d={d} fill="none" stroke={emblem} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {art.fill.map((d) => (
        <Path key={d} d={d} fill={emblem} />
      ))}
      {info.division !== null
        ? PIP_XS.map((x, i) => <Circle key={x} cx={x} cy={PIP_Y} r={2.4} fill={emblem} fillOpacity={i < filledPips ? 1 : 0.35} />)
        : null}
    </Svg>
  );
});
