import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const timeEntryStatusEnum = pgEnum("time_entry_status", [
  "DRAFT",
  "APPROVED",
  "SYNCING",
  "SYNCED",
  "ERROR",
]);

export type TimeEntryStatus = (typeof timeEntryStatusEnum.enumValues)[number];

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
