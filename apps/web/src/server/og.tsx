import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BADGE_OUTER, TIER_COLORS, type TierId } from '@mindtier/core';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

async function font() {
  return readFile(join(process.cwd(), 'src/assets/SpaceGrotesk-Bold.ttf'));
}

function Badge({ tier, size }: { tier: TierId; size: number }) {
  const c = TIER_COLORS[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`g-${tier}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.highlight} />
          <stop offset="0.5" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
      </defs>
      <polygon points={BADGE_OUTER} fill={`url(#g-${tier})`} stroke={c.highlight} strokeWidth={2} />
    </svg>
  );
}

/** Branded 1200×630 card used for link previews. */
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
          background: 'radial-gradient(circle at 20% 10%, #2A2470 0%, #121734 55%, #0A0D1A 100%)',
          color: '#F4F6FF',
          fontFamily: 'Space Grotesk',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, color: '#A996FF', letterSpacing: 2 }}>{eyebrow.toUpperCase()}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 88, lineHeight: 1.05, maxWidth: 900 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 38, color: '#A3ABD1', maxWidth: 900 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 44 }}>Mindtier</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Badge tier="bronze" size={70} />
            <Badge tier="gold" size={92} />
            <Badge tier="diamond" size={70} />
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Space Grotesk', data: await font(), weight: 700, style: 'normal' }] },
  );
}
