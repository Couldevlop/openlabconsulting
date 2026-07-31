import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Tables systeme de la file de taches Payload (`payload_jobs`,
 * `payload_jobs_log`), requises des lors que `jobs` est active dans la
 * configuration : c'est la file qui porte la generation des rapports
 * d'audit hors du cycle de la requete HTTP.
 *
 * Ecrite a la main et idempotente, conformement a la convention du depot
 * (cf. add_announcement_banner).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'generateAuditReport', 'remindPendingReports');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
DO $$ BEGIN
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'generateAuditReport', 'remindPendingReports');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  `)

  await db.execute(sql`
CREATE TABLE IF NOT EXISTS "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  `)

  await db.execute(sql`
DO $$ BEGIN
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  `)

  await db.execute(sql`
CREATE INDEX IF NOT EXISTS "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP TABLE IF EXISTS "payload_jobs_log" CASCADE;
  `)

  await db.execute(sql`
DROP TABLE IF EXISTS "payload_jobs" CASCADE;
  `)
}
