import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Disable prepared statements for Supabase Transaction Pooler
const client = postgres(connectionString, {
  prepare: false,
});

// drizzle-orm 1.x RC: the client is passed inside a config object.
export const db = drizzle({ client });