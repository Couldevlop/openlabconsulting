/* eslint-disable */
/**
 * Recentrage du catalogue produits (décision du 2026-08-08).
 *
 * Quatre produits restent visibles sur le site — NexusRH CI, Openlab
 * MaturIA, AEGIS et AgroSense CI. Les autres repassent en brouillon :
 * rien n'est supprimé, tout est republiable d'un clic depuis l'admin.
 *
 * Deux opérations méritent une explication.
 *
 * 1. AEGIS remplace OpenLab Fraud Shield **sur la même fiche**, pour ne
 *    pas laisser d'enregistrement orphelin. Ce n'est pas un renommage :
 *    les deux produits n'ont pas le même objet — Fraud Shield traite la
 *    fraude documentaire, AEGIS la détection de rançongiciels. Tout le
 *    contenu est donc réécrit, à partir des textes du dépôt `aegis`
 *    (README, docs/00-vision-perimetre.md, docs/01-architecture.md).
 *    Le slug change : prévoir la redirection 301 de
 *    `/solutions/fraud-shield` vers `/solutions/aegis`.
 *
 * 2. MaturIA est créé. Contenu tiré du dépôt `maturia` (README,
 *    CLAUDE.md). Le référentiel déclare neuf secteurs mais une seule
 *    grille est livrée à ce jour (banque) : les preuves affichées le
 *    disent, plutôt que d'annoncer neuf secteurs opérationnels.
 *
 * Idempotent : relançable sans effet de bord (upsert par slug).
 *
 * Usage : pnpm cms:seed:catalogue-2026-08
 */
import { getPayload } from 'payload';
import config from '../payload.config';

/** Produits qui restent publiés, dans leur ordre d'affichage. */
const ORDRE_PUBLIE = {
  nexusrh: 10,
  maturia: 20,
  aegis: 30,
  agrosense: 40,
} as const;

/** Produits retirés du site — brouillon, jamais supprimés. */
const A_DEPUBLIER = [
  'sentinelbtp',
  'smart-city',
  'qualitos',
  'sygescom',
  'nexuserp',
];

const AEGIS = {
  slug: 'aegis',
  name: 'AEGIS',
  iconKey: 'shield-check',
  tagline: "Le chiffrement n'est pas le début de l'attaque. C'est sa fin.",
  target: 'DSI, RSSI, institutions publiques, banques et assurances · UEMOA',
  maturity: 'dev',
  statusLabel: 'En développement',
  eyebrow: 'Cyberdéfense IA souveraine · Rançongiciels',
  intro:
    "AEGIS est une plateforme de détection et de réponse aux rançongiciels, fondée sur une IA souveraine auto-hébergée : aucune dépendance à une API étrangère, déploiement sur cluster K3s. Elle combine télémétrie bas niveau, apprentissage automatique et IA agentique pour repérer les signaux d'une attaque avant l'étape de chiffrement. Programme de R&D du Laboratoire OpenLab, mené par paliers.",
  problem:
    "Le Ransomware-as-a-Service a industrialisé l'attaque et abaissé la barrière d'entrée ; les attaquants exfiltrent les identifiants avant de chiffrer. Un antivirus de signatures ne voit ni une menace polymorphe ni un binaire jamais observé, et les sauvegardes sont rarement immuables ou testées. Envoyer sa télémétrie de sécurité — donc la carte de ses propres vulnérabilités — vers des serveurs hors du continent ajoute un risque souverain au risque technique.",
  features: [
    {
      iconKey: 'antenna',
      title: 'Télémétrie noyau',
      body: 'Sondes eBPF et filtrage par signatures au plus près du système, normalisés vers le standard ouvert OCSF. Le contrat de données est typé et borné : une entrée hostile ne fait pas paniquer un décodeur.',
    },
    {
      iconKey: 'radar',
      title: 'Détection embarquée',
      body: "Un modèle compilé dans le binaire de l'agent pré-filtre le flux sans appeler le moindre service : aucun processus, aucun port ouvert, aucune latence réseau sur le chemin chaud.",
    },
    {
      iconKey: 'scan-search',
      title: 'Anomalies et signaux faibles',
      body: 'Au-delà des signatures, la détection porte sur les comportements — accès en rafale, chiffrement massif, mouvement latéral — là où les attaques inédites se trahissent.',
    },
    {
      iconKey: 'bot',
      title: 'Investigation assistée',
      body: "Une couche agentique reconstitue la chronologie d'un incident et outille l'analyste. La décision d'isolation reste humaine : une IA qui se trompe causerait l'incident qu'elle devait prévenir.",
    },
    {
      iconKey: 'shield-check',
      title: 'Souveraineté réelle',
      body: 'Entraînement, inférence et stockage restent dans le cluster du client. Conformité loi n° 2013-450, cadre ARTCI et ANSSI-CI.',
    },
  ],
  stack: [
    'Rust',
    'eBPF',
    'OCSF',
    'Kubernetes K3s',
    'DaemonSet durci',
    'Python (entraînement hors ligne)',
  ],
  proofs: [
    {
      value: '347',
      label: 'tests automatisés sur le socle Rust',
      source: 'Dépôt AEGIS, TESTING.md',
    },
    {
      value: '0',
      label: "appel à une API d'IA étrangère",
      source: 'Architecture auto-hébergée, docs/00-vision-perimetre.md',
    },
    {
      value: '6',
      label: 'couches de défense en profondeur spécifiées',
      source: 'Dépôt AEGIS, docs/01-architecture.md',
    },
  ],
  pricing: {
    model: 'quote',
    headline: 'Programme de R&D — engagement pilote sur devis',
    details: [
      'Déploiement en environnement de test, sur votre cluster',
      "Banc d'essai adversarial et mesure du taux de faux positifs",
      'Transfert de compétences aux équipes SOC',
    ],
    note: 'AEGIS est un programme de R&D mené par paliers, pas un produit sur étagère. Les engagements se prennent palier par palier, avec des portes de passage explicites.',
  },
  faq: [
    {
      question: 'AEGIS remplace-t-il un antivirus ?',
      answer:
        "Non. AEGIS est une couche de détection comportementale qui vient au-dessus des défenses existantes. Il repère ce qu'une base de signatures ne peut pas voir : une menace polymorphe ou un binaire jamais observé.",
    },
    {
      question: 'Est-ce un SOC managé 24/7 ?',
      answer:
        'Non. La réponse à incident en pleine nuit est une organisation — astreintes, analystes, SLA — pas un logiciel. AEGIS outille vos équipes, il ne les remplace pas.',
    },
    {
      question: 'Vos données sortent-elles du pays ?',
      answer:
        "Jamais. L'entraînement, l'inférence et le stockage se font dans votre cluster. C'est le point de départ du projet, pas une option.",
    },
    {
      question: "Peut-on l'essayer aujourd'hui ?",
      answer:
        'Le socle est en cours de validation chez OpenLab. Les organisations intéressées par un pilote encadré peuvent nous contacter pour en discuter le périmètre.',
    },
  ],
  expertisesLies: [
    { slug: 'cybersecurite-ia', title: 'Cybersécurité augmentée par IA' },
    { slug: 'data-gouvernance', title: 'Data & gouvernance' },
  ],
};

const MATURIA = {
  slug: 'maturia',
  name: 'MaturIA',
  iconKey: 'compass',
  tagline: 'Votre maturité IA, mesurée. Plus jamais devinée.',
  target: 'Dirigeants et comités de direction · Côte d’Ivoire et UEMOA',
  maturity: 'production',
  statusLabel: 'En production',
  eyebrow: 'Diagnostic de maturité IA · Vertical Orion',
  intro:
    "MaturIA conduit un décideur, secteur par secteur, à travers un questionnaire adaptatif et une mise en situation, puis produit un scoring, un niveau de maturité de 1 à 5 et une feuille de route VOIE. Un agent mène l'entretien ; le moteur de calcul, lui, reste déterministe et auditable — le chiffre remis en comité de direction doit pouvoir être expliqué ligne à ligne.",
  problem:
    "« Où en sommes-nous vraiment sur l'IA ? » La réponse tient trop souvent à l'intuition du dernier séminaire ou au discours d'un fournisseur. Sans référentiel sectoriel, sans mesure reproductible, une direction ne sait ni ce qu'elle maîtrise, ni par quoi commencer, ni ce qu'elle risque à attendre. Les feuilles de route se construisent alors sur des impressions.",
  features: [
    {
      iconKey: 'compass',
      title: 'Questionnaire adaptatif',
      body: "L'entretien s'ajuste aux réponses : les questions inutiles sont écartées, les zones floues sont creusées. Le décideur ne remplit pas un formulaire, il conduit un diagnostic.",
    },
    {
      iconKey: 'badge-check',
      title: 'Référentiel sectoriel',
      body: "La grille de questions est propre au secteur. Un secteur dont la grille n'est pas livrée n'est jamais proposé : mieux vaut ne pas mesurer que mal mesurer.",
    },
    {
      iconKey: 'database',
      title: 'Scoring déterministe',
      body: 'Le calcul du niveau de maturité vit dans un domaine pur, sans dépendance à un modèle de langage. Deux passages identiques donnent le même résultat.',
    },
    {
      iconKey: 'bot',
      title: 'Feuille de route VOIE',
      body: "Le diagnostic débouche sur des chantiers ordonnés et datés, pas sur un score isolé. C'est la partie que le comité de direction emporte.",
    },
    {
      iconKey: 'shield-check',
      title: 'Souveraineté et accès',
      body: 'Hébergement K3s souverain, authentification multifacteur, conformité loi n° 2013-450. Vos réponses de diagnostic restent vos données.',
    },
  ],
  stack: [
    'Java 21 LTS',
    'Spring Boot 3.3',
    'Clean Architecture',
    'Python 3.12 · FastAPI',
    'LangGraph',
    'Qdrant',
    'Angular 18',
    'Keycloak',
  ],
  proofs: [
    {
      value: '1 à 5',
      label: 'niveaux de maturité, adossés à un référentiel sectoriel',
      source: 'MaturIA, moteur de scoring',
    },
    {
      value: '9',
      label: 'secteurs déclarés — grille bancaire livrée à ce jour',
      source: 'Référentiel MaturIA, core-infrastructure',
    },
    {
      value: '0',
      label: 'dépendance IA dans le calcul du score',
      source: 'Clean Architecture, domaine sans framework',
    },
  ],
  pricing: {
    model: 'quote',
    headline: 'Diagnostic sur devis, restitution en comité de direction',
    details: [
      'Diagnostic complet conduit avec vos équipes',
      'Rapport de maturité et feuille de route VOIE',
      'Restitution et arbitrage des chantiers prioritaires',
    ],
    note: 'Le diagnostic se conduit secteur par secteur. Nous confirmons la disponibilité de la grille de votre secteur avant tout engagement.',
  },
  faq: [
    {
      question: 'Combien de temps prend un diagnostic ?',
      answer:
        "Le questionnaire adaptatif se conduit en une session de travail. Le temps réel se joue ensuite, sur la restitution et l'arbitrage des chantiers.",
    },
    {
      question: 'Le score est-il calculé par une IA ?',
      answer:
        "Non, et c'est délibéré. L'agent mène l'entretien, mais le calcul du niveau de maturité est déterministe et auditable. Un chiffre présenté en comité de direction doit pouvoir être expliqué.",
    },
    {
      question: 'Mon secteur est-il couvert ?',
      answer:
        'Le référentiel en déclare neuf, et les grilles sont livrées secteur par secteur. Nous vous confirmons la disponibilité de la vôtre avant de démarrer.',
    },
    {
      question: 'Que reste-t-il après le diagnostic ?',
      answer:
        "Une feuille de route VOIE : des chantiers ordonnés, datés et chiffrés. Le score n'est qu'un point de départ.",
    },
  ],
  expertisesLies: [
    { slug: 'conseil-strategie', title: 'Conseil & stratégie IA' },
    { slug: 'data-gouvernance', title: 'Data & gouvernance' },
  ],
};

type Fiche = typeof AEGIS;

function versPayload(fiche: Fiche, order: number) {
  return {
    slug: fiche.slug,
    name: fiche.name,
    iconKey: fiche.iconKey,
    tagline: fiche.tagline,
    target: fiche.target,
    maturity: fiche.maturity,
    statusLabel: fiche.statusLabel,
    eyebrow: fiche.eyebrow,
    intro: fiche.intro,
    problem: fiche.problem,
    features: fiche.features,
    stack: fiche.stack.map((value) => ({ value })),
    proofs: fiche.proofs,
    pricing: {
      ...fiche.pricing,
      details: fiche.pricing.details.map((value) => ({ value })),
    },
    faq: fiche.faq,
    expertisesLies: fiche.expertisesLies,
    order,
    _status: 'published' as const,
  };
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  // 1. AEGIS prend la place de Fraud Shield, sur la même fiche.
  const ancien = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'fraud-shield' } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  const cible = ancien.docs[0]
    ? ancien.docs[0]
    : (
        await payload.find({
          collection: 'products',
          where: { slug: { equals: 'aegis' } },
          limit: 1,
          draft: true,
          overrideAccess: true,
        })
      ).docs[0];

  if (cible) {
    await payload.update({
      collection: 'products',
      id: cible.id,
      data: versPayload(AEGIS, ORDRE_PUBLIE.aegis),
      overrideAccess: true,
    });
    console.log(`AEGIS : fiche ${cible.id} réécrite (ex-fraud-shield)`);
  } else {
    const cree = await payload.create({
      collection: 'products',
      data: versPayload(AEGIS, ORDRE_PUBLIE.aegis),
      overrideAccess: true,
    });
    console.log(`AEGIS : fiche ${cree.id} créée`);
  }

  // 2. MaturIA.
  const existant = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'maturia' } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  if (existant.docs[0]) {
    await payload.update({
      collection: 'products',
      id: existant.docs[0].id,
      data: versPayload(MATURIA, ORDRE_PUBLIE.maturia),
      overrideAccess: true,
    });
    console.log(`MaturIA : fiche ${existant.docs[0].id} mise à jour`);
  } else {
    const cree = await payload.create({
      collection: 'products',
      data: versPayload(MATURIA, ORDRE_PUBLIE.maturia),
      overrideAccess: true,
    });
    console.log(`MaturIA : fiche ${cree.id} créée`);
  }

  // 3. Ordre d'affichage des deux fiches conservées telles quelles.
  for (const slug of ['nexusrh', 'agrosense'] as const) {
    const trouve = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (trouve.docs[0]) {
      await payload.update({
        collection: 'products',
        id: trouve.docs[0].id,
        data: { order: ORDRE_PUBLIE[slug], _status: 'published' },
        overrideAccess: true,
      });
      console.log(`${slug} : ordre ${ORDRE_PUBLIE[slug]}`);
    }
  }

  // 4. Dépublication — brouillon, rien n'est supprimé.
  for (const slug of A_DEPUBLIER) {
    const trouve = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (!trouve.docs[0]) {
      console.log(`${slug} : absent, rien à faire`);
      continue;
    }
    await payload.update({
      collection: 'products',
      id: trouve.docs[0].id,
      data: { _status: 'draft' },
      overrideAccess: true,
    });
    console.log(`${slug} : repassé en brouillon`);
  }

  const publies = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    limit: 50,
    overrideAccess: true,
  });
  console.log(
    `\nProduits publiés (${publies.totalDocs}) : ${publies.docs
      .map((p) => (p as { slug?: string }).slug)
      .join(', ')}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
