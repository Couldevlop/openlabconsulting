import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Payload 3.91 ajoute aux collections `auth` le champ cache
 * `resetPasswordRequestedAt` (horodatage de la derniere demande de
 * reinitialisation, utilise pour limiter les demandes repetees).
 *
 * Sans cette colonne, toute requete sur `users` echoue (`column
 * users.reset_password_requested_at does not exist`) et /admin plante
 * apres la connexion (incident du 2026-10-16, montee 3.84.1 -> 3.91.0).
 *
 * Ecrite a la main et idempotente, conformement a la convention du depot.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_requested_at";
  `)
}
