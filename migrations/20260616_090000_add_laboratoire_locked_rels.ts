import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Correctif : la migration `20260612_120000_add_laboratoire_collections` a
 * créé les tables `rd_axes` / `publications` / `partnerships` mais a OMIS les
 * colonnes de relation correspondantes sur `payload_locked_documents_rels`.
 *
 * Conséquence : l'admin Payload (verrouillage de documents) interroge
 * `payload_locked_documents` en joignant `rd_axes_id` / `publications_id` /
 * `partnerships_id` → en prod (schéma issu des migrations) la requête échoue
 * (« column ... does not exist ») et l'admin renvoie une exception serveur
 * après connexion. Reproduit le motif des autres collections (cf.
 * `20260528_180745_add_products`).
 *
 * Idempotent (IF NOT EXISTS + garde duplicate_object) pour pouvoir aussi être
 * appliqué à chaud sur une base déjà partiellement migrée.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "rd_axes_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "publications_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "partnerships_id" integer;

   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rd_axes_fk" FOREIGN KEY ("rd_axes_id") REFERENCES "public"."rd_axes"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partnerships_fk" FOREIGN KEY ("partnerships_id") REFERENCES "public"."partnerships"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_rd_axes_id_idx" ON "payload_locked_documents_rels" USING btree ("rd_axes_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partnerships_id_idx" ON "payload_locked_documents_rels" USING btree ("partnerships_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "payload_locked_documents_rels_rd_axes_id_idx";
   DROP INDEX IF EXISTS "payload_locked_documents_rels_publications_id_idx";
   DROP INDEX IF EXISTS "payload_locked_documents_rels_partnerships_id_idx";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "rd_axes_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "publications_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "partnerships_id";`)
}
