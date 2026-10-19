import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_PATH ?? "./data/blxckt.db";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
