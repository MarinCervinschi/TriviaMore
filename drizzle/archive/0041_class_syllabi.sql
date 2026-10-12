CREATE TABLE "catalog"."class_syllabi" (
	"class_id" uuid PRIMARY KEY NOT NULL,
	"academic_year" integer NOT NULL,
	"catalogue_url" text,
	"objectives" text,
	"contents" text,
	"prerequisites" text,
	"assessment" text,
	"readings" text,
	"teaching_methods" text,
	"outcomes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."class_syllabi" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "catalog"."class_syllabi" ADD CONSTRAINT "class_syllabi_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;