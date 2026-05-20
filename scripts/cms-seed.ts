/* eslint-disable */
/**
 * Script de seed initial du CMS Payload.
 *
 * Crée un super-admin initial à partir des variables d'env :
 *   - SEED_ADMIN_EMAIL    (ex : debora@openlabconsulting.com)
 *   - SEED_ADMIN_PASSWORD (12+ chars, zxcvbn ≥ 3 — CLAUDE.md §11.2)
 *   - SEED_ADMIN_NAME     (ex : Debora Ahouma)
 *
 * Usage :
 *   docker compose up -d postgres
 *   pnpm db:migrate
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... pnpm cms:seed
 *
 * Idempotent : si l'utilisateur existe déjà avec cet email, on ne
 * touche à rien (pas d'écrasement de password).
 */

import { getPayload } from 'payload';
import config from '../payload.config';

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Super Admin';

  if (!email || !password) {
    console.error(
      'Erreur : SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD doivent être définis.',
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error(
      'Erreur : password doit faire au moins 12 caractères (CLAUDE.md §11.2).',
    );
    process.exit(1);
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(
      `Utilisateur ${email} existe déjà — seed idempotent, rien à faire.`,
    );
    process.exit(0);
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      fullName,
      role: 'super-admin',
    },
  });

  console.log(`Super-admin créé : ${user.email} (id ${user.id})`);
  console.log('Connecte-toi sur /admin et active immédiatement la 2FA TOTP.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed échoué :', err);
  process.exit(1);
});
