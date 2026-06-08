/* eslint-disable */
/**
 * Seed du bandeau réassurance (CLAUDE.md §6.2, « Ils nous accompagnent
 * depuis le terrain ») dans le global Payload `reassurance-settings`.
 *
 * Pourquoi ce script : la section est pilotable depuis l'admin (global
 * `reassurance-settings`), mais tant que le global est **vide**, le
 * composant retombe sur `REASSURANCE_FALLBACK` (logos codés en dur) — ce
 * qui « masque » l'admin. Ce seed initialise le global avec les logos
 * actuels + GIT, pour que l'admin devienne la source de vérité : ensuite,
 * ajouter un logo = Médias → upload puis une ligne dans le global, sans
 * code ni redéploiement.
 *
 * Idempotent :
 *   - Médias réutilisés via `alt` (pas de doublon d'upload).
 *   - Le global est réécrit avec exactement la liste ci-dessous.
 *
 * Stockage des médias selon la config Payload (MinIO si MINIO_ENDPOINT,
 * sinon `media/` local).
 *
 * Usage local :
 *   docker compose up -d postgres minio
 *   pnpm db:migrate && pnpm cms:seed:reassurance
 *
 * Usage prod (via tunnels `ssh -L` directs vers les ClusterIP postgres +
 * minio, NODE_ENV=production pour ne pas push le schéma) — cf.
 * docs/admin-cms.md et la procédure seed-article-covers.
 */
import { getPayload } from 'payload';
import path from 'node:path';
import { existsSync } from 'node:fs';
import config from '../payload.config';

interface PartnerSeed {
  /** Nom de marque — alt a11y + libellé. */
  name: string;
  /** Fichier dans public/logos/. */
  file: string;
  /** Texte alternatif du média (Médiathèque). */
  alt: string;
}

// Ordre = ordre d'affichage dans le marquee. Pour en ajouter d'autres
// ensuite : passer par l'admin (Médias + global), pas par ce fichier.
const PARTNERS: readonly PartnerSeed[] = [
  { name: 'DOCI', file: 'doci.png', alt: 'DOCI — logo partenaire' },
  { name: 'Sertemef', file: 'sertemef.png', alt: 'Sertemef — logo partenaire' },
  { name: 'SPITEC', file: 'spitec.png', alt: 'SPITEC — logo partenaire' },
  {
    name: 'GIT',
    file: 'git.png',
    alt: 'GIT — La référence des innovations',
  },
];

const EYEBROW = 'Ils nous accompagnent depuis le terrain';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const logosDir = path.resolve(process.cwd(), 'public/logos');

  const partners: { name: string; logo: string | number }[] = [];
  let uploaded = 0;
  let reused = 0;

  for (const partner of PARTNERS) {
    const filePath = path.join(logosDir, partner.file);
    if (!existsSync(filePath)) {
      console.warn(`⚠ logo absent, ignoré : ${filePath}`);
      continue;
    }

    // Réutilise un média existant (même alt) sinon l'uploade.
    const { docs: medias } = await payload.find({
      collection: 'media',
      where: { alt: { equals: partner.alt } },
      limit: 1,
      depth: 0,
    });
    let mediaId = medias[0]?.id;
    if (!mediaId) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: partner.alt },
        filePath,
      });
      mediaId = media.id;
      uploaded += 1;
      console.log(`＋ média uploadé : ${partner.file}`);
    } else {
      reused += 1;
      console.log(`↻ média réutilisé : ${partner.file}`);
    }

    partners.push({ name: partner.name, logo: mediaId });
  }

  await payload.updateGlobal({
    slug: 'reassurance-settings',
    data: { eyebrow: EYEBROW, partners },
  });

  console.log(
    `✅ Réassurance seedée — ${partners.length} partenaire(s) dans le global ` +
      `(${uploaded} média(s) uploadé(s), ${reused} réutilisé(s)).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed réassurance échoué :', err);
  process.exit(1);
});
