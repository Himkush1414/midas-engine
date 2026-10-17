import { DOMAINS, GAMES, GAMES_BY_DOMAIN, TIERS } from '@mindtier/core';
import { TierBadge } from '@/components/TierBadge';
import type { LandingCopy } from '@/lib/landing/en';
import { SITE } from '@/lib/site';
import styles from '@/app/page.module.css';

/** The marketing page, rendered from one language's copy. */
export function Landing({ copy }: { copy: LandingCopy }) {
  return (
    <div lang={copy.lang}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={`${styles.badges} rise`} aria-hidden="true">
            <TierBadge tier="bronze" division={3} size={96} />
            <TierBadge tier="gold" division={2} size={140} />
            <TierBadge tier="diamond" division={1} size={96} />
          </div>
          <h1 className="rise">{copy.heroTitle}</h1>
          <p className={`${styles.lead} muted`}>{copy.heroLead}</p>
          <div className={styles.ctas}>
            <a className="button" href={SITE.playUrl}>
              {copy.ctaPlay}
            </a>
            <a className="button secondary" href="#how">
              {copy.ctaHow}
            </a>
          </div>
          <p className="faint">{copy.heroFacts}</p>
        </div>
      </section>

      <section className="container" aria-labelledby="tiers">
        <h2 id="tiers" className={styles.center}>
          {copy.tiersTitle}
        </h2>
        <ul className={styles.tierRow}>
          {TIERS.map((t) => (
            <li key={t}>
              <TierBadge tier={t} division={t === 'master' || t === 'grandmaster' ? null : 1} size={72} />
              <span className="muted">{copy.tiers[t]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="container" aria-labelledby="how-title">
        <h2 id="how-title" className={styles.center}>
          {copy.howTitle}
        </h2>
        <div className={styles.grid3}>
          {copy.steps.map((s, i) => (
            <div key={s.title} className="card">
              <span className={styles.step}>{i + 1}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="climb">
        <h2 id="climb" className={styles.center}>
          {copy.climbTitle}
        </h2>
        <div className={styles.grid3}>
          {copy.climb.map((c) => (
            <div key={c.title} className="card">
              <h3>{c.title}</h3>
              <p className="muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="games">
        <h2 id="games" className={styles.center}>
          {copy.gamesTitle}
        </h2>
        <div className={styles.domains}>
          {DOMAINS.map((d) => (
            <div key={d} className="card">
              <h3>{copy.domains[d]}</h3>
              <ul className={styles.gameList}>
                {GAMES_BY_DOMAIN[d].map((g) => (
                  <li key={g}>
                    <strong>{GAMES[g].name}</strong>
                    {copy.showRules ? <span className="muted"> — {GAMES[g].rules}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="promises">
        <h2 id="promises" className={styles.center}>
          {copy.promisesTitle}
        </h2>
        <div className={styles.grid2}>
          {copy.promises.map((p) => (
            <div key={p.title} className="card">
              <h3>{p.title}</h3>
              <p className="muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="container" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className={styles.center}>
          {copy.pricingTitle}
        </h2>
        <div className={styles.grid2}>
          <div className="card">
            <h3>{copy.freeTitle}</h3>
            <ul className={styles.list}>
              {copy.freeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={`card ${styles.pro}`}>
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

      <section className="container" aria-labelledby="faq">
        <h2 id="faq" className={styles.center}>
          {copy.faqTitle}
        </h2>
        <div className={styles.faq}>
          {copy.faq.map((f) => (
            <details key={f.q} className="card">
              <summary>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
