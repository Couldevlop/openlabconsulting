import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Collection `publications` : ajout des colonnes `slug` (page de détail
 * /laboratoire/publications/<slug>) et `abstract` (résumé long).
 *
 * Rédigée à la main (chaîne de snapshots drizzle interrompue depuis
 * `add_visits`). Colonnes nullables (les publications sans slug n'ont pas
 * de page de détail).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "slug" varchar;
   ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "abstract" varchar;
   CREATE INDEX IF NOT EXISTS "publications_slug_idx" ON "publications" USING btree ("slug");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "publications_slug_idx";
   ALTER TABLE "publications" DROP COLUMN IF EXISTS "slug";
   ALTER TABLE "publications" DROP COLUMN IF EXISTS "abstract";`)
}
