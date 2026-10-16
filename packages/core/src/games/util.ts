export function isInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function isIntArray(value: unknown, maxLength = 256): value is number[] {
  return Array.isArray(value) && value.length <= maxLength && value.every(isInt);
}

export function isBoolArray(value: unknown, maxLength = 256): value is boolean[] {
  return Array.isArray(value) && value.length <= maxLength && value.every((v) => typeof v === 'boolean');
}

export function isOneOf<T extends string>(options: readonly T[]) {
  return (value: unknown): value is T => typeof value === 'string' && (options as readonly string[]).includes(value);
}

/** Linear interpolation of a parameter across the level range. */
export function lerpByLevel(level: number, maxLevel: number, from: number, to: number): number {
  const t = maxLevel <= 1 ? 0 : (level - 1) / (maxLevel - 1);
  return from + (to - from) * t;
}

export function binary(correct: boolean) {
  return { correct, score: correct ? 1 : 0 };
}

/**
 * Builds four unique multiple-choice options containing `answer`, using
 * candidate distractors first and then numeric offsets. Returns the options
 * in shuffled order with the answer's index.
 */
export function numericOptions(
  answer: number,
  distractors: readonly number[],
  shuffle: <T>(xs: readonly T[]) => T[],
  count = 4,
): { options: number[]; answerIndex: number } {
  const set = new Set<number>([answer]);
  for (const d of distractors) {
    if (set.size >= count) break;
    if (Number.isFinite(d) && d >= 0) set.add(d);
  }
  for (let k = 1; set.size < count; k++) {
    if (answer + k >= 0) set.add(answer + k);
    if (set.size < count && answer - k >= 0) set.add(answer - k);
  }
  const options = shuffle([...set].slice(0, count));
  return { options, answerIndex: options.indexOf(answer) };
}
