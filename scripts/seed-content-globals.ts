/* eslint-disable */
/**
 * Seed des globals « Contenu site » (Hero, Manifeste, Insights, Méthodologie,
 * Audit IA CTA/Process, Footer, À propos, Hubs Solutions/Expertises/Secteurs)
 * à partir des fallbacks codés (`lib/cms/site-settings.ts`).
 *
 * Pourquoi ce script : ces sections sont pilotables depuis l'admin (globals
 * Payload), mais tant qu'un global est **vide en base**, deux choses se
 * produisent :
 *   1. le site rend quand même (les helpers `*-server.ts` retombent sur le
 *      fallback hard-codé) ;
 *   2. l'admin n'affiche RIEN à éditer → l'éditeur a l'impression que la
 *      section n'est pas paramétrable (« rien ne s'affiche »).
 * Ce seed initialise chaque global avec son fallback pour que l'admin
 * devienne la source de vérité, sans changer une virgule de l'affichage.
 *
 * Idempotent ET non destructif : on ne touche QU'aux globals encore vides
 * (champ témoin absent/vide). Un global déjà édité en admin est laissé
 * intact — on ne réécrit jamais par-dessus une saisie humaine.
 *
 * Usage local :
 *   docker compose up -d postgres
 *   pnpm db:migrate && pnpm cms:seed:content
 *
 * Usage prod (tunnel/port-forward vers postgres, NODE_ENV=production pour ne
 * pas pousser le schéma) — cf. docs/admin-cms.md et la procédure
 * seed-article-covers / seed-reassurance.
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import {
  HERO_FALLBACK,
  MANIFESTO_FALLBACK,
  INSIGHTS_HUB_FALLBACK,
  METHODOLOGIE_FALLBACK,
  AUDIT_IA_CTA_FALLBACK,
  AUDIT_IA_PROCESS_FALLBACK,
  FOOTER_FALLBACK,
  ABOUT_FALLBACK,
  SOLUTIONS_HUB_FALLBACK,
  EXPERTISES_HUB_FALLBACK,
  SECTEURS_HUB_FALLBACK,
} from '../lib/cms/site-settings';

/**
 * Une entrée à seeder : le slug du global, le champ « témoin » qui indique
 * si le global est déjà rempli, et la donnée à écrire si vide.
 *
 * La donnée est typée `Record<string, unknown>` volontairement : on adapte
 * la forme du fallback à l'entrée attendue par Payload (cf. les deux
 * transforms du global audit-ia-cta).
 */
interface GlobalSeed {
  slug: string;
  /** Champ texte simple présent quand le global a déjà été enregistré. */
  marker: string;
  data: Record<string, unknown>;
}

// audit-ia-cta : `reassuranceBullets` est un array d'objets `{text}` côté
// Payload (pas un string[]) et le groupe `whitepaperCard` n'a PAS de champ
// `cover` (la couverture est servie par le fallback côté rendu). On mappe
// donc explicitement, sans propager `cover`.
const { cover: _omitCover, ...whitepaperCardFields } =
  AUDIT_IA_CTA_FALLBACK.whitepaperCard;

const AUDIT_IA_CTA_DATA: Record<string, unknown> = {
  eyebrow: AUDIT_IA_CTA_FALLBACK.eyebrow,
  headlineLead: AUDIT_IA_CTA_FALLBACK.headlineLead,
  headlineHighlight: AUDIT_IA_CTA_FALLBACK.headlineHighlight,
  description: AUDIT_IA_CTA_FALLBACK.description,
  cta: AUDIT_IA_CTA_FALLBACK.cta,
  reassuranceBullets: AUDIT_IA_CTA_FALLBACK.reassuranceBullets.map((text) => ({
    text,
  })),
  whitepaperCard: whitepaperCardFields,
};

const GLOBALS: readonly GlobalSeed[] = [
  { slug: 'hero-settings', marker: 'eyebrow', data: { ...HERO_FALLBACK } },
  {
    slug: 'manifesto-settings',
    marker: 'eyebrow',
    data: { ...MANIFESTO_FALLBACK },
  },
  {
    slug: 'insights-hub-settings',
    marker: 'eyebrow',
    data: { ...INSIGHTS_HUB_FALLBACK },
  },
  {
    slug: 'methodologie',
    marker: 'eyebrow',
    data: { ...METHODOLOGIE_FALLBACK },
  },
  {
    slug: 'audit-ia-cta-settings',
    marker: 'eyebrow',
    data: AUDIT_IA_CTA_DATA,
  },
  {
    slug: 'audit-ia-process-settings',
    marker: 'heroEyebrow',
    data: { ...AUDIT_IA_PROCESS_FALLBACK },
  },
  { slug: 'footer-settings', marker: 'tagline', data: { ...FOOTER_FALLBACK } },
  { slug: 'about-settings', marker: 'eyebrow', data: { ...ABOUT_FALLBACK } },
  {
    slug: 'solutions-hub-settings',
    marker: 'eyebrow',
    data: { ...SOLUTIONS_HUB_FALLBACK },
  },
  {
    slug: 'expertises-hub-settings',
    marker: 'eyebrow',
    data: { ...EXPERTISES_HUB_FALLBACK },
  },
  {
    slug: 'secteurs-hub-settings',
    marker: 'eyebrow',
    data: { ...SECTEURS_HUB_FALLBACK },
  },
];

function isFilled(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  let seeded = 0;
  let skipped = 0;

  for (const entry of GLOBALS) {
    const current = (await payload.findGlobal({
      slug: entry.slug as never,
      depth: 0,
    })) as Record<string, unknown>;

    if (isFilled(current?.[entry.marker])) {
      skipped += 1;
      console.log(`↻ ${entry.slug} déjà rempli — laissé intact.`);
      continue;
    }

    await payload.updateGlobal({
      slug: entry.slug as never,
      data: entry.data as never,
    });
    seeded += 1;
    console.log(`＋ ${entry.slug} seedé depuis le fallback.`);
  }

  console.log(
    `✅ Globals « Contenu site » : ${seeded} seedé(s), ${skipped} déjà rempli(s) ` +
      `(sur ${GLOBALS.length}).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed globals contenu échoué :', err);
  process.exit(1);
});
