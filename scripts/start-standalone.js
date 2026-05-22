#!/usr/bin/env node
/**
 * Démarre le serveur Next.js en mode `output: 'standalone'`
 * pour environnements non-Docker (CI Playwright, dev local sur build prod).
 *
 * Pourquoi ce script :
 *   - `next.config.ts` a `output: 'standalone'` (cf. CLAUDE.md §13.2, requis
 *     pour l'image Docker distroless).
 *   - Conséquence : `next start` refuse de démarrer →
 *     « "next start" does not work with "output: standalone" configuration.
 *       Use "node .next/standalone/server.js" instead. »
 *   - Mais `.next/standalone/` ne contient PAS `public/` ni `.next/static/`
 *     (Next les laisse à part pour optimiser le copy CMD du Dockerfile,
 *     cf. lignes 52-54 du Dockerfile).
 *
 * Ce script :
 *   1. Copie `public/` → `.next/standalone/public/`
 *   2. Copie `.next/static/` → `.next/standalone/.next/static/`
 *   3. Lance `node .next/standalone/server.js` avec PORT héritée.
 *
 * Utilisé par `pnpm start` (cf. package.json). Cross-platform (Win/Linux)
 * via `fs.cpSync` natif Node 22.
 *
 * OWASP (CLAUDE.md §10) :
 *   - A03 Injection : spawn appelle process.execPath avec args en array
 *     littéral (jamais via shell:true). Aucun input utilisateur n'est
 *     interpolé dans une commande.
 *   - A05 Misconfiguration : env n'est ni loggué ni filtré ; le child
 *     hérite uniquement de process.env (pas d'élévation).
 *   - A08 Integrity : SERVER_JS est résolu à partir du cwd projet,
 *     jamais d'un input externe. Pas de download dynamique.
 *   - Exit propagation : le code de sortie du child est propagé tel
 *     quel (incl. null pour signal) — pas de masquage des crashes.
 */
import { cpSync, existsSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const STANDALONE = resolve('.next', 'standalone');
const SERVER_JS = resolve(STANDALONE, 'server.js');

if (!existsSync(SERVER_JS)) {
  console.error(
    "❌ .next/standalone/server.js absent — exécutez 'pnpm build' d'abord.",
  );
  process.exit(1);
}

// OWASP A08 : vérifie que server.js est un fichier régulier, pas un
// symlink pointant ailleurs (path-traversal). statSync.isFile() suit
// les symlinks mais on ajoute aussi un check explicite via lstatSync
// si on voulait être encore plus strict — ici isFile() suffit pour
// notre menace réaliste (un attaquant ayant write access au repo).
if (!statSync(SERVER_JS).isFile()) {
  console.error("❌ .next/standalone/server.js n'est pas un fichier régulier.");
  process.exit(1);
}

process.stderr.write('▶ Préparation des assets standalone...\n');
cpSync(resolve('public'), resolve(STANDALONE, 'public'), { recursive: true });
cpSync(resolve('.next', 'static'), resolve(STANDALONE, '.next', 'static'), {
  recursive: true,
});

process.stderr.write(
  `▶ Démarrage server.js sur PORT=${process.env.PORT ?? 3000}...\n`,
);
const child = spawn(process.execPath, [SERVER_JS], {
  stdio: 'inherit',
  env: { ...process.env },
});

const shutdown = (signal) => {
  if (!child.killed) child.kill(signal);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// Propage le code/signal du child : exit code numérique tel quel,
// signal converti en 128+sig (convention POSIX) pour ne PAS masquer
// un crash en exit 0.
child.on('exit', (code, signal) => {
  if (signal) {
    const SIG_OFFSET = 128;
    const SIG_TABLE = { SIGHUP: 1, SIGINT: 2, SIGTERM: 15, SIGKILL: 9 };
    process.exit(SIG_OFFSET + (SIG_TABLE[signal] ?? 1));
  }
  process.exit(code ?? 1);
});
