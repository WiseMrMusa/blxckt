import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

// Default lives under ./data; make the static path obvious to the bundler's
// file tracing. DATABASE_PATH may point elsewhere, so ignore tracing for it.
const defaultPath = path.join(process.cwd(), "data", "blxckt.db");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
  : defaultPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

function create() {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Reuse the connection across dev hot-reloads so we don't leak file handles.
const globalForDb = globalThis as unknown as {
  __blxcktDb?: ReturnType<typeof create>;
};

export const db = globalForDb.__blxcktDb ?? create();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__blxcktDb = db;
}

export { schema };
export type Database = typeof db;
