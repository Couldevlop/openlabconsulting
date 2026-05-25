import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "insights_hub_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"intro" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_text" varchar,
  	"empty_state_cta_label" varchar,
  	"empty_state_cta_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "insights_hub_settings" CASCADE;`)
}
