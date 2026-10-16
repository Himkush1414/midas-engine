import { DOMAINS, DOMAIN_LABELS, GAMES, GAMES_BY_DOMAIN, TIERS } from '@mindtier/core';
import { TierBadge } from '@/components/TierBadge';
import { SITE } from '@/lib/site';
import styles from './page.module.css';

const STEPS = [
  {
    title: 'Place',
    body: 'Play five quick placement games — one each for Memory, Focus, Speed, Logic and Math. About four minutes, no sign-up.',
  },
  {
    title: 'Climb',
    body: 'Every game adapts to your rating, so it is never too easy or too hard. Each session moves your number — and sometimes your tier.',
  },
  {
    title: 'Duel',
    body: 'Send a friend a link. You both play the exact same puzzles, and the better score takes the win.',
  },
];

const PROMISES = [
  { title: 'No ads. Ever.', body: 'Not between games, not for free players. Focus deserves better.' },
  { title: 'Your results are always yours', body: 'Your tier, your history and your share card are free. Pro adds more play — it never unlocks a result you already earned.' },
  { title: 'Honest billing', body: 'Trial terms on the button, a reminder before it converts, and one tap to manage your subscription.' },
  { title: 'A game, not a diagnosis', body: 'Ranks compare your skill at these puzzles with other players. We don’t claim they measure IQ or change your brain.' },
];

const FAQ = [
  {
    q: 'How are ranks calculated?',
    a: 'Mindtier uses Glicko-2, the rating system behind many online chess sites. Every puzzle has a difficulty rating; when you solve harder puzzles your rating rises. Ratings map to eight tiers — Iron to Grandmaster — with four divisions each up to Diamond.',
  },
  {
    q: 'Is this an IQ test?',
    a: 'No. Mindtier is a game. Your rank reflects how well you play these specific puzzles compared with other players. It is not an IQ, medical, educational or diagnostic assessment.',
  },
  {
    q: 'What is free?',
    a: 'Placement and your full results, one ranked session every day, the Daily Challenge, duels with friends and Zen practice for five games. No ads anywhere.',
  },
  {
    q: 'Can I delete my data?',
    a: 'Yes — in the app under Settings → Delete account, or on our account deletion page. Deletion removes your profile, ratings and history.',
  },
];

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={`${styles.badges} rise`} aria-hidden="true">
            <TierBadge tier="bronze" division={3} size={96} />
            <TierBadge tier="gold" division={2} size={140} />
            <TierBadge tier="diamond" division={1} size={96} />
          </div>
          <h1 className="rise">What tier is your mind?</h1>
          <p className={`${styles.lead} muted`}>
            Ranked brain games. Find your rank from Iron to Grandmaster in five quick placement games — then climb with
            adaptive puzzles, a Daily Challenge and duels with friends.
          </p>
          <div className={styles.ctas}>
            <a className="button" href={SITE.playUrl}>
              Get it on Google Play
            </a>
            <a className="button secondary" href="#how">
              How it works
            </a>
          </div>
          <p className="faint">Free to play · No ads, ever · iOS coming soon</p>
        </div>
      </section>

      <section className="container" aria-labelledby="tiers">
        <h2 id="tiers" className={styles.center}>
          Eight tiers. One climb.
        </h2>
        <ul className={styles.tierRow}>
          {TIERS.map((t) => (
            <li key={t}>
              <TierBadge tier={t} division={t === 'master' || t === 'grandmaster' ? null : 1} size={72} />
              <span className="muted">{t[0]!.toUpperCase() + t.slice(1)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="container" aria-labelledby="how-title">
        <h2 id="how-title" className={styles.center}>
          How it works
        </h2>
        <div className={styles.grid3}>
          {STEPS.map((s, i) => (
            <div key={s.title} className="card">
              <span className={styles.step}>{i + 1}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="games">
        <h2 id="games" className={styles.center}>
          13 games across 5 skills
        </h2>
        <div className={styles.domains}>
          {DOMAINS.map((d) => (
            <div key={d} className="card">
              <h3>{DOMAIN_LABELS[d]}</h3>
              <ul className={styles.gameList}>
                {GAMES_BY_DOMAIN[d].map((g) => (
                  <li key={g}>
                    <strong>{GAMES[g].name}</strong>
                    <span className="muted"> — {GAMES[g].rules}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="promises">
        <h2 id="promises" className={styles.center}>
          Built on four promises
        </h2>
        <div className={styles.grid2}>
          {PROMISES.map((p) => (
            <div key={p.title} className="card">
              <h3>{p.title}</h3>
              <p className="muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="container" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className={styles.center}>
          Free to play. Pro if you want more.
        </h2>
        <div className={styles.grid2}>
          <div className="card">
            <h3>Free</h3>
            <ul className={styles.list}>
              <li>Placement and full tier results</li>
              <li>1 ranked session every day</li>
              <li>Daily Challenge and leaderboard</li>
              <li>Duels with friends</li>
              <li>Zen practice in 5 games</li>
            </ul>
          </div>
          <div className={`card ${styles.pro}`}>
            <h3>Mindtier Pro</h3>
            <p className="muted">From $3.33/month billed yearly ($39.99) with a 7-day free trial, $7.99 monthly, or $79.99 once. Prices vary by country.</p>
            <ul className={styles.list}>
              <li>Unlimited ranked sessions</li>
              <li>Focus training for any domain</li>
              <li>All 13 games in Zen</li>
              <li>Full history, percentiles and trends</li>
              <li>Unlimited duel challenges</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container" aria-labelledby="faq">
        <h2 id="faq" className={styles.center}>
          Questions
        </h2>
        <div className={styles.faq}>
          {FAQ.map((f) => (
            <details key={f.q} className="card">
              <summary>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
