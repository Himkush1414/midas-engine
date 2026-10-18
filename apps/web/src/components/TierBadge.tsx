import { BADGE_BEVELS, BADGE_INNER, BADGE_OUTER, EMBLEMS, LIGHT_TIERS, PIP_BARS, TIER_COLORS, TIER_LABELS, type TierId } from '@mindtier/core';

/** Server-rendered SVG badge using the exact forged artwork from the app. */
export function TierBadge({ tier, division, size = 96 }: { tier: TierId; division?: 1 | 2 | 3 | 4 | null; size?: number }) {
  const c = TIER_COLORS[tier];
  const light = LIGHT_TIERS.has(tier);
  const emblem = light ? c.deep : '#FFFFFF';
  const art = EMBLEMS[tier];
  const filled = division ? 5 - division : 0;
  const [metal, plate] = [`metal-${tier}`, `plate-${tier}`];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${TIER_LABELS[tier]} tier badge`}>
      <defs>
        <linearGradient id={metal} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={c.highlight} />
          <stop offset="0.45" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
        <linearGradient id={plate} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.deep} stopOpacity={light ? 0.35 : 0.55} />
          <stop offset="0.6" stopColor={c.base} stopOpacity={0} />
          <stop offset="1" stopColor={c.highlight} stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <polygon points={BADGE_OUTER} fill={`url(#${metal})`} />
      {BADGE_BEVELS.map((f) => (
        <polygon key={f.points} points={f.points} fill={f.tone === 'light' ? '#FFFFFF' : '#000000'} fillOpacity={f.opacity} />
      ))}
      <polygon points={BADGE_INNER} fill={`url(#${plate})`} stroke={c.highlight} strokeOpacity={0.55} strokeWidth={0.8} strokeLinejoin="round" />
      <g transform="translate(0 1.6)" opacity={0.55}>
        {art.stroke.map((d) => (
          <path key={d} d={d} fill="none" stroke={c.deep} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {art.fill.map((d) => (
          <path key={d} d={d} fill={c.deep} />
        ))}
      </g>
      {art.stroke.map((d) => (
        <path key={d} d={d} fill="none" stroke={emblem} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {art.fill.map((d) => (
        <path key={d} d={d} fill={emblem} />
      ))}
      {division ? PIP_BARS.map((d, i) => <path key={d} d={d} fill={emblem} fillOpacity={i < filled ? 1 : 0.3} />) : null}
      <polygon points={BADGE_OUTER} fill="none" stroke={c.highlight} strokeOpacity={0.7} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}
