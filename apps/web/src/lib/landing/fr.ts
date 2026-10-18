import type { LandingCopy } from './en';

export const fr: LandingCopy = {
  lang: 'fr',
  metaTitle: 'Mindtier — Jeux de réflexion classés',
  metaDescription:
    'Découvre ton rang mental en six parties de placement rapides, puis grimpe de Fer à Grand Maître. Des énigmes qui s’adaptent à toi, un défi du jour, des duels, des saisons mensuelles et des ligues hebdomadaires. Jamais de pub.',
  heroKicker: 'Jeux de réflexion classés',
  heroTitle: 'À quel rang est ton esprit ?',
  heroLead:
    'Des jeux de réflexion classés. Découvre ton rang, de Fer à Grand Maître, en six parties de placement rapides — puis grimpe avec des énigmes qui s’adaptent à toi, un défi du jour et des duels entre amis.',
  ctaPlay: 'Disponible sur Google Play',
  ctaWeb: 'Joue le défi du jour',
  heroFacts: 'Gratuit · Jamais de pub · iOS bientôt',
  tiersTitle: 'Huit rangs. Une ascension.',
  tiers: {
    iron: 'Fer',
    bronze: 'Bronze',
    silver: 'Argent',
    gold: 'Or',
    platinum: 'Platine',
    diamond: 'Diamant',
    master: 'Maître',
    grandmaster: 'Grand Maître',
  },
  howTitle: 'Comment ça marche',
  steps: [
    {
      title: 'Place-toi',
      body: 'Joue six parties de placement rapides — une pour la Mémoire, l’Attention, la Vitesse, la Logique, le Calcul et le Langage. Environ cinq minutes, sans inscription.',
    },
    {
      title: 'Grimpe',
      body: 'Chaque jeu s’adapte à ton score : jamais trop facile, jamais trop dur. Chaque session fait bouger ton chiffre — et parfois ton rang.',
    },
    {
      title: 'Défie',
      body: 'Envoie un lien à un ami. Vous jouez tous les deux exactement les mêmes énigmes — le meilleur score gagne.',
    },
  ],
  climbTitle: 'Un objectif chaque semaine',
  climb: [
    {
      title: 'Saisons mensuelles',
      body: 'Chaque mois calendaire est une saison. Quand une nouvelle commence, les scores élevés reculent un peu, et ton bilan de saison montre ton rang le plus haut et ta plus forte progression.',
    },
    {
      title: 'Ligues hebdomadaires',
      body: 'Rejoins un classement de jusqu’à 30 joueurs de ton rang. Ta première session classée de chaque jour compte : gratuit ou Pro, tout le monde a les mêmes chances.',
    },
    {
      title: 'Ta semaine',
      body: 'Le dimanche soir, un bilan des semaines où tu as joué : sessions, jours joués et évolution de ton score. Aucune notification les semaines sans jeu.',
    },
  ],
  gamesTitle: '15 jeux, 6 compétences',
  domains: { memory: 'Mémoire', focus: 'Attention', speed: 'Vitesse', logic: 'Logique', math: 'Calcul', language: 'Langage' },
  showRules: false,
  promisesTitle: 'Quatre promesses',
  promises: [
    { title: 'Jamais de pub.', body: 'Ni entre les parties, ni pour les joueurs gratuits.' },
    {
      title: 'Tes résultats t’appartiennent',
      body: 'Ton rang, ton historique et ta carte de partage sont gratuits. Pro ajoute plus de jeu — il ne bloque jamais un résultat déjà obtenu.',
    },
    {
      title: 'Une facturation honnête',
      body: 'Les conditions de l’essai sur le bouton, un rappel avant la fin de l’essai et une seule touche pour gérer ton abonnement.',
    },
    {
      title: 'Un jeu, pas un diagnostic',
      body: 'Les rangs comparent ton niveau à ces énigmes avec celui des autres joueurs. Nous ne prétendons pas qu’ils mesurent le QI ni qu’ils changent ton cerveau.',
    },
  ],
  pricingTitle: 'Gratuit pour jouer. Pro si tu veux plus.',
  freeTitle: 'Gratuit',
  freeItems: [
    'Placement et résultats complets',
    '1 session classée par jour',
    'Défi du jour et classement',
    'Saisons et ligues hebdomadaires',
    'Duels entre amis',
    'Entraînement zen sur 6 jeux',
  ],
  proPrice:
    'À partir de 3,33 $/mois avec l’abonnement annuel (39,99 $) et 7 jours d’essai gratuit, 7,99 $ par mois ou 79,99 $ à vie. Les prix varient selon le pays.',
  proItems: [
    'Sessions classées illimitées',
    'Entraînement par domaine',
    'Les 15 jeux en mode zen',
    'Historique complet, percentiles et tendances',
    'Duels illimités',
  ],
  faqTitle: 'Questions',
  faq: [
    {
      q: 'Comment les rangs sont-ils calculés ?',
      a: 'Mindtier utilise Glicko-2, le système de classement de nombreux sites d’échecs en ligne. Chaque énigme a une difficulté ; quand tu résous des énigmes plus difficiles, ton score monte. Les scores correspondent à huit rangs, de Fer à Grand Maître, avec quatre divisions jusqu’à Diamant. Le placement peut te placer au plus en Diamant ; Maître et Grand Maître se gagnent en parties classées.',
    },
    {
      q: 'Est-ce un test de QI ?',
      a: 'Non. Mindtier est un jeu. Ton rang reflète ton niveau à ces énigmes par rapport aux autres joueurs. Ce n’est ni un test de QI, ni une évaluation médicale, éducative ou diagnostique.',
    },
    {
      q: 'Qu’est-ce qui est gratuit ?',
      a: 'Le placement et tous tes résultats, une session classée par jour, le défi du jour, les saisons, les ligues hebdomadaires, les duels entre amis et l’entraînement zen sur six jeux. Aucune pub nulle part.',
    },
    {
      q: 'Pro aide-t-il dans les ligues ?',
      a: 'Non. Dans une ligue, seule ta première session classée de chaque jour compte, que tu joues gratuitement ou avec Pro.',
    },
    {
      q: 'Puis-je supprimer mes données ?',
      a: 'Oui : dans l’app, dans Réglages → Supprimer le compte, ou sur notre page de suppression de compte. Ton profil, tes scores et ton historique sont supprimés.',
    },
  ],
  demo: {
    kicker: 'Essaie ici',
    title: 'Dix secondes de Flank',
    body: 'Dans quelle direction pointe la flèche du milieu ? Ignore ses voisines. Touche les boutons ou utilise les flèches du clavier.',
    start: 'Commencer',
    again: 'Rejouer',
    left: 'Gauche',
    right: 'Droite',
    progress: '{done} sur {total}',
    result: '{correct}/{total} justes · {ms} ms en moyenne',
    verdict: 'C’est une vitesse de niveau {tier}.',
    note: 'Juste un avant-goût : ton vrai rang vient de six parties de classement dans l’appli.',
  },
  dailyTitle: 'Un défi. Tout le monde. Chaque jour.',
  dailyBody: 'Trois énigmes, les mêmes pour tous les joueurs de la planète, renouvelées à minuit UTC. Joue directement ici dans ton navigateur, sans inscription, puis regarde où tu te places au classement du jour.',
  finalTitle: 'Trouve ton rang.',
  finalBody: 'Six parties rapides. Environ cinq minutes. Ensuite, l’ascension t’appartient.',
  shots: {
    home: 'Écran d’accueil de Mindtier : Platine II, score 1605, avec la prochaine session classée',
    reveal: 'Résultat du classement : Platine II avec un radar de six compétences',
    results: 'Résultats de la session : division supérieure, avec les gains de trois jeux',
    duel: 'Un duel terminé : 2140 contre 1985',
    daily: 'Résultat du défi du jour et le classement du jour',
    league: 'Tableau de la ligue hebdomadaire avec ta place',
    season: 'Bilan de saison avec le rang maximal et la plus grande progression',
  },
};
