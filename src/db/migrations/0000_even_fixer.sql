CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"barcode" varchar(100) NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 10 NOT NULL,
	"expiry_date" timestamp,
	CONSTRAINT "medications_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_id" integer NOT NULL,
	"medication_id" integer NOT NULL,
	"dose" varchar(100) NOT NULL,
	"duration" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" varchar(50) NOT NULL,
	"doctor_id" varchar(255) NOT NULL,
	"diagnosis" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dispensed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "student_medical_records" (
	"university_id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"blood_type" varchar(10),
	"allergies" text,
	"chronic_diseases" text,
	"rfid_tag" varchar(100),
	CONSTRAINT "student_medical_records_rfid_tag_unique" UNIQUE("rfid_tag")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" varchar(50) NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_student_id_student_medical_records_university_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_medical_records"("university_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_medical_records" ADD CONSTRAINT "student_medical_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;