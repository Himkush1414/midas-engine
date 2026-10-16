import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from './ui';

export interface SparkPoint {
  at: number;
  value: number;
}

export interface SparklineGeometry {
  path: string;
  points: { x: number; y: number }[];
  min: number;
  max: number;
}

const PAD_X = 6;
const PAD_Y = 10;

/** Pure geometry so it can be unit tested without rendering. */
export function sparklineGeometry(data: readonly SparkPoint[], width: number, height: number): SparklineGeometry {
  if (data.length === 0 || width <= 0) return { path: '', points: [], min: 0, max: 0 };
  const values = data.map((d) => d.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  // Give flat lines some room so they sit mid-chart instead of on the baseline.
  if (max - min < 20) {
    const mid = (max + min) / 2;
    min = mid - 10;
    max = mid + 10;
  }
  const innerW = width - PAD_X * 2;
  const innerH = height - PAD_Y * 2;
  const points = data.map((d, i) => ({
    x: PAD_X + (data.length === 1 ? innerW : (i / (data.length - 1)) * innerW),
    y: PAD_Y + (1 - (d.value - min) / (max - min)) * innerH,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return { path, points, min, max };
}

export function nearestIndex(points: readonly { x: number }[], x: number): number {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i]!.x - x) < Math.abs(points[best]!.x - x)) best = i;
  }
  return best;
}

const fmtDate = (at: number) => new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/**
 * Single-series rating line. Identity comes from the card title (small
 * multiples), so the line colour only needs ≥3:1 contrast with the surface.
 * Touch and drag to read exact values.
 */
export function RatingSparkline({ data, color, height = 72, label }: { data: SparkPoint[]; color: string; height?: number; label: string }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const geo = sparklineGeometry(data, width, height);
  const last = geo.points[geo.points.length - 1];
  const sel = active !== null ? geo.points[active] : null;
  const selData = active !== null ? data[active] : null;

  const track = (e: GestureResponderEvent) => setActive(nearestIndex(geo.points, e.nativeEvent.locationX));
  const first = data[0];
  const end = data[data.length - 1];
  const summary =
    first && end ? `${label}: from ${Math.round(first.value)} to ${Math.round(end.value)} across ${data.length} updates` : `${label}: no history yet`;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={{ height }}
      accessible
      accessibilityLabel={summary}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={track}
      onResponderMove={track}
      onResponderRelease={() => setActive(null)}
      onResponderTerminate={() => setActive(null)}
    >
      {width > 0 && geo.points.length > 0 ? (
        <Svg width={width} height={height}>
          <Line x1={PAD_X} x2={width - PAD_X} y1={height - PAD_Y} y2={height - PAD_Y} stroke={colors.border} strokeWidth={1} />
          {geo.points.length > 1 ? <Path d={geo.path} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
          {sel ? <Line x1={sel.x} x2={sel.x} y1={PAD_Y / 2} y2={height - PAD_Y} stroke={colors.textFaint} strokeWidth={1} /> : null}
          {(sel ?? last) ? (
            <Circle cx={(sel ?? last)!.x} cy={(sel ?? last)!.y} r={4.5} fill={color} stroke={colors.surface} strokeWidth={2} />
          ) : null}
        </Svg>
      ) : null}
      {sel && selData ? (
        <View
          pointerEvents="none"
          style={[
            styles.tip,
            { backgroundColor: colors.surfaceRaised, borderColor: colors.border, left: Math.min(Math.max(0, sel.x - 44), Math.max(0, width - 88)) },
          ]}
        >
          <Text variant="caption" weight="semibold" tabular>
            {Math.round(selData.value)}
          </Text>
          <Text variant="caption" tone="muted">
            {fmtDate(selData.at)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tip: { position: 'absolute', top: -6, width: 88, alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingVertical: 2 },
});
