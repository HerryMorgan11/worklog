import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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