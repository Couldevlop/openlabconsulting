/* eslint-disable */
/**
 * Seed de l'article « ERP SYSCOHADA » dans la collection `articles`, à partir
 * du HTML `docs/images/article_erp_syscohada.html`.
 *
 * Décliné de seed-article-agrosense-eudr.ts (même convertisseur HTML →
 * Lexical). Cible le mot-clé « ERP SYSCOHADA » ; lie le produit NexusERP.
 *
 * Usage : pnpm cms:seed:article:erp-syscohada  (DRY : SEED_DRY=1 ...)
 */
import { getPayload } from 'payload';
import { readFileSync } from 'node:fs';
// @ts-expect-error — jsdom : dépendance de test, parse le HTML source.
import { JSDOM } from 'jsdom';
import config from '../payload.config';

const SRC_HTML = 'docs/images/article_erp_syscohada.html';

const SLUG = 'erp-syscohada-pme-uemoa-exigences';
const TITLE =
  'ERP SYSCOHADA : ce qu’une PME de l’UEMOA doit exiger de son logiciel de gestion';
const EXCERPT =
  'Trop de PME ouest-africaines plient leur comptabilité au logiciel au lieu d’exiger un logiciel qui parle SYSCOHADA — le plan comptable de dix-sept pays OHADA. Quatre exigences pour bien choisir son ERP.';
const SUMMARY_POINTS = [
  'Le SYSCOHADA est le plan comptable de dix-sept pays OHADA : un ERP conçu pour le PCG français ne le connaît pas et impose des bricolages coûteux.',
  'Quatre exigences pour une PME de l’UEMOA : SYSCOHADA + PCG en parallèle sans double saisie, multi-devises natif, cycle complet, souveraineté des données.',
  'NexusERP tient SYSCOHADA et PCG France en parallèle, consolide FCFA/EUR/USD nativement et se déploie sur une infrastructure souveraine.',
];
const KEYWORDS = [
  'ERP SYSCOHADA',
  'logiciel comptabilité SYSCOHADA',
  'ERP PME UEMOA',
  'OHADA',
  'NexusERP',
  'multi-devises FCFA',
  'PCG France',
  'ERP Afrique',
];
const CATEGORY = 'etude-de-cas';
const AUTHOR = 'OpenLab Consulting';
const CTA_PARAGRAPH =
  'NexusERP est l’une des huit solutions propriétaires d’OpenLab Consulting. Découvrez l’ERP SYSCOHADA nouvelle génération sur /solutions/nexuserp.';

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
