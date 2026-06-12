/* eslint-disable */
/**
 * Seed des collections Laboratoire (rd-axes, publications, partnerships)
 * dans Payload à partir des fallbacks codés (lib/data/laboratoire.ts).
 *
 * Upsert idempotent : rd-axes / partnerships par `slug`, publications par
 * `title` (pas de slug). `order` = position * 10.
 *
 * Usage :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:laboratoire
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { RD_AXES, PUBLICATIONS, PARTENARIATS } from '../lib/data/laboratoire';

async function upsert(
  payload: any,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<'created' | 'updated'> {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
  });
  const doc = existing.docs[0];
  if (doc) {
    await payload.update({ collection, id: doc.id, data });
    return 'updated';
  }
  await payload.create({ collection, data });
  return 'created';
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;
  const bump = (r: 'created' | 'updated') =>
    r === 'created' ? (created += 1) : (updated += 1);

  for (const [i, a] of RD_AXES.entries()) {
    bump(
      await upsert(
        payload,
        'rd-axes',
        { slug: { equals: a.slug } },
        {
          slug: a.slug,
          title: a.title,
          pitch: a.pitch,
          produitsLies: a.produitsLies.map((value) => ({ value })),
          exemples: a.exemples.map((value) => ({ value })),
          order: (i + 1) * 10,
        },
      ),
    );
  }

  for (const [i, p] of PUBLICATIONS.entries()) {
    bump(
      await upsert(
        payload,
        'publications',
        { title: { equals: p.title } },
        {
          type: p.type,
          title: p.title,
          authors: p.authors.map((value) => ({ value })),
          year: p.year,
          href: p.href,
          summary: p.summary,
          ...(p.slug ? { slug: p.slug } : {}),
          ...(p.abstract ? { abstract: p.abstract } : {}),
          order: (i + 1) * 10,
        },
      ),
    );
  }

  for (const [i, p] of PARTENARIATS.entries()) {
    bump(
      await upsert(
        payload,
        'partnerships',
        { slug: { equals: p.slug } },
        {
          slug: p.slug,
          title: p.title,
          type: p.type,
          pitch: p.pitch,
          order: (i + 1) * 10,
        },
      ),
    );
  }

  console.log(
    `✅ Seed laboratoire terminé — ${created} créé(s), ${updated} mis à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed laboratoire échoué :', err);
  process.exit(1);
});
