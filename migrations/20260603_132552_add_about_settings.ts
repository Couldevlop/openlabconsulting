import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "about_settings_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "about_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"intro" varchar,
  	"pillars_eyebrow" varchar,
  	"pillars_headline" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "about_settings_pillars" ADD CONSTRAINT "about_settings_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "about_settings_pillars_order_idx" ON "about_settings_pillars" USING btree ("_order");
  CREATE INDEX "about_settings_pillars_parent_id_idx" ON "about_settings_pillars" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "about_settings_pillars" CASCADE;
  DROP TABLE "about_settings" CASCADE;`)
}
