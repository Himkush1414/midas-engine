import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BADGE_BEVELS, BADGE_INNER, BADGE_OUTER, EMBLEMS, LIGHT_TIERS, TIER_COLORS, type TierId } from '@mindtier/core';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), 'src/assets/fonts', file));

function Badge({ tier, size }: { tier: TierId; size: number }) {
  const c = TIER_COLORS[tier];
  const emblem = LIGHT_TIERS.has(tier) ? c.deep : '#FFFFFF';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`g-${tier}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={c.highlight} />
          <stop offset="0.45" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
      </defs>
      <polygon points={BADGE_OUTER} fill={`url(#g-${tier})`} />
      {BADGE_BEVELS.map((f) => (
        <polygon key={f.points} points={f.points} fill={f.tone === 'light' ? '#FFFFFF' : '#000000'} fillOpacity={f.opacity} />
      ))}
      <polygon points={BADGE_INNER} fill="none" stroke={c.highlight} strokeOpacity={0.55} strokeWidth={0.8} />
      {EMBLEMS[tier].stroke.map((d) => (
        <path key={d} d={d} fill="none" stroke={emblem} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {EMBLEMS[tier].fill.map((d) => (
        <path key={d} d={d} fill={emblem} />
      ))}
      <polygon points={BADGE_OUTER} fill="none" stroke={c.highlight} strokeOpacity={0.7} strokeWidth={1.2} />
    </svg>
  );
}

/** Branded 1200×630 card used for link previews, in the Floodlight style. */
export async function ogCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0F0D0B',
          color: '#F4EFE6',
          fontFamily: 'Big Shoulders',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: -40, width: 520, height: 18, background: '#D7FF3A', transform: 'skewX(-12deg)' }} />
        <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 26, color: '#D7FF3A', letterSpacing: 4 }}>{eyebrow.toUpperCase()}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 124, lineHeight: 0.9, maxWidth: 820, textTransform: 'uppercase' }}>{title}</div>
          <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 28, color: '#B7AD9E', maxWidth: 600 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 54, textTransform: 'uppercase' }}>Mindtier</div>
        </div>
        <div style={{ position: 'absolute', right: 64, bottom: 72, display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <Badge tier="gold" size={120} />
          <Badge tier="diamond" size={168} />
          <Badge tier="master" size={120} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Big Shoulders', data: await font('BigShoulders_900Black.ttf'), weight: 900, style: 'normal' },
        { name: 'JetBrains Mono', data: await font('JetBrainsMono_700Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  );
}
