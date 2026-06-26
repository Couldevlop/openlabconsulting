/* eslint-disable */
/**
 * Seed de l'article « L'IA ne s'installe pas. Elle s'adopte. » dans la
 * collection `articles` Payload.
 *
 * - Corps Lexical construit directement (titres H2/H3, paragraphes, citation,
 *   un tableau comparatif, une liste à puces) — pas de parsing HTML.
 * - Couverture : média existant `SNIA5.png` retrouvé dans la médiathèque
 *   (par `filename`), réutilisé tel quel (aucun upload).
 * - Upsert par `slug` ; publié (`_status: 'published'`).
 * - `SEED_DRY=1` : construit le Lexical sans DB et imprime la structure.
 *
 * Usage local :  pnpm cms:seed:article:adoption
 * Usage prod :   via tunnel/port-forward postgres, NODE_ENV=production pour
 *                ne pas pousser le schéma (cf. seed-content-globals / memory).
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const SLUG = 'ia-ne-sinstalle-pas-elle-sadopte';
const TITLE = 'L’IA ne s’installe pas. Elle s’adopte.';
const EXCERPT =
  'La souveraineté IA de la Côte d’Ivoire ne se décrétera pas : elle se construira par l’usage. Voici la couche où tout se joue — applications et données — et la preuve qu’elle tourne déjà, en production.';
const COVER_FILENAME = 'SNIA5.png';

const SUMMARY_POINTS = [
  'L’IA utile ne se gagne ni par la seule infrastructure, ni par l’expérimentation isolée, mais par la couche applicative et données.',
  'OpenCacao prouve la méthode : un modèle open source affiné sur un corpus ivoirien, auto-hébergé sur cluster souverain, accessible en ligne.',
  'Huit produits propriétaires déployés ou en déploiement avancé — des systèmes en production, pas des démonstrations.',
  'Aux organisations qui se reconnaissent dans la SNIA 2030 et veulent passer à l’exécution : la couche d’adoption existe déjà.',
];

const KEYWORDS = [
  'IA souveraine Côte d’Ivoire',
  'SNIA 2030',
  'adoption IA Afrique',
  'OpenCacao',
  'technologies émergentes',
  'souveraineté numérique',
  'IA appliquée',
];

const SOURCES = [
  {
    label:
      'Stratégie Nationale de l’IA (SNIA 2030) — Ministère de la Transition Numérique et de la Digitalisation',
    url: 'https://telecom.gouv.ci',
  },
  {
    label: 'Conseil du Café-Cacao — filière et production',
    url: 'https://www.conseilcafecacao.ci',
  },
  {
    label: 'Banque mondiale — Côte d’Ivoire, économie du cacao',
    url: 'https://www.banquemondiale.org/fr/country/cotedivoire',
  },
  {
    label: 'CNRA — Centre National de Recherche Agronomique',
    url: 'https://www.cnra.ci',
  },
  {
    label: 'ANADER — Agence Nationale d’Appui au Développement Rural',
    url: 'https://www.anader.ci',
  },
  {
    label: 'OpenCacao — IA souveraine de la filière cacao',
    url: 'https://opencacao.openlabconsulting.com',
  },
];

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
const heading = (tag: string, children: any[]) => ({
  type: 'heading',
  tag,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const quote = (children: any[]) => ({
  type: 'quote',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const cell = (header: boolean, children: any[]) => ({
  type: 'tablecell',
  headerState: header ? 1 : 0,
  colSpan: 1,
  rowSpan: 1,
  backgroundColor: null,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const row = (cells: any[]) => ({
  type: 'tablerow',
  children: cells,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const table = (rows: any[]) => ({
  type: 'table',
  children: rows,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});

/** Mini-parser inline : `**gras**` et `*italique*` → nœuds text (bitmask). */
function inline(s: string): any[] {
  const out: any[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(text(s.slice(last, m.index)));
    if (m[1] !== undefined) out.push(text(m[1], BOLD));
    else out.push(text(m[2]!, ITALIC));
    last = re.lastIndex;
  }
  if (last < s.length) out.push(text(s.slice(last)));
  return out.length ? out : [text(s)];
}
const p = (s: string) => para(inline(s));
const h2 = (s: string) => heading('h2', [text(s)]);
const h3 = (s: string) => heading('h3', [text(s)]);
const q = (s: string) => quote(inline(s));
const trow = (cells: string[], header = false) =>
  row(cells.map((c) => cell(header, [para(inline(c))])));

// ── Corps de l'article ──────────────────────────────────────────
const CONTENT: any[] = [
  p(
    'L’intelligence artificielle ne souffre pas d’un déficit d’annonces. Elle souffre d’un déficit d’adoption. Entre le moment où une technologie devient disponible et celui où elle change réellement le quotidien d’une organisation, il y a un fossé — et c’est dans ce fossé que se perdent la plupart des ambitions numériques africaines.',
  ),
  p(
    'Cette phrase résume notre approche depuis le premier jour : **l’IA ne s’installe pas, elle s’adopte.** C’est aussi, mot pour mot, ce que rend possible à l’échelle nationale la priorité portée par le ministre Djibril Ouattara — *accompagner l’innovation et favoriser l’adoption des technologies émergentes*. Accompagner. Favoriser l’adoption. Pas seulement financer des infrastructures, pas seulement multiplier les vitrines : créer les conditions pour que la technologie soit réellement absorbée par l’économie réelle.',
  ),
  p(
    'Cet article explique où se joue cette adoption, pourquoi nous avons décidé d’y jouer, et ce que nous avons déjà mis en production pour le prouver.',
  ),
  q(
    '« La souveraineté IA de la Côte d’Ivoire se construira d’abord par l’usage, pas par l’annonce. Par la preuve, pas par la promesse. »',
  ),

  h2('Le piège des deux extrêmes'),
  p(
    'Trop souvent, le débat sur l’IA en Afrique reste prisonnier de deux extrêmes. Deux récits séduisants, deux impasses.',
  ),
  h3('L’extrême de l’infrastructure'),
  p(
    'Le premier, c’est la **promesse infrastructure**. Des data centers, des câbles, des GPU, des foundation models entraînés depuis zéro. Une vision noble — et nécessaire à terme — mais longue, capitalistique, qui se mesure en années et en milliards. Elle suppose que la souveraineté commence par posséder la totalité de la pile technologique, du silicium au modèle. C’est vrai sur le papier. C’est intenable comme point de départ pour une économie qui a besoin de résultats maintenant, pas dans une décennie.',
  ),
  p(
    'Le risque de cet extrême est connu : on attend l’infrastructure parfaite pour commencer, et pendant qu’on attend, l’usage ne progresse pas. La souveraineté reste un objet de discours, jamais un objet d’usage.',
  ),
  h3('L’extrême de l’expérimentation'),
  p(
    'Le second extrême, c’est l’**expérimentation isolée**. Le pilote, le hackathon, la preuve de concept. Joli en démonstration, applaudi en conférence, photogénique sur un stand. Mais jamais intégré à la vraie vie des organisations. Le POC qui dort. La démo qui ne devient jamais un système.',
  ),
  p(
    'Ce piège-là est plus insidieux, parce qu’il produit du mouvement sans produire de transformation. On multiplie les expérimentations, on coche des cases d’innovation, et les processus métier ne changent pas d’un iota. L’IA reste un supplément d’âme, jamais une infrastructure de décision.',
  ),
  table([
    trow(
      [
        '',
        'Promesse infrastructure',
        'Expérimentation isolée',
        'Couche applicative & données',
      ],
      true,
    ),
    trow(['Horizon', 'Années', 'Semaines', 'Mois']),
    trow([
      'Coût',
      'Milliards',
      'Faible mais récurrent',
      'Maîtrisé, orienté ROI',
    ]),
    trow([
      'Mesure',
      'Capacité installée',
      'Effet d’annonce',
      'Usage en production',
    ]),
    trow([
      'Risque',
      'Attendre sans déployer',
      'Bouger sans transformer',
      'Exécuter pour de vrai',
    ]),
  ]),

  h2('La couche qui change tout : applications et données'),
  p(
    'Entre ces deux extrêmes, il y a un terrain que peu occupent sérieusement : la **couche applicative et données**. C’est là que nous avons décidé de jouer.',
  ),
  p(
    'Ce choix n’est pas un compromis tiède entre deux ambitions. C’est le point de levier le plus élevé pour une économie comme la nôtre. Pourquoi ? Parce que la valeur de l’IA, pour une banque, une coopérative ou un ministère, ne réside pas dans le modèle en lui-même. Elle réside dans la rencontre entre un modèle compétent et **des données de qualité, propres à un métier, gouvernées et hébergées sous contrôle.**',
  ),
  p(
    'Un modèle générique entraîné ailleurs ne connaît pas la filière cacao ivoirienne, le barème CNPS, les règles SYSCOHADA, ni la réalité d’une station-service à San-Pédro. La couche applicative et données, c’est précisément ce qui transforme une capacité technologique abstraite en avantage opérationnel concret. C’est moins spectaculaire qu’un data center inauguré en grande pompe. C’est infiniment plus utile.',
  ),
  p(
    'Et surtout, c’est **accessible maintenant.** On n’a pas besoin d’attendre dix ans d’investissement souverain pour affiner un modèle ouvert sur ses propres données et le faire tourner sur un cluster que l’on contrôle. C’est faisable cette année. Nous le faisons déjà.',
  ),

  h2('La priorité du ministre, traduite en exécution'),
  p(
    'La Stratégie Nationale de l’Intelligence Artificielle à l’horizon 2030 — la SNIA 2030 — pose un cap clair : faire de l’IA un moteur de développement, en s’appuyant sur l’innovation et l’adoption des technologies émergentes. La priorité portée par le ministre Djibril Ouattara n’est pas un slogan administratif : c’est une commande politique qui appelle une réponse opérationnelle.',
  ),
  p(
    'Or une stratégie nationale ne se réalise pas par décret. Elle se réalise par une **chaîne d’exécution** : des acteurs capables de transformer une orientation en systèmes qui tournent. C’est exactement le rôle que nous revendiquons. Pas celui de commentateur de la stratégie, mais celui d’opérateur de son volet applicatif.',
  ),
  p(
    'Accompagner l’innovation, côté État, c’est créer le cadre. Favoriser l’adoption, côté terrain, c’est livrer les outils que les organisations adoptent vraiment. Les deux mouvements sont complémentaires. L’un sans l’autre échoue : un cadre sans exécution reste une intention, une exécution sans cadre reste un îlot. La Côte d’Ivoire a aujourd’hui les deux — c’est ce qui rend le moment singulier.',
  ),

  h2('OpenCacao : la preuve la plus mature'),
  p(
    'S’il ne fallait retenir qu’une démonstration, ce serait celle-là. **OpenCacao** est l’illustration grandeur nature de notre thèse.',
  ),
  h3('Ce que c’est, concrètement'),
  p(
    'Un modèle de langage **open source**, affiné sur un corpus ivoirien de référence : environ **5 Go de données** issues du CNRA (Centre National de Recherche Agronomique), de l’ANADER (Agence Nationale d’Appui au Développement Rural) et du Conseil du Café-Cacao. Auto-hébergé sur **cluster souverain**, sous notre seul contrôle opérationnel. Accessible publiquement à **opencacao.openlabconsulting.com**.',
  ),
  p(
    'Notez ce que ce n’est *pas*. Ce n’est pas un foundation model construit depuis zéro, avec des mois de calcul et des budgets que peu d’acteurs africains peuvent aligner. C’est un modèle ouvert, déjà compétent, **adapté** à un domaine précis. La différence est stratégique : là où l’entraînement depuis zéro relève de l’extrême infrastructure, l’affinage d’un modèle ouvert sur un corpus métier relève de la couche applicative — rapide, maîtrisé, souverain dans ce qui compte vraiment : les données et l’opération.',
  ),
  h3('Pourquoi le cacao'),
  p(
    'Parce que le cacao n’est pas un sujet de niche en Côte d’Ivoire : c’est un pilier de l’économie. Le pays est le **premier producteur mondial** — de l’ordre de 45 % de l’offre mondiale — et la filière pèse une part majeure du PIB et des recettes d’exportation. Construire une IA verticale sur ce domaine, ce n’est pas un exercice de style. C’est viser le cœur de la valeur nationale.',
  ),
  p(
    'OpenCacao montre la méthode reproductible : partir des données d’un domaine, affiner un modèle ouvert, l’héberger localement, l’encadrer de garde-fous. Cette méthode n’a rien de réservé au cacao. Elle vaut pour l’anacarde, le coton, l’hévéa. Pour la banque, l’assurance, la santé. Pour les télécoms et l’énergie. Pour une administration, un ministère, une collectivité. Le cacao est la première démonstration, pas la dernière.',
  ),

  h2('Huit produits, pas des slides'),
  p(
    'OpenCacao ne tombe pas du ciel. Il s’inscrit dans un écosystème de **huit produits propriétaires**, conçus et opérés par la même équipe, déployés sur le même cluster, gouvernés par les mêmes principes de sécurité et de souveraineté.',
  ),
  table([
    trow(['Produit', 'Domaine', 'Statut'], true),
    trow([
      '**AgroSense CI**',
      'Agriculture de précision : suivi des cultures par capteurs et données satellitaires (cacao, anacarde, coton, hévéa).',
      'MVP avancé',
    ]),
    trow([
      '**NexusERP**',
      'Pilotage des organisations : comptabilité SYSCOHADA, ventes, achats, stock, RH, projets, multi-devises FCFA / EUR / USD.',
      'Production',
    ]),
    trow([
      '**SYGESCOM**',
      'Gestion commerciale et réseaux de stations d’hydrocarbures, en temps réel, multi-sites.',
      'Production',
    ]),
    trow([
      '**NexusRH CI**',
      'Ressources humaines : paie conforme CNPS, ITS, FDFP, intégration Mobile Money.',
      'Production',
    ]),
    trow([
      '**Fraud Shield**',
      'Confiance financière : détection de fraude documentaire par IA (banques, assurances, administrations).',
      'Production',
    ]),
    trow([
      '**QualitOS**',
      'Management de la qualité multi-méthodes (PDCA, 5S, DMAIC, ISO) pour l’industrie, la santé, les services.',
      'En développement',
    ]),
    trow([
      '**OpenLab Smart City**',
      'IA de sécurité urbaine pour collectivités et ministères.',
      'Pilote',
    ]),
    trow([
      '**SentinelBTP**',
      'Surveillance structurelle par IA (SHM) : anticiper les défaillances du bâtiment et des ouvrages.',
      'Pilote',
    ]),
  ]),
  p(
    'Certains sont en production depuis des mois — NexusRH, NexusERP, SYGESCOM, Fraud Shield. D’autres sont en déploiement avancé ou en pilote terrain. Aucun n’est une diapositive. Ce sont des systèmes qui traitent des données réelles, pour des organisations réelles, avec des conséquences réelles.',
  ),
  p(
    'C’est la différence que nous revendiquons. On ne présente pas un *roadmap* d’intentions : on présente un parc en exploitation. La souveraineté ne se prouve pas par ce qu’on annonce pouvoir faire. Elle se prouve par ce qui tourne pendant qu’on en parle.',
  ),

  h2('Souveraineté : le mot, et ce qu’il exige vraiment'),
  p(
    '« Souveraineté » est devenu un mot fragile à force d’être répété. Il mérite une définition exigeante, sinon il ne veut plus rien dire.',
  ),
  p(
    'Pour nous, la souveraineté IA tient en trois conditions concrètes, vérifiables :',
  ),
  h3('1. La maîtrise des données'),
  p(
    'Les données qui nourrissent et spécialisent les modèles restent sous contrôle national, hébergées localement, jamais cédées implicitement à une plateforme étrangère en échange d’un service. Le corpus d’OpenCacao en est l’exemple : il vient de nos institutions, il reste chez nous.',
  ),
  h3('2. La maîtrise de l’opération'),
  p(
    'Le modèle tourne sur une infrastructure que l’on administre — un cluster Kubernetes souverain — et non sur une API distante dont on ne connaît ni la localisation, ni la rétention, ni les conditions d’usage des requêtes. Contrôler l’exécution, c’est contrôler la dépendance.',
  ),
  h3('3. La vérifiabilité'),
  p(
    'Tout est auditable : le code, les données, les déploiements. Pour un ministère ou une banque, l’auditabilité du socle vaut autant que la performance du modèle. Quand chaque changement passe par une trace, l’audit annuel cesse d’être une fouille archéologique.',
  ),
  p(
    'Aucune de ces trois conditions n’exige de posséder l’intégralité de la pile, jusqu’au foundation model. Toutes les trois sont atteignables aujourd’hui, par la couche applicative et données. C’est précisément pourquoi cette couche n’est pas un repli : c’est le chemin le plus court vers une souveraineté réelle.',
  ),

  h2('La méthode : par l’usage, dans l’ordre'),
  p(
    'L’IA ne s’adopte pas par enthousiasme. Elle s’adopte par méthode. Et la méthode tient en trois étapes, dans l’ordre — jamais dans le désordre.',
  ),
  p(
    '**D’abord, mesurer.** Où en est vraiment une organisation : ses données, ses processus, ses compétences, son infrastructure. On ne déploie pas l’IA sur des fondations qu’on n’a pas évaluées.',
  ),
  p(
    '**Ensuite, choisir.** Quelles données, quels processus confier à l’IA — et lesquels garder humains. La bonne IA, au bon endroit, sous gouvernance. C’est ici que se décide la différence entre un gadget et un levier.',
  ),
  p(
    '**Enfin, déployer pour de vrai.** Priorisation par ROI, conduite du changement, jalons concrets. Pas un pilote qui dort : une adoption qui change les résultats.',
  ),
  p(
    'Cette discipline est l’exact opposé des deux extrêmes. Elle ne fantasme pas l’infrastructure totale, et elle ne se contente pas de la démonstration. Elle exécute. C’est lent à dire, rapide à produire — et c’est la seule façon de transformer une stratégie nationale en résultats mesurables.',
  ),

  h2('Aux organisations qui veulent passer à l’exécution'),
  p(
    'La SNIA 2030 trace une direction. La priorité du ministre Djibril Ouattara ouvre la voie. Mais une stratégie ne devient réalité que lorsque des institutions et des entreprises décident, concrètement, de **passer à l’exécution.**',
  ),
  p(
    'Si vous êtes une banque, une compagnie d’assurance, une coopérative, une administration, une collectivité — et que vous vous reconnaissez dans l’ambition d’une Côte d’Ivoire qui adopte l’IA plutôt que de seulement la commenter — alors la couche dont parle cet article n’est pas une théorie. Elle est disponible. Elle tourne. Elle attend vos données et votre métier.',
  ),
  p(
    'Nous ne vendons pas une promesse de souveraineté pour 2035. Nous proposons une adoption qui commence ce trimestre, sur un cas d’usage réel, avec un livrable mesurable. C’est ainsi qu’une nation devient souveraine en IA : non par une grande annonce, mais par mille usages qui, additionnés, déplacent l’économie.',
  ),
  p(
    'L’IA ne s’installe pas. Elle s’adopte. Et l’adoption, elle, a déjà commencé.',
  ),
  p(
    '*Envie de savoir où l’IA vous ferait gagner du temps ? Demandez un audit IA gratuit — trente minutes pour cartographier vos cas d’usage et repartir avec trois prochaines étapes activables.*',
  ),
];

async function findCover(payload: any): Promise<string | number | undefined> {
  // Retrouve le média par nom de fichier exact, sinon variante insensible
  // à la casse / sans extension. Couverture optionnelle : on n'échoue pas.
  const exact = await payload.find({
    collection: 'media',
    where: { filename: { equals: COVER_FILENAME } },
    limit: 1,
    depth: 0,
  });
  if (exact.docs[0]) return exact.docs[0].id;
  const like = await payload.find({
    collection: 'media',
    where: { filename: { like: 'SNIA5' } },
    limit: 1,
    depth: 0,
  });
  if (like.docs[0]) {
    console.log(
      `↻ couverture trouvée par approximation : ${like.docs[0].filename}`,
    );
    return like.docs[0].id;
  }
  console.warn(
    `⚠ couverture ${COVER_FILENAME} introuvable dans Médias — article publié sans cover.`,
  );
  return undefined;
}

async function main(): Promise<void> {
  const DRY = process.env.SEED_DRY === '1';

  if (DRY) {
    const summary = CONTENT.map((n: any) =>
      n.type === 'heading'
        ? `${n.tag}: ${n.children?.[0]?.text?.slice(0, 60) ?? ''}`
        : n.type === 'table'
          ? `table ${n.children.length}×${n.children[0]?.children.length}`
          : n.type === 'list'
            ? `${n.listType}-list (${n.children.length})`
            : n.type === 'quote'
              ? 'quote'
              : `p (${(n.children ?? []).map((c: any) => c.text ?? '').join('').length} car.)`,
    );
    console.log('— Structure du corps —');
    summary.forEach((s: string, i: number) =>
      console.log(String(i + 1).padStart(2), s),
    );
    const words = CONTENT.flatMap((n: any) => n.children ?? [])
      .map((c: any) => c.text ?? '')
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    console.log(
      `\n✅ DRY — ${CONTENT.length} blocs, ~${words} mots (~${Math.round(words / 220)} min), excerpt ${EXCERPT.length} car.`,
    );
    process.exit(0);
  }

  const payload = await getPayload({ config });
  const cover = await findCover(payload);

  const data: Record<string, unknown> = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    summary: SUMMARY_POINTS.map((point) => ({ point })),
    content: root(CONTENT),
    sources: SOURCES,
    category: 'souverainete',
    keywords: KEYWORDS.map((keyword) => ({ keyword })),
    author: 'OpenLab Consulting',
    cover,
    publishedAt: new Date().toISOString(),
    _status: 'published',
  };

  const existing = await payload.find({
    collection: 'articles',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: 'articles',
      id: existing.docs[0].id,
      data,
    });
    console.log(`↻ article mis à jour : ${SLUG}`);
  } else {
    await payload.create({ collection: 'articles', data });
    console.log(`＋ article créé : ${SLUG}`);
  }

  console.log(
    `✅ Article publié — ${CONTENT.length} blocs, cover=${cover ?? 'aucune'}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article adoption échoué :', err);
  process.exit(1);
});
