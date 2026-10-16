import { DOMAINS, DOMAIN_LABELS, ITEM_RATING_MAX, ITEM_RATING_MIN, type DomainRatings } from '@mindtier/core';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { fonts, useTheme } from '@/theme';
import { svgA11y } from './svgA11y';

export function radarPoint(index: number, value: number, radius: number, center: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DOMAINS.length;
  return [center + Math.cos(angle) * radius * value, center + Math.sin(angle) * radius * value];
}

export function normalise(rating: number): number {
  return Math.min(1, Math.max(0.08, (rating - ITEM_RATING_MIN) / (ITEM_RATING_MAX - ITEM_RATING_MIN)));
}

/** Five-axis skill shape. Labels sit outside the pentagon. */
export function SkillRadar({ ratings, size = 260 }: { ratings: DomainRatings; size?: number }) {
  const { colors, domain } = useTheme();
  const c = size / 2;
  const r = size * 0.34;
  const ring = (k: number) =>
    DOMAINS.map((_, i) => radarPoint(i, k, r, c).join(',')).join(' ');
  const shape = DOMAINS.map((d, i) => radarPoint(i, normalise(ratings[d].rating), r, c).join(',')).join(' ');
  const label = DOMAINS.map((d) => `${DOMAIN_LABELS[d]} ${Math.round(ratings[d].rating)}`).join(', ');

  return (
    <Svg width={size} height={size} {...svgA11y(`Skill shape: ${label}`)}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <Polygon key={k} points={ring(k)} fill="none" stroke={colors.border} strokeWidth={1} />
      ))}
      {DOMAINS.map((_, i) => {
        const [x, y] = radarPoint(i, 1, r, c);
        return <Line key={i} x1={c} y1={c} x2={x} y2={y} stroke={colors.border} strokeWidth={1} />;
      })}
      <Polygon points={shape} fill={colors.primary} fillOpacity={0.28} stroke={colors.primaryText} strokeWidth={2.5} strokeLinejoin="round" />
      {DOMAINS.map((d, i) => {
        const [x, y] = radarPoint(i, normalise(ratings[d].rating), r, c);
        return <Circle key={d} cx={x} cy={y} r={4.5} fill={domain[d]} />;
      })}
      {DOMAINS.map((d, i) => {
        const [x, y] = radarPoint(i, 1.32, r, c);
        return (
          <SvgText key={d} x={x} y={y + 4} fontSize={12} fontFamily={fonts.bodySemibold} fill={colors.textMuted} textAnchor="middle">
            {DOMAIN_LABELS[d]}
          </SvgText>
        );
      })}
    </Svg>
  );
}
