import { BADGE_INNER, BADGE_OUTER, EMBLEMS, LIGHT_TIERS, PIP_XS, PIP_Y, TIER_COLORS, TIER_LABELS, type TierId } from '@mindtier/core';

/** Server-rendered SVG badge using the exact artwork from the app. */
export function TierBadge({ tier, division, size = 96 }: { tier: TierId; division?: 1 | 2 | 3 | 4 | null; size?: number }) {
  const c = TIER_COLORS[tier];
  const emblem = LIGHT_TIERS.has(tier) ? c.deep : '#FFFFFF';
  const art = EMBLEMS[tier];
  const filled = division ? 5 - division : 0;
  const id = `g-${tier}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${TIER_LABELS[tier]} tier badge`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.highlight} />
          <stop offset="0.5" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
      </defs>
      <polygon points={BADGE_OUTER} fill={`url(#${id})`} stroke={c.highlight} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={BADGE_INNER} fill="none" stroke={emblem} strokeOpacity={0.35} strokeWidth={1.5} strokeLinejoin="round" />
      {art.stroke.map((d) => (
        <path key={d} d={d} fill="none" stroke={emblem} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {art.fill.map((d) => (
        <path key={d} d={d} fill={emblem} />
      ))}
      {division
        ? PIP_XS.map((x, i) => <circle key={x} cx={x} cy={PIP_Y} r={2.4} fill={emblem} fillOpacity={i < filled ? 1 : 0.35} />)
        : null}
    </svg>
  );
}
