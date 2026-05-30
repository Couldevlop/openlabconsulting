import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "reassurance_settings_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL
  );
  
  CREATE TABLE "reassurance_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "reassurance_settings_partners" ADD CONSTRAINT "reassurance_settings_partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reassurance_settings_partners" ADD CONSTRAINT "reassurance_settings_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reassurance_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "reassurance_settings_partners_order_idx" ON "reassurance_settings_partners" USING btree ("_order");
  CREATE INDEX "reassurance_settings_partners_parent_id_idx" ON "reassurance_settings_partners" USING btree ("_parent_id");
  CREATE INDEX "reassurance_settings_partners_logo_idx" ON "reassurance_settings_partners" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "reassurance_settings_partners" CASCADE;
  DROP TABLE "reassurance_settings" CASCADE;`)
}
