import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Collection `visits` — comptage de fréquentation (visiteurs uniques /
 * jour, pays, heure). Migration rédigée à la main (table simple, sans
 * drafts) faute de pouvoir régénérer via l'outil (contrainte disque
 * locale 2026-06-07) ; conforme aux conventions Payload/drizzle des
 * autres migrations (snake_case, serial PK, timestamps, index).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "visits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"hour" numeric NOT NULL,
  	"country" varchar DEFAULT 'XX' NOT NULL,
  	"visitor_hash" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "visits_id" integer;

  CREATE INDEX "visits_day_idx" ON "visits" USING btree ("day");
  CREATE INDEX "visits_country_idx" ON "visits" USING btree ("country");
  CREATE INDEX "visits_visitor_hash_idx" ON "visits" USING btree ("visitor_hash");
  CREATE UNIQUE INDEX "visits_day_visitor_hash_idx" ON "visits" USING btree ("day","visitor_hash");
  CREATE INDEX "visits_updated_at_idx" ON "visits" USING btree ("updated_at");
  CREATE INDEX "visits_created_at_idx" ON "visits" USING btree ("created_at");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visits_fk" FOREIGN KEY ("visits_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("visits_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_visits_fk";
  DROP INDEX "payload_locked_documents_rels_visits_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "visits_id";
  DROP TABLE "visits" CASCADE;`)
}
