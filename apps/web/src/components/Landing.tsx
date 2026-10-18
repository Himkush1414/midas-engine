import { DOMAINS, GAMES, GAMES_BY_DOMAIN, TIERS } from '@mindtier/core';
import { FlankDemo } from '@/components/landing/FlankDemo';
import { Phone, type Shot } from '@/components/landing/Phone';
import { TierBadge } from '@/components/TierBadge';
import type { LandingCopy } from '@/lib/landing/en';
import { SITE } from '@/lib/site';
import styles from './landing/Landing.module.css';

const STEP_SHOTS: Shot[] = ['reveal', 'results', 'duel'];
const CLIMB_SHOTS: Shot[] = ['season', 'league', 'home'];

/** The marketing page, rendered from one language's copy. */
export function Landing({ copy }: { copy: LandingCopy }) {
  const lang = copy.lang;
  return (
    <div>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="kicker rise">{copy.heroKicker}</p>
            <h1 className={`${styles.heroTitle} rise`}>{copy.heroTitle}</h1>
            <p className={styles.lead}>{copy.heroLead}</p>
            <div className={styles.ctas}>
              <a className="button" href={SITE.playUrl}>
                {copy.ctaPlay}
              </a>
              {/* /play is the app's own single-page bundle, not a Next.js route: a full page load is right. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="button secondary" href="/play">
                {copy.ctaWeb}
              </a>
            </div>
            <p className={styles.facts}>{copy.heroFacts}</p>
          </div>
          <div className={styles.heroArt}>
            {/* Three forged badges float around the phone: what the climb looks like. */}
            <div className={styles.floaters} aria-hidden="true">
              <span className={`${styles.float} ${styles.floatA}`}>
                <TierBadge tier="gold" division={2} size={92} />
              </span>
              <span className={`${styles.float} ${styles.floatB}`}>
                <TierBadge tier="diamond" division={1} size={118} />
              </span>
              <span className={`${styles.float} ${styles.floatC}`}>
                <TierBadge tier="master" division={null} size={78} />
              </span>
            </div>
            <Phone lang={lang} shot="home" alt={copy.shots.home} priority className={styles.heroPhone} />
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="tiers">
        <p className="kicker">{TIERS.length} / Iron → Grandmaster</p>
        <h2 id="tiers">{copy.tiersTitle}</h2>
        <ol className={styles.tierRow}>
          {TIERS.map((t, i) => (
            <li key={t} className={styles.tierStep} style={{ ['--i' as string]: i }}>
              <TierBadge tier={t} division={t === 'master' || t === 'grandmaster' ? null : 1} size={84} />
              <span>{copy.tiers[t]}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="how" className={`container ${styles.section}`} aria-labelledby="how-title">
        <h2 id="how-title">{copy.howTitle}</h2>
        <div className={styles.steps}>
          {copy.steps.map((s, i) => (
            <article key={s.title} className={`${styles.step} ${i % 2 ? styles.stepFlip : ''}`}>
              <div className={styles.stepText}>
                <span className={styles.stepNumber}>0{i + 1}</span>
                <h3>{s.title}</h3>
                <p className="muted">{s.body}</p>
              </div>
              <Phone lang={lang} shot={STEP_SHOTS[i] ?? 'home'} alt={copy.shots[STEP_SHOTS[i] ?? 'home']} className={styles.stepPhone} />
            </article>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="demo-title">
        <div className={styles.demoHead}>
          <p className="kicker">{copy.demo.kicker}</p>
          <h2 id="demo-title">{copy.demo.title}</h2>
          <p className="muted">{copy.demo.body}</p>
        </div>
        <FlankDemo copy={copy.demo} tiers={copy.tiers} />
      </section>

      <section className={styles.dailyBand} aria-labelledby="daily-title">
        <div className={`container ${styles.dailyGrid}`}>
          <div>
            <p className="kicker">{copy.ctaWeb}</p>
            <h2 id="daily-title">{copy.dailyTitle}</h2>
            <p className={styles.bandBody}>{copy.dailyBody}</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="button" href="/play">
              {copy.ctaWeb}
            </a>
          </div>
          <Phone lang={lang} shot="daily" alt={copy.shots.daily} className={styles.dailyPhone} />
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="climb">
        <h2 id="climb">{copy.climbTitle}</h2>
        <div className={styles.bento}>
          {copy.climb.map((c, i) => (
            <article key={c.title} className={`${styles.tile} ${styles[`tile${i}`]}`}>
              <div className={styles.tileText}>
                <h3>{c.title}</h3>
                <p className="muted">{c.body}</p>
              </div>
              <Phone lang={lang} shot={CLIMB_SHOTS[i] ?? 'home'} alt={copy.shots[CLIMB_SHOTS[i] ?? 'home']} className={styles.tilePhone} />
            </article>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="games">
        <h2 id="games">{copy.gamesTitle}</h2>
        <div className={styles.domains}>
          {DOMAINS.map((d) => (
            <div key={d} className={`${styles.domain} ${styles[d]}`}>
              <h3>{copy.domains[d]}</h3>
              <ul className={styles.gameList}>
                {GAMES_BY_DOMAIN[d].map((g) => (
                  <li key={g}>
                    <strong>{GAMES[g].name}</strong>
                    {copy.showRules ? <span> {GAMES[g].rules}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="promises">
        <h2 id="promises">{copy.promisesTitle}</h2>
        <ol className={styles.promises}>
          {copy.promises.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p className="muted">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className={`container ${styles.section}`} aria-labelledby="pricing-title">
        <h2 id="pricing-title">{copy.pricingTitle}</h2>
        <div className={styles.pricing}>
          <div className={styles.plan}>
            <h3>{copy.freeTitle}</h3>
            <ul className={styles.list}>
              {copy.freeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={`${styles.plan} ${styles.pro}`}>
            <h3>Mindtier Pro</h3>
            <p className="muted">{copy.proPrice}</p>
            <ul className={styles.list}>
              {copy.proItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="faq">
        <h2 id="faq">{copy.faqTitle}</h2>
        <div className={styles.faq}>
          {copy.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.final} aria-labelledby="final-title">
        <div className="container">
          <h2 id="final-title">{copy.finalTitle}</h2>
          <p>{copy.finalBody}</p>
          <a className={styles.finalButton} href={SITE.playUrl}>
            {copy.ctaPlay}
          </a>
        </div>
      </section>
    </div>
  );
}
