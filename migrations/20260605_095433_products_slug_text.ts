import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "slug" SET DATA TYPE varchar;
  ALTER TABLE "_products_v" ALTER COLUMN "version_slug" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_products_slug";
  DROP TYPE "public"."enum__products_v_version_slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_slug" AS ENUM('nexusrh', 'nexuserp', 'sygescom', 'agrosense', 'qualitos', 'fraud-shield', 'smart-city');
  CREATE TYPE "public"."enum__products_v_version_slug" AS ENUM('nexusrh', 'nexuserp', 'sygescom', 'agrosense', 'qualitos', 'fraud-shield', 'smart-city');
  ALTER TABLE "products" ALTER COLUMN "slug" SET DATA TYPE "public"."enum_products_slug" USING "slug"::"public"."enum_products_slug";
  ALTER TABLE "_products_v" ALTER COLUMN "version_slug" SET DATA TYPE "public"."enum__products_v_version_slug" USING "version_slug"::"public"."enum__products_v_version_slug";`)
}
