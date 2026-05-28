import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_features_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  CREATE TYPE "public"."enum_products_slug" AS ENUM('nexusrh', 'nexuserp', 'sygescom', 'agrosense', 'qualitos', 'fraud-shield', 'smart-city');
  CREATE TYPE "public"."enum_products_maturity" AS ENUM('production', 'pilot', 'mvp', 'dev');
  CREATE TYPE "public"."enum_products_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  CREATE TYPE "public"."enum_products_pricing_model" AS ENUM('saas', 'license', 'quote');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_features_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  CREATE TYPE "public"."enum__products_v_version_slug" AS ENUM('nexusrh', 'nexuserp', 'sygescom', 'agrosense', 'qualitos', 'fraud-shield', 'smart-city');
  CREATE TYPE "public"."enum__products_v_version_maturity" AS ENUM('production', 'pilot', 'mvp', 'dev');
  CREATE TYPE "public"."enum__products_v_version_icon_key" AS ENUM('users', 'badge-check', 'building', 'scan-search', 'fuel', 'sprout', 'radar');
  CREATE TYPE "public"."enum__products_v_version_pricing_model" AS ENUM('saas', 'license', 'quote');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_key" "enum_products_features_icon_key",
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "products_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "products_proofs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "products_pricing_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "products_expertises_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_products_slug",
  	"name" varchar,
  	"tagline" varchar,
  	"target" varchar,
  	"maturity" "enum_products_maturity" DEFAULT 'production',
  	"status_label" varchar,
  	"eyebrow" varchar,
  	"intro" varchar,
  	"problem" varchar,
  	"icon_key" "enum_products_icon_key",
  	"pricing_model" "enum_products_pricing_model" DEFAULT 'quote',
  	"pricing_headline" varchar,
  	"pricing_note" varchar,
  	"order" numeric DEFAULT 100,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_key" "enum__products_v_version_features_icon_key",
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_proofs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_pricing_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_expertises_lies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__products_v_version_slug",
  	"version_name" varchar,
  	"version_tagline" varchar,
  	"version_target" varchar,
  	"version_maturity" "enum__products_v_version_maturity" DEFAULT 'production',
  	"version_status_label" varchar,
  	"version_eyebrow" varchar,
  	"version_intro" varchar,
  	"version_problem" varchar,
  	"version_icon_key" "enum__products_v_version_icon_key",
  	"version_pricing_model" "enum__products_v_version_pricing_model" DEFAULT 'quote',
  	"version_pricing_headline" varchar,
  	"version_pricing_note" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_stack" ADD CONSTRAINT "products_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_proofs" ADD CONSTRAINT "products_proofs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_pricing_details" ADD CONSTRAINT "products_pricing_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_expertises_lies" ADD CONSTRAINT "products_expertises_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_stack" ADD CONSTRAINT "_products_v_version_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_proofs" ADD CONSTRAINT "_products_v_version_proofs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_pricing_details" ADD CONSTRAINT "_products_v_version_pricing_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_expertises_lies" ADD CONSTRAINT "_products_v_version_expertises_lies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_stack_order_idx" ON "products_stack" USING btree ("_order");
  CREATE INDEX "products_stack_parent_id_idx" ON "products_stack" USING btree ("_parent_id");
  CREATE INDEX "products_proofs_order_idx" ON "products_proofs" USING btree ("_order");
  CREATE INDEX "products_proofs_parent_id_idx" ON "products_proofs" USING btree ("_parent_id");
  CREATE INDEX "products_pricing_details_order_idx" ON "products_pricing_details" USING btree ("_order");
  CREATE INDEX "products_pricing_details_parent_id_idx" ON "products_pricing_details" USING btree ("_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_expertises_lies_order_idx" ON "products_expertises_lies" USING btree ("_order");
  CREATE INDEX "products_expertises_lies_parent_id_idx" ON "products_expertises_lies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_stack_order_idx" ON "_products_v_version_stack" USING btree ("_order");
  CREATE INDEX "_products_v_version_stack_parent_id_idx" ON "_products_v_version_stack" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_proofs_order_idx" ON "_products_v_version_proofs" USING btree ("_order");
  CREATE INDEX "_products_v_version_proofs_parent_id_idx" ON "_products_v_version_proofs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_pricing_details_order_idx" ON "_products_v_version_pricing_details" USING btree ("_order");
  CREATE INDEX "_products_v_version_pricing_details_parent_id_idx" ON "_products_v_version_pricing_details" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_expertises_lies_order_idx" ON "_products_v_version_expertises_lies" USING btree ("_order");
  CREATE INDEX "_products_v_version_expertises_lies_parent_id_idx" ON "_products_v_version_expertises_lies" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_stack" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_proofs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_pricing_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_expertises_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_stack" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_proofs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_pricing_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_expertises_lies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products_stack" CASCADE;
  DROP TABLE "products_proofs" CASCADE;
  DROP TABLE "products_pricing_details" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products_expertises_lies" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "_products_v_version_stack" CASCADE;
  DROP TABLE "_products_v_version_proofs" CASCADE;
  DROP TABLE "_products_v_version_pricing_details" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v_version_expertises_lies" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  DROP TYPE "public"."enum_products_features_icon_key";
  DROP TYPE "public"."enum_products_slug";
  DROP TYPE "public"."enum_products_maturity";
  DROP TYPE "public"."enum_products_icon_key";
  DROP TYPE "public"."enum_products_pricing_model";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_features_icon_key";
  DROP TYPE "public"."enum__products_v_version_slug";
  DROP TYPE "public"."enum__products_v_version_maturity";
  DROP TYPE "public"."enum__products_v_version_icon_key";
  DROP TYPE "public"."enum__products_v_version_pricing_model";
  DROP TYPE "public"."enum__products_v_version_status";`)
}
