/**
 * Glicko-2 rating system (Mark Glickman, "Example of the Glicko-2 system", 2022 revision).
 *
 * In Mindtier a player "plays against" puzzle items: each scored block of trials is
 * one game against an item whose rating is derived from its difficulty level. Scores
 * may be fractional (0..1), which Glicko-2 supports natively.
 */

export interface Rating {
  /** Display-scale rating (Glicko-1 scale, default 1500). */
  rating: number;
  /** Rating deviation on the display scale. */
  rd: number;
  /** Volatility σ. */
  volatility: number;
}

export interface GameResult {
  opponentRating: number;
  opponentRd: number;
  /** 1 = win, 0 = loss, fractional values allowed. */
  score: number;
}

export interface Glicko2Options {
  /** System constant τ constraining volatility change. */
  tau: number;
  /** RD floor so ratings keep moving for established players. */
  minRd: number;
  /** RD ceiling (also the RD of a brand-new player). */
  maxRd: number;
  /** Convergence tolerance for the volatility iteration. */
  epsilon: number;
}

export const GLICKO_SCALE = 173.7178;
export const DEFAULT_RATING = 1500;

export const DEFAULT_GLICKO2_OPTIONS: Glicko2Options = {
  tau: 0.5,
  minRd: 45,
  maxRd: 350,
  epsilon: 0.000001,
};

export function newRating(rating = DEFAULT_RATING, rd = DEFAULT_GLICKO2_OPTIONS.maxRd, volatility = 0.06): Rating {
  return { rating, rd, volatility };
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expectation(mu: number, muJ: number, phiJ: number): number {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

/** Expected score of `a` against `b` on the display scale. */
export function expectedScore(a: Pick<Rating, 'rating'>, b: Pick<Rating, 'rating' | 'rd'>): number {
  return expectation(
    (a.rating - DEFAULT_RATING) / GLICKO_SCALE,
    (b.rating - DEFAULT_RATING) / GLICKO_SCALE,
    b.rd / GLICKO_SCALE,
  );
}

function newVolatility(sigma: number, phi: number, v: number, delta: number, tau: number, epsilon: number): number {
  const a = Math.log(sigma * sigma);
  const f = (x: number) => {
    const ex = Math.exp(x);
    const num = ex * (delta * delta - phi * phi - v - ex);
    const den = 2 * (phi * phi + v + ex) ** 2;
    return num / den - (x - a) / (tau * tau);
  };

  let A = a;
  let B: number;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * tau) < 0) k++;
    B = a - k * tau;
  }

  let fA = f(A);
  let fB = f(B);
  // Illinois variant of regula falsi; bounded to guarantee termination.
  for (let i = 0; i < 100 && Math.abs(B - A) > epsilon; i++) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA /= 2;
    }
    B = C;
    fB = fC;
  }
  return Math.exp(A / 2);
}

function clampRd(rd: number, opts: Glicko2Options): number {
  return Math.min(opts.maxRd, Math.max(opts.minRd, rd));
}

/**
 * Update a rating after one rating period containing `results`.
 * With no results, only the deviation grows (inactivity).
 */
export function rate(player: Rating, results: readonly GameResult[], options: Partial<Glicko2Options> = {}): Rating {
  const opts = { ...DEFAULT_GLICKO2_OPTIONS, ...options };
  const mu = (player.rating - DEFAULT_RATING) / GLICKO_SCALE;
  const phi = player.rd / GLICKO_SCALE;
  const sigma = player.volatility;

  if (results.length === 0) {
    const phiStar = Math.sqrt(phi * phi + sigma * sigma);
    return { rating: player.rating, rd: clampRd(phiStar * GLICKO_SCALE, opts), volatility: sigma };
  }

  let vInv = 0;
  let deltaSum = 0;
  for (const r of results) {
    if (!(r.score >= 0 && r.score <= 1)) throw new RangeError(`score must be within [0, 1], got ${r.score}`);
    const muJ = (r.opponentRating - DEFAULT_RATING) / GLICKO_SCALE;
    const phiJ = r.opponentRd / GLICKO_SCALE;
    const gPhi = g(phiJ);
    const e = expectation(mu, muJ, phiJ);
    vInv += gPhi * gPhi * e * (1 - e);
    deltaSum += gPhi * (r.score - e);
  }
  const v = 1 / vInv;
  const delta = v * deltaSum;

  const sigmaPrime = newVolatility(sigma, phi, v, delta, opts.tau, opts.epsilon);
  const phiStar = Math.sqrt(phi * phi + sigmaPrime * sigmaPrime);
  const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muPrime = mu + phiPrime * phiPrime * deltaSum;

  return {
    rating: muPrime * GLICKO_SCALE + DEFAULT_RATING,
    rd: clampRd(phiPrime * GLICKO_SCALE, opts),
    volatility: sigmaPrime,
  };
}

/** Conservative skill estimate used for leaderboards (rating − 2·RD). */
export function conservativeRating(r: Rating): number {
  return r.rating - 2 * r.rd;
}
