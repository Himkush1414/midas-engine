#!/usr/bin/env node
// Synthesises Mindtier's UI sound effects as small mono 16-bit WAV files.
// Everything is generated from code: no third-party samples, no licences.
// Usage: node scripts/render-sounds.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps/mobile/assets/sounds');

/** A note: frequency (Hz), start and length in seconds, gain 0..1, waveform. */
function render(notes, total) {
  const n = Math.ceil(total * RATE);
  const buf = new Float32Array(n);
  for (const { f, t, d, g = 0.5, wave = 'sine', bend = 0 } of notes) {
    const start = Math.floor(t * RATE);
    const len = Math.floor(d * RATE);
    let phase = 0;
    for (let i = 0; i < len && start + i < n; i++) {
      const p = i / len;
      const freq = f * (1 + bend * p);
      phase += (2 * Math.PI * freq) / RATE;
      // Fast attack, exponential decay: soft, percussive UI sounds.
      const env = Math.min(1, i / (0.004 * RATE)) * Math.exp(-5 * p);
      let s = Math.sin(phase);
      if (wave === 'soft-square') s = Math.tanh(3 * s) * 0.6;
      if (wave === 'bell') s = 0.7 * Math.sin(phase) + 0.25 * Math.sin(2 * phase) + 0.05 * Math.sin(3.01 * phase);
      buf[start + i] += s * env * g;
    }
  }
  return buf;
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const norm = peak > 0.89 ? 0.89 / peak : 1;
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * norm)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const SOUNDS = {
  tap: render([{ f: 1400, t: 0, d: 0.035, g: 0.35, wave: 'soft-square' }], 0.05),
  correct: render(
    [
      { f: 880, t: 0, d: 0.12, g: 0.45, wave: 'bell' },
      { f: 1318.5, t: 0.06, d: 0.18, g: 0.4, wave: 'bell' },
    ],
    0.26,
  ),
  wrong: render(
    [
      { f: 220, t: 0, d: 0.16, g: 0.5, wave: 'soft-square', bend: -0.25 },
      { f: 165, t: 0.05, d: 0.16, g: 0.35, bend: -0.2 },
    ],
    0.24,
  ),
  tick: render([{ f: 1046.5, t: 0, d: 0.07, g: 0.4, wave: 'bell' }], 0.09),
  rankup: render(
    [
      { f: 523.25, t: 0, d: 0.22, g: 0.4, wave: 'bell' },
      { f: 659.25, t: 0.09, d: 0.22, g: 0.4, wave: 'bell' },
      { f: 783.99, t: 0.18, d: 0.26, g: 0.42, wave: 'bell' },
      { f: 1046.5, t: 0.3, d: 0.5, g: 0.45, wave: 'bell' },
    ],
    0.85,
  ),
};

await mkdir(out, { recursive: true });
for (const [name, samples] of Object.entries(SOUNDS)) {
  const file = join(out, `${name}.wav`);
  const bytes = wav(samples);
  await writeFile(file, bytes);
  console.log(`✓ ${name}.wav ${(bytes.length / 1024).toFixed(1)} KB`);
}
