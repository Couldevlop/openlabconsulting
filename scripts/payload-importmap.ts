/* eslint-disable */
/**
 * Génère le fichier importMap.js de Payload v3 (admin React).
 *
 * Wrapper tsx pour bypass le binaire `payload` qui plante sur Windows
 * + Node 22 + tsx 4.21 à cause d'un interop CJS/ESM cassé avec
 * @next/env (cf. memory feedback-payload-esm-extensions).
 *
 * Usage : pnpm cms:generate-importmap
 */

import { generateImportMap, getPayload } from 'payload';
import config from '../payload.config';

async function main(): Promise<void> {
  console.log('▶ Génération importMap admin Payload...');
  // On passe par getPayload qui sanitise + initialise tout (incl. les
  // collections internes payload-kv, payload-jobs, etc.) sans collision.
  // Plus simple et plus sûr que sanitizeConfig(config) qui dédouble.
  const payload = await getPayload({ config });
  await generateImportMap(payload.config, { force: true, log: true });
  console.log('✅ importMap généré : app/(payload)/admin/importMap.js');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Génération importMap échouée :', err);
  process.exit(1);
});
