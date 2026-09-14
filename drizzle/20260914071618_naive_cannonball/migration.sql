CREATE TYPE "time_entry_status" AS ENUM('DRAFT', 'APPROVED', 'SYNCING', 'SYNCED', 'ERROR');--> statement-breakpoint
CREATE TABLE "redmine_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"base_url" text NOT NULL,
	"api_key_encrypted" text,
	"redmine_user_id" integer,
	"redmine_username" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"last_connection_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"time_entry_id" uuid NOT NULL,
	"status" varchar(50) NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"http_status" integer,
	"error_message" text,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"hours" numeric(5,2) NOT NULL,
	"description" text,
	"status" "time_entry_status" DEFAULT 'DRAFT'::"time_entry_status" NOT NULL,
	"redmine_project_id" integer,
	"redmine_issue_id" integer,
	"redmine_activity_id" integer,
	"redmine_time_entry_id" integer,
	"approved_at" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"daily_target_hours" numeric(4,2) DEFAULT '8',
	"weekly_target_hours" numeric(5,2) DEFAULT '40',
	"timezone" varchar(100) DEFAULT 'Europe/Madrid',
	"working_days" jsonb,
	"default_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerk_user_id" varchar(255) NOT NULL,
	"email" varchar(320),
	"name" varchar(255),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "redmine_configs_user_id_idx" ON "redmine_configs" ("user_id");--> statement-breakpoint
CREATE INDEX "sync_logs_time_entry_id_idx" ON "sync_logs" ("time_entry_id");--> statement-breakpoint
CREATE INDEX "time_entries_user_id_idx" ON "time_entries" ("user_id");--> statement-breakpoint
CREATE INDEX "time_entries_user_date_idx" ON "time_entries" ("user_id","date");--> statement-breakpoint
CREATE INDEX "time_entries_user_status_idx" ON "time_entries" ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_idx" ON "user_settings" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" ("clerk_user_id");--> statement-breakpoint
ALTER TABLE "redmine_configs" ADD CONSTRAINT "redmine_configs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_time_entry_id_time_entries_id_fkey" FOREIGN KEY ("time_entry_id") REFERENCES "time_entries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;