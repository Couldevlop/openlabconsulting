/* eslint-disable */
/**
 * Génère une migration Payload via l'API JS directe (tsx) — contourne
 * les soucis du binaire `payload` sous Node 22 + ESM strict sur Windows
 * (même approche que payload-migrate.ts / cms-seed.ts).
 *
 * Le dossier migrations/ étant initialement vide, la première exécution
 * produit la **baseline complète** du schéma (toutes les collections,
 * dont les colonnes articles `summary`/`sources`). En prod, le
 * migrate-job applique ces migrations (le `push` y est désactivé).
 *
 * Usage :
 *   docker compose up -d postgres
 *   MIGRATION_NAME=initial pnpm db:migrate:create:tsx
 */
import { getPayload } from 'payload';
import config from '../payload.config';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const migrationName = process.env.MIGRATION_NAME ?? 'initial';

  console.log(`▶ Génération de la migration « ${migrationName} »...`);
  await payload.db.createMigration({
    payload,
    migrationName,
    forceAcceptWarning: true,
  });
  console.log('✅ Migration générée dans migrations/.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Génération de migration échouée :', err);
  process.exit(1);
});
