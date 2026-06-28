/* eslint-disable */
/**
 * Seed de l'article « SentinelBTP : voir le danger avant l'effondrement »
 * dans la collection `articles` Payload, à partir du HTML source
 * `docs/images/article_sentinelbtp.html`.
 *
 * Décliné de `seed-article-ia-souveraine.ts` (même convertisseur HTML →
 * Lexical). Cible une niche à concurrence quasi nulle : IA prédictive + IoT
 * pour la sécurité structurelle des bâtiments (SHM) en Côte d'Ivoire.
 *
 * Mode DRY (SEED_DRY=1) : parse + construit le Lexical SANS DB, imprime la
 * structure. Lien interne ajouté vers la page produit /solutions/sentinelbtp.
 *
 * Usage local :   pnpm cms:seed:article:sentinelbtp
 * DRY :           SEED_DRY=1 pnpm cms:seed:article:sentinelbtp
 */
import { getPayload } from 'payload';
import { readFileSync } from 'node:fs';
// @ts-expect-error — jsdom : dépendance de test, parse le HTML source.
import { JSDOM } from 'jsdom';
import config from '../payload.config';

const SRC_HTML = 'docs/images/article_sentinelbtp.html';

const SLUG = 'sentinelbtp-ia-securite-batiments-cote-divoire';
const TITLE =
  'SentinelBTP : voir le danger avant l’effondrement, l’IA au service de la sécurité des bâtiments en Côte d’Ivoire';
const EXCERPT =
  'À Abidjan, un immeuble qui s’effondre a presque toujours prévenu. Comment l’IA prédictive et l’IoT transforment la sécurité des bâtiments, d’une posture réactive et tardive à une anticipation mesurable.';
const SUMMARY_POINTS = [
  'En 2024, la presse et les secours ivoiriens ont recensé une quinzaine d’effondrements majeurs à Abidjan et dans le pays, un risque récurrent, documenté et pourtant évitable.',
  'Le marché du Structural Health Monitoring (SHM) est mature (≈ 10,5 Md$ visés en 2030) : ce qui manque en Afrique n’est pas la technologie, mais son accessibilité et sa localisation.',
  'SentinelBTP combine capteurs edge, IA sur séries temporelles et dossier de preuve opposable (article 37) pour anticiper ≥ 72 h avant le seuil de danger, du réactif au préventif.',
];
const KEYWORDS = [
  'SentinelBTP',
  'sécurité des bâtiments Côte d’Ivoire',
  'surveillance structurelle',
  'Structural Health Monitoring',
  'effondrement immeuble Abidjan',
  'IA prédictive BTP',
  'IoT bâtiment',
  'SNIA 2030',
];
const CATEGORY = 'etude-de-cas';
const AUTHOR = 'OpenLab Consulting';
// Lien interne SEO vers la page produit (anti cul-de-sac + maillage).
const CTA_PARAGRAPH =
  'SentinelBTP est l’une des huit solutions propriétaires d’OpenLab Consulting. Découvrez la plateforme de surveillance structurelle sur /solutions/sentinelbtp.';

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

function inlineNodes(el: any, format = 0): any[] {
  const out: any[] = [];
  for (const n of el.childNodes) {
    if (n.nodeType === 3) {
      const t = n.textContent.replace(/\s+/g, ' ');
      if (t) out.push(text(t, format));
    } else if (n.nodeType === 1) {
      const tag = n.tagName.toLowerCase();
      const f =
        tag === 'strong' || tag === 'b'
          ? format | BOLD
          : tag === 'em' || tag === 'i'
            ? format | ITALIC
            : format;
      out.push(...inlineNodes(n, f));
    }
  }
  return out.length ? out : [text('')];
}

async function main(): Promise<void> {
  const DRY = process.env.SEED_DRY === '1';
  const payload = DRY ? null : await getPayload({ config });

  const dom = new JSDOM(readFileSync(SRC_HTML, 'utf8'));
  const doc = dom.window.document;

  const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'blockquote']);
  const blocks: any[] = [];
  const collect = (el: any) => {
    for (const c of el.children) {
      const tag = c.tagName.toLowerCase();
      if (BLOCK.has(tag)) blocks.push(c);
      else if (c.children.length) collect(c);
    }
  };
  collect(doc.body);

  const content: any[] = [];
  let skippedDek = false;
  for (const b of blocks) {
    const tag = b.tagName.toLowerCase();
    const txt = b.textContent.replace(/\s+/g, ' ').trim();
    if (tag === 'h1') continue; // → champ title
    if (!txt) continue; // ignore blocs vides (encarts décoratifs vidés)
    if (tag === 'p' && !skippedDek) {
      skippedDek = true;
      continue; // dek → excerpt
    }
    if (tag === 'p') content.push(para(inlineNodes(b)));
    else if (/^h[2-4]$/.test(tag)) content.push(heading(tag, inlineNodes(b)));
    else if (tag === 'blockquote') content.push(quote(inlineNodes(b)));
  }

  // Maillage interne : CTA final vers la page produit.
  content.push(para([text(CTA_PARAGRAPH)]));

  const data: Record<string, unknown> = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    summary: SUMMARY_POINTS.map((point) => ({ point })),
    content: root(content),
    category: CATEGORY,
    keywords: KEYWORDS.map((keyword) => ({ keyword })),
    author: AUTHOR,
    publishedAt: new Date().toISOString(),
    _status: 'published',
  };

  if (DRY) {
    console.log('— Structure du corps —');
    content.forEach((n: any, i: number) => {
      const label =
        n.type === 'heading'
          ? `${n.tag}: ${(n.children ?? [])
              .map((c: any) => c.text ?? '')
              .join('')
              .slice(0, 70)}`
          : n.type === 'quote'
            ? 'quote'
            : `p (${(n.children ?? []).map((c: any) => c.text ?? '').join('').length} car.)`;
      console.log(String(i + 1).padStart(2), label);
    });
    console.log(
      `\n✅ DRY — ${content.length} blocs · excerpt ${EXCERPT.length} car. · ${SUMMARY_POINTS.length} points clés.`,
    );
    process.exit(0);
  }

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
  console.log(`✅ Article seedé — ${content.length} blocs.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article échoué :', err);
  process.exit(1);
});
