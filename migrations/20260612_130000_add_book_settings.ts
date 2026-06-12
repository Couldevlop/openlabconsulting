import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Global `book_settings` (métadonnées éditables du livre) + tables d'array
 * `book_settings_long_pitch` et `book_settings_audiences`.
 *
 * Rédigée à la main (chaîne de snapshots drizzle interrompue depuis
 * `add_visits`), calquée sur les conventions des globals + arrays existants.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "book_settings_long_pitch" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );

   CREATE TABLE "book_settings_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar
  );

   CREATE TABLE "book_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"edition" varchar,
  	"isbn" varchar,
  	"page_count" numeric,
  	"publication_year" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

   ALTER TABLE "book_settings_long_pitch" ADD CONSTRAINT "book_settings_long_pitch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."book_settings"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "book_settings_audiences" ADD CONSTRAINT "book_settings_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."book_settings"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "book_settings_long_pitch_order_idx" ON "book_settings_long_pitch" USING btree ("_order");
   CREATE INDEX "book_settings_long_pitch_parent_id_idx" ON "book_settings_long_pitch" USING btree ("_parent_id");
   CREATE INDEX "book_settings_audiences_order_idx" ON "book_settings_audiences" USING btree ("_order");
   CREATE INDEX "book_settings_audiences_parent_id_idx" ON "book_settings_audiences" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "book_settings_long_pitch" CASCADE;
  DROP TABLE "book_settings_audiences" CASCADE;
  DROP TABLE "book_settings" CASCADE;`)
}
