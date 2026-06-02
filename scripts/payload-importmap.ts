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

async function main(): Promise<void> {
  console.log('▶ Génération importMap admin Payload...');
  // L'admin de PRODUCTION utilise toujours le storage S3 (MinIO). On force
  // donc la présence du plugin `s3Storage` au moment de générer l'importMap,
  // afin que l'artefact committé inclue `S3ClientUploadHandler` quel que soit
  // l'environnement local. Sans ça, une génération sur un poste sans
  // MINIO_ENDPOINT produit un importMap incomplet → l'admin prod crashe au
  // SSR (« PayloadComponent not found in importMap … S3ClientUploadHandler »,
  // page blanche). On positionne la variable AVANT l'import de la config
  // (import dynamique) car `payload.config.ts` lit `process.env.MINIO_ENDPOINT`
  // au chargement du module pour décider d'activer le plugin.
  process.env.MINIO_ENDPOINT ??= 'localhost:9000';
  const { default: config } = await import('../payload.config');
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
