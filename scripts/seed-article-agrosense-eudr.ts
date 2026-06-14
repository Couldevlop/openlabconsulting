/* eslint-disable */
/**
 * Seed de l'article « EUDR & cacao ivoirien » dans la collection `articles`,
 * à partir du HTML `docs/images/article_agrosense_eudr.html`.
 *
 * Décliné de seed-article-sentinelbtp.ts (même convertisseur HTML → Lexical).
 * Cible une niche à concurrence quasi nulle : conformité EUDR (déforestation)
 * + agriculture de précision cacao par IA/IoT. Lie le produit AgroSense CI.
 *
 * Usage : pnpm cms:seed:article:agrosense-eudr  (DRY : SEED_DRY=1 ...)
 */
import { getPayload } from 'payload';
import { readFileSync } from 'node:fs';
// @ts-expect-error — jsdom : dépendance de test, parse le HTML source.
import { JSDOM } from 'jsdom';
import config from '../payload.config';

const SRC_HTML = 'docs/images/article_agrosense_eudr.html';

const SLUG = 'eudr-cacao-tracabilite-zero-deforestation-cote-divoire';
const TITLE =
  'EUDR & cacao ivoirien : prouver le « zéro déforestation » par la donnée';
const EXCERPT =
  'La Côte d’Ivoire, premier producteur mondial de cacao, devra rattacher chaque fève exportée vers l’UE à une parcelle géolocalisée et non déforestée. Comment la donnée, l’IoT et l’imagerie satellite en font la preuve.';
const SUMMARY_POINTS = [
  'Avec l’EUDR, chaque parcelle de cacao exportée vers l’UE doit être géolocalisée et prouvée non déforestée après le 31 décembre 2020 — condition d’accès au marché.',
  'Le défi n’est pas le principe mais l’exécution : géolocaliser des centaines de milliers de petites parcelles et produire un dossier opposable, à l’échelle des coopératives.',
  'AgroSense CI géolocalise chaque parcelle (< 5 m), la croise avec les masques de déforestation satellite (Sentinel-2) et génère le rapport de conformité EUDR en un clic.',
];
const KEYWORDS = [
  'EUDR cacao',
  'traçabilité cacao Côte d’Ivoire',
  'zéro déforestation',
  'agriculture de précision cacao',
  'AgroSense CI',
  'Sentinel-2',
  'coopérative cacao',
  'conformité EUDR',
];
const CATEGORY = 'etude-de-cas';
const AUTHOR = 'OpenLab Consulting';
const CTA_PARAGRAPH =
  'AgroSense CI est l’une des huit solutions propriétaires d’OpenLab Consulting. Découvrez la plateforme d’agriculture de précision et de conformité EUDR sur /solutions/agrosense.';

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
    if (tag === 'h1') continue;
    if (!txt) continue;
    if (tag === 'p' && !skippedDek) {
      skippedDek = true;
      continue;
    }
    if (tag === 'p') content.push(para(inlineNodes(b)));
    else if (/^h[2-4]$/.test(tag)) content.push(heading(tag, inlineNodes(b)));
    else if (tag === 'blockquote') content.push(quote(inlineNodes(b)));
  }

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

  // Mode DUMP : imprime le `data` complet (content Lexical inclus) en JSON,
  // sans DB. Sert au transfert hors-ligne vers la prod (INSERT SQL) quand
  // Docker local est indisponible.
  if (process.env.SEED_DUMP === '1') {
    process.stdout.write(JSON.stringify(data));
    process.exit(0);
  }

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
    const tooLong = SUMMARY_POINTS.filter((p) => p.length > 200);
    console.log(
      `\n✅ DRY — ${content.length} blocs · excerpt ${EXCERPT.length} car. · points >200: ${tooLong.length}`,
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
