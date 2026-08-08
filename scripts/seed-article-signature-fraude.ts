/* eslint-disable */
/**
 * Seed de l'article « La signature qui n'engageait personne » dans la
 * collection `articles` Payload.
 *
 * Source rédactionnelle : `docs/article-signature-qui-n-engageait-personne.md`
 * (le corps est reproduit ici en nœuds Lexical, comme pour les autres seeds
 * d'articles : le markdown reste la copie de travail, la base fait foi).
 *
 * ⚠ L'article est créé en **brouillon** (`_status: 'draft'`). Il n'apparaît
 * ni sur /insights ni dans le sitemap tant qu'un rédacteur en chef ne l'a pas
 * publié depuis l'admin. Prévisualisation : bouton « Aperçu » de la fiche.
 *
 * Un article déjà publié n'est jamais redescendu en brouillon par ce script :
 * on ne réécrit alors que le contenu, sans toucher au statut.
 *
 * Usage local :   pnpm cms:seed:article:signature-fraude
 * DRY (sans DB) : SEED_DRY=1 pnpm cms:seed:article:signature-fraude
 */
import { getPayload } from 'payload';
import { existsSync } from 'node:fs';
import path from 'node:path';
import config from '../payload.config';

/**
 * ⚠ Exécution contre la base de PRODUCTION : imposer `NODE_ENV=production`.
 * Sans cela, l'adaptateur Postgres de Payload aligne le schéma sur la config
 * du checkout courant (push Drizzle) et propose de supprimer les tables
 * absentes de la branche locale. Un script de seed ne doit jamais toucher au
 * schéma : les migrations s'en chargent.
 */

const SLUG = 'signature-qui-n-engageait-personne';
const COVER_FILE = 'DGI.png';
const COVER_PATH = path.resolve(process.cwd(), 'docs/images', COVER_FILE);
const COVER_ALT =
  'Direction générale des Impôts : la traçabilité des actes financiers numériques';
const TITLE = 'La signature qui n’engageait personne';
const EXCERPT =
  'Un acte administratif numérique qui n’identifie pas son auteur n’est pas un acte : c’est une rumeur avec un logo. Analyse neutre d’une défaillance d’architecture, et de ce que l’IA sait réellement anticiper.';
const SUMMARY_POINTS = [
  'Le chiffre qui compte n’est pas le montant du préjudice, c’est le délai : cinq mois de détection, soit mieux que la médiane mondiale de 12 mois mesurée par l’ACFE sur 1 921 cas dans 138 pays.',
  'Une surveillance automatisée des données ramène ce délai à six mois environ, contre jusqu’à 24 mois pour une détection passive. À perte mensuelle constante, le délai est le préjudice.',
  'Le contrôle de légalité doit rester déterministe et opposable : le score probabiliste oriente l’attention d’un inspecteur, il ne produit jamais un acte.',
  'OpenLab Consulting construit dans cet ordre : couche de confiance, contrôle déterministe de conformité, puis détection intelligente. Fraud Shield couvre le maillon documentaire.',
];
const KEYWORDS = [
  'détection de fraude',
  'contrôle interne',
  'signature électronique',
  'intelligence artificielle',
  'fraude documentaire',
  'administration fiscale',
  'GovTech Côte d’Ivoire',
  'piste d’audit',
];
const CATEGORY = 'cybersecurite';
const AUTHOR = 'Waopron Coulibaly, Directeur technique, OpenLab Consulting';

const SOURCES = [
  {
    label:
      'ACFE, Occupational Fraud 2024: A Report to the Nations (1 921 cas, 138 pays)',
    url: 'https://www.acfe.com/-/media/files/acfe/pdfs/rttn/2024/2024-report-to-the-nations.pdf',
  },
  {
    label:
      'Commonwealth Fraud Prevention Centre, délais de détection par méthode active et passive',
    url: 'https://www.counterfraud.gov.au/news/general-news/digest-occupational-fraud-report-2024',
  },
  {
    label:
      'U.S. Treasury, prévention et recouvrement des paiements indus, exercice 2024',
    url: 'https://www.nextgov.com/artificial-intelligence/2024/10/ai-tools-helped-treasury-recover-billions-fraud-and-improper-payments/400368/',
  },
  {
    label: 'DGFiP, rapport d’activité 2024, résultats du contrôle fiscal',
    url: 'https://www.epsa.com/fr/actualite/controle-fiscal-ce-quil-faut-retenir-du-rapport-dactivite-2024-de-la-dgfip/',
  },
  {
    label: 'Google Cloud, AML AI et résultats communiqués par HSBC',
    url: 'https://www.googlecloudpresscorner.com/2023-06-21-Google-Cloud-Launches-AI-Powered-Anti-Money-Laundering-Product-for-Financial-Institutions',
  },
  {
    label:
      'Danske Bank et Teradata, moteur de détection de fraude en temps réel',
    url: 'https://www.prnewswire.com/news-releases/danske-bank-and-teradata-implement-artificial-intelligence-ai-engine-that-monitors-fraud-in-real-time-300540944.html',
  },
  {
    label: 'Mastercard, Decision Intelligence Pro, mai 2024',
    url: 'https://www.mastercard.com/us/en/news-and-trends/press/2024/may/mastercard-accelerates-card-fraud-detection-with-generative-ai-technology.html',
  },
  {
    label: 'Robodebt, commission royale d’enquête et règlements',
    url: 'https://www.tandfonline.com/doi/full/10.1080/10361146.2025.2549868',
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
const listItem = (value: number, children: any[]) => ({
  type: 'listitem',
  value,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const list = (ordered: boolean, items: any[]) => ({
  type: 'list',
  listType: ordered ? 'number' : 'bullet',
  start: 1,
  tag: ordered ? 'ol' : 'ul',
  children: items,
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
const q = (s: string) => quote(inline(s));
const ol = (items: string[]) =>
  list(
    true,
    items.map((item, i) => listItem(i + 1, inline(item))),
  );
const trow = (cells: string[], header = false) =>
  row(cells.map((c) => cell(header, [para(inline(c))])));

// ── Corps de l'article ──────────────────────────────────────────
const CONTENT: any[] = [
  q(
    'Un acte administratif numérique qui n’identifie pas son auteur avec certitude n’est pas un acte. C’est une rumeur avec un logo.',
  ),

  h2('Les faits, sobrement'),
  p(
    'Un dossier portant sur un préjudice supérieur à 39 milliards de francs CFA, lié à des dégrèvements et exonérations jugés irréguliers, a été porté devant la justice ivoirienne en juillet 2026. Les éléments publics évoquent l’usurpation d’une signature électronique.',
  ),
  p(
    'Ce texte ne traite pas de ce dossier : l’instruction est en cours, la présomption d’innocence s’applique, et nous ne disposons d’aucune pièce. Aucune personne, aucune institution n’est mise en cause ici. Il pose une question d’ingénierie, valable dans des dizaines d’organisations publiques et privées : **comment un système conçu pour sécuriser des flux financiers peut-il laisser émettre des actes dont l’auteur réel n’est pas identifiable ?**',
  ),

  h2('Le chiffre qui compte n’est pas 39 milliards'),
  p(
    'Le montant occupe les conversations. Le chiffre instructif est ailleurs : **cinq mois** entre le premier constat interne et la saisine judiciaire. Et ce constat est déjà tardif : les traces existaient dans les journaux applicatifs dès le premier acte. Personne ne les regardait.',
  ),
  p(
    'Voici ce qui devrait déranger : **cinq mois, c’est mieux que la moyenne mondiale.**',
  ),
  p(
    'L’Association of Certified Fraud Examiners documente 1 921 cas réels de fraude professionnelle dans 138 pays. La fraude type court **12 mois** avant d’être découverte, et **43 %** des cas sont mis au jour par une dénonciation, loin devant toute méthode technique. Surtout, la même étude donne la variable qui déplace tout : détectée par une **méthode active**, c’est-à-dire une surveillance automatisée des données et des transactions, une fraude est découverte en **six mois environ**. Détectée passivement, par hasard ou par aveu, elle peut courir jusqu’à **24 mois**.',
  ),
  p(
    'Un rapport de un à quatre. Ce n’est pas une nuance méthodologique, c’est un budget.',
  ),
  p(
    'C’est la marque d’un contrôle **périodique et déclaratif**, conçu pour un monde de papier où la fraude était limitée par la vitesse d’écriture d’un agent. Dans un système intégré où un acte se génère en quatre clics, il est obsolète.',
  ),
  p(
    'La question n’est donc pas « pourquoi n’a-t-on pas vu ? » mais « **qu’est-ce qui, dans l’architecture, rendait le fait de voir impossible en temps réel ?** »',
  ),

  h2('Ce que « usurpation de signature » veut dire'),
  p(
    'La formule évoque une prouesse cryptographique. C’est presque certainement faux, et cela change le remède.',
  ),
  p(
    'Trois scénarios l’expliquent, par vraisemblance décroissante. **Le compte plutôt que la clé** : des identifiants porteurs du pouvoir d’engagement utilisés par un tiers, la signature n’étant qu’un attribut de session applicative. **La délégation sans traçabilité** : le droit de valider *au nom de*, sans que le système distingue le délégataire du délégant. **Le contournement du workflow** : l’acte créé en amont de l’écran de validation, la signature apposée mécaniquement par la génération documentaire.',
  ),
  p(
    'Les trois convergent vers un même diagnostic. **La signature n’était pas liée cryptographiquement à une personne physique détenant sa propre clé.** Si elle l’avait été, l’usurpation aurait supposé un vol physique et une contrainte sur une personne identifiée. L’enquête n’aurait pas eu besoin de trois mois d’analyse informatique : elle aurait eu un nom en trois heures.',
  ),

  h2('Ce que l’intelligence artificielle change'),
  p('Commençons par ce qu’elle ne doit pas faire.'),
  p(
    '**L’IA n’a rien à faire dans la vérification de conformité juridique.** Un dégrèvement est légal ou il ne l’est pas ; les conditions figurent dans le Code général des Impôts. Cette vérification doit rester **déterministe, explicite, auditable ligne à ligne**, parce qu’un score probabiliste n’est pas opposable devant un juge. L’Australie l’a appris avec Robodebt : dispositif déclaré illégal, plusieurs milliards de réparations.',
  ),
  p(
    '**L’IA ne détecte pas une fraude que personne n’a le pouvoir de sanctionner.** Si l’alerte remonte à l’autorité incluse dans le périmètre audité, l’outil est neutralisé dès sa mise en production. La valeur d’un dispositif tient à l’indépendance du destinataire de l’alerte.',
  ),
  p(
    'Reste ce que l’IA fait mieux que quiconque : **trouver ce que personne ne cherche.** Ce n’est plus une promesse, c’est mesuré.',
  ),
  table([
    trow(['Organisation', 'Résultat publié'], true),
    trow([
      'Trésor américain',
      '652,7 M$ recouvrés en 2023, **plus de 4 Md$** en 2024',
    ]),
    trow([
      'DGFiP (France)',
      '**56 %** des contrôles fiscaux professionnels 2024 ciblés par IA',
    ]),
    trow([
      'HSBC',
      '**2 à 4 fois plus** de risque avéré, **60 % d’alertes en moins**',
    ]),
    trow(['Danske Bank', '1 200 faux positifs par jour réduits de **60 %**']),
    trow(['Mastercard', 'Décision rendue en **50 millisecondes**']),
  ]),
  p('Deux enseignements comptent plus que la technologie.'),
  p(
    '**Le gain vient de l’exhaustivité, pas de la finesse du modèle.** Ces organisations sont passées d’un contrôle sur échantillon a posteriori à une notation de chaque acte à son émission : montant atypique pour le segment, concentration inhabituelle d’un agent sur un portefeuille, fractionnement contournant un seuil. Et surtout l’**analyse de graphe** : la fraude interne n’est presque jamais l’affaire d’un individu, elle est l’affaire d’une relation.',
  ),
  p(
    '**La baisse des fausses alertes compte autant que la hausse de la détection.** Un dispositif qui noie ses contrôleurs sous les fausses pistes ne détecte rien. Les 60 % d’alertes en moins chez HSBC, ce sont aussi des dossiers honnêtes qui cessent d’être bloqués : un contrôle continu ne ralentit pas l’organisation, il l’accélère. Moins de fraude **et** moins de délai. C’est le seul récit qui fait accepter un tel projet de l’intérieur.',
  ),

  h2('Sept questions à poser à votre système d’information'),
  p(
    'Cette grille se répond en une journée. Elle vaut un audit de trois mois :',
  ),
  ol([
    'Nos signatures sur actes financiers sont-elles liées à une personne physique, ou est-ce un cachet applicatif institutionnel ?',
    'S’il s’agit d’un cachet : combien de clés existent, et où sont-elles stockées ?',
    'La délégation de signature est-elle modélisée, ou repose-t-elle sur le partage de comptes ?',
    'Les profils à pouvoir d’engagement financier sont-ils protégés par une authentification multifacteur ?',
    'Un seuil de montant déclenche-t-il une validation par un second acteur indépendant ?',
    'Nos journaux d’audit sont-ils inaltérables et répliqués hors du périmètre audité ?',
    'Un acte financier peut-il être émis sans rattachement à sa pièce justificative ?',
  ]),
  p(
    'Si trois de ces sept réponses sont négatives, votre exposition n’est pas hypothétique. Elle est simplement non mesurée.',
  ),

  h2('Notre conviction'),
  p(
    'La dématérialisation a réussi. La seconde étape est différente de nature : elle consiste à **inscrire la règle de droit et la responsabilité individuelle dans l’architecture technique elle-même**. Un système qui numérise un processus sans en numériser les contre-pouvoirs ne fait pas disparaître la fraude : il en augmente le débit.',
  ),
  p(
    'C’est là qu’OpenLab Consulting travaille, et dans cet ordre. La **couche de confiance** d’abord : identité opposable, signature liée à une personne, piste d’audit immuable répliquée hors du périmètre audité. Puis le **contrôle déterministe de conformité**, exécuté avant l’émission de l’acte. Puis seulement la **détection intelligente**, dont la sortie est un rang de priorité et jamais une décision.',
  ),
  p(
    'Sur le maillon des pièces justificatives, notre produit **OpenLab Fraud Shield** est en production : détection de cachet copié-collé, de montant retouché ou de signature reproduite, avec un score d’authenticité et un calque désignant les zones suspectes. Chaque détection s’explique, l’analyse tient sous les deux secondes par document sur processeur seul, et un pilote en banque UEMOA au premier trimestre 2026 a triplé les cas détectés par contrôleur. Le tout en souveraineté, avec des équipes ivoiriennes, jusqu’à l’installation entièrement sur site. Découvrez la plateforme sur /solutions/fraud-shield.',
  ),
  p(
    'Cinq mois d’un côté, cinquante millisecondes de l’autre. Entre les deux, il n’y a pas un mystère technologique. Il y a des décisions d’architecture que quelqu’un doit prendre.',
  ),
];

/**
 * Couverture de l'article. Réutilise le média s'il est déjà en médiathèque,
 * sinon le téléverse depuis `docs/images`. Optionnelle : un fichier absent
 * ne fait pas échouer le seed, l'article part simplement sans image.
 */
async function ensureCover(payload: any): Promise<string | number | undefined> {
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: COVER_FILE } },
    limit: 1,
    depth: 0,
  });
  if (found.docs[0]) {
    console.log(`↻ couverture déjà en médiathèque : ${COVER_FILE}`);
    return found.docs[0].id;
  }

  if (!existsSync(COVER_PATH)) {
    console.warn(`⚠ ${COVER_PATH} introuvable — article sans couverture.`);
    return undefined;
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt: COVER_ALT },
    filePath: COVER_PATH,
  });
  console.log(`＋ couverture téléversée : ${COVER_FILE} (id ${created.id})`);
  return created.id;
}

async function main(): Promise<void> {
  const DRY = process.env.SEED_DRY === '1';

  if (DRY) {
    console.log('— Structure du corps —');
    CONTENT.forEach((n: any, i: number) => {
      const label =
        n.type === 'heading'
          ? `${n.tag}: ${n.children?.[0]?.text?.slice(0, 60) ?? ''}`
          : n.type === 'table'
            ? `table ${n.children.length}×${n.children[0]?.children.length}`
            : n.type === 'list'
              ? `${n.listType}-list (${n.children.length})`
              : n.type === 'quote'
                ? 'quote'
                : `p (${(n.children ?? []).map((c: any) => c.text ?? '').join('').length} car.)`;
      console.log(String(i + 1).padStart(2), label);
    });
    const plain = (nodes: any[]): string =>
      nodes
        .map((n: any) =>
          typeof n?.text === 'string' ? n.text : plain(n?.children ?? []),
        )
        .join(' ');
    const words = plain(CONTENT).split(/\s+/).filter(Boolean).length;
    console.log(
      `\n✅ DRY — ${CONTENT.length} blocs, ~${words} mots (~${Math.max(1, Math.round(words / 200))} min de lecture), excerpt ${EXCERPT.length} car., ${SOURCES.length} sources.`,
    );
    process.exit(0);
  }

  const payload = await getPayload({ config });
  const cover = await ensureCover(payload);

  const data: Record<string, unknown> = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    summary: SUMMARY_POINTS.map((point) => ({ point })),
    content: root(CONTENT),
    sources: SOURCES,
    category: CATEGORY,
    keywords: KEYWORDS.map((keyword) => ({ keyword })),
    author: AUTHOR,
    ...(cover ? { cover } : {}),
  };

  const existing = await payload.find({
    collection: 'articles',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
    // Inclut les brouillons : sans cela, un re-run créerait un doublon
    // (slug unique) au lieu de mettre à jour la version en attente.
    draft: true,
  });

  if (existing.docs[0]) {
    const wasPublished =
      (existing.docs[0] as { _status?: string })._status === 'published';
    await payload.update({
      collection: 'articles',
      id: existing.docs[0].id,
      // Un article déjà publié ne redescend pas en brouillon : on rafraîchit
      // seulement son contenu. Sinon, on reste en brouillon.
      data: wasPublished ? data : { ...data, _status: 'draft' },
      draft: !wasPublished,
    });
    console.log(
      `↻ article mis à jour : ${SLUG} (${wasPublished ? 'publié, statut inchangé' : 'brouillon'})`,
    );
  } else {
    await payload.create({
      collection: 'articles',
      data: { ...data, _status: 'draft' },
      draft: true,
    });
    console.log(`＋ article créé en BROUILLON : ${SLUG}`);
  }

  console.log(
    `✅ Seed terminé — ${CONTENT.length} blocs, ${SOURCES.length} sources. Publication à faire depuis l'admin.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article échoué :', err);
  process.exit(1);
});
