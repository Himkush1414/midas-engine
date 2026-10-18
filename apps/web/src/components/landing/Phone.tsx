import Image from 'next/image';
import type { LandingCopy } from '@/lib/landing/en';
import styles from './Landing.module.css';

export type Shot = keyof LandingCopy['shots'];

/** A phone showing a real screen of the app (scripts/web-shots.mjs), in the page's language. */
export function Phone({ lang, shot, alt, priority, className }: { lang: string; shot: Shot; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={`${styles.phone} ${className ?? ''}`}>
      <div className={styles.screen}>
        <Image src={`/shots/${lang}/${shot}.webp`} alt={alt} width={540} height={960} sizes="(max-width: 900px) 70vw, 300px" priority={priority} />
      </div>
    </div>
  );
}
