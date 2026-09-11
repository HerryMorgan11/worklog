import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timeEntries } from "./time-entries";

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