import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Collection `audit_reports` : rapports d'audit IA generes depuis
 * /audit-ia, relus puis valides dans le back-office avant envoi au
 * prospect (cf. docs/superpowers/specs/2026-07-30-rapport-audit-ia-design.md).
 *
 * Ecrite a la main et idempotente (IF NOT EXISTS, DO $$ ... EXCEPTION),
 * conformement a la convention du depot depuis juin 2026
 * (cf. add_announcement_banner) : elle peut donc etre appliquee a chaud
 * en prod si le migrate-job ne tourne pas, et rejouee sans casse.
 *
 * Le fichier .json associe restaure un instantane COMPLET du schema :
 * la chaine etait interrompue depuis le 2026-06-07 (huit migrations sans
 * instantane), ce qui faisait produire a `payload migrate:create` un diff
 * aberrant recreant tout le schema. Les generations futures repartiront
 * de cet instantane.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum_audit_reports_status" AS ENUM('brouillon-ia', 'en-revue', 'valide', 'envoye', 'echec-generation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum_audit_reports_generated_by" AS ENUM('lucie-7b', 'squelette');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum__audit_reports_v_version_status" AS ENUM('brouillon-ia', 'en-revue', 'valide', 'envoye', 'echec-generation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum__audit_reports_v_version_generated_by" AS ENUM('lucie-7b', 'squelette');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "audit_reports_sections_roadmap" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"horizon" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "audit_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead_id" integer NOT NULL,
  	"status" "enum_audit_reports_status" DEFAULT 'brouillon-ia' NOT NULL,
  	"sections_synthesis" varchar NOT NULL,
  	"sections_situation" varchar NOT NULL,
  	"sections_recommendation" varchar NOT NULL,
  	"sections_next_steps" varchar NOT NULL,
  	"generated_by" "enum_audit_reports_generated_by" DEFAULT 'squelette' NOT NULL,
  	"generation_error" varchar,
  	"validated_by_id" integer,
  	"validated_at" timestamp(3) with time zone,
  	"pdf_key" varchar,
  	"sent_at" timestamp(3) with time zone,
  	"reminded_at" timestamp(3) with time zone,
  	"download_count" numeric DEFAULT 0,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "_audit_reports_v_version_sections_roadmap" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"horizon" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"_uuid" varchar
  );
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "_audit_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_lead_id" integer NOT NULL,
  	"version_status" "enum__audit_reports_v_version_status" DEFAULT 'brouillon-ia' NOT NULL,
  	"version_sections_synthesis" varchar NOT NULL,
  	"version_sections_situation" varchar NOT NULL,
  	"version_sections_recommendation" varchar NOT NULL,
  	"version_sections_next_steps" varchar NOT NULL,
  	"version_generated_by" "enum__audit_reports_v_version_generated_by" DEFAULT 'squelette' NOT NULL,
  	"version_generation_error" varchar,
  	"version_validated_by_id" integer,
  	"version_validated_at" timestamp(3) with time zone,
  	"version_pdf_key" varchar,
  	"version_sent_at" timestamp(3) with time zone,
  	"version_reminded_at" timestamp(3) with time zone,
  	"version_download_count" numeric DEFAULT 0,
  	"version_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  `)

  await db.execute(sql`
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "audit_reports_id" integer;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "audit_reports_sections_roadmap" ADD CONSTRAINT "audit_reports_sections_roadmap_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audit_reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "_audit_reports_v_version_sections_roadmap" ADD CONSTRAINT "_audit_reports_v_version_sections_roadmap_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audit_reports_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "_audit_reports_v" ADD CONSTRAINT "_audit_reports_v_parent_id_audit_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audit_reports"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "_audit_reports_v" ADD CONSTRAINT "_audit_reports_v_version_lead_id_leads_id_fk" FOREIGN KEY ("version_lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "_audit_reports_v" ADD CONSTRAINT "_audit_reports_v_version_validated_by_id_users_id_fk" FOREIGN KEY ("version_validated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_sections_roadmap_order_idx" ON "audit_reports_sections_roadmap" USING btree ("_order");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_sections_roadmap_parent_id_idx" ON "audit_reports_sections_roadmap" USING btree ("_parent_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_lead_idx" ON "audit_reports" USING btree ("lead_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_validated_by_idx" ON "audit_reports" USING btree ("validated_by_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_updated_at_idx" ON "audit_reports" USING btree ("updated_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "audit_reports_created_at_idx" ON "audit_reports" USING btree ("created_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_sections_roadmap_order_idx" ON "_audit_reports_v_version_sections_roadmap" USING btree ("_order");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_sections_roadmap_parent_id_idx" ON "_audit_reports_v_version_sections_roadmap" USING btree ("_parent_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_parent_idx" ON "_audit_reports_v" USING btree ("parent_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_version_lead_idx" ON "_audit_reports_v" USING btree ("version_lead_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_version_validated_by_idx" ON "_audit_reports_v" USING btree ("version_validated_by_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_version_updated_at_idx" ON "_audit_reports_v" USING btree ("version_updated_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_version_version_created_at_idx" ON "_audit_reports_v" USING btree ("version_created_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_created_at_idx" ON "_audit_reports_v" USING btree ("created_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "_audit_reports_v_updated_at_idx" ON "_audit_reports_v" USING btree ("updated_at");
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_reports_fk" FOREIGN KEY ("audit_reports_id") REFERENCES "public"."audit_reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_audit_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_reports_id");
  `)

  await db.execute(sql`
ALTER TABLE "audit_reports_sections_roadmap" DISABLE ROW LEVEL SECURITY;
  `)

  await db.execute(sql`
ALTER TABLE "audit_reports" DISABLE ROW LEVEL SECURITY;
  `)

  await db.execute(sql`
ALTER TABLE "_audit_reports_v_version_sections_roadmap" DISABLE ROW LEVEL SECURITY;
  `)

  await db.execute(sql`
ALTER TABLE "_audit_reports_v" DISABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_audit_reports_fk";
  `)

  await db.execute(sql`
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "audit_reports_id";
  `)

  await db.execute(sql`
DROP TABLE IF EXISTS "_audit_reports_v_version_sections_roadmap" CASCADE;
  `)

  await db.execute(sql`
DROP TABLE IF EXISTS "_audit_reports_v" CASCADE;
  `)

  await db.execute(sql`
DROP TABLE IF EXISTS "audit_reports_sections_roadmap" CASCADE;
  `)

  await db.execute(sql`
DROP TABLE IF EXISTS "audit_reports" CASCADE;
  `)

  await db.execute(sql`
DROP TYPE IF EXISTS "public"."enum__audit_reports_v_version_generated_by";
  `)

  await db.execute(sql`
DROP TYPE IF EXISTS "public"."enum__audit_reports_v_version_status";
  `)

  await db.execute(sql`
DROP TYPE IF EXISTS "public"."enum_audit_reports_generated_by";
  `)

  await db.execute(sql`
DROP TYPE IF EXISTS "public"."enum_audit_reports_status";
  `)
}
