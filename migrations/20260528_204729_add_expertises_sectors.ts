import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_expertises_slug" AS ENUM('conseil-strategie', 'agents-automatisation', 'data-gouvernance', 'cybersecurite-ia');
  CREATE TYPE "public"."enum_expertises_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar', 'compass', 'bot', 'database', 'shield-check', 'landmark', 'wallet', 'wheat', 'heart-pulse', 'antenna');
  CREATE TYPE "public"."enum_expertises_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertises_v_version_slug" AS ENUM('conseil-strategie', 'agents-automatisation', 'data-gouvernance', 'cybersecurite-ia');
  CREATE TYPE "public"."enum__expertises_v_version_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar', 'compass', 'bot', 'database', 'shield-check', 'landmark', 'wallet', 'wheat', 'heart-pulse', 'antenna');
  CREATE TYPE "public"."enum__expertises_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sectors_slug" AS ENUM('secteur-public', 'banque-assurance', 'agro-industrie', 'sante', 'telecoms-energie');
  CREATE TYPE "public"."enum_sectors_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar', 'compass', 'bot', 'database', 'shield-check', 'landmark', 'wallet', 'wheat', 'heart-pulse', 'antenna');
  CREATE TYPE "public"."enum_sectors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sectors_v_version_slug" AS ENUM('secteur-public', 'banque-assurance', 'agro-industrie', 'sante', 'telecoms-energie');
  CREATE TYPE "public"."enum__sectors_v_version_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar', 'compass', 'bot', 'database', 'shield-check', 'landmark', 'wallet', 'wheat', 'heart-pulse', 'antenna');
  CREATE TYPE "public"."enum__sectors_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'compass';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'bot';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'database';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'shield-check';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'landmark';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'wallet';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'wheat';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'heart-pulse';
  ALTER TYPE "public"."enum_products_features_icon_key" ADD VALUE 'antenna';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'compass';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'bot';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'database';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'shield-check';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'landmark';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'wallet';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'wheat';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'heart-pulse';
  ALTER TYPE "public"."enum_products_icon_key" ADD VALUE 'antenna';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'compass';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'bot';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'database';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'shield-check';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'landmark';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'wallet';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'wheat';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'heart-pulse';
  ALTER TYPE "public"."enum__products_v_version_features_icon_key" ADD VALUE 'antenna';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'compass';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'bot';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'database';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'shield-check';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'landmark';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'wallet';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'wheat';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'heart-pulse';
  ALTER TYPE "public"."enum__products_v_version_icon_key" ADD VALUE 'antenna';
  CREATE TABLE "expertises_competences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "expertises_approche" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "expertises_produits_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "expertises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_expertises_slug",
  	"title" varchar,
  	"icon_key" "enum_expertises_icon_key",
  	"punchline" varchar,
  	"intro" varchar,
  	"order" numeric DEFAULT 100,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_expertises_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_expertises_v_version_competences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertises_v_version_approche" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertises_v_version_produits_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertises_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__expertises_v_version_slug",
  	"version_title" varchar,
  	"version_icon_key" "enum__expertises_v_version_icon_key",
  	"version_punchline" varchar,
  	"version_intro" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__expertises_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "sectors_enjeux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "sectors_regulation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "sectors_produits_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "sectors_expertises_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_sectors_slug",
  	"name" varchar,
  	"icon_key" "enum_sectors_icon_key",
  	"tagline" varchar,
  	"intro" varchar,
  	"order" numeric DEFAULT 100,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sectors_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_sectors_v_version_enjeux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v_version_regulation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v_version_produits_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v_version_expertises_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__sectors_v_version_slug",
  	"version_name" varchar,
  	"version_icon_key" "enum__sectors_v_version_icon_key",
  	"version_tagline" varchar,
  	"version_intro" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sectors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "expertises_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "expertises_competences" ADD CONSTRAINT "expertises_competences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertises_approche" ADD CONSTRAINT "expertises_approche_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertises_produits_lies" ADD CONSTRAINT "expertises_produits_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v_version_competences" ADD CONSTRAINT "_expertises_v_version_competences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v_version_approche" ADD CONSTRAINT "_expertises_v_version_approche_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v_version_produits_lies" ADD CONSTRAINT "_expertises_v_version_produits_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_parent_id_expertises_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_enjeux" ADD CONSTRAINT "sectors_enjeux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_regulation" ADD CONSTRAINT "sectors_regulation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_produits_lies" ADD CONSTRAINT "sectors_produits_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_expertises_lies" ADD CONSTRAINT "sectors_expertises_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_version_enjeux" ADD CONSTRAINT "_sectors_v_version_enjeux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_version_regulation" ADD CONSTRAINT "_sectors_v_version_regulation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_version_produits_lies" ADD CONSTRAINT "_sectors_v_version_produits_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_version_expertises_lies" ADD CONSTRAINT "_sectors_v_version_expertises_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_parent_id_sectors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "expertises_competences_order_idx" ON "expertises_competences" USING btree ("_order");
  CREATE INDEX "expertises_competences_parent_id_idx" ON "expertises_competences" USING btree ("_parent_id");
  CREATE INDEX "expertises_approche_order_idx" ON "expertises_approche" USING btree ("_order");
  CREATE INDEX "expertises_approche_parent_id_idx" ON "expertises_approche" USING btree ("_parent_id");
  CREATE INDEX "expertises_produits_lies_order_idx" ON "expertises_produits_lies" USING btree ("_order");
  CREATE INDEX "expertises_produits_lies_parent_id_idx" ON "expertises_produits_lies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "expertises_slug_idx" ON "expertises" USING btree ("slug");
  CREATE INDEX "expertises_updated_at_idx" ON "expertises" USING btree ("updated_at");
  CREATE INDEX "expertises_created_at_idx" ON "expertises" USING btree ("created_at");
  CREATE INDEX "expertises__status_idx" ON "expertises" USING btree ("_status");
  CREATE INDEX "_expertises_v_version_competences_order_idx" ON "_expertises_v_version_competences" USING btree ("_order");
  CREATE INDEX "_expertises_v_version_competences_parent_id_idx" ON "_expertises_v_version_competences" USING btree ("_parent_id");
  CREATE INDEX "_expertises_v_version_approche_order_idx" ON "_expertises_v_version_approche" USING btree ("_order");
  CREATE INDEX "_expertises_v_version_approche_parent_id_idx" ON "_expertises_v_version_approche" USING btree ("_parent_id");
  CREATE INDEX "_expertises_v_version_produits_lies_order_idx" ON "_expertises_v_version_produits_lies" USING btree ("_order");
  CREATE INDEX "_expertises_v_version_produits_lies_parent_id_idx" ON "_expertises_v_version_produits_lies" USING btree ("_parent_id");
  CREATE INDEX "_expertises_v_parent_idx" ON "_expertises_v" USING btree ("parent_id");
  CREATE INDEX "_expertises_v_version_version_slug_idx" ON "_expertises_v" USING btree ("version_slug");
  CREATE INDEX "_expertises_v_version_version_updated_at_idx" ON "_expertises_v" USING btree ("version_updated_at");
  CREATE INDEX "_expertises_v_version_version_created_at_idx" ON "_expertises_v" USING btree ("version_created_at");
  CREATE INDEX "_expertises_v_version_version__status_idx" ON "_expertises_v" USING btree ("version__status");
  CREATE INDEX "_expertises_v_created_at_idx" ON "_expertises_v" USING btree ("created_at");
  CREATE INDEX "_expertises_v_updated_at_idx" ON "_expertises_v" USING btree ("updated_at");
  CREATE INDEX "_expertises_v_latest_idx" ON "_expertises_v" USING btree ("latest");
  CREATE INDEX "sectors_enjeux_order_idx" ON "sectors_enjeux" USING btree ("_order");
  CREATE INDEX "sectors_enjeux_parent_id_idx" ON "sectors_enjeux" USING btree ("_parent_id");
  CREATE INDEX "sectors_regulation_order_idx" ON "sectors_regulation" USING btree ("_order");
  CREATE INDEX "sectors_regulation_parent_id_idx" ON "sectors_regulation" USING btree ("_parent_id");
  CREATE INDEX "sectors_produits_lies_order_idx" ON "sectors_produits_lies" USING btree ("_order");
  CREATE INDEX "sectors_produits_lies_parent_id_idx" ON "sectors_produits_lies" USING btree ("_parent_id");
  CREATE INDEX "sectors_expertises_lies_order_idx" ON "sectors_expertises_lies" USING btree ("_order");
  CREATE INDEX "sectors_expertises_lies_parent_id_idx" ON "sectors_expertises_lies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sectors_slug_idx" ON "sectors" USING btree ("slug");
  CREATE INDEX "sectors_updated_at_idx" ON "sectors" USING btree ("updated_at");
  CREATE INDEX "sectors_created_at_idx" ON "sectors" USING btree ("created_at");
  CREATE INDEX "sectors__status_idx" ON "sectors" USING btree ("_status");
  CREATE INDEX "_sectors_v_version_enjeux_order_idx" ON "_sectors_v_version_enjeux" USING btree ("_order");
  CREATE INDEX "_sectors_v_version_enjeux_parent_id_idx" ON "_sectors_v_version_enjeux" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_version_regulation_order_idx" ON "_sectors_v_version_regulation" USING btree ("_order");
  CREATE INDEX "_sectors_v_version_regulation_parent_id_idx" ON "_sectors_v_version_regulation" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_version_produits_lies_order_idx" ON "_sectors_v_version_produits_lies" USING btree ("_order");
  CREATE INDEX "_sectors_v_version_produits_lies_parent_id_idx" ON "_sectors_v_version_produits_lies" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_version_expertises_lies_order_idx" ON "_sectors_v_version_expertises_lies" USING btree ("_order");
  CREATE INDEX "_sectors_v_version_expertises_lies_parent_id_idx" ON "_sectors_v_version_expertises_lies" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_parent_idx" ON "_sectors_v" USING btree ("parent_id");
  CREATE INDEX "_sectors_v_version_version_slug_idx" ON "_sectors_v" USING btree ("version_slug");
  CREATE INDEX "_sectors_v_version_version_updated_at_idx" ON "_sectors_v" USING btree ("version_updated_at");
  CREATE INDEX "_sectors_v_version_version_created_at_idx" ON "_sectors_v" USING btree ("version_created_at");
  CREATE INDEX "_sectors_v_version_version__status_idx" ON "_sectors_v" USING btree ("version__status");
  CREATE INDEX "_sectors_v_created_at_idx" ON "_sectors_v" USING btree ("created_at");
  CREATE INDEX "_sectors_v_updated_at_idx" ON "_sectors_v" USING btree ("updated_at");
  CREATE INDEX "_sectors_v_latest_idx" ON "_sectors_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expertises_fk" FOREIGN KEY ("expertises_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_expertises_id_idx" ON "payload_locked_documents_rels" USING btree ("expertises_id");
  CREATE INDEX "payload_locked_documents_rels_sectors_id_idx" ON "payload_locked_documents_rels" USING btree ("sectors_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "expertises_competences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertises_approche" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertises_produits_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertises" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertises_v_version_competences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertises_v_version_approche" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertises_v_version_produits_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertises_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_enjeux" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_regulation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_produits_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_expertises_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_version_enjeux" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_version_regulation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_version_produits_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_version_expertises_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "expertises_competences" CASCADE;
  DROP TABLE "expertises_approche" CASCADE;
  DROP TABLE "expertises_produits_lies" CASCADE;
  DROP TABLE "expertises" CASCADE;
  DROP TABLE "_expertises_v_version_competences" CASCADE;
  DROP TABLE "_expertises_v_version_approche" CASCADE;
  DROP TABLE "_expertises_v_version_produits_lies" CASCADE;
  DROP TABLE "_expertises_v" CASCADE;
  DROP TABLE "sectors_enjeux" CASCADE;
  DROP TABLE "sectors_regulation" CASCADE;
  DROP TABLE "sectors_produits_lies" CASCADE;
  DROP TABLE "sectors_expertises_lies" CASCADE;
  DROP TABLE "sectors" CASCADE;
  DROP TABLE "_sectors_v_version_enjeux" CASCADE;
  DROP TABLE "_sectors_v_version_regulation" CASCADE;
  DROP TABLE "_sectors_v_version_produits_lies" CASCADE;
  DROP TABLE "_sectors_v_version_expertises_lies" CASCADE;
  DROP TABLE "_sectors_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_expertises_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sectors_fk";
  
  ALTER TABLE "products_features" ALTER COLUMN "icon_key" SET DATA TYPE text;
  DROP TYPE "public"."enum_products_features_icon_key";
  CREATE TYPE "public"."enum_products_features_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  ALTER TABLE "products_features" ALTER COLUMN "icon_key" SET DATA TYPE "public"."enum_products_features_icon_key" USING "icon_key"::"public"."enum_products_features_icon_key";
  ALTER TABLE "products" ALTER COLUMN "icon_key" SET DATA TYPE text;
  DROP TYPE "public"."enum_products_icon_key";
  CREATE TYPE "public"."enum_products_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  ALTER TABLE "products" ALTER COLUMN "icon_key" SET DATA TYPE "public"."enum_products_icon_key" USING "icon_key"::"public"."enum_products_icon_key";
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon_key" SET DATA TYPE text;
  DROP TYPE "public"."enum__products_v_version_features_icon_key";
  CREATE TYPE "public"."enum__products_v_version_features_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon_key" SET DATA TYPE "public"."enum__products_v_version_features_icon_key" USING "icon_key"::"public"."enum__products_v_version_features_icon_key";
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon_key" SET DATA TYPE text;
  DROP TYPE "public"."enum__products_v_version_icon_key";
  CREATE TYPE "public"."enum__products_v_version_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon_key" SET DATA TYPE "public"."enum__products_v_version_icon_key" USING "version_icon_key"::"public"."enum__products_v_version_icon_key";
  DROP INDEX "payload_locked_documents_rels_expertises_id_idx";
  DROP INDEX "payload_locked_documents_rels_sectors_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "expertises_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sectors_id";
  DROP TYPE "public"."enum_expertises_slug";
  DROP TYPE "public"."enum_expertises_icon_key";
  DROP TYPE "public"."enum_expertises_status";
  DROP TYPE "public"."enum__expertises_v_version_slug";
  DROP TYPE "public"."enum__expertises_v_version_icon_key";
  DROP TYPE "public"."enum__expertises_v_version_status";
  DROP TYPE "public"."enum_sectors_slug";
  DROP TYPE "public"."enum_sectors_icon_key";
  DROP TYPE "public"."enum_sectors_status";
  DROP TYPE "public"."enum__sectors_v_version_slug";
  DROP TYPE "public"."enum__sectors_v_version_icon_key";
  DROP TYPE "public"."enum__sectors_v_version_status";`)
}
