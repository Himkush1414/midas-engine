/**
 * Deterministic, platform-independent pseudo-random numbers.
 *
 * Every generated puzzle is a pure function of a seed, so the Daily Challenge,
 * duels and server-side validation all reproduce the exact same content on
 * Hermes, V8 and Node. Only 32-bit integer maths (`Math.imul`, `>>> 0`) is used.
 */

/** cyrb128 string hash → four 32-bit words used to seed sfc32. */
export function hashSeed(input: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < input.length; i++) {
    const k = input.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

export class Rng {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(seed: string) {
    [this.a, this.b, this.c, this.d] = hashSeed(seed);
    // Discard the first outputs so similar seeds diverge quickly.
    for (let i = 0; i < 15; i++) this.nextUint32();
  }

  /** sfc32 step. */
  nextUint32(): number {
    this.a >>>= 0;
    this.b >>>= 0;
    this.c >>>= 0;
    this.d >>>= 0;
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    return this.nextUint32() / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`invalid int range [${min}, ${max}]`);
    }
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** True with probability p. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError('cannot pick from an empty list');
    return items[this.int(0, items.length - 1)] as T;
  }

  /** Fisher–Yates shuffle returning a new array. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = out[i] as T;
      out[i] = out[j] as T;
      out[j] = tmp;
    }
    return out;
  }

  /** `count` distinct integers from [min, max], in random order. */
  sample(min: number, max: number, count: number): number[] {
    const size = max - min + 1;
    if (count > size) throw new RangeError(`cannot sample ${count} from ${size}`);
    const pool = Array.from({ length: size }, (_, i) => min + i);
    return this.shuffle(pool).slice(0, count);
  }

  /** Derive an independent child stream, e.g. one per trial. */
  fork(label: string | number): Rng {
    return new Rng(`${this.nextUint32().toString(36)}:${label}`);
  }
}

/** Build a namespaced seed string, e.g. `seedFor('daily', '2026-10-16')`. */
export function seedFor(...parts: Array<string | number>): string {
  return parts.join('|');
}
