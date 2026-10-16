import { DOMAINS, ITEM_RATING_MAX, ITEM_RATING_MIN, type DomainRatings } from '@mindtier/core';
import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { fonts, useTheme } from '@/theme';
import { svgA11y } from './svgA11y';

const LABEL_SIZE = 12;
/** Generous average glyph width for Inter semibold, so estimates err towards fitting. */
const GLYPH_EM = 0.62;
const LABEL_GAP = 8;

export function radarPoint(index: number, value: number, radius: number, cx: number, cy: number = cx): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DOMAINS.length;
  return [cx + Math.cos(angle) * radius * value, cy + Math.sin(angle) * radius * value];
}

export function normalise(rating: number): number {
  return Math.min(1, Math.max(0.08, (rating - ITEM_RATING_MIN) / (ITEM_RATING_MAX - ITEM_RATING_MIN)));
}

export const estimateLabelWidth = (label: string) => label.length * LABEL_SIZE * GLYPH_EM;

/** Side axes (left/right of centre) anchor labels outward; the top and bottom labels are centred on their tip. */
const isSideAxis = (dx: number) => Math.abs(dx) > 0.9;

/** Pentagon radius that leaves room for every label inside `width`. */
export function radarRadius(width: number, size: number, labels: string[]): number {
  const preferred = size * 0.34;
  const cx = width / 2;
  let r = preferred;
  DOMAINS.forEach((_, i) => {
    const [dx] = radarPoint(i, 1, 1, 0);
    const w = estimateLabelWidth(labels[i] ?? '');
    const room = isSideAxis(dx) ? cx - LABEL_GAP - w : cx - 4 - w / 2;
    if (Math.abs(dx) > 0.01) r = Math.min(r, room / Math.abs(dx));
  });
  return Math.max(size * 0.2, r);
}

/** Five-axis skill shape. Labels sit outside the pentagon and never leave the canvas. */
export function SkillRadar({ ratings, size = 260 }: { ratings: DomainRatings; size?: number }) {
  const { colors, domain } = useTheme();
  const t = useT();
  const [width, setWidth] = useState(size);
  const labels = DOMAINS.map((d) => domainLabel(t, d));
  const cx = width / 2;
  const cy = size / 2;
  const r = radarRadius(width, size, labels);
  const ring = (k: number) => DOMAINS.map((_, i) => radarPoint(i, k, r, cx, cy).join(',')).join(' ');
  const shape = DOMAINS.map((d, i) => radarPoint(i, normalise(ratings[d].rating), r, cx, cy).join(',')).join(' ');
  const summary = DOMAINS.map((d, i) => `${labels[i]} ${Math.round(ratings[d].rating)}`).join(', ');

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== width) setWidth(w);
  };

  return (
    <View onLayout={onLayout} style={{ alignSelf: 'stretch', height: size }}>
      <Svg width={width} height={size} {...svgA11y(t('reveal.skillShape', { summary }))}>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <Polygon key={k} points={ring(k)} fill="none" stroke={colors.border} strokeWidth={1} />
        ))}
        {DOMAINS.map((_, i) => {
          const [x, y] = radarPoint(i, 1, r, cx, cy);
          return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={colors.border} strokeWidth={1} />;
        })}
        <Polygon points={shape} fill={colors.primary} fillOpacity={0.28} stroke={colors.primaryText} strokeWidth={2.5} strokeLinejoin="round" />
        {DOMAINS.map((d, i) => {
          const [x, y] = radarPoint(i, normalise(ratings[d].rating), r, cx, cy);
          return <Circle key={d} cx={x} cy={y} r={4.5} fill={domain[d]} />;
        })}
        {DOMAINS.map((d, i) => {
          const [tipX, tipY] = radarPoint(i, 1, r, cx, cy);
          const side = tipX - cx;
          const anchor = !isSideAxis(side / r) ? 'middle' : side > 0 ? 'start' : 'end';
          const x = anchor === 'middle' ? tipX : tipX + Math.sign(side) * LABEL_GAP;
          // Top label above the tip, bottom labels below it, side labels level with it.
          const y = tipY < cy - r * 0.9 ? tipY - 10 : tipY > cy + r * 0.5 ? tipY + 20 : tipY + 4;
          return (
            <SvgText key={d} x={x} y={y} fontSize={LABEL_SIZE} fontFamily={fonts.bodySemibold} fill={colors.textMuted} textAnchor={anchor}>
              {labels[i]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
