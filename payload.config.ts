import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  TextStateFeature,
  defaultColors,
  createServerFeature,
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
} from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Imports sans extension : compatibles webpack Next (build) ET tsx CLI
// (scripts payload-migrate / cms-seed). Le binaire payload direct
// nécessiterait `.js` mais on ne l'utilise plus — tout passe par tsx.
import { Articles } from './collections/Articles';
import { AuditLog } from './collections/AuditLog';
import { CaseStudies } from './collections/CaseStudies';
import { Expertises } from './collections/Expertises';
import { Leads } from './collections/Leads';
import { Media } from './collections/Media';
import { Products } from './collections/Products';
import { Sectors } from './collections/Sectors';
import { TeamMembers } from './collections/TeamMembers';
import { TeamPublications } from './collections/TeamPublications';
import { Users } from './collections/Users';
import { Whitepapers } from './collections/Whitepapers';
import { Callout } from './blocks/Callout';
import { HeroSettings } from './globals/HeroSettings';
import { InsightsHubSettings } from './globals/InsightsHubSettings';
import { ManifestoSettings } from './globals/ManifestoSettings';
import { ReassuranceSettings } from './globals/ReassuranceSettings';
import { AuditIaCtaSettings } from './globals/AuditIaCtaSettings';
import { FooterSettings } from './globals/FooterSettings';
import { SeoDefaults } from './globals/SeoDefaults';
import { AboutSettings } from './globals/AboutSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Payload CMS v3 — configuration centrale (CLAUDE.md §9 + §16.2 S6).
 *
 * Collections actives :
 *   - articles    : insights longs format (homepage §6.9)
 *   - caseStudies : cas clients du carrousel homepage (§6.5)
 *   - products    : 7 logiciels propriétaires (§1.3, §7)
 *   - expertises  : 4 axes de conseil (§5, §6.3)
 *   - sectors     : 5 secteurs cibles (§5)
 *   - teamMembers : équipe dirigeante (page /a-propos/equipe)
 *   - teamPublications : publications signature de l'équipe
 *   - whitepapers : livres blancs lead magnet (§6.10)
 *   - media       : bibliothèque assets centralisée (MinIO)
 *   - users       : auth + 6 rôles RBAC + 2FA TOTP (§11)
 *   - leads       : CRM Kanban + scoring IA Claude (§9.3)
 *   - auditLog    : journal immuable actions sensibles (§11.2)
 *
 * Pipeline d'upload :
 *   1. Éditeur uploade via admin Payload (/admin)
 *   2. sharp génère les variantes thumbnail/card/cover
 *   3. storage-s3 envoie sur MinIO bucket `openlab-media`
 *   4. Le Server Component récupère l'URL via Payload local API
 *
 * Si MinIO n'est pas configuré (dev sans bucket), fallback file system
 * local. Détecté via présence de MINIO_ENDPOINT.
 *
 * NOTE BUILD : Payload tente la connexion DB uniquement au runtime
 * (admin / API). Le build Next.js réussit sans Postgres. La pipeline
 * d'admin nécessite `pnpm db:migrate` + `pnpm cms:seed` une fois la
 * DB démarrée (docker compose up postgres).
 */
const useMinio =
  typeof process.env.MINIO_ENDPOINT === 'string' &&
  process.env.MINIO_ENDPOINT.length > 0;

const isProd = process.env.NODE_ENV === 'production';

// `next build` évalue ce module (collecte des routes /api/*) en
// NODE_ENV=production mais SANS les secrets runtime (injectés seulement au
// déploiement). On ne doit donc PAS échouer pendant la phase de build —
// uniquement au démarrage du serveur de prod. Next pose
// NEXT_PHASE='phase-production-build' durant `next build`.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Récupère une variable d'environnement sensible. Au DÉMARRAGE du serveur de
 * production, son absence est FATALE (throw) — OWASP A07/A02 : sans ça, un
 * oubli d'injection (ConfigMap/SealedSecret) ferait démarrer le serveur avec
 * un secret par défaut public connu, permettant de forger un JWT super-admin.
 * Pendant `next build` (pas de secrets) et en dev/test, on retombe sur une
 * valeur locale explicite.
 */
function requireSecret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (typeof value === 'string' && value.length > 0) return value;
  if (isProd && !isBuildPhase) {
    throw new Error(
      `[payload] Variable d'environnement requise manquante en production : ${name}. ` +
        'Refus de démarrer avec une valeur par défaut (sécurité).',
    );
  }
  return devFallback;
}

const serverURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000';

// Origines de confiance pour CORS + protection CSRF des mutations
// authentifiées (OWASP A01/CSRF). Le same-origin est toujours autorisé ;
// cette liste borne les origines cross-site pouvant porter le cookie de
// session. On inclut l'apex + le sous-domaine www.
const trustedOrigins = Array.from(
  new Set(
    [serverURL, serverURL.replace('://', '://www.')].filter((u) =>
      u.startsWith('http'),
    ),
  ),
);

// Feature Lexical custom : sélecteur d'emoji dans la barre d'outils. Le
// composant client est résolu via l'importMap (cf. cms:generate-importmap).
const EmojiServerFeature = createServerFeature({
  feature: {
    ClientFeature:
      '/components/admin/lexical/EmojiFeatureClient.tsx#EmojiFeatureClient',
  },
  key: 'emoji',
});

export default buildConfig({
  secret: requireSecret('PAYLOAD_SECRET', 'dev-secret-replace-in-prod'),
  serverURL,
  cors: trustedOrigins,
  csrf: trustedOrigins,
  // Borne la taille des uploads (busboy) — évite le DoS disque MinIO par un
  // compte éditeur uploadant des fichiers énormes. 20 Mo couvre largement
  // les couvertures (~2 Mo) et PDF de livres blancs.
  upload: {
    limits: { fileSize: 20 * 1024 * 1024 },
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' · Admin OpenLab',
    },
    components: {
      views: {
        // Dashboard custom premium (refonte admin P2 phase 3) :
        // KPIs leads + articles + audit log, derniers leads, activité.
        // Charte OpenLab (orange/navy/ivory). Le path est résolu via
        // l'importMap généré par `pnpm cms:generate-importmap`.
        dashboard: {
          Component: '/components/admin/Dashboard.tsx#default',
        },
      },
    },
  },
  collections: [
    Articles,
    CaseStudies,
    Products,
    Expertises,
    Sectors,
    TeamMembers,
    TeamPublications,
    Whitepapers,
    Media,
    Users,
    Leads,
    AuditLog,
  ],
  globals: [
    HeroSettings,
    InsightsHubSettings,
    ManifestoSettings,
    ReassuranceSettings,
    AuditIaCtaSettings,
    FooterSettings,
    SeoDefaults,
    AboutSettings,
  ],
  // Éditeur richText premium pour la mise en forme professionnelle des
  // articles (§9.5, §12.5). On conserve tout le jeu par défaut (gras,
  // italique, souligné, barré, code inline, listes puces/numéros/cases,
  // liens internes + externes, citation, filet horizontal, upload d'images
  // inline depuis la médiathèque MinIO) et on ajoute :
  //   - titres restreints à H2/H3/H4 — le H1 est réservé au titre de page,
  //     ce qui garde une hiérarchie SEO propre (un seul H1 par document) ;
  //   - une barre d'outils fixe en haut de l'éditeur (confort rédacteur) ;
  //   - couleurs de texte + surlignage (TextStateFeature + defaultColors) pour
  //     la mise en forme ;
  //   - un sélecteur d'emoji (EmojiServerFeature) pour enrichir la saisie.
  //   - des TABLEAUX (TableFeature) pour les données comparatives ;
  //   - un bloc CODE multi-langages (éditeur Monaco en admin, coloration
  //     Shiki côté serveur au rendu — cf. lib/insights/code-highlighter) ;
  //   - des ENCADRÉS (bloc `callout` : info / astuce / avertissement /
  //     danger), signature éditoriale des meilleures docs tech.
  // Les blocs Lexical sont stockés inline dans le JSON du champ richText :
  // aucune table SQL dédiée, donc aucune migration de schéma.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
      TextStateFeature({
        state: {
          color: { ...defaultColors.text, ...defaultColors.background },
        },
      }),
      EmojiServerFeature(),
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({ blocks: [CodeBlock(), Callout] }),
    ],
  }),
  db: postgresAdapter({
    pool: {
      connectionString: requireSecret(
        'DATABASE_URL',
        'postgresql://openlab:devpass@localhost:5432/openlab',
      ),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // sharp pour la conversion AVIF/WebP automatique des médias uploadés.
  sharp,
  plugins: useMinio
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.MINIO_BUCKET ?? 'openlab-media',
          config: {
            endpoint: process.env.MINIO_ENDPOINT?.startsWith('http')
              ? process.env.MINIO_ENDPOINT
              : `http://${process.env.MINIO_ENDPOINT ?? 'localhost:9000'}`,
            credentials: {
              accessKeyId: requireSecret('MINIO_ACCESS_KEY', 'minioadmin'),
              secretAccessKey: requireSecret('MINIO_SECRET_KEY', 'minioadmin'),
            },
            region: 'us-east-1',
            forcePathStyle: true, // MinIO requiert path-style
          },
        }),
      ]
    : [],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'schema.graphql'),
  },
});
