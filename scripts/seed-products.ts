/* eslint-disable */
/**
 * Seed des 8 produits propriétaires (CLAUDE.md §1.3) dans Payload.
 *
 * Upsert idempotent par `slug` (update si le slug existe, create sinon).
 * Les produits sont créés **publiés** via le `_status` natif des drafts
 * Payload, afin d'être visibles côté public. Une fois seedés, ils restent
 * entièrement éditables / supprimables dans l'admin Payload.
 *
 * Les champs hard-codés sont sérialisés vers le schéma de la collection :
 *   - `stack: string[]`         → `[{ value }]`
 *   - `pricing.details: string[]` → `[{ value }]`
 * Le reste (features, proofs, faq, expertisesLies) est déjà au bon format.
 *
 * Usage (prod & local) :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:products
 *
 * .env est chargé via `--env-file=.env` (cf. package.json).
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { FALLBACK_PRODUCTS } from '../lib/data/products';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;

  for (const product of FALLBACK_PRODUCTS) {
    const data = {
      slug: product.slug,
      iconKey: product.iconKey,
      name: product.name,
      tagline: product.tagline,
      target: product.target,
      maturity: product.status,
      statusLabel: product.statusLabel,
      eyebrow: product.eyebrow,
      intro: product.intro,
      problem: product.problem,
      features: product.features.map((f) => ({
        iconKey: f.iconKey,
        title: f.title,
        body: f.body,
      })),
      stack: product.stack.map((value) => ({ value })),
      proofs: product.proofs.map((p) => ({
        value: p.value,
        label: p.label,
        source: p.source,
      })),
      pricing: {
        model: product.pricing.model,
        headline: product.pricing.headline,
        details: product.pricing.details.map((value) => ({ value })),
        ...(product.pricing.note ? { note: product.pricing.note } : {}),
      },
      faq: product.faq.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
      expertisesLies: product.expertisesLies.map((e) => ({
        slug: e.slug,
        title: e.title,
      })),
      // `_status` natif des drafts Payload : publie la version (visible
      // côté public). L'éditeur peut ensuite repasser en brouillon dans l'admin.
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'products',
        id: existingDoc.id,
        data,
      });
      updated += 1;
      console.log(`↻ mis à jour : ${product.slug}`);
    } else {
      await payload.create({ collection: 'products', data });
      created += 1;
      console.log(`＋ créé : ${product.slug}`);
    }
  }

  console.log(
    `✅ Seed produits terminé — ${created} créé(s), ${updated} mis à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed produits échoué :', err);
  process.exit(1);
});
