/* eslint-disable */
/**
 * Script chirurgical : retire les tirets cadratins « — » du CONTENU déjà
 * enregistré en base Payload (globals + collections), en les remplaçant par
 * une ponctuation française normale — sans toucher au reste du contenu.
 *
 * Pourquoi : le nettoyage des « — » côté code (fallbacks, seeds, lib/data)
 * ne réécrit pas les lignes déjà présentes en base. La home et les pages
 * pilotées par le CMS continuent donc d'afficher les anciens « — » tant que
 * la base n'est pas mise à jour. Ce script fait cette mise à jour de façon
 * ciblée : il ne modifie QUE les « — », préservant toute édition admin.
 *
 * Règle de remplacement (mécanique) :
 *   - « — » précédé d'un segment court ressemblant à un label/titre  → « : »
 *     (deux-points, espace avant + après, typo FR).
 *   - sinon (incise, milieu de phrase)                              → « , ».
 *   - « — » en tête de chaîne (signature)                           → retiré.
 *   Les traits d'union « - » et demi-cadratins « – » ne sont JAMAIS touchés.
 *
 * Sécurité : DRY-RUN par défaut (n'écrit rien). Pour appliquer réellement,
 * passer APPLY=true. Les collections système / PII (users, leads, media,
 * visits, audit log…) sont exclues.
 *
 * Usage local (base docker) :
 *   docker compose up -d postgres
 *   tsx --env-file=.env scripts/strip-emdashes-cms.ts            # DRY-RUN
 *   APPLY=true tsx --env-file=.env scripts/strip-emdashes-cms.ts # applique
 *
 * Usage prod (tunnel/port-forward vers le postgres prod, NODE_ENV=production
 * pour ne PAS pousser le schéma) — cf. docs/admin-cms.md :
 *   NODE_ENV=production tsx --env-file=.env.prod scripts/strip-emdashes-cms.ts
 *   NODE_ENV=production APPLY=true tsx --env-file=.env.prod scripts/strip-emdashes-cms.ts
 */
import { getPayload } from 'payload';
import config from '../payload.config';

const APPLY = process.env.APPLY === 'true';

/** Collections système / données personnelles à NE PAS toucher. */
const COLLECTION_DENYLIST = new Set([
  'users',
  'leads',
  'media',
  'visits',
  'audit-logs',
  'auditLogs',
  'payload-preferences',
  'payload-migrations',
  'payload-locked-documents',
  'payload-jobs',
]);

/** Remplace les « — » d'une chaîne selon la règle mécanique. */
function fixEmDashes(input: string): string {
  if (!input.includes('—')) return input;
  // Chaîne courte avec un seul « — » = probable titre/label « X — Y » → « : ».
  // Tout le reste (prose, incises, segments longs ou multiples) → « , ».
  const dashCount = (input.match(/—/g) ?? []).length;
  const isShortTitle = input.trim().length <= 60 && dashCount === 1;
  return input
    .replace(/\s*—\s*/g, (_match, offset: number, str: string) => {
      // « — » en tête de chaîne (signature, attribution) → on le retire.
      if (offset === 0) return '';
      if (isShortTitle) {
        const before = str.slice(0, offset).trim();
        if (before.length > 0 && !before.includes(',')) return ' : ';
      }
      // Incise / milieu de phrase → virgule.
      return ', ';
    })
    .replace(/ {2,}/g, ' ');
}

/** Parcourt récursivement une valeur et remplace les « — » dans les chaînes. */
function walk(value: unknown): { value: unknown; count: number } {
  if (typeof value === 'string') {
    const fixed = fixEmDashes(value);
    return { value: fixed, count: fixed !== value ? 1 : 0 };
  }
  if (Array.isArray(value)) {
    let count = 0;
    const arr = value.map((v) => {
      const r = walk(v);
      count += r.count;
      return r.value;
    });
    return { value: arr, count };
  }
  if (value && typeof value === 'object') {
    let count = 0;
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const r = walk(v);
      count += r.count;
      obj[k] = r.value;
    }
    return { value: obj, count };
  }
  return { value, count: 0 };
}

/** Retire les champs gérés par Payload qu'on ne veut pas réécrire. */
function stripManaged<T extends Record<string, unknown>>(doc: T): T {
  const { id, createdAt, updatedAt, ...rest } = doc;
  void id;
  void createdAt;
  void updatedAt;
  return rest as T;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const mode = APPLY ? 'APPLY (écriture)' : 'DRY-RUN (lecture seule)';
  console.log(`\n=== strip-emdashes-cms — mode : ${mode} ===\n`);

  let totalDocs = 0;
  let totalStrings = 0;

  // --- Globals ---
  for (const global of payload.config.globals) {
    const slug = global.slug;
    const doc = (await payload.findGlobal({
      slug,
      depth: 0,
    })) as Record<string, unknown>;
    const { value, count } = walk(doc);
    if (count > 0) {
      totalDocs += 1;
      totalStrings += count;
      console.log(`[global] ${slug} — ${count} chaîne(s) avec « — »`);
      if (APPLY) {
        await payload.updateGlobal({
          slug,
          data: stripManaged(value as Record<string, unknown>),
          depth: 0,
        });
      }
    }
  }

  // --- Collections ---
  for (const collection of payload.config.collections) {
    const slug = collection.slug;
    if (COLLECTION_DENYLIST.has(slug)) continue;
    const { docs } = await payload.find({
      collection: slug,
      limit: 1000,
      depth: 0,
      pagination: false,
    });
    for (const doc of docs as Record<string, unknown>[]) {
      const { value, count } = walk(doc);
      if (count > 0) {
        totalDocs += 1;
        totalStrings += count;
        console.log(
          `[collection] ${slug} #${String(doc.id)} — ${count} chaîne(s) avec « — »`,
        );
        if (APPLY) {
          await payload.update({
            collection: slug,
            id: doc.id as string | number,
            data: stripManaged(value as Record<string, unknown>),
            depth: 0,
          });
        }
      }
    }
  }

  console.log(
    `\n=== ${totalStrings} chaîne(s) sur ${totalDocs} document(s) ${
      APPLY ? 'mises à jour' : 'à mettre à jour (DRY-RUN)'
    } ===`,
  );
  if (!APPLY && totalStrings > 0) {
    console.log('Pour appliquer : relancer avec APPLY=true.\n');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('strip-emdashes-cms a échoué :', err);
  process.exit(1);
});
