import { randomInt } from 'node:crypto';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // no l, o, 0, 1: easy to read aloud

/** 8-character duel code, ~40 bits of entropy. Matches the duels.id check constraint. */
export function duelId(): string {
  let out = '';
  for (let i = 0; i < 8; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
