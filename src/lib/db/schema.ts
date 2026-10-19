import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Timestamp column stored as unix milliseconds, surfaced as a Date. */
const timestamp = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    // Their own X handle, optional. Stored without the leading @.
    handle: text("handle"),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    // sha256 of the raw session token. The raw token only ever lives in the cookie.
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#ff4d2e"),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("categories_user_name_unique").on(t.userId, t.name)],
);

export const blocks = sqliteTable(
  "blocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Per-user case number, increments from 1. */
    seq: integer("seq").notNull(),
    /** Account handle, lowercase, without the leading @. */
    handle: text("handle").notNull(),
    displayName: text("display_name"),
    reason: text("reason").notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    blockedAt: timestamp("blocked_at").notNull(),
    /** When to reconsider the block. Powers the review queue. */
    reviewAt: timestamp("review_at"),
    status: text("status", { enum: ["blocked", "unblocked"] })
      .notNull()
      .default("blocked"),
    unblockedAt: timestamp("unblocked_at"),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("blocks_user_handle_unique").on(t.userId, t.handle),
    index("blocks_user_idx").on(t.userId),
    index("blocks_user_status_idx").on(t.userId, t.status),
  ],
);

export const evidence = sqliteTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    blockId: text("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["link", "note"] })
      .notNull()
      .default("link"),
    label: text("label"),
    url: text("url"),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("evidence_block_idx").on(t.blockId)],
);

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
