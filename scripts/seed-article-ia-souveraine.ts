/* eslint-disable */
/**
 * Seed de l'article « L'IA souveraine ivoirienne » dans la collection
 * `articles` Payload, à partir du HTML source `docs/images/ia-souveraine-
 * cote-ivoire.html`.
 *
 * - Parse le HTML (jsdom) → nœuds Lexical (titres H2/H3, paragraphes,
 *   listes, TABLEAU, citations) fidèles au texte d'origine.
 * - Uploade les 4 figures (docs/articles/ia-souveraine/fig-N.png) dans
 *   `media` (idempotent par `alt`) et les insère comme nœuds `upload`.
 * - Métadonnées (titre, excerpt, points clés, catégorie, mots-clés)
 *   renseignées explicitement ci-dessous.
 * - Upsert par `slug` ; publié (`_status: 'published'`).
 *
 * Usage local :   pnpm cms:seed:article:ia-souveraine
 * Usage prod :    via tunnel (cf. docs/admin-cms.md / project memory),
 *                 NODE_ENV=production pour ne pas push le schéma.
 */
import { getPayload } from 'payload';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
// @ts-expect-error — jsdom est une dépendance de test sans @types installés ;
// ce script de seed (hors build app) l'utilise pour parser le HTML source.
import { JSDOM } from 'jsdom';
import config from '../payload.config';

const SRC_HTML = 'docs/images/ia-souveraine-cote-ivoire.html';
const FIG_DIR = 'docs/articles/ia-souveraine';

const SLUG = 'ia-souveraine-cote-ivoire';
const TITLE =
  'L’IA souveraine ivoirienne : un cap juste, un chemin à construire';
const EXCERPT =
  'Pourquoi la Côte d’Ivoire ne réussira pas son IA en brûlant les étapes — et comment avancer dès aujourd’hui, méthodiquement.';
const SUMMARY_POINTS = [
  'La Côte d’Ivoire vise plus de 1 000 milliards FCFA d’investissements IA d’ici 2030, mais part de loin : 138ᵉ/193 au Government AI Readiness Index 2023.',
  'Sept verrous freinent l’IA souveraine : énergie, puissance de calcul, datacenters, données, compétences, cadre réglementaire et fonctionnement en silos.',
  'La voie réaliste est progressive : digitaliser via le RAG, puis spécialiser des modèles open source sur nos données, avant de bâtir une IA pleinement souveraine.',
];
const KEYWORDS = [
  'IA souveraine',
  'Côte d’Ivoire',
  'SNIA 2030',
  'RAG',
  'datacenter Afrique',
  'souveraineté numérique',
  'modèles open source',
  'structuration des données',
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
const upload = (mediaId: string | number) => ({
  type: 'upload',
  relationTo: 'media',
  value: mediaId,
  fields: {},
  version: 3,
});

// Inline : <strong>/<em>/texte → nœuds text (format bitmask).
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
  // Dry-run (SEED_DRY=1) : parse + construit le Lexical SANS DB ni upload,
  // imprime un résumé de structure. Sert à valider avant de toucher la prod.
  const DRY = process.env.SEED_DRY === '1';
  const payload = DRY ? null : await getPayload({ config });

  // 1. Upload des 4 figures (idempotent par alt), index 1..4.
  const dom = new JSDOM(readFileSync(SRC_HTML, 'utf8'));
  const doc = dom.window.document;
  const figures = [...doc.querySelectorAll('figure')];
  const figMedia: (string | number)[] = [];
  for (let i = 0; i < figures.length; i++) {
    const img = figures[i].querySelector('img');
    const alt = (img?.getAttribute('alt') || `Figure ${i + 1}`).trim();
    const file = path.resolve(process.cwd(), FIG_DIR, `fig-${i + 1}.png`);
    if (!existsSync(file)) throw new Error(`figure absente : ${file}`);
    if (DRY) {
      figMedia.push(i + 1);
      continue;
    }
    const found = await payload!.find({
      collection: 'media',
      where: { alt: { equals: alt } },
      limit: 1,
      depth: 0,
    });
    let id = found.docs[0]?.id;
    if (!id) {
      const m = await payload!.create({
        collection: 'media',
        data: { alt },
        filePath: file,
      });
      id = m.id;
      console.log(`＋ figure uploadée : fig-${i + 1}.png`);
    } else console.log(`↻ figure réutilisée : fig-${i + 1}.png`);
    figMedia.push(id);
  }

  // 2. Construire le corps Lexical en parcourant les blocs du HTML.
  const BLOCK = new Set([
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'ul',
    'ol',
    'table',
    'figure',
    'blockquote',
  ]);
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
  let skippedDek = false,
    skippedSummary = false,
    figIdx = 0,
    injectedSourcesH = false;
  for (const b of blocks) {
    const tag = b.tagName.toLowerCase();
    if (tag === 'h1') continue; // → champ title
    if (tag === 'p' && !skippedDek) {
      skippedDek = true;
      continue;
    } // dek → excerpt
    if (tag === 'ul' && !skippedSummary) {
      skippedSummary = true;
      continue;
    } // → summary
    if (tag === 'p') {
      content.push(para(inlineNodes(b)));
    } else if (/^h[2-4]$/.test(tag)) {
      content.push(heading(tag, inlineNodes(b)));
    } else if (tag === 'blockquote') {
      content.push(quote(inlineNodes(b)));
    } else if (tag === 'ul' || tag === 'ol') {
      if (tag === 'ol' && !injectedSourcesH) {
        content.push(heading('h2', [text('Sources')]));
        injectedSourcesH = true;
      }
      const items = [...b.querySelectorAll(':scope > li')].map((li, i) =>
        listItem(i + 1, inlineNodes(li)),
      );
      content.push(list(tag === 'ol', items));
    } else if (tag === 'table') {
      const rows = [...b.querySelectorAll('tr')].map((tr, ri) =>
        row(
          [...tr.querySelectorAll('th,td')].map((c) =>
            cell(ri === 0 || c.tagName.toLowerCase() === 'th', [
              para(inlineNodes(c)),
            ]),
          ),
        ),
      );
      content.push(table(rows));
    } else if (tag === 'figure') {
      const mediaId = figMedia[figIdx++];
      if (mediaId != null) content.push(upload(mediaId));
      const cap = b.querySelector('figcaption');
      if (cap) content.push(para([...inlineNodes(cap, ITALIC)]));
    }
  }

  const data: Record<string, unknown> = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    summary: SUMMARY_POINTS.map((point) => ({ point })),
    content: root(content),
    category: 'souverainete',
    keywords: KEYWORDS.map((keyword) => ({ keyword })),
    author: 'OpenLab Consulting',
    cover: figMedia[0] ?? undefined,
    publishedAt: new Date().toISOString(),
    _status: 'published',
  };

  if (DRY) {
    const summary = content.map((n: any) =>
      n.type === 'heading'
        ? `${n.tag}: ${n.children?.[0]?.text?.slice(0, 50) ?? ''}`
        : n.type === 'table'
          ? `table ${n.children.length}×${n.children[0]?.children.length}`
          : n.type === 'upload'
            ? `image(media=${n.value})`
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
    console.log(
      `\n✅ DRY — ${content.length} blocs, ${figMedia.length} figure(s), excerpt ${EXCERPT.length} car.`,
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

  console.log(
    `✅ Article seedé — ${content.length} blocs, ${figMedia.length} figure(s).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed article échoué :', err);
  process.exit(1);
});
