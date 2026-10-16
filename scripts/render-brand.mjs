#!/usr/bin/env node
// Renders every raster brand asset from the SVG masters in /brand.
// Usage: node scripts/render-brand.mjs
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = (f) => join(root, 'brand', f);
const mobile = (f) => join(root, 'apps/mobile/assets/images', f);
const web = (f) => join(root, 'apps/web/public', f);
const store = (f) => join(root, 'store/graphics', f);

/** [source svg, output png, size] */
const jobs = [
  // App icon (iOS + legacy Android) — full bleed, opaque.
  ['logo-mark.svg', mobile('icon.png'), 1024],
  // Android adaptive icon layers.
  ['icon-foreground.svg', mobile('android-icon-foreground.png'), 1024],
  ['icon-background.svg', mobile('android-icon-background.png'), 1024],
  ['icon-monochrome.svg', mobile('android-icon-monochrome.png'), 1024],
  // Splash mark (transparent).
  ['splash-icon.svg', mobile('splash-icon.png'), 1024],
  // Notification small icon must be white on transparent.
  ['icon-monochrome.svg', mobile('notification-icon.png'), 96],
  // Web.
  ['logo-mark.svg', web('favicon-48.png'), 48],
  ['logo-mark.svg', web('apple-touch-icon.png'), 180],
  ['logo-mark.svg', web('icon-192.png'), 192],
  ['logo-mark.svg', web('icon-512.png'), 512],
  // Google Play listing icon: 512×512, 32-bit PNG.
  ['logo-mark.svg', store('play-icon-512.png'), 512],
];

for (const [src, out, size] of jobs) {
  await mkdir(dirname(out), { recursive: true });
  await sharp(brand(src), { density: Math.max(72, (72 * size) / 1024) * 4 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${out.replace(root + '/', '')} (${size}px)`);
}
