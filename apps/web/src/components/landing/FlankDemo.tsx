'use client';

import type { TierId } from '@mindtier/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TierBadge } from '@/components/TierBadge';
import type { LandingCopy } from '@/lib/landing/en';
import styles from './Landing.module.css';

type Dir = 'left' | 'right';
interface Trial {
  center: Dir;
  flank: Dir;
}

const TRIALS = 6;
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));

/** Half the trials have neighbours pointing the other way: that's the part that takes focus. */
function makeTrials(): Trial[] {
  return Array.from({ length: TRIALS }, (_, i) => {
    const center: Dir = Math.random() < 0.5 ? 'left' : 'right';
    const incongruent = i % 2 === 1;
    return { center, flank: incongruent ? (center === 'left' ? 'right' : 'left') : center };
  });
}

/** A light-hearted mapping of average reaction time to a tier, for the taste only. */
export function demoTier(ms: number, correct: number): TierId {
  if (correct < TRIALS - 2) return 'bronze';
  if (ms < 430) return 'diamond';
  if (ms < 520) return 'platinum';
  if (ms < 620) return 'gold';
  if (ms < 760) return 'silver';
  return 'bronze';
}

function Arrow({ dir, strong }: { dir: Dir; strong?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={strong ? styles.arrowStrong : styles.arrow} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <path d="M6 24h30M24 10l14 14-14 14" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlankDemo({ copy, tiers }: { copy: LandingCopy['demo']; tiers: LandingCopy['tiers'] }) {
  const [trials, setTrials] = useState<Trial[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ ok: boolean; ms: number }[]>([]);
  const [flash, setFlash] = useState<'ok' | 'miss' | null>(null);
  const shownAt = useRef(0);

  const start = () => {
    setTrials(makeTrials());
    setIndex(0);
    setResults([]);
    setFlash(null);
  };

  const done = trials !== null && index >= TRIALS;
  const trial = trials && !done ? trials[index] : null;

  useEffect(() => {
    if (trial) shownAt.current = performance.now();
  }, [trial]);

  const answer = useCallback(
    (dir: Dir) => {
      if (!trial) return;
      const ok = dir === trial.center;
      setResults((r) => [...r, { ok, ms: performance.now() - shownAt.current }]);
      setFlash(ok ? 'ok' : 'miss');
      window.setTimeout(() => {
        setFlash(null);
        setIndex((i) => i + 1);
      }, 220);
    },
    [trial],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!trial || flash) return;
      if (e.key === 'ArrowLeft') answer('left');
      if (e.key === 'ArrowRight') answer('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trial, flash, answer]);

  const correct = results.filter((r) => r.ok).length;
  const hits = results.filter((r) => r.ok);
  const avg = hits.length ? Math.round(hits.reduce((s, r) => s + r.ms, 0) / hits.length) : 0;
  const tier = demoTier(avg, correct);

  return (
    <div className={styles.demo} aria-live="polite">
      {!trials ? (
        <div className={styles.demoIdle}>
          <div className={styles.demoRow} aria-hidden="true">
            {(['right', 'right', 'left', 'right', 'right'] as Dir[]).map((d, i) => (
              <Arrow key={i} dir={d} strong={i === 2} />
            ))}
          </div>
          <button type="button" className="button" onClick={start}>
            {copy.start}
          </button>
        </div>
      ) : done ? (
        <div className={styles.demoDone}>
          <TierBadge tier={tier} division={null} size={112} />
          <div>
            <p className={styles.demoVerdict}>{fill(copy.verdict, { tier: tiers[tier] })}</p>
            <p className="muted">{fill(copy.result, { correct, total: TRIALS, ms: avg })}</p>
            <p className="faint">{copy.note}</p>
            <button type="button" className="button secondary" onClick={start}>
              {copy.again}
            </button>
          </div>
        </div>
      ) : trial ? (
        <div className={`${styles.demoStage} ${flash === 'ok' ? styles.flashOk : flash === 'miss' ? styles.flashMiss : ''}`}>
          <p className={styles.demoCount}>{fill(copy.progress, { done: index + 1, total: TRIALS })}</p>
          <div className={styles.demoRow} role="img" aria-label={`${copy.title}: ${trial.center === 'left' ? copy.left : copy.right}`}>
            {[trial.flank, trial.flank, trial.center, trial.flank, trial.flank].map((d, i) => (
              <Arrow key={`${index}-${i}`} dir={d} strong={i === 2} />
            ))}
          </div>
          <div className={styles.demoButtons}>
            <button type="button" className="button secondary" onClick={() => answer('left')} disabled={Boolean(flash)}>
              ← {copy.left}
            </button>
            <button type="button" className="button secondary" onClick={() => answer('right')} disabled={Boolean(flash)}>
              {copy.right} →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
