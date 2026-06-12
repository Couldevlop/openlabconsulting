import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Collections du Laboratoire : `rd_axes`, `publications`, `partnerships`
 * (+ tables d'array : produits_lies, exemples, authors ; + enums type).
 *
 * Sans workflow draft (pas de `_status` / tables `_v_`). Rédigée à la main
 * (chaîne de snapshots drizzle interrompue depuis `add_visits`), calquée sur
 * les conventions de `products` (table collection, slug unique, `order`
 * numeric, timestamps) et `methodologie_axes` (tables d'array).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_publications_type" AS ENUM('livre', 'livre-blanc', 'article-pair', 'conference');
   CREATE TYPE "public"."enum_partnerships_type" AS ENUM('universitaire', 'public', 'prive', 'ong');

   CREATE TABLE "rd_axes_produits_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );

   CREATE TABLE "rd_axes_exemples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );

   CREATE TABLE "rd_axes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"pitch" varchar,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

   CREATE TABLE "publications_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );

   CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_publications_type" DEFAULT 'article-pair',
  	"title" varchar,
  	"year" numeric,
  	"href" varchar,
  	"summary" varchar,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

   CREATE TABLE "partnerships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"type" "enum_partnerships_type" DEFAULT 'universitaire',
  	"pitch" varchar,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

   ALTER TABLE "rd_axes_produits_lies" ADD CONSTRAINT "rd_axes_produits_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rd_axes"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "rd_axes_exemples" ADD CONSTRAINT "rd_axes_exemples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rd_axes"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "publications_authors" ADD CONSTRAINT "publications_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;

   CREATE INDEX "rd_axes_produits_lies_order_idx" ON "rd_axes_produits_lies" USING btree ("_order");
   CREATE INDEX "rd_axes_produits_lies_parent_id_idx" ON "rd_axes_produits_lies" USING btree ("_parent_id");
   CREATE INDEX "rd_axes_exemples_order_idx" ON "rd_axes_exemples" USING btree ("_order");
   CREATE INDEX "rd_axes_exemples_parent_id_idx" ON "rd_axes_exemples" USING btree ("_parent_id");
   CREATE UNIQUE INDEX "rd_axes_slug_idx" ON "rd_axes" USING btree ("slug");
   CREATE INDEX "rd_axes_updated_at_idx" ON "rd_axes" USING btree ("updated_at");
   CREATE INDEX "rd_axes_created_at_idx" ON "rd_axes" USING btree ("created_at");
   CREATE INDEX "publications_authors_order_idx" ON "publications_authors" USING btree ("_order");
   CREATE INDEX "publications_authors_parent_id_idx" ON "publications_authors" USING btree ("_parent_id");
   CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
   CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
   CREATE UNIQUE INDEX "partnerships_slug_idx" ON "partnerships" USING btree ("slug");
   CREATE INDEX "partnerships_updated_at_idx" ON "partnerships" USING btree ("updated_at");
   CREATE INDEX "partnerships_created_at_idx" ON "partnerships" USING btree ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "rd_axes_produits_lies" CASCADE;
  DROP TABLE "rd_axes_exemples" CASCADE;
  DROP TABLE "rd_axes" CASCADE;
  DROP TABLE "publications_authors" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "partnerships" CASCADE;
  DROP TYPE "public"."enum_publications_type";
  DROP TYPE "public"."enum_partnerships_type";`)
}
