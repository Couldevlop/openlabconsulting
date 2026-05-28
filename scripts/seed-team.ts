/* eslint-disable */
/**
 * Seed de l'équipe (CLAUDE.md §6, page /a-propos/equipe) dans Payload :
 *   - `teamMembers`      (upsert par `memberId`)
 *   - `teamPublications` (upsert par `title` + `order`)
 *
 * Upsert idempotent. Les documents sont créés **publiés** via le `_status`
 * natif des drafts Payload, afin d'être visibles côté public. Une fois seedés,
 * ils restent entièrement éditables / supprimables dans l'admin Payload.
 *
 * Les champs hard-codés sont sérialisés vers le schéma des collections :
 *   - membre `bio: string[]`        → `[{ value }]`
 *   - membre `focusAreas: string[]` → `[{ value }]`
 *   - membre `sameAs: string[]`     → `[{ value }]`
 *   - publication `type`            → champ `pubType`
 *
 * Le portrait (`imagePath` du fallback) reste un placeholder : l'upload de
 * l'image se fait depuis l'admin Payload (champ `image`).
 *
 * Usage (prod & local) :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   pnpm cms:seed:team
 *
 * .env est chargé via `--env-file=.env` (cf. package.json).
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import {
  FALLBACK_TEAM_MEMBERS,
  SIGNATURE_PUBLICATIONS,
} from '../lib/data/team';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  let membersCreated = 0;
  let membersUpdated = 0;

  // 1. Membres — upsert par `memberId`.
  let order = 10;
  for (const member of FALLBACK_TEAM_MEMBERS) {
    const data = {
      memberId: member.id,
      name: member.name,
      jobTitle: member.jobTitle,
      shortBio: member.shortBio,
      bio: member.bio.map((value) => ({ value })),
      quote: member.quote,
      focusAreas: member.focusAreas.map((value) => ({ value })),
      sameAs: member.sameAs.map((value) => ({ value })),
      order,
      // `_status` natif des drafts Payload : publie la version (visible
      // côté public). L'éditeur peut ensuite repasser en brouillon dans l'admin.
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'teamMembers',
      where: { memberId: { equals: member.id } },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'teamMembers',
        id: existingDoc.id,
        data,
      });
      membersUpdated += 1;
      console.log(`↻ membre mis à jour : ${member.id}`);
    } else {
      await payload.create({ collection: 'teamMembers', data });
      membersCreated += 1;
      console.log(`＋ membre créé : ${member.id}`);
    }
    order += 10;
  }

  // 2. Publications — upsert par `title` + `order`.
  let pubsCreated = 0;
  let pubsUpdated = 0;
  let pubOrder = 10;
  for (const pub of SIGNATURE_PUBLICATIONS) {
    const data = {
      pubType: pub.type,
      title: pub.title,
      year: pub.year,
      description: pub.description,
      href: pub.href,
      order: pubOrder,
      _status: 'published',
    } as Record<string, unknown>;

    const existing = await payload.find({
      collection: 'teamPublications',
      where: {
        and: [
          { title: { equals: pub.title } },
          { order: { equals: pubOrder } },
        ],
      },
      limit: 1,
      depth: 0,
    });

    const existingDoc = existing.docs[0];
    if (existingDoc) {
      await payload.update({
        collection: 'teamPublications',
        id: existingDoc.id,
        data,
      });
      pubsUpdated += 1;
      console.log(`↻ publication mise à jour : ${pub.title}`);
    } else {
      await payload.create({ collection: 'teamPublications', data });
      pubsCreated += 1;
      console.log(`＋ publication créée : ${pub.title}`);
    }
    pubOrder += 10;
  }

  console.log(
    `✅ Seed équipe terminé — membres : ${membersCreated} créé(s), ${membersUpdated} mis à jour ; ` +
      `publications : ${pubsCreated} créée(s), ${pubsUpdated} mise(s) à jour.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed équipe échoué :', err);
  process.exit(1);
});
