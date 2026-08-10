import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  if (!_db) {
    const client = postgres(url, {
      prepare: false,
      ssl: "require",
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    _db = drizzle(client);
  }

  return _db;
}
