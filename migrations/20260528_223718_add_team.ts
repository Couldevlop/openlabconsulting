import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_publications_pub_type" AS ENUM('Livre', 'Livre blanc', 'Conférence', 'Article pair-évalué');
  CREATE TYPE "public"."enum_team_publications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_publications_v_version_pub_type" AS ENUM('Livre', 'Livre blanc', 'Conférence', 'Article pair-évalué');
  CREATE TYPE "public"."enum__team_publications_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "team_members_bio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "team_members_focus_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "team_members_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" varchar,
  	"name" varchar,
  	"job_title" varchar,
  	"short_bio" varchar,
  	"image_id" integer,
  	"quote" varchar,
  	"order" numeric DEFAULT 100,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_members_v_version_bio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_members_v_version_focus_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_members_v_version_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_member_id" varchar,
  	"version_name" varchar,
  	"version_job_title" varchar,
  	"version_short_bio" varchar,
  	"version_image_id" integer,
  	"version_quote" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "team_publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pub_type" "enum_team_publications_pub_type" DEFAULT 'Livre',
  	"title" varchar,
  	"year" numeric,
  	"description" varchar,
  	"href" varchar,
  	"order" numeric DEFAULT 100,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_publications_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_publications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_pub_type" "enum__team_publications_v_version_pub_type" DEFAULT 'Livre',
  	"version_title" varchar,
  	"version_year" numeric,
  	"version_description" varchar,
  	"version_href" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_publications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_publications_id" integer;
  ALTER TABLE "team_members_bio" ADD CONSTRAINT "team_members_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members_focus_areas" ADD CONSTRAINT "team_members_focus_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members_same_as" ADD CONSTRAINT "team_members_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_bio" ADD CONSTRAINT "_team_members_v_version_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_focus_areas" ADD CONSTRAINT "_team_members_v_version_focus_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_same_as" ADD CONSTRAINT "_team_members_v_version_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_publications_v" ADD CONSTRAINT "_team_publications_v_parent_id_team_publications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_publications"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "team_members_bio_order_idx" ON "team_members_bio" USING btree ("_order");
  CREATE INDEX "team_members_bio_parent_id_idx" ON "team_members_bio" USING btree ("_parent_id");
  CREATE INDEX "team_members_focus_areas_order_idx" ON "team_members_focus_areas" USING btree ("_order");
  CREATE INDEX "team_members_focus_areas_parent_id_idx" ON "team_members_focus_areas" USING btree ("_parent_id");
  CREATE INDEX "team_members_same_as_order_idx" ON "team_members_same_as" USING btree ("_order");
  CREATE INDEX "team_members_same_as_parent_id_idx" ON "team_members_same_as" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "team_members_member_id_idx" ON "team_members" USING btree ("member_id");
  CREATE INDEX "team_members_image_idx" ON "team_members" USING btree ("image_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE INDEX "_team_members_v_version_bio_order_idx" ON "_team_members_v_version_bio" USING btree ("_order");
  CREATE INDEX "_team_members_v_version_bio_parent_id_idx" ON "_team_members_v_version_bio" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_version_focus_areas_order_idx" ON "_team_members_v_version_focus_areas" USING btree ("_order");
  CREATE INDEX "_team_members_v_version_focus_areas_parent_id_idx" ON "_team_members_v_version_focus_areas" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_version_same_as_order_idx" ON "_team_members_v_version_same_as" USING btree ("_order");
  CREATE INDEX "_team_members_v_version_same_as_parent_id_idx" ON "_team_members_v_version_same_as" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_member_id_idx" ON "_team_members_v" USING btree ("version_member_id");
  CREATE INDEX "_team_members_v_version_version_image_idx" ON "_team_members_v" USING btree ("version_image_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "team_publications_updated_at_idx" ON "team_publications" USING btree ("updated_at");
  CREATE INDEX "team_publications_created_at_idx" ON "team_publications" USING btree ("created_at");
  CREATE INDEX "team_publications__status_idx" ON "team_publications" USING btree ("_status");
  CREATE INDEX "_team_publications_v_parent_idx" ON "_team_publications_v" USING btree ("parent_id");
  CREATE INDEX "_team_publications_v_version_version_updated_at_idx" ON "_team_publications_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_publications_v_version_version_created_at_idx" ON "_team_publications_v" USING btree ("version_created_at");
  CREATE INDEX "_team_publications_v_version_version__status_idx" ON "_team_publications_v" USING btree ("version__status");
  CREATE INDEX "_team_publications_v_created_at_idx" ON "_team_publications_v" USING btree ("created_at");
  CREATE INDEX "_team_publications_v_updated_at_idx" ON "_team_publications_v" USING btree ("updated_at");
  CREATE INDEX "_team_publications_v_latest_idx" ON "_team_publications_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_publications_fk" FOREIGN KEY ("team_publications_id") REFERENCES "public"."team_publications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_team_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("team_publications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_members_bio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_focus_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_version_bio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_version_focus_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_version_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_publications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_publications_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "team_members_bio" CASCADE;
  DROP TABLE "team_members_focus_areas" CASCADE;
  DROP TABLE "team_members_same_as" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "_team_members_v_version_bio" CASCADE;
  DROP TABLE "_team_members_v_version_focus_areas" CASCADE;
  DROP TABLE "_team_members_v_version_same_as" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "team_publications" CASCADE;
  DROP TABLE "_team_publications_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_publications_fk";
  
  DROP INDEX "payload_locked_documents_rels_team_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_publications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_publications_id";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum_team_publications_pub_type";
  DROP TYPE "public"."enum_team_publications_status";
  DROP TYPE "public"."enum__team_publications_v_version_pub_type";
  DROP TYPE "public"."enum__team_publications_v_version_status";`)
}
