import { BADGE_BEVELS, BADGE_INNER, BADGE_OUTER, EMBLEMS, LIGHT_TIERS, PIP_BARS, type TierInfo } from '@mindtier/core';
import { memo, useEffect, useId } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useT } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { useReduceMotion } from '@/lib/motion';
import { fonts, tierColors, useTheme } from '@/theme';
import { svgA11y } from '../svgA11y';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface TierBadgeProps {
  info: Pick<TierInfo, 'tier' | 'division' | 'label' | 'provisional'>;
  size?: number;
  /** Show the provisional "?" state even when a tier exists. */
  showProvisional?: boolean;
  /** A slow specular sweep across the metal, for hero placements. Off under reduced motion. */
  shine?: boolean;
}

/** Light glinting across the forged face every few seconds. */
function Shine({ clipId, gradientId }: { clipId: string; gradientId: string }) {
  const x = useSharedValue(-70);
  useEffect(() => {
    x.set(withRepeat(withDelay(2600, withTiming(130, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1, false));
  }, [x]);
  const props = useAnimatedProps(() => ({ x: x.get() }));
  return (
    <G clipPath={`url(#${clipId})`}>
      <G transform="rotate(24 50 50)">
        <AnimatedRect animatedProps={props} y={-20} width={26} height={140} fill={`url(#${gradientId})`} />
      </G>
    </G>
  );
}

/**
 * The forged tier badge: a metal hexagon with a bevelled rim lit from the upper left, a sunken
 * plate, an embossed emblem and slanted division pips. Art comes from @mindtier/core, shared with
 * the website and the share cards.
 */
export const TierBadge = memo(function TierBadge({ info, size = 96, showProvisional = true, shine = false }: TierBadgeProps) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const uid = useId().replace(/:/g, '');
  const t = useT();
  const provisional = showProvisional && info.provisional;
  const name = tierLabel(t, info);
  const label = provisional ? t('tiers.provisionalA11y', { label: name }) : t('tiers.rankA11y', { label: name });

  if (provisional) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" {...svgA11y(label)}>
        <Polygon points={BADGE_OUTER} fill={colors.surfaceRaised} />
        <Polygon
          points={BADGE_INNER}
          fill={colors.surfaceSunken}
          stroke={colors.borderStrong}
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
        <SvgText x={50} y={64} fontSize={40} fontFamily={fonts.display} fill={colors.textMuted} textAnchor="middle">
          ?
        </SvgText>
      </Svg>
    );
  }

  const c = tierColors[info.tier];
  const light = LIGHT_TIERS.has(info.tier);
  const emblem = light ? c.deep : '#FFFFFF';
  const art = EMBLEMS[info.tier];
  const filledPips = info.division === null ? 0 : 5 - info.division;
  const [metal, plate, gleam, clip] = [`metal-${uid}`, `plate-${uid}`, `gleam-${uid}`, `clip-${uid}`] as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" {...svgA11y(label)}>
      <Defs>
        <LinearGradient id={metal} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={c.highlight} />
          <Stop offset="0.45" stopColor={c.base} />
          <Stop offset="1" stopColor={c.deep} />
        </LinearGradient>
        <LinearGradient id={plate} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.deep} stopOpacity={light ? 0.35 : 0.55} />
          <Stop offset="0.6" stopColor={c.base} stopOpacity={0} />
          <Stop offset="1" stopColor={c.highlight} stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient id={gleam} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        <ClipPath id={clip}>
          <Polygon points={BADGE_OUTER} />
        </ClipPath>
      </Defs>
      <Polygon points={BADGE_OUTER} fill={`url(#${metal})`} />
      {BADGE_BEVELS.map((f) => (
        <Polygon key={f.points} points={f.points} fill={f.tone === 'light' ? '#FFFFFF' : '#000000'} fillOpacity={f.opacity} />
      ))}
      <Polygon points={BADGE_INNER} fill={`url(#${plate})`} stroke={c.highlight} strokeOpacity={0.55} strokeWidth={0.8} strokeLinejoin="round" />
      {/* Emboss: the emblem's shadow sits a step lower, in the deep tone. */}
      <G transform="translate(0 1.6)" opacity={0.55}>
        {art.stroke.map((d) => (
          <Path key={d} d={d} fill="none" stroke={c.deep} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {art.fill.map((d) => (
          <Path key={d} d={d} fill={c.deep} />
        ))}
      </G>
      {art.stroke.map((d) => (
        <Path key={d} d={d} fill="none" stroke={emblem} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {art.fill.map((d) => (
        <Path key={d} d={d} fill={emblem} />
      ))}
      {info.division !== null
        ? PIP_BARS.map((d, i) => <Path key={d} d={d} fill={emblem} fillOpacity={i < filledPips ? 1 : 0.3} />)
        : null}
      <Polygon points={BADGE_OUTER} fill="none" stroke={c.highlight} strokeOpacity={0.7} strokeWidth={1.2} strokeLinejoin="round" />
      {shine && !reduce ? <Shine clipId={clip} gradientId={gleam} /> : null}
    </Svg>
  );
});
