/* eslint-disable */
/**
 * Seed de l'article « Cabinet IA à Abidjan : comment bien choisir » dans la
 * collection `articles`. Contenu Lexical construit directement (blocs séparés
 * H2/paragraphes/listes/images), 3 graphiques de données uploadés en Media
 * via l'API Payload (sharp + MinIO), couverture = média existant.
 *
 * Chiffres sourcés (McKinsey 2025, Mastercard/Statista 2025, SNIA Côte d'Ivoire
 * 2030). Aucun prix affiché (lien devis). Idempotent (upsert par slug).
 *
 * Usage :
 *   pnpm tsx --env-file=<env-prod> scripts/seed-article-cabinet-ia-abidjan.ts
 *   SEED_DRY=1 ... (structure seule, sans DB)
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const SLUG = 'cabinet-ia-abidjan-comment-choisir';
const TITLE = 'Cabinet IA à Abidjan : comment bien choisir';
const EXCERPT =
  'À Abidjan, le mot « IA » est partout. Voici les six critères, les bonnes questions et les signaux d’alerte pour choisir un cabinet qui livre vraiment.';
const SUMMARY_POINTS = [
  'Le marché de l’IA en Afrique passerait de 4,5 à 16,5 milliards $ entre 2025 et 2030 ; la Côte d’Ivoire a une stratégie nationale dotée de plus de 1 000 milliards FCFA.',
  'Un cabinet IA se choisit sur sa R&D, sa conformité locale et la souveraineté de son hébergement — pas sur une démo.',
  'Six critères séparent un vrai cabinet d’une agence digitale qui sous-traite l’IA.',
];
const KEYWORDS = [
  'cabinet IA Abidjan',
  'consultant intelligence artificielle Cocody',
  'audit IA Côte d’Ivoire',
  'cabinet conseil IA Afrique francophone',
  'agence intelligence artificielle Abidjan',
];
const SOURCES = [
  {
    label: 'McKinsey — Africa’s gen AI opportunity (2025)',
    url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/leading-not-lagging-africas-gen-ai-opportunity',
  },
  {
    label: 'Mastercard / Statista — Marché IA Afrique 2030 (2025)',
    url: 'https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2025-1/august/ai-in-africa-to-top-16-5b-by-2030-mastercard-explores-path-for-continued-digital-transformation/',
  },
  {
    label: 'Stratégie Nationale IA Côte d’Ivoire 2030',
    url: 'https://telecom.gouv.ci/new/uploads/publications/174196670372.pdf',
  },
];
const CATEGORY = 'souverainete';
const AUTHOR = 'Debora Ahouma';

// Couverture : média existant en prod (visuel IA abstrait) pour éviter un
// upload redondant avec les graphiques inline. id 4 = 1001290243-4.png.
const COVER_MEDIA_ID = 4;

// Graphiques à uploader (fichiers PNG rasterisés) : [chemin, alt].
const CHARTS = {
  marche: [
    'public/insights/charts/marche-ia-afrique.png',
    'Marché de l’IA en Afrique : 4,5 Md$ en 2025, 16,5 Md$ en 2030 (× 3,7) — Mastercard / Statista.',
  ],
  adoption: [
    'public/insights/charts/adoption-gen-ia-afrique.png',
    'Plus de 40 % des organisations africaines sont déjà engagées dans l’IA générative (McKinsey, 2025).',
  ],
  secteurs: [
    'public/insights/charts/valeur-gen-ia-secteurs.png',
    'Valeur annuelle potentielle de l’IA générative par secteur en Afrique : commerce 10,4, télécoms 9,6, biens de conso 8,9 Md$ (McKinsey, 2025).',
  ],
} as const;

// ── Builders Lexical ────────────────────────────────────────────
const BOLD = 1;
const ITALIC = 2;
const root = (children: any[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
});
const text = (t: string, format = 0) => ({
  type: 'text',
  text: t,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  version: 1,
});
const para = (children: any[]) => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  textFormat: 0,
});
const heading = (tag: string, t: string) => ({
  type: 'heading',
  tag,
  children: [text(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const quote = (t: string) => ({
  type: 'quote',
  children: [text(t, ITALIC)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const link = (url: string, t: string) => ({
  type: 'link',
  fields: { linkType: 'custom', newTab: false, url },
  children: [text(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const bulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    checked: undefined,
    children: [text(t)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  })),
});
const upload = (id: number) => ({
  type: 'upload',
  relationTo: 'media',
  value: id,
  fields: null,
  format: '',
  version: 3,
});

async function main(): Promise<void> {
  const DRY = process.env.SEED_DRY === '1';
  const payload = DRY ? null : await getPayload({ config });

  // 1) Upload des 3 graphiques en Media (sharp + MinIO via Payload).
  const ids: Record<string, number> = {};
  if (!DRY) {
    for (const [key, [filePath, alt]] of Object.entries(CHARTS)) {
      const created = await payload!.create({
        collection: 'media',
        data: { alt },
        filePath,
      });
      ids[key] = created.id as number;
      console.log(`＋ média ${key} → id ${created.id}`);
    }
  }
  const img = (key: keyof typeof CHARTS) =>
    DRY ? upload(0) : upload(ids[key] ?? 0);

  // 2) Corps Lexical — blocs séparés, propres.
  const content: any[] = [
    para([
      text(
        'L’intelligence artificielle attire toutes les promesses. Et tous les opportunistes. À Abidjan, le mot « IA » figure désormais sur la plaquette d’agences qui faisaient des sites vitrines il y a deux ans. Le risque n’est pas de manquer de prestataires. Le risque, c’est d’en choisir un mauvais.',
      ),
    ]),
    para([
      text(
        'Un projet IA raté coûte deux fois : le budget perdu, et le temps que vos équipes n’ont pas consacré à autre chose. Ce guide vous donne les critères pour trancher — avant le premier devis.',
      ),
    ]),

    heading('h2', 'Un marché qui décolle, une fenêtre qui se referme'),
    para([
      text(
        'Le sujet n’est plus théorique. Le marché de l’IA en Afrique est estimé à 4,5 milliards de dollars en 2025 et devrait atteindre 16,5 milliards en 2030, soit près de quatre fois plus en cinq ans.',
      ),
    ]),
    img('marche'),
    para([
      text(
        'À l’échelle du continent, McKinsey estime que l’IA générative pourrait créer entre 61 et 103 milliards de dollars de valeur par an. Et l’adoption a déjà commencé : plus de 40 % des organisations africaines expérimentent ou déploient l’IA générative.',
      ),
    ]),
    img('adoption'),
    para([
      text(
        'La Côte d’Ivoire ne regarde pas passer le train. En 2024, le pays a adopté sa Stratégie Nationale de l’Intelligence Artificielle à horizon 2030, élaborée avec l’appui de la Banque mondiale, avec un plan d’investissement de plus de 1 000 milliards FCFA sur 2025-2030 et la création d’une Agence Nationale de l’IA. Autrement dit : la question n’est plus « faut-il s’y mettre », mais « avec qui ».',
      ),
    ]),

    heading('h2', 'Pourquoi le choix du cabinet décide du résultat'),
    para([
      text(
        'Une IA n’est pas un logiciel qu’on installe. C’est un système qui apprend de vos données, s’intègre à vos processus, et doit rester conforme au droit ivoirien. Le prestataire ne livre pas un produit fini : il livre une capacité durable, ou un prototype qui meurt après la facture.',
      ),
    ]),
    para([
      text(
        'La différence se joue rarement sur la technologie. Elle se joue sur la méthode, la légitimité et ce qui reste quand le consultant est parti.',
      ),
    ]),

    heading(
      'h2',
      'Les 6 critères qui séparent un vrai cabinet IA d’une agence digitale',
    ),
    para([
      text('1. R&D propre, pas simple revente. ', BOLD),
      text(
        'Ce cabinet construit-il, ou revend-il ? Un intégrateur qui se contente de brancher une API étrangère n’a aucune maîtrise quand le besoin sort du cadre standard. Demandez à voir les produits : OpenLab Consulting exploite huit logiciels propriétaires, de la paie conforme CNPS à la surveillance structurelle des bâtiments (',
      ),
      link('/laboratoire', 'voir le Laboratoire'),
      text(').'),
    ]),
    para([
      text('2. Conformité locale réellement maîtrisée. ', BOLD),
      text(
        'Une IA RH qui ignore les taux CNPS, ITS et FDFP produit des fichiers faux. Un ERP qui ne parle pas SYSCOHADA n’est pas déployable en zone OHADA. Et toute donnée personnelle relève de la loi ivoirienne 2013-450 — et du RGPD dès qu’un client européen est concerné.',
      ),
    ]),
    para([
      text('3. Souveraineté de l’hébergement. ', BOLD),
      text(
        'Où vivent vos données et vos modèles ? « Sur un cloud américain, quelque part » signifie perte de contrôle, et parfois de conformité. Demandez le schéma de déploiement.',
      ),
    ]),
    para([
      text('4. Des preuves, pas des superlatifs. ', BOLD),
      text(
        '« Révolutionnaire » ne vaut rien sans chiffre sourcé et daté. Un bon cabinet montre des cas réels et reconnaît les limites de son approche.',
      ),
    ]),
    para([
      text('5. Transfert de compétences. ', BOLD),
      text(
        'Le meilleur cabinet vous rend autonome. Si tout repose sur sa présence permanente, vous n’avez pas acheté une capacité, vous avez loué une dépendance.',
      ),
    ]),
    para([
      text('6. Légitimité et durée. ', BOLD),
      text('Références vérifiables, équipe à visage découvert, ancienneté.'),
    ]),

    heading('h2', 'Où l’IA crée le plus de valeur'),
    para([
      text(
        'Tous les secteurs ne sont pas logés à la même enseigne. Le commerce de détail, les télécommunications et les biens de grande consommation concentrent l’essentiel du potentiel de valeur de l’IA générative sur le continent.',
      ),
    ]),
    img('secteurs'),
    para([
      text(
        'Un bon cabinet sait où l’IA paie vite chez vous — et où elle ne paiera pas. C’est tout l’objet d’un cadrage sérieux.',
      ),
    ]),

    heading('h2', 'Les questions à poser au premier rendez-vous'),
    bulletList([
      'Quels logiciels avez-vous développés vous-mêmes, et lesquels sont en production ?',
      'Où seront hébergées nos données, et sous quelle juridiction ?',
      'Comment gérez-vous la conformité CNPS / SYSCOHADA / loi 2013-450 ?',
      'Que reste-t-il à mes équipes une fois la mission terminée ?',
      'Pouvez-vous me montrer un cas chiffré et sourcé ?',
    ]),
    quote('Les réponses floues sont une réponse en soi.'),

    heading('h2', 'Les signaux d’alerte'),
    para([
      text(
        'Méfiez-vous des promesses chiffrées sans source, des « démos » qui sont en réalité des vidéos montées, et de la sous-traitance offshore non assumée — votre projet, et vos données, partent alors là où vous ne les suivez plus. Méfiez-vous aussi du cabinet qui dit oui à tout : un partenaire honnête sait dire « ceci n’est pas un bon cas d’usage pour l’IA ».',
      ),
    ]),

    heading('h2', 'Conseil + R&D + édition : le triple avantage local'),
    para([
      text(
        'La plupart des acteurs font une seule de ces trois choses. Très peu les réunissent : conseiller, construire ses propres produits, et publier.',
      ),
    ]),
    para([
      text(
        'OpenLab Consulting tient les trois. Le conseil cadre et déploie. La R&D produit huit logiciels propriétaires. Et l’édition — avec le ',
      ),
      link(
        '/livre',
        'livre « Intelligence Artificielle : du Machine Learning aux Agents Autonomes »',
      ),
      text(
        ' — ancre une exigence académique. Ce n’est pas un argument de vente : c’est ce qui garantit qu’un conseil est adossé à une pratique réelle, pas à une présentation.',
      ),
    ]),

    heading('h2', 'Combien ça coûte : pourquoi nous n’affichons pas de tarif'),
    para([
      text(
        'Un projet IA n’a pas de prix de catalogue. Tout dépend de votre périmètre, de l’état de vos données, du niveau de conformité requis et de l’ambition visée. Afficher une grille tarifaire serait malhonnête — et le signe d’un prestataire qui vend un produit standard, pas une réponse à votre situation.',
      ),
    ]),
    para([
      text(
        'Notre approche : un diagnostic d’abord, un devis ensuite, adossé à un périmètre clair. Commencez par un ',
      ),
      link('/audit-ia', 'audit IA gratuit'),
      text(' ; nous chiffrons ensuite sur la base d’un cadrage précis. '),
      link('/contact', 'Contactez-nous'),
      text(' pour un devis.'),
    ]),

    heading('h2', 'Conclusion'),
    para([
      text(
        'Un cabinet IA ne se juge pas à son vocabulaire. Il se juge à ce qu’il construit, à sa maîtrise du droit local, et à ce qu’il vous laisse une fois parti. Posez les bonnes questions. Exigez des preuves. Et commencez petit, par un diagnostic.',
      ),
    ]),
    para([
      text('Réservez votre ', BOLD),
      link('/audit-ia', 'audit IA gratuit'),
      text(
        ' : cinq questions, une recommandation adaptée, un consultant senior pour en parler.',
      ),
    ]),
  ];

  if (DRY) {
    console.log(
      `— DRY — ${content.length} blocs (images en placeholder id 0).`,
    );
    process.exit(0);
  }

  const data: Record<string, unknown> = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    summary: SUMMARY_POINTS.map((point) => ({ point })),
    content: root(content),
    category: CATEGORY,
    keywords: KEYWORDS.map((keyword) => ({ keyword })),
    sources: SOURCES,
    author: AUTHOR,
    cover: COVER_MEDIA_ID,
    publishedAt: new Date().toISOString(),
    _status: 'published',
  };

  const existing = await payload!.find({
    collection: 'articles',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]) {
    await payload!.update({
      collection: 'articles',
      id: existing.docs[0].id,
      data,
    });
    console.log(`↻ article mis à jour : ${SLUG}`);
  } else {
    await payload!.create({ collection: 'articles', data });
    console.log(`＋ article créé : ${SLUG}`);
  }
  console.log(`✅ Article seedé — ${content.length} blocs, 3 graphiques.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article échoué :', err);
  process.exit(1);
});
