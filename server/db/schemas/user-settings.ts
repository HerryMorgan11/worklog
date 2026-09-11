import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";


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