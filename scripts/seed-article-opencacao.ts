/* eslint-disable */
/**
 * Seed de l'article « OpenCacao : une IA souveraine ivoirienne du cacao »
 * dans la collection `articles` Payload.
 *
 * Contenu issu de docs/seo/article-opencacao-draft.md (cadrage « annonce
 * honnête » validé : démonstration souveraine fonctionnelle, amélioration
 * continue SUPERVISÉE, pas de « premier/produit/auto-apprentissage »).
 * Les sections méta/flash/À-CONFIRMER du brouillon sont exclues ; placeholders
 * résolus (date → « juin 2026 », livre → /livres-blancs/donnez-la-parole-a-vos-donnees).
 *
 * Le slug est aligné sur le lien du bandeau d'annonce (cf. global
 * announcement-banner). Idempotent (find→update|create).
 *
 * Usage local :   pnpm cms:seed:article:opencacao
 * DRY (sans DB) : SEED_DRY=1 pnpm cms:seed:article:opencacao
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const SLUG = 'opencacao-ia-souveraine-cacao-cote-divoire';
const TITLE = 'OpenCacao : une IA souveraine ivoirienne du cacao';
const EXCERPT =
  'OpenLab Consulting met en ligne OpenCacao, une IA souveraine du cacao conçue et hébergée en Côte d’Ivoire. La preuve par l’exemple.';
const CATEGORY = 'souverainete';
const AUTHOR = 'OpenLab Consulting';
// Couverture de l'article : nom de fichier du média à relier. On ne ré-uploade
// PAS l'image (le mode SQL ne peut pas pousser de binaire ; en Local API le
// média est déjà déposé via l'admin ou `cms:seed:covers`). On retrouve le média
// existant par son `filename` et on pose juste la relation `cover`. NULL-safe :
// si le média est absent, l'article est seedé sans couverture (pas d'échec).
const COVER_FILENAME = 'opencacao-cover.png';

const SUMMARY_POINTS = [
  'OpenLab Consulting met en ligne OpenCacao : une IA de conseil agronomique sur le cacao, conçue, entraînée et hébergée en Côte d’Ivoire — souveraine de bout en bout.',
  'Pendant que l’État annonce 1 milliard $ sur 30 ans pour une IA souveraine du cacao, une équipe privée ivoirienne en livre déjà une démonstration fonctionnelle, aujourd’hui, en ligne.',
  'Et ce n’est qu’un début : la méthode est réplicable à tout secteur, public comme privé. Elle est documentée dans le livre « Donnez la parole à vos données ».',
];

const KEYWORDS = [
  'OpenCacao',
  'IA souveraine cacao',
  'intelligence artificielle Côte d’Ivoire',
  'souveraineté numérique Afrique',
  'IA souveraine Afrique francophone',
  'fine-tuning LoRA',
  'Ministral 8B',
  'Stratégie Nationale IA 2030',
];

const SOURCES = [
  {
    label:
      'Gouvernement ivoirien — ambition IA souveraine, cacao « au cœur du code source » (mai 2026)',
    url: 'https://www.primature.ci/actualite/intelligence-artificielle-ia-la-cote-divoire-veut-se-hisser-au-rang-des-leaders-en-afrique',
  },
  {
    label:
      'Afrimag — « L’or brun passe à l’heure algorithmique » : la Côte d’Ivoire lance sa propre IA',
    url: 'https://afrimag.net/souverainete-numerique-lor-brun-passe-a-lheure-algorithmique-la-cote-divoire-lance-sa-propre-ia/',
  },
  {
    label: 'Stratégie Nationale IA Côte d’Ivoire 2030 (> 1 000 Md FCFA)',
    url: 'https://telecom.gouv.ci/new/uploads/publications/174196670372.pdf',
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
const linkNode = (url: string, children: any[]) => ({
  type: 'link',
  fields: {
    linkType: 'custom',
    newTab: url.startsWith('http'),
    url,
  },
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 3,
});

// Mini-parseur inline : **gras**, _italique_, [texte](url).
function inline(str: string): any[] {
  const nodes: any[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|_([^_]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(str))) {
    if (m.index > last) nodes.push(text(str.slice(last, m.index)));
    if (m[1] !== undefined) nodes.push(linkNode(m[2] ?? '', [text(m[1])]));
    else if (m[3] !== undefined) nodes.push(text(m[3], BOLD));
    else if (m[4] !== undefined) nodes.push(text(m[4], ITALIC));
    last = re.lastIndex;
  }
  if (last < str.length) nodes.push(text(str.slice(last)));
  return nodes.length ? nodes : [text('')];
}

const para = (s: string) => ({
  type: 'paragraph',
  children: inline(s),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  textFormat: 0,
});
const h2 = (s: string) => ({
  type: 'heading',
  tag: 'h2',
  children: inline(s),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});
const list = (type: 'bullet' | 'number', items: string[]) => ({
  type: 'list',
  listType: type,
  start: 1,
  tag: type === 'bullet' ? 'ul' : 'ol',
  children: items.map((s, i) => ({
    type: 'listitem',
    value: i + 1,
    children: inline(s),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
});

// ── Corps de l'article ──────────────────────────────────────────
const CONTENT: any[] = [
  para(
    'Abidjan — juin 2026. La Côte d’Ivoire est le premier producteur mondial de cacao. Elle a désormais une **intelligence artificielle du cacao conçue chez elle**. OpenLab Consulting met en ligne **OpenCacao**, un assistant de conseil agronomique entraîné sur la filière, accessible sur **opencacao.openlabconsulting.com**.',
  ),
  para(
    'Ce n’est pas un chatbot branché sur une IA étrangère. C’est un modèle **pensé, affiné et hébergé en Côte d’Ivoire**, sur des données ivoiriennes, sans dépendance à un service propriétaire externe.',
  ),

  h2('L’État annonce, OpenLab livre'),
  para(
    'En mai 2026, le gouvernement ivoirien a posé une ambition forte : une **IA souveraine avec le cacao « au cœur du code source »**, soutenue par un plan d’investissement évoqué à **1 milliard de dollars sur 30 ans**. Une vision juste — et un horizon long.',
  ),
  para(
    'OpenLab Consulting prend cette ambition au mot et la rend **tangible, maintenant** : OpenCacao est une **démonstration technique fonctionnelle**, en ligne, qui prouve qu’une équipe ivoirienne peut produire, avec des moyens modestes, une IA souveraine et utile. Pas un communiqué : une URL qui répond.',
  ),

  h2('Ce qu’est OpenCacao, exactement'),
  para('Soyons précis (le projet est ouvert, code et méthode documentés) :'),
  list('bullet', [
    '**Modèle de base** : **Ministral 3 8B Instruct** (modèle ouvert de Mistral, licence Apache 2.0), choisi pour sa qualité et sa souveraineté d’usage.',
    '**Spécialisation** : **fine-tuning LoRA 4-bit** sur un corpus de la filière cacao ivoirienne, bâti à partir de sources de référence (CNRA, ANADER, Conseil du Café-Cacao, FAO).',
    '**Exécution** : servi via **vLLM** (GPU) ou **llama.cpp** (CPU, format GGUF quantifié) — entièrement sur **infrastructure contrôlée** (cluster souverain), aucune fuite vers un cloud étranger.',
    '**Service** : une **API maîtrisée** (FastAPI) avec **garde-fous métier** et un **cache** (Redis) pour des réponses rapides et un coût contenu.',
  ]),
  para(
    'C’est ça, la souveraineté concrète : un modèle ouvert, des données locales, une infrastructure maîtrisée.',
  ),

  h2('Honnête sur ce que ça fait — et ne fait pas'),
  para(
    'OpenCacao est un **outil d’aide à la décision**. Il **ne remplace pas** l’agronome, l’encadrement de terrain de l’ANADER, ni les recommandations officielles du Conseil du Café-Cacao — et il le dit lui-même dans chaque réponse. Il refuse, par conception, de donner des dosages de produits phytosanitaires et renvoie vers l’agent local.',
  ),
  para(
    'C’est un choix assumé : une IA utile est une IA qui **connaît ses limites** et cite ses sources. Pas une boîte noire qui sur-promet.',
  ),

  h2('Une IA qui s’améliore — sous contrôle humain'),
  para(
    'OpenCacao **s’améliore en continu à partir de son usage réel** : les questions de terrain nourrissent son corpus. Mais — et c’est décisif — **chaque apprentissage passe par une validation humaine** (relecteur agronome de référence) avant d’entrer dans le modèle.',
  ),
  para(
    'Amélioration continue, jamais en roue libre. C’est ce qui la rend à la fois **plus pertinente avec le temps**, **sûre** et **souveraine** : ni dérive, ni fuite, ni dépendance.',
  ),

  h2('Pourquoi la souveraineté change tout'),
  para(
    'Confier ses données métier à une IA hébergée à l’étranger, c’est trois renoncements : la **conformité** (loi ivoirienne 2013-450, RGPD), le **contrôle** (vos données entraînent le modèle d’un autre) et la **valeur** (captée ailleurs). Une IA souveraine garde les trois sur le continent. Ce n’est pas un slogan : c’est de la gestion de risque sur l’actif le plus précieux d’une organisation — ses données.',
  ),
  para(
    'Le moment est porteur : le marché de l’IA en Afrique passerait de **4,5 à 16,5 milliards de dollars entre 2025 et 2030** (Mastercard / Statista), et l’IA générative pourrait y créer **61 à 103 milliards de dollars de valeur par an** (McKinsey). La Côte d’Ivoire a son cadre : la **Stratégie Nationale IA 2030** (plus de 1 000 milliards FCFA).',
  ),

  h2('Un livre pour passer à l’échelle : « Donnez la parole à vos données »'),
  para(
    'OpenLab Consulting n’est pas qu’un cabinet : c’est un **cabinet-éditeur**. OpenCacao s’accompagne du livre [« Donnez la parole à vos données »](/livres-blancs/donnez-la-parole-a-vos-donnees).',
  ),
  para(
    'Le titre dit tout. Vos données — agricoles, financières, administratives, sanitaires — ont une voix. Le livre explique **comment la leur donner** : transformer un patrimoine de données en une IA verticale, souveraine, au service d’un métier. OpenCacao en est l’illustration grandeur nature.',
  ),

  h2('La brèche : si on l’a fait pour le cacao, on le fait pour vous'),
  para(
    'Voici le vrai message. **OpenCacao est une preuve, pas une exception.**',
  ),
  para(
    'La méthode — partir des données d’un domaine, affiner un modèle ouvert, l’héberger en local, l’encadrer de garde-fous — n’a rien de réservé au cacao. Elle vaut pour l’anacarde, le coton, l’hévéa. Pour la banque, l’assurance, la santé. Pour les télécoms, l’énergie. Pour une administration, un ministère, une collectivité.',
  ),
  para(
    'Toute organisation — **privée comme publique** — qui veut s’inscrire résolument dans une démarche de souveraineté peut avoir **sa propre IA verticale**, sur ses propres données, sous son propre contrôle.',
  ),
  para(
    'Si l’on sait le faire pour la filière la plus stratégique du pays, on sait le faire pour la vôtre.',
  ),

  h2('De vos documents à votre IA : la méthode en 3 temps'),
  para(
    'C’est précisément ce que documente le livre « Donnez la parole à vos données ». La démarche est claire et reproductible :',
  ),
  list('number', [
    '**Rassembler vos documents.** Récupération automatique ou dépôt de fichiers — pages web (HTML), textes, PDF, notes internes. Toutes vos sources, dans tous les formats.',
    '**Constituer le corpus.** Le savoir métier est nettoyé, structuré et indexé (RAG) — pour que rien ne se perde et que tout soit retrouvable.',
    '**Affiner le modèle.** Un **fine-tuning** (LoRA) spécialise un modèle ouvert sur _votre_ corpus. Résultat : une IA verticale, qui parle votre métier, hébergée chez vous.',
  ]),
  para(
    'Trois étapes. Vos données entrent ; votre IA souveraine sort. C’est la méthode qui a donné OpenCacao — et qui peut donner la vôtre.',
  ),

  h2('Conclusion'),
  para(
    'La souveraineté numérique africaine n’est plus un colloque. C’est une IA qui répond, aujourd’hui, sur opencacao.openlabconsulting.com — conçue à Abidjan, entraînée sur des données ivoiriennes, hébergée en local.',
  ),
  para(
    'Cette fois, l’Afrique n’a plus d’excuse. Et votre organisation non plus.',
  ),
  para(
    '**→ Donner la parole à VOS données :** [audit IA gratuit](/audit-ia) · [nous contacter](/contact)',
  ),
];

// Mode « émission SQL » (SEED_SQL=1) : génère le SQL d'insertion SANS DB ni
// secret, pour exécution via psql in-cluster (le seul canal prod autorisé —
// les secrets ne sortent jamais du cluster). Le public lit la table `articles`
// (filtre _status='published') : ligne principale + sous-tables array suffisent.
function emitSql(): string {
  const crypto = require('node:crypto') as typeof import('node:crypto');
  const q = (s: string) => `$q$${s}$q$`;
  const hex = () => crypto.randomBytes(12).toString('hex');
  const contentJson = JSON.stringify(root(CONTENT));
  const sumVals = SUMMARY_POINTS.map(
    (p, i) => `(${q(hex())},${i + 1},${q(p)})`,
  ).join(',\n      ');
  const kwVals = KEYWORDS.map((k, i) => `(${q(hex())},${i + 1},${q(k)})`).join(
    ',\n      ',
  );
  const srcVals = SOURCES.map(
    (s, i) => `(${q(hex())},${i + 1},${q(s.label)},${q(s.url)})`,
  ).join(',\n      ');
  return `BEGIN;
DELETE FROM articles WHERE slug = ${q(SLUG)};
WITH cov AS (
  -- Couverture : on relie un média déjà présent (retrouvé par filename). 0 ligne
  -- si absent → (SELECT cover_id FROM cov) vaut NULL (scalaire sans ligne) →
  -- article seedé sans couverture, jamais d'échec.
  SELECT id AS cover_id FROM media WHERE filename = ${q(COVER_FILENAME)} ORDER BY id LIMIT 1
),
art AS (
  INSERT INTO articles
    (title, slug, excerpt, content, category, author, published_at, updated_at, created_at, _status, cover_id)
  VALUES
    (${q(TITLE)}, ${q(SLUG)}, ${q(EXCERPT)}, $j$${contentJson}$j$::jsonb,
     'souverainete', ${q(AUTHOR)}, now(), now(), now(), 'published', (SELECT cover_id FROM cov))
  RETURNING id, title, slug, excerpt, content, category, author, published_at, created_at, updated_at, _status, cover_id
),
ver AS (
  -- Collection en mode drafts : l'admin liste depuis _articles_v. Sans cette
  -- ligne « latest », l'article est public mais INVISIBLE dans l'admin. On y
  -- clone aussi la couverture (version_cover_id) pour cohérence avec l'admin.
  INSERT INTO _articles_v
    (parent_id, version_title, version_slug, version_excerpt, version_content,
     version_category, version_author, version_published_at, version_created_at,
     version_updated_at, version__status, created_at, updated_at, latest, version_cover_id)
  SELECT id, title, slug, excerpt, content,
     category::text::enum__articles_v_version_category, author, published_at, created_at,
     updated_at, _status::text::enum__articles_v_version_status, now(), now(), true, cover_id
  FROM art
  RETURNING 1
),
s AS (
  INSERT INTO articles_summary (id,_order,_parent_id,point)
  SELECT v.id, v.ord, art.id, v.point
  FROM art, (VALUES
      ${sumVals}
    ) AS v(id,ord,point)
  RETURNING 1
),
k AS (
  INSERT INTO articles_keywords (id,_order,_parent_id,keyword)
  SELECT v.id, v.ord, art.id, v.kw
  FROM art, (VALUES
      ${kwVals}
    ) AS v(id,ord,kw)
  RETURNING 1
),
src AS (
  INSERT INTO articles_sources (id,_order,_parent_id,label,url)
  SELECT v.id, v.ord, art.id, v.label, v.url
  FROM art, (VALUES
      ${srcVals}
    ) AS v(id,ord,label,url)
  RETURNING 1
)
SELECT (SELECT id FROM art) AS article_id,
       (SELECT count(*) FROM ver) AS version_row,
       (SELECT count(*) FROM s) AS summary,
       (SELECT count(*) FROM k) AS keywords,
       (SELECT count(*) FROM src) AS sources;
COMMIT;`;
}

async function main(): Promise<void> {
  if (process.env.SEED_SQL === '1') {
    process.stdout.write(emitSql());
    process.exit(0);
  }
  const DRY = process.env.SEED_DRY === '1';
  const payload = DRY ? null : await getPayload({ config });

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
    publishedAt: new Date().toISOString(),
    _status: 'published',
  };

  if (DRY) {
    console.log('— Structure du corps —');
    CONTENT.forEach((n: any, i: number) => {
      const label =
        n.type === 'heading'
          ? `${n.tag}: ${(n.children ?? [])
              .map((c: any) => c.text ?? '')
              .join('')
              .slice(0, 64)}`
          : n.type === 'list'
            ? `${n.listType} list (${n.children.length} items)`
            : `p (${(n.children ?? []).map((c: any) => c.text ?? '').join('').length} car.)`;
      console.log(String(i + 1).padStart(2), label);
    });
    console.log(
      `\n✅ DRY — ${CONTENT.length} blocs · ${SUMMARY_POINTS.length} points clés · ${SOURCES.length} sources.`,
    );
    process.exit(0);
  }

  // Relie la couverture si le média a déjà été déposé (admin ou
  // `cms:seed:covers`). Absent → on n'ajoute pas le champ (pas d'échec).
  const { docs: covers } = await payload!.find({
    collection: 'media',
    where: { filename: { equals: COVER_FILENAME } },
    limit: 1,
    depth: 0,
  });
  if (covers[0]?.id != null) data.cover = covers[0].id;

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
  console.log(`✅ Article seedé — ${CONTENT.length} blocs.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article échoué :', err);
  process.exit(1);
});
