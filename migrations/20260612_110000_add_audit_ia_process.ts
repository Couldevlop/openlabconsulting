import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Global `audit_ia_process_settings` (page /audit-ia : hero + section process)
 * + sa table d'array `audit_ia_process_settings_steps` (étapes).
 *
 * Rédigée à la main (chaîne de snapshots drizzle interrompue depuis
 * `add_visits`), calquée sur le couple `methodologie` / `methodologie_axes`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "audit_ia_process_settings_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );

   CREATE TABLE "audit_ia_process_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"lead" varchar,
  	"process_eyebrow" varchar,
  	"process_headline" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

   ALTER TABLE "audit_ia_process_settings_steps" ADD CONSTRAINT "audit_ia_process_settings_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audit_ia_process_settings"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "audit_ia_process_settings_steps_order_idx" ON "audit_ia_process_settings_steps" USING btree ("_order");
   CREATE INDEX "audit_ia_process_settings_steps_parent_id_idx" ON "audit_ia_process_settings_steps" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "audit_ia_process_settings_steps" CASCADE;
  DROP TABLE "audit_ia_process_settings" CASCADE;`)
}
