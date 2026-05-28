import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies" DROP COLUMN "status";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies" ADD COLUMN "status" "enum_case_studies_status" DEFAULT 'draft';
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_status" "enum__case_studies_v_version_status" DEFAULT 'draft';`)
}
