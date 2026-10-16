import { DOMAINS } from '@mindtier/core';
import { estimateLabelWidth, radarPoint, radarRadius } from '../SkillRadar';

describe('radarRadius', () => {
  const short = ['Memory', 'Focus', 'Speed', 'Logic', 'Math'];
  const long = ['Gedächtnis', 'Attention', 'Velocidade', 'Logique', 'Rechnen'];

  it('keeps the preferred size when labels fit', () => {
    expect(radarRadius(320, 260, short)).toBeCloseTo(260 * 0.34);
  });

  it('shrinks so every side label stays inside the canvas', () => {
    for (const width of [260, 296, 320]) {
      const r = radarRadius(width, 260, long);
      DOMAINS.forEach((_, i) => {
        const [x] = radarPoint(i, 1, r, width / 2);
        const w = estimateLabelWidth(long[i] ?? '');
        const side = (x - width / 2) / r;
        const [left, right] = Math.abs(side) > 0.9 ? (side > 0 ? [x + 8, x + 8 + w] : [x - 8 - w, x - 8]) : [x - w / 2, x + w / 2];
        expect(left).toBeGreaterThanOrEqual(-0.001);
        expect(right).toBeLessThanOrEqual(width + 0.001);
      });
    }
  });
});
