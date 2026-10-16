import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

/** Shapes used across games; ids are stable because trials reference them. */
export const SHAPE_KEYS = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'cross', 'ring'] as const;
export type ShapeKey = (typeof SHAPE_KEYS)[number];

const STAR = '50,8 61,38 93,38 67,57 77,89 50,70 23,89 33,57 7,38 39,38';
const HEX = '50,6 88,28 88,72 50,94 12,72 12,28';

export function Shape({
  id,
  size,
  color,
  filled = true,
  strokeWidth = 7,
}: {
  id: number;
  size: number;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  const paint = filled ? { fill: color } : { fill: 'none', stroke: color, strokeWidth, strokeLinejoin: 'round' as const };
  let el;
  switch (id % SHAPE_KEYS.length) {
    case 0:
      el = <Circle cx={50} cy={50} r={40} {...paint} />;
      break;
    case 1:
      el = <Rect x={12} y={12} width={76} height={76} rx={10} {...paint} />;
      break;
    case 2:
      el = <Polygon points="50,9 92,86 8,86" {...paint} />;
      break;
    case 3:
      el = <Polygon points={STAR} {...paint} />;
      break;
    case 4:
      el = <Polygon points={HEX} {...paint} />;
      break;
    case 5:
      el = <Polygon points="50,6 92,50 50,94 8,50" {...paint} />;
      break;
    case 6:
      el = <Path d="M38 8h24v30h30v24H62v30H38V62H8V38h30z" {...paint} />;
      break;
    default:
      el = <Circle cx={50} cy={50} r={34} fill="none" stroke={color} strokeWidth={14} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {el}
    </Svg>
  );
}
