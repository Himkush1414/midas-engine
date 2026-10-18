import type { Domain, TierId } from '@mindtier/core';

interface Card {
  title: string;
  body: string;
}

/** Everything the landing page says, in one language. Game names stay English brand names in every language. */
export interface LandingCopy {
  lang: 'en' | 'es' | 'pt' | 'de' | 'fr' | 'it';
  metaTitle: string;
  metaDescription: string;
  /** Mono label above the hero title. */
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  ctaPlay: string;
  /** Opens the web Daily Challenge at /play. */
  ctaWeb: string;
  heroFacts: string;
  tiersTitle: string;
  tiers: Record<TierId, string>;
  howTitle: string;
  steps: Card[];
  climbTitle: string;
  climb: Card[];
  gamesTitle: string;
  domains: Record<Domain, string>;
  /** Show the one-line game rules (they are written in English). */
  showRules: boolean;
  promisesTitle: string;
  promises: Card[];
  pricingTitle: string;
  freeTitle: string;
  freeItems: string[];
  proPrice: string;
  proItems: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  /** The playable taste of Flank on the page. {ms}, {correct}, {total} and {tier} are filled in. */
  demo: {
    kicker: string;
    title: string;
    body: string;
    start: string;
    again: string;
    left: string;
    right: string;
    progress: string;
    result: string;
    verdict: string;
    note: string;
  };
  dailyTitle: string;
  dailyBody: string;
  finalTitle: string;
  finalBody: string;
  /** Alt text for the app screens in the device mockups. */
  shots: Record<'home' | 'reveal' | 'results' | 'duel' | 'daily' | 'league' | 'season', string>;
}

export const en: LandingCopy = {
  lang: 'en',
  metaTitle: 'Mindtier — Ranked brain games',
  metaDescription:
    'Find your brain rank in six quick placement games, then climb from Iron to Grandmaster. Adaptive puzzles, daily challenges, friend duels, monthly seasons and weekly leagues. No ads, ever.',
  heroKicker: 'Ranked brain games',
  heroTitle: 'What tier is your mind?',
  heroLead:
    'Ranked brain games. Find your rank from Iron to Grandmaster in six quick placement games — then climb with adaptive puzzles, a Daily Challenge and duels with friends.',
  ctaPlay: 'Get it on Google Play',
  ctaWeb: 'Play today’s challenge',
  heroFacts: 'Free to play · No ads, ever · iOS coming soon',
  tiersTitle: 'Eight tiers. One climb.',
  tiers: {
    iron: 'Iron',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
    diamond: 'Diamond',
    master: 'Master',
    grandmaster: 'Grandmaster',
  },
  howTitle: 'How it works',
  steps: [
    {
      title: 'Place',
      body: 'Play six quick placement games — one each for Memory, Focus, Speed, Logic, Math and Language. About five minutes, no sign-up.',
    },
    {
      title: 'Climb',
      body: 'Every game adapts to your rating, so it is never too easy or too hard. Each session moves your number — and sometimes your tier.',
    },
    {
      title: 'Duel',
      body: 'Send a friend a link. You both play the exact same puzzles, and the better score takes the win.',
    },
  ],
  climbTitle: 'Something to play for, every week',
  climb: [
    {
      title: 'Monthly seasons',
      body: 'Each calendar month is a season. High ratings ease back a little when a new one starts, and your season recap shows your peak tier and biggest climb.',
    },
    {
      title: 'Weekly leagues',
      body: 'Opt in to a table of up to 30 players at your tier. Your first ranked session each day scores, so free and Pro players have the same chances.',
    },
    {
      title: 'Your week',
      body: 'A Sunday-evening recap of the weeks you played: sessions, days played and where your rating moved. Quiet weeks get no notification.',
    },
  ],
  gamesTitle: '15 games across 6 skills',
  domains: { memory: 'Memory', focus: 'Focus', speed: 'Speed', logic: 'Logic', math: 'Math', language: 'Language' },
  showRules: true,
  promisesTitle: 'Built on four promises',
  promises: [
    { title: 'No ads. Ever.', body: 'Not between games, not for free players. Focus deserves better.' },
    {
      title: 'Your results are always yours',
      body: 'Your tier, your history and your share card are free. Pro adds more play — it never unlocks a result you already earned.',
    },
    { title: 'Honest billing', body: 'Trial terms on the button, a reminder before it converts, and one tap to manage your subscription.' },
    {
      title: 'A game, not a diagnosis',
      body: 'Ranks compare your skill at these puzzles with other players. We don’t claim they measure IQ or change your brain.',
    },
  ],
  pricingTitle: 'Free to play. Pro if you want more.',
  freeTitle: 'Free',
  freeItems: [
    'Placement and full tier results',
    '1 ranked session every day',
    'Daily Challenge and leaderboard',
    'Seasons and weekly leagues',
    'Duels with friends',
    'Zen practice in 6 games',
  ],
  proPrice: 'From $3.33/month billed yearly ($39.99) with a 7-day free trial, $7.99 monthly, or $79.99 once. Prices vary by country.',
  proItems: [
    'Unlimited ranked sessions',
    'Focus training for any domain',
    'All 15 games in Zen',
    'Full history, percentiles and trends',
    'Unlimited duel challenges',
  ],
  faqTitle: 'Questions',
  faq: [
    {
      q: 'How are ranks calculated?',
      a: 'Mindtier uses Glicko-2, the rating system behind many online chess sites. Every puzzle has a difficulty rating; when you solve harder puzzles your rating rises. Ratings map to eight tiers — Iron to Grandmaster — with four divisions each up to Diamond. Placement can start you as high as Diamond; Master and Grandmaster are earned in ranked play.',
    },
    {
      q: 'Is this an IQ test?',
      a: 'No. Mindtier is a game. Your rank reflects how well you play these specific puzzles compared with other players. It is not an IQ, medical, educational or diagnostic assessment.',
    },
    {
      q: 'What is free?',
      a: 'Placement and your full results, one ranked session every day, the Daily Challenge, seasons, weekly leagues, duels with friends and Zen practice for six games. No ads anywhere.',
    },
    {
      q: 'Does Pro help in leagues?',
      a: 'No. Only your first ranked session of each day scores in a league, for free and Pro players alike.',
    },
    {
      q: 'Can I delete my data?',
      a: 'Yes — in the app under Settings → Delete account, or on our account deletion page. Deletion removes your profile, ratings and history.',
    },
  ],
  demo: {
    kicker: 'Try it here',
    title: 'Ten seconds of Flank',
    body: 'Which way does the middle arrow point? Ignore its neighbours. Tap the buttons or use your arrow keys.',
    start: 'Start',
    again: 'Play again',
    left: 'Left',
    right: 'Right',
    progress: '{done} of {total}',
    result: '{correct}/{total} right · {ms} ms average',
    verdict: 'That’s {tier}-level speed.',
    note: 'Just a taste: your real rank comes from six placement games in the app.',
  },
  dailyTitle: 'One challenge. Everyone. Every day.',
  dailyBody:
    'Three puzzles, the same for every player on Earth, reset at midnight UTC. Play it right here in your browser, no sign-up — then see where you landed on today’s board.',
  finalTitle: 'Find your tier.',
  finalBody: 'Six quick games. About five minutes. Then the climb is yours.',
  shots: {
    home: 'Mindtier home screen: Platinum II, rating 1605, with the next ranked session',
    reveal: 'Placement reveal: Platinum II with a skill radar across six skills',
    results: 'Session results: Division up, with rating gains for three games',
    duel: 'A finished duel: 2,140 against 1,985',
    daily: 'Daily Challenge result and today’s leaderboard',
    league: 'Weekly league table with your place',
    season: 'Season recap with peak tier and biggest climb',
  },
};
