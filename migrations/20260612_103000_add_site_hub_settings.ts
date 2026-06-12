import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Globals `site_settings` (override du compteur de produits) + 3 hubs
 * éditoriaux `solutions_hub_settings` / `expertises_hub_settings` /
 * `secteurs_hub_settings` (eyebrow + titre lead/highlight + description).
 *
 * Migration rédigée à la main (tables simples, sans drafts) — la chaîne de
 * snapshots drizzle est interrompue depuis `20260607_201500_add_visits`
 * (pas de `.json`), donc on suit la même convention que cette dernière
 * (snake_case, serial PK, timestamps), conforme aux globals existants
 * (cf. `insights_hub_settings`).
 *
 * Inclut aussi l'extension des enums `icon_key` (produits/expertises/secteurs
 * + versions draft) avec la nouvelle clé `hard-hat` (icône SentinelBTP),
 * ajoutée au registre `lib/icon-map.ts`. `ADD VALUE IF NOT EXISTS` est
 * idempotent ; la valeur n'est pas utilisée dans la même transaction (OK PG12+).
 * `down()` ne retire pas les valeurs d'enum (Postgres n'a pas de DROP VALUE).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "enum_products_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum_products_features_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum_expertises_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum_sectors_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum__products_v_version_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum__products_v_version_features_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum__expertises_v_version_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';
   ALTER TYPE "enum__sectors_v_version_icon_key" ADD VALUE IF NOT EXISTS 'hard-hat';

   CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_count_override" numeric,
  	"product_count_word_override" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

   CREATE TABLE "solutions_hub_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

   CREATE TABLE "expertises_hub_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

   CREATE TABLE "secteurs_hub_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline_lead" varchar,
  	"headline_highlight" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings" CASCADE;
  DROP TABLE "solutions_hub_settings" CASCADE;
  DROP TABLE "expertises_hub_settings" CASCADE;
  DROP TABLE "secteurs_hub_settings" CASCADE;`)
}
