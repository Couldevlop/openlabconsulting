/* eslint-disable */
/**
 * Seed des images de couverture des articles Insights.
 *
 * Uploade les visuels (docs/images/*.png) dans la collection `media`
 * Payload, puis renseigne le champ `cover` de chaque article par slug.
 * Idempotent : réutilise un média existant (même `alt`) et ne ré-uploade
 * pas. Stockage selon la config Payload (MinIO si MINIO_ENDPOINT, sinon
 * système de fichiers local `media/`).
 *
 * Usage :
 *   docker compose up -d postgres
 *   pnpm db:migrate && pnpm cms:seed:articles
 *   pnpm cms:seed:covers
 *
 * Note prod : les visuels docs/images/ ne sont pas versionnés ; en prod
 * les couvertures sont gérées via l'admin (upload médiathèque).
 */
import { getPayload } from 'payload';
import path from 'node:path';
import { existsSync } from 'node:fs';
import config from '../payload.config';

interface CoverMapping {
  slug: string;
  image: string;
  alt: string;
}

const COVERS: readonly CoverMapping[] = [
  {
    slug: 'fraude-documentaire-ia-banques-assurances',
    image: '1001290076.png',
    alt: 'Détection de fraude documentaire par IA, tableau de bord Fraud Shield',
  },
  {
    slug: 'migration-ia-souveraine-k3s-hetzner',
    image: '1001290645.png',
    alt: 'Décisions augmentées par l’IA, souveraineté numérique africaine',
  },
  {
    slug: 'cnps-its-fdfp-conformite-sirh-ivoirien',
    image: '1001289248.png',
    alt: 'Conformité RH NexusRH : CNPS, ITS, FDFP',
  },
  {
    slug: 'data-petrole-ia-raffinerie-entreprises-ivoiriennes',
    image: '1001290243.png',
    alt: 'La data est votre pétrole, l’IA votre raffinerie, Data & IA',
  },
  {
    slug: 'pertes-carburant-stations-pilotage-temps-reel',
    image: '1001287382.png',
    alt: 'Pertes de carburant en station, pilotage SYGESCOM temps réel',
  },
  {
    slug: 'ia-securite-urbaine-villes-africaines-2050',
    image: '1001293417.png',
    alt: 'Quand l’IA protège la ville, sécurité urbaine augmentée par l’IA',
  },
  {
    slug: 'ia-ivoirienne-notre-futur-manifeste',
    image: '1001294771.png',
    alt: 'L’IA ivoirienne, notre futur, manifeste souveraineté',
  },
  {
    slug: 'opencacao-ia-souveraine-cacao-cote-divoire',
    image: 'opencacao-cover.png',
    alt: 'OpenCacao : l’IA souveraine du cacao conçue et hébergée en Côte d’Ivoire',
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const imagesDir = path.resolve(process.cwd(), 'docs/images');

  let done = 0;
  let skipped = 0;

  for (const cover of COVERS) {
    const { docs: articles } = await payload.find({
      collection: 'articles',
      where: { slug: { equals: cover.slug } },
      limit: 1,
      depth: 0,
    });
    const article = articles[0];
    if (!article) {
      console.warn(`⚠ article introuvable : ${cover.slug}`);
      skipped += 1;
      continue;
    }

    const filePath = path.join(imagesDir, cover.image);
    if (!existsSync(filePath)) {
      console.warn(`⚠ image absente : ${filePath}`);
      skipped += 1;
      continue;
    }

    // Réutilise un média existant (même alt) sinon l'uploade.
    const { docs: medias } = await payload.find({
      collection: 'media',
      where: { alt: { equals: cover.alt } },
      limit: 1,
      depth: 0,
    });
    let mediaId = medias[0]?.id;
    if (!mediaId) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: cover.alt },
        filePath,
      });
      mediaId = media.id;
    }

    await payload.update({
      collection: 'articles',
      id: article.id,
      data: { cover: mediaId },
    });
    done += 1;
    console.log(`✓ ${cover.slug} ← ${cover.image}`);
  }

  console.log(`✅ Couvertures : ${done} appliquée(s), ${skipped} ignorée(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed des couvertures échoué :', err);
  process.exit(1);
});
