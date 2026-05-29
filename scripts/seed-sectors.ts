/* eslint-disable */
/**
 * Seed des 5 secteurs cibles (CLAUDE.md §5) dans Payload.
 *
 * Upsert idempotent par `slug` (update si le slug existe, create sinon).
 * Les secteurs sont créés **publiés** via le `_status` natif des drafts
 * Payload, afin d'être visibles côté public. Une fois seedés, ils restent
 * entièrement éditables / supprimables dans l'admin Payload.
 *
 * Les champs hard-codés sont sérialisés vers le schéma de la collection :
 *   - `enjeux: string[]`     → `[{ value }]`
 *   - `regulation: string[]` → `[{ value }]`
 * Le reste (produitsLies, expertisesLies) est déjà au bon format.
 *
 * Usage (prod & local) :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:sectors
 *
 * .env est chargé via `--env-file=.env` (cf. package.json).
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { FALLBACK_SECTORS } from '../lib/data/sectors';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;

  for (const sector of FALLBACK_SECTORS) {
    const data = {
      slug: sector.slug,
      iconKey: sector.iconKey,
      name: sector.name,
      tagline: sector.tagline,
      intro: sector.intro,
      enjeux: sector.enjeux.map((value) => ({ value })),
      regulation: sector.regulation.map((value) => ({ value })),
      produitsLies: sector.produitsLies.map((p) => ({
        slug: p.slug,
        title: p.title,
      })),
      expertisesLies: sector.expertisesLies.map((e) => ({
        slug: e.slug,
        title: e.title,
      })),
      // `_status` natif des drafts Payload : publie la version (visible
      // côté public). L'éditeur peut ensuite repasser en brouillon dans l'admin.
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'sectors',
      where: { slug: { equals: sector.slug } },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'sectors',
        id: existingDoc.id,
        data,
      });
      updated += 1;
      console.log(`↻ mis à jour : ${sector.slug}`);
    } else {
      await payload.create({ collection: 'sectors', data });
      created += 1;
      console.log(`＋ créé : ${sector.slug}`);
    }
  }

  console.log(
    `✅ Seed secteurs terminé — ${created} créé(s), ${updated} mis à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed secteurs échoué :', err);
  process.exit(1);
});
