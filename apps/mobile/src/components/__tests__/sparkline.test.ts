import { nearestIndex, sparklineGeometry } from '../RatingSparkline';

describe('sparklineGeometry', () => {
  it('maps the highest value to the top and lowest to the bottom', () => {
    const g = sparklineGeometry(
      [
        { at: 1, value: 1300 },
        { at: 2, value: 1500 },
        { at: 3, value: 1400 },
      ],
      200,
      80,
    );
    expect(g.points).toHaveLength(3);
    expect(g.points[1]!.y).toBeLessThan(g.points[0]!.y);
    expect(g.points[0]!.x).toBeLessThan(g.points[2]!.x);
    expect(g.path.startsWith('M')).toBe(true);
  });

  it('centres flat lines instead of pinning them to the baseline', () => {
    const g = sparklineGeometry([{ at: 1, value: 1300 }, { at: 2, value: 1300 }], 200, 80);
    expect(g.points[0]!.y).toBeCloseTo(40, 0);
  });

  it('handles empty data and zero width', () => {
    expect(sparklineGeometry([], 200, 80).points).toHaveLength(0);
    expect(sparklineGeometry([{ at: 1, value: 1 }], 0, 80).points).toHaveLength(0);
  });

  it('finds the nearest point to a touch', () => {
    expect(nearestIndex([{ x: 0 }, { x: 50 }, { x: 100 }], 60)).toBe(1);
    expect(nearestIndex([{ x: 0 }, { x: 50 }, { x: 100 }], 99)).toBe(2);
  });
});
