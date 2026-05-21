/* eslint-disable */
/**
 * Script de migration Payload — wrapper qui utilise l'API JS directe
 * via tsx, contourne les bugs du binaire `payload` avec Node 22 + ESM
 * strict sur Windows.
 *
 * Usage :
 *   docker-compose up -d postgres
 *   pnpm db:migrate
 *
 * Idempotent : Payload détecte les migrations déjà appliquées et skip.
 *
 * NOTE : .env est chargé via le flag `--env-file=.env` passé à tsx
 * dans le script package.json. Pas besoin de loadEnv ici.
 */

import { getPayload } from 'payload';
import config from '../payload.config';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  console.log('▶ Migration Payload en cours...');
  await payload.db.migrate();
  console.log('✅ Migrations appliquées.');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration échouée :', err);
  process.exit(1);
});
