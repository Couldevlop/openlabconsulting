import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Global `payload_jobs_stats`, cree par Payload des qu'une tache porte un
 * `schedule` : c'est la table qui memorise la derniere execution planifiee.
 *
 * Requise par la relance des rapports d'audit (`remindPendingReports`),
 * planifiee toutes les heures. Sans elle, la planification ne demarre pas.
 *
 * Ecrite a la main et idempotente, conformement a la convention du depot.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)

  await db.execute(sql`
ALTER TABLE "payload_jobs" ADD COLUMN IF NOT EXISTS "meta" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP TABLE IF EXISTS "payload_jobs_stats" CASCADE;
  `)

  await db.execute(sql`
ALTER TABLE "payload_jobs" DROP COLUMN IF EXISTS "meta";
  `)
}
