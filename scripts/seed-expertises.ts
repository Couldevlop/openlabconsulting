/* eslint-disable */
/**
 * Seed des 4 expertises de conseil (CLAUDE.md §5, §6.3) dans Payload.
 *
 * Upsert idempotent par `slug` (update si le slug existe, create sinon).
 * Les expertises sont créées **publiées** via le `_status` natif des drafts
 * Payload, afin d'être visibles côté public. Une fois seedées, elles restent
 * entièrement éditables / supprimables dans l'admin Payload.
 *
 * Les champs hard-codés sont sérialisés vers le schéma de la collection :
 *   - `competences: string[]` → `[{ value }]`
 * Le reste (approche, produitsLies) est déjà au bon format.
 *
 * Usage (prod & local) :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:expertises
 *
 * .env est chargé via `--env-file=.env` (cf. package.json).
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { FALLBACK_EXPERTISES } from '../lib/data/expertises';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;

  for (const expertise of FALLBACK_EXPERTISES) {
    const data = {
      slug: expertise.slug,
      iconKey: expertise.iconKey,
      title: expertise.title,
      punchline: expertise.punchline,
      intro: expertise.intro,
      competences: expertise.competences.map((value) => ({ value })),
      approche: expertise.approche.map((a) => ({
        step: a.step,
        title: a.title,
        body: a.body,
      })),
      produitsLies: expertise.produitsLies.map((p) => ({
        slug: p.slug,
        name: p.name,
      })),
      // `_status` natif des drafts Payload : publie la version (visible
      // côté public). L'éditeur peut ensuite repasser en brouillon dans l'admin.
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'expertises',
      where: { slug: { equals: expertise.slug } },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'expertises',
        id: existingDoc.id,
        data,
      });
      updated += 1;
      console.log(`↻ mis à jour : ${expertise.slug}`);
    } else {
      await payload.create({ collection: 'expertises', data });
      created += 1;
      console.log(`＋ créé : ${expertise.slug}`);
    }
  }

  console.log(
    `✅ Seed expertises terminé — ${created} créé(s), ${updated} mis à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed expertises échoué :', err);
  process.exit(1);
});
