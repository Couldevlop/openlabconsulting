/* eslint-disable */
/**
 * Visuel d'en-tête de la fiche MaturIA.
 *
 * Uploade `docs/images/maturia-hero.png` dans la médiathèque puis le
 * renseigne comme `heroImage` du produit `maturia`. Ce champ prime sur la
 * capture codée et le mockup SVG dans le hero de `/solutions/maturia`.
 *
 * Idempotent : réutilise le média existant s'il porte déjà le même `alt`,
 * plutôt que d'empiler des doublons dans la médiathèque à chaque
 * exécution.
 *
 * Usage : pnpm cms:seed:maturia-hero
 *
 * En production, l'upload passe par MinIO : ouvrir les deux tunnels avant
 * de lancer (5432 pour Postgres, 9000 pour MinIO) et pointer
 * MINIO_ENDPOINT sur le tunnel local.
 */
import { getPayload } from 'payload';
import path from 'node:path';
import { existsSync } from 'node:fs';
import config from '../payload.config';

const FICHIER = 'maturia-hero.png';
const ALT =
  'MaturIA : résultat de maturité IA par domaine, niveau global et feuille de route VOIE';

async function main(): Promise<void> {
  const chemin = path.resolve(process.cwd(), 'docs/images', FICHIER);
  if (!existsSync(chemin)) {
    throw new Error(`Visuel introuvable : ${chemin}`);
  }

  const payload = await getPayload({ config });

  const existant = await payload.find({
    collection: 'media',
    where: { alt: { equals: ALT } },
    limit: 1,
    overrideAccess: true,
  });

  const media = existant.docs[0]
    ? existant.docs[0]
    : await payload.create({
        collection: 'media',
        data: { alt: ALT },
        filePath: chemin,
        overrideAccess: true,
      });
  console.log(
    existant.docs[0]
      ? `Média réutilisé : ${media.id}`
      : `Média créé : ${media.id}`,
  );

  const produit = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'maturia' } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  const fiche = produit.docs[0];
  if (!fiche) {
    throw new Error('Fiche produit `maturia` introuvable.');
  }

  await payload.update({
    collection: 'products',
    id: fiche.id,
    data: { heroImage: media.id, _status: 'published' },
    overrideAccess: true,
  });
  console.log(`Fiche ${fiche.id} : heroImage renseigné (média ${media.id}).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
