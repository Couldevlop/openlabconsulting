/* eslint-disable */
/**
 * Recentrage du catalogue produits (décision du 2026-08-08).
 *
 * Quatre produits restent visibles sur le site — NexusRH CI, Openlab
 * MaturIA, AEGIS et AgroSense CI. Les autres repassent en brouillon :
 * rien n'est supprimé, tout est republiable d'un clic depuis l'admin.
 *
 * Deux opérations méritent une explication.
 *
 * 1. AEGIS remplace OpenLab Fraud Shield **sur la même fiche**, pour ne
 *    pas laisser d'enregistrement orphelin. Ce n'est pas un renommage :
 *    les deux produits n'ont pas le même objet — Fraud Shield traite la
 *    fraude documentaire, AEGIS la détection de rançongiciels. Tout le
 *    contenu est donc réécrit, à partir des textes du dépôt `aegis`
 *    (README, docs/00-vision-perimetre.md, docs/01-architecture.md).
 *    Le slug change : prévoir la redirection 301 de
 *    `/solutions/fraud-shield` vers `/solutions/aegis`.
 *
 * 2. MaturIA est créé. Contenu tiré du dépôt `maturia` (README,
 *    CLAUDE.md). Le référentiel déclare neuf secteurs mais une seule
 *    grille est livrée à ce jour (banque) : les preuves affichées le
 *    disent, plutôt que d'annoncer neuf secteurs opérationnels.
 *
 * Idempotent : relançable sans effet de bord (upsert par slug).
 *
 * Usage : pnpm cms:seed:catalogue-2026-08
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { getProductBySlug } from '../lib/data/products';

/** Produits qui restent publiés, dans leur ordre d'affichage. */
const ORDRE_PUBLIE = {
  nexusrh: 10,
  maturia: 20,
  aegis: 30,
  agrosense: 40,
} as const;

/** Produits retirés du site — brouillon, jamais supprimés. */
const A_DEPUBLIER = [
  'sentinelbtp',
  'smart-city',
  'qualitos',
  'sygescom',
  'nexuserp',
];

/**
 * Le contenu des fiches vit dans `lib/data/products.ts`, jamais recopié ici.
 *
 * Les deux versions ont divergé une fois : la fiche du site annonçait « neuf
 * secteurs, grille bancaire livrée à ce jour » alors que le référentiel en
 * publie dix, toutes livrées. Corriger le site laissait la contre-vérité dans
 * le script, prête à revenir au prochain seed. Une seule source, donc.
 */
function versPayload(slug: keyof typeof ORDRE_PUBLIE) {
  const fiche = getProductBySlug(slug);
  if (!fiche) {
    throw new Error(`Fiche « ${slug} » absente de lib/data/products.ts`);
  }
  return {
    slug: fiche.slug,
    name: fiche.name,
    iconKey: fiche.iconKey,
    tagline: fiche.tagline,
    target: fiche.target,
    // Le repli nomme ce champ `status`, Payload l'appelle `maturity`.
    maturity: fiche.status,
    statusLabel: fiche.statusLabel,
    eyebrow: fiche.eyebrow,
    intro: fiche.intro,
    problem: fiche.problem,
    features: fiche.features.map((f) => ({ ...f })),
    stack: fiche.stack.map((value) => ({ value })),
    proofs: fiche.proofs.map((p) => ({ ...p })),
    pricing: {
      model: fiche.pricing.model,
      headline: fiche.pricing.headline,
      details: fiche.pricing.details.map((value) => ({ value })),
      note: fiche.pricing.note,
    },
    faq: fiche.faq.map((q) => ({ ...q })),
    expertisesLies: fiche.expertisesLies.map((e) => ({ ...e })),
    order: ORDRE_PUBLIE[slug],
    _status: 'published' as const,
  };
}
async function main(): Promise<void> {
  const payload = await getPayload({ config });

  // 1. AEGIS prend la place de Fraud Shield, sur la même fiche.
  const ancien = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'fraud-shield' } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  const cible = ancien.docs[0]
    ? ancien.docs[0]
    : (
        await payload.find({
          collection: 'products',
          where: { slug: { equals: 'aegis' } },
          limit: 1,
          draft: true,
          overrideAccess: true,
        })
      ).docs[0];

  if (cible) {
    await payload.update({
      collection: 'products',
      id: cible.id,
      data: versPayload('aegis'),
      overrideAccess: true,
    });
    console.log(`AEGIS : fiche ${cible.id} réécrite (ex-fraud-shield)`);
  } else {
    const cree = await payload.create({
      collection: 'products',
      data: versPayload('aegis'),
      overrideAccess: true,
    });
    console.log(`AEGIS : fiche ${cree.id} créée`);
  }

  // 2. MaturIA.
  const existant = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'maturia' } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  });
  if (existant.docs[0]) {
    await payload.update({
      collection: 'products',
      id: existant.docs[0].id,
      data: versPayload('maturia'),
      overrideAccess: true,
    });
    console.log(`MaturIA : fiche ${existant.docs[0].id} mise à jour`);
  } else {
    const cree = await payload.create({
      collection: 'products',
      data: versPayload('maturia'),
      overrideAccess: true,
    });
    console.log(`MaturIA : fiche ${cree.id} créée`);
  }

  // 3. Ordre d'affichage des deux fiches conservées telles quelles.
  for (const slug of ['nexusrh', 'agrosense'] as const) {
    const trouve = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (trouve.docs[0]) {
      await payload.update({
        collection: 'products',
        id: trouve.docs[0].id,
        data: { order: ORDRE_PUBLIE[slug], _status: 'published' },
        overrideAccess: true,
      });
      console.log(`${slug} : ordre ${ORDRE_PUBLIE[slug]}`);
    }
  }

  // 4. Dépublication — brouillon, rien n'est supprimé.
  for (const slug of A_DEPUBLIER) {
    const trouve = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (!trouve.docs[0]) {
      console.log(`${slug} : absent, rien à faire`);
      continue;
    }
    await payload.update({
      collection: 'products',
      id: trouve.docs[0].id,
      data: { _status: 'draft' },
      overrideAccess: true,
    });
    console.log(`${slug} : repassé en brouillon`);
  }

  const publies = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    limit: 50,
    overrideAccess: true,
  });
  console.log(
    `\nProduits publiés (${publies.totalDocs}) : ${publies.docs
      .map((p) => (p as { slug?: string }).slug)
      .join(', ')}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
