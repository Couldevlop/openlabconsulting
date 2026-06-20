import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Global `announcement_banner` — bandeau d'annonce (flash info) pilotable
 * depuis l'admin. Table simple (pas d'array), calquée sur les conventions
 * des globals existants (cf. add_book_settings).
 *
 * Idempotent (CREATE TABLE IF NOT EXISTS) pour pouvoir aussi être appliqué
 * à chaud en prod si le migrate-job ne tourne pas.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "announcement_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"message" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "announcement_banner" CASCADE;`)
}
