import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Articles } from './collections/Articles';
import { Media } from './collections/Media';
import { Users } from './collections/Users';
import { Whitepapers } from './collections/Whitepapers';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Payload CMS v3 — configuration centrale (CLAUDE.md §9 + §16.2 S6).
 *
 * Trois collections de départ :
 *   - articles    : insights longs format (homepage §6.9)
 *   - whitepapers : livres blancs lead magnet (§6.10)
 *   - media       : bibliothèque assets centralisée
 *
 * Collections à ajouter en P6 raffinement :
 *   - users (auth) avec rôles SUPER_ADMIN / ADMIN / EDITOR_CHIEF / EDITOR / AUTHOR
 *   - pages, caseStudies, testimonials, faqs, leads, audits-ia
 *   - book (single doc) avec chapters embarqués
 *
 * Branchement MinIO via @payloadcms/storage-s3 à ajouter quand le
 * bucket est instancié sur le cluster K3s. Pour l'instant, fallback
 * file system local (utile en dev sans MinIO).
 *
 * NOTE BUILD : Payload tente une connexion DB au démarrage du runtime,
 * pas au build. Le build Next.js se termine sans nécessiter Postgres.
 * Pour l'admin runtime : DATABASE_URI + PAYLOAD_SECRET requis (.env.example).
 */
export default buildConfig({
  // Le secret doit être renseigné dans .env.production (SealedSecret K8s en prod).
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-replace-in-prod',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  admin: {
    user: 'users', // collection users à ajouter en P6 auth
    meta: {
      titleSuffix: ' · Admin OpenLab',
    },
  },
  collections: [Articles, Whitepapers, Media, Users],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ??
        'postgresql://openlab:devpass@localhost:5432/openlab',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'schema.graphql'),
  },
});
