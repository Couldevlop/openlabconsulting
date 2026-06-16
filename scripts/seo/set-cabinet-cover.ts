/* eslint-disable */
/**
 * Remplace la couverture de l'article « Cabinet IA à Abidjan » par une image
 * dédiée (docs/images/CabinetIA.png) : upload en Media (sharp + MinIO) puis
 * mise à jour du champ `cover` de l'article. Idempotent côté article (réécrit
 * simplement le cover) ; crée toutefois un nouveau média à chaque exécution.
 *
 * Usage :
 *   node ./node_modules/tsx/dist/cli.mjs --env-file=<env-prod> scripts/seo/set-cabinet-cover.ts
 */
import { getPayload } from 'payload';
import config from '../../payload.config';

const SLUG = 'cabinet-ia-abidjan-comment-choisir';
const FILE = 'docs/images/CabinetIA.png';
const ALT = 'Cabinet IA à Abidjan — OpenLab Consulting';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const media = await payload.create({
    collection: 'media',
    data: { alt: ALT },
    filePath: FILE,
  });
  console.log(`＋ média couverture créé → id ${media.id}`);

  const found = await payload.find({
    collection: 'articles',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
  });
  if (!found.docs[0]) throw new Error(`Article introuvable : ${SLUG}`);

  await payload.update({
    collection: 'articles',
    id: found.docs[0].id,
    data: { cover: media.id },
  });
  console.log(`✅ Couverture mise à jour pour ${SLUG} → média ${media.id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Échec mise à jour couverture :', err);
  process.exit(1);
});
