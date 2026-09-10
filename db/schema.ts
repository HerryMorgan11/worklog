import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/*
|--------------------------------------------------------------------------
| ENUMS
|--------------------------------------------------------------------------
*/

export const timeEntryStatusEnum = pgEnum("time_entry_status", [
  "DRAFT",
  "APPROVED",
  "SYNCING",
  "SYNCED",
  "ERROR",
]);

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    clerkUserId: varchar("clerk_user_id", {
      length: 255,
    }).notNull(),

    email: varchar("email", {
      length: 320,
    }),

    name: varchar("name", {
      length: 255,
    }),

    avatarUrl: text("avatar_url"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId),
  ],
);

/*
|--------------------------------------------------------------------------
| REDMINE CONFIG
|--------------------------------------------------------------------------
*/

export const redmineConfigs = pgTable(
  "redmine_configs",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    baseUrl: text("base_url").notNull(),

    apiKeyEncrypted: text("api_key_encrypted"),

    redmineUserId: integer("redmine_user_id"),

    redmineUsername: varchar("redmine_username", {
      length: 255,
    }),

    enabled: boolean("enabled")
      .default(true)
      .notNull(),

    lastConnectionAt: timestamp("last_connection_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // 1:1 con users — quitar el UNIQUE en el futuro si pasa a 1:N
    uniqueIndex("redmine_configs_user_id_idx").on(table.userId),
  ],
);

/*
|--------------------------------------------------------------------------
| USER SETTINGS
|--------------------------------------------------------------------------
*/

export const userSettings = pgTable(
  "user_settings",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    dailyTargetHours: numeric("daily_target_hours", {
      precision: 4,
      scale: 2,
      mode: "number",
    }).default(8),

    weeklyTargetHours: numeric("weekly_target_hours", {
      precision: 5,
      scale: 2,
      mode: "number",
    }).default(40),

    timezone: varchar("timezone", {
      length: 100,
    }).default("Europe/Madrid"),

    workingDays: jsonb("working_days").$type<string[]>(),

    defaultDescription: text("default_description"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // 1:1 con users
    uniqueIndex("user_settings_user_id_idx").on(table.userId),
  ],
);

/*
|--------------------------------------------------------------------------
| TIME ENTRIES
|--------------------------------------------------------------------------
*/

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    date: date("date", {
      mode: "string",
    }).notNull(),

    hours: numeric("hours", {
      precision: 5,
      scale: 2,
      mode: "number",
    }).notNull(),

    description: text("description"),

    status: timeEntryStatusEnum("status")
      .default("DRAFT")
      .notNull(),

    redmineProjectId: integer("redmine_project_id"),

    redmineIssueId: integer("redmine_issue_id"),

    redmineActivityId: integer("redmine_activity_id"),

    redmineTimeEntryId: integer("redmine_time_entry_id"),

    approvedAt: timestamp("approved_at", {
      withTimezone: true,
    }),

    syncedAt: timestamp("synced_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("time_entries_user_id_idx").on(table.userId),
    index("time_entries_user_date_idx").on(table.userId, table.date),
    index("time_entries_user_status_idx").on(table.userId, table.status),
  ],
);

/*
|--------------------------------------------------------------------------
| SYNC LOGS
|--------------------------------------------------------------------------
*/

export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    timeEntryId: uuid("time_entry_id")
      .notNull()
      .references(() => timeEntries.id, {
        onDelete: "cascade",
      }),

    status: varchar("status", {
      length: 50,
    }).notNull(),

    requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),

    responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),

    httpStatus: integer("http_status"),

    errorMessage: text("error_message"),

    attemptNumber: integer("attempt_number")
      .default(1)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sync_logs_time_entry_id_idx").on(table.timeEntryId),
  ],
);