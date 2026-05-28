import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "methodologie_axes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"index" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"punchline" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "methodologie" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title_lead" varchar,
  	"title_highlight" varchar,
  	"intro" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "methodologie_axes" ADD CONSTRAINT "methodologie_axes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."methodologie"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "methodologie_axes_order_idx" ON "methodologie_axes" USING btree ("_order");
  CREATE INDEX "methodologie_axes_parent_id_idx" ON "methodologie_axes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "methodologie_axes" CASCADE;
  DROP TABLE "methodologie" CASCADE;`)
}
