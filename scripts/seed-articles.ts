/* eslint-disable */
/**
 * Seed des articles fondateurs (Insights) dans Payload.
 *
 * Le contenu Markdown (scripts/articles-content.ts) est converti en état
 * Lexical via `convertMarkdownToLexical`, puis upserté par `slug`
 * (idempotent : update si le slug existe, create sinon). Les articles
 * sont créés **publiés** via le `_status` natif des drafts Payload, afin
 * d'être visibles côté public.
 *
 * Une fois seedés, les articles restent **entièrement éditables /
 * supprimables dans l'admin Payload**.
 *
 * Usage (prod & local) :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:articles
 *
 * .env est chargé via `--env-file=.env` (cf. package.json).
 */
import { getPayload } from 'payload';
import {
  editorConfigFactory,
  convertMarkdownToLexical,
} from '@payloadcms/richtext-lexical';
import config from '../payload.config';
import { SEED_ARTICLES } from './articles-content';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  });

  let created = 0;
  let updated = 0;

  for (const article of SEED_ARTICLES) {
    const content = convertMarkdownToLexical({
      editorConfig,
      markdown: article.markdown,
    });

    const data = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      summary: article.summary.map((point) => ({ point })),
      content,
      sources: article.sources,
      category: article.category,
      keywords: article.keywords.map((keyword) => ({ keyword })),
      author: article.author,
      publishedAt: article.publishedAt,
      // `_status` natif des drafts Payload : publie la version (visible
      // côté public). L'éditeur peut ensuite repasser en brouillon dans l'admin.
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: article.slug } },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'articles',
        id: existingDoc.id,
        data,
      });
      updated += 1;
      console.log(`↻ mis à jour : ${article.slug}`);
    } else {
      await payload.create({ collection: 'articles', data });
      created += 1;
      console.log(`＋ créé : ${article.slug}`);
    }
  }

  console.log(
    `✅ Seed articles terminé — ${created} créé(s), ${updated} mis à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed articles échoué :', err);
  process.exit(1);
});
