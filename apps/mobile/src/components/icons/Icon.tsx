import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';
import { GLYPHS, type IconName, type Primitive } from './glyphs';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Accessible label; omit for decorative icons. */
  label?: string;
}

function renderPrimitive(p: Primitive, i: number, color: string, strokeWidth: number) {
  const paint = p.fill
    ? { fill: color, stroke: 'none' as const }
    : { fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const opacity = p.opacity;
  if ('d' in p) return <Path key={i} d={p.d} opacity={opacity} {...paint} />;
  if ('circle' in p) {
    const [cx, cy, r] = p.circle;
    return <Circle key={i} cx={cx} cy={cy} r={r} opacity={opacity} {...paint} />;
  }
  const [x, y, width, height, rx] = p.rect;
  return <Rect key={i} x={x} y={y} width={width} height={height} rx={rx} opacity={opacity} {...paint} />;
}

export const Icon = memo(function Icon({ name, size = 24, color, strokeWidth = 1.8, label }: IconProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.text;
  const glyph: readonly Primitive[] = GLYPHS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={Boolean(label)}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {glyph.map((p, i) => renderPrimitive(p, i, tint, strokeWidth))}
    </Svg>
  );
});

export type { IconName };
