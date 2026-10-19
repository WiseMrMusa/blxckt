import "server-only";

import { and, asc, desc, eq, like, lte, or, sql } from "drizzle-orm";

import { db } from "./index";
import {
  blocks,
  categories,
  evidence,
  type Block,
  type Category,
} from "./schema";
import { newId } from "../util";

export type BlockWithCategory = {
  block: Block;
  category: Category | null;
};

export type BlockWithDetail = BlockWithCategory & {
  evidence: Array<typeof evidence.$inferSelect>;
};

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export function listCategories(userId: string): Category[] {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
    .all();
}

export function getCategory(userId: string, id: string): Category | null {
  return (
    db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .get() ?? null
  );
}

export function categoryCounts(
  userId: string,
): Array<{ categoryId: string | null; count: number }> {
  return db
    .select({
      categoryId: blocks.categoryId,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(blocks)
    .where(and(eq(blocks.userId, userId), eq(blocks.status, "blocked")))
    .groupBy(blocks.categoryId)
    .all();
}

const DEFAULT_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: "Harassment", color: "#ff4d2e" },
  { name: "Spam / Bot", color: "#e0a33a" },
  { name: "Bad Faith", color: "#9d7bff" },
  { name: "Personal", color: "#5aa9e6" },
];

export function createDefaultCategories(userId: string) {
  const now = new Date();
  db.insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((c) => ({
        id: newId(),
        userId,
        name: c.name,
        color: c.color,
        createdAt: now,
      })),
    )
    .run();
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

export type BlockFilters = {
  query?: string;
  status?: "blocked" | "unblocked" | "all";
  categoryId?: string;
  sort?: "recent" | "oldest" | "handle";
};

function blockWhere(userId: string, filters: BlockFilters) {
  const clauses = [eq(blocks.userId, userId)];

  const status = filters.status ?? "blocked";
  if (status !== "all") {
    clauses.push(eq(blocks.status, status));
  }

  if (filters.categoryId) {
    clauses.push(eq(blocks.categoryId, filters.categoryId));
  }

  const q = filters.query?.trim();
  if (q) {
    const needle = `%${q.replace(/^@+/, "")}%`;
    clauses.push(
      or(
        like(blocks.handle, needle),
        like(blocks.reason, needle),
        like(blocks.notes, needle),
        like(blocks.displayName, needle),
      )!,
    );
  }

  return and(...clauses);
}

export function listBlocks(
  userId: string,
  filters: BlockFilters = {},
  opts: { limit?: number; offset?: number } = {},
): { rows: BlockWithCategory[]; total: number } {
  const where = blockWhere(userId, filters);

  const orderBy =
    filters.sort === "oldest"
      ? asc(blocks.blockedAt)
      : filters.sort === "handle"
        ? asc(blocks.handle)
        : desc(blocks.blockedAt);

  const rows = db
    .select({ block: blocks, category: categories })
    .from(blocks)
    .leftJoin(categories, eq(blocks.categoryId, categories.id))
    .where(where)
    .orderBy(orderBy, desc(blocks.createdAt))
    .limit(opts.limit ?? 100)
    .offset(opts.offset ?? 0)
    .all();

  const total =
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(blocks)
      .where(where)
      .get()?.count ?? 0;

  return { rows, total };
}

export function getBlock(
  userId: string,
  id: string,
): BlockWithDetail | null {
  const row = db
    .select({ block: blocks, category: categories })
    .from(blocks)
    .leftJoin(categories, eq(blocks.categoryId, categories.id))
    .where(and(eq(blocks.id, id), eq(blocks.userId, userId)))
    .get();

  if (!row) return null;

  const evidenceRows = db
    .select()
    .from(evidence)
    .where(eq(evidence.blockId, id))
    .orderBy(asc(evidence.createdAt))
    .all();

  return { ...row, evidence: evidenceRows };
}

export function findBlockByHandle(
  userId: string,
  handle: string,
): Block | null {
  return (
    db
      .select()
      .from(blocks)
      .where(and(eq(blocks.userId, userId), eq(blocks.handle, handle)))
      .get() ?? null
  );
}

export function nextSeq(userId: string): number {
  const max =
    db
      .select({ max: sql<number>`coalesce(max(${blocks.seq}), 0)`.mapWith(Number) })
      .from(blocks)
      .where(eq(blocks.userId, userId))
      .get()?.max ?? 0;
  return max + 1;
}

export function recentBlocks(
  userId: string,
  limit = 5,
): BlockWithCategory[] {
  return db
    .select({ block: blocks, category: categories })
    .from(blocks)
    .leftJoin(categories, eq(blocks.categoryId, categories.id))
    .where(eq(blocks.userId, userId))
    .orderBy(desc(blocks.createdAt))
    .limit(limit)
    .all();
}

export type ReviewQueue = {
  overdue: BlockWithCategory[];
  upcoming: BlockWithCategory[];
};

/** Blocked accounts whose review date has arrived (overdue) or is within `windowDays`. */
export function reviewQueue(userId: string, windowDays = 0): ReviewQueue {
  const now = Date.now();
  const cutoff = new Date(now + windowDays * 86_400_000);
  const rows = db
    .select({ block: blocks, category: categories })
    .from(blocks)
    .leftJoin(categories, eq(blocks.categoryId, categories.id))
    .where(
      and(
        eq(blocks.userId, userId),
        eq(blocks.status, "blocked"),
        lte(blocks.reviewAt, cutoff),
      ),
    )
    .orderBy(asc(blocks.reviewAt))
    .limit(200)
    .all();

  const overdue: BlockWithCategory[] = [];
  const upcoming: BlockWithCategory[] = [];
  for (const row of rows) {
    if ((row.block.reviewAt?.getTime() ?? 0) <= now) overdue.push(row);
    else upcoming.push(row);
  }

  return { overdue, upcoming };
}

/** All evidence rows for a user, joined through their blocks. */
export function evidenceForUser(userId: string) {
  return db
    .select({
      blockId: evidence.blockId,
      kind: evidence.kind,
      label: evidence.label,
      url: evidence.url,
      createdAt: evidence.createdAt,
    })
    .from(evidence)
    .innerJoin(blocks, eq(evidence.blockId, blocks.id))
    .where(eq(blocks.userId, userId))
    .all();
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

export type Stats = {
  total: number;
  blocked: number;
  unblocked: number;
  thisMonth: number;
  dueReview: number;
  upcomingReview: number;
  byCategory: Array<{ category: Category | null; count: number }>;
  timeline: Array<{ month: string; count: number }>;
};

export function getStats(userId: string): Stats {
  const rows = db
    .select({
      status: blocks.status,
      blockedAt: blocks.blockedAt,
      categoryId: blocks.categoryId,
      reviewAt: blocks.reviewAt,
    })
    .from(blocks)
    .where(eq(blocks.userId, userId))
    .all();

  const cats = listCategories(userId);
  const catById = new Map(cats.map((c) => [c.id, c]));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dueCutoff = now;
  const upcomingCutoff = new Date(now.getTime() + 30 * 86_400_000);

  let blocked = 0;
  let unblocked = 0;
  let thisMonth = 0;
  let dueReview = 0;
  let upcomingReview = 0;
  const counts = new Map<string | null, number>();

  for (const row of rows) {
    if (row.status === "blocked") {
      blocked += 1;
      counts.set(row.categoryId, (counts.get(row.categoryId) ?? 0) + 1);
      if (row.reviewAt) {
        const t = row.reviewAt.getTime();
        if (t <= dueCutoff.getTime()) dueReview += 1;
        else if (t <= upcomingCutoff.getTime()) upcomingReview += 1;
      }
    } else {
      unblocked += 1;
    }
    if (row.blockedAt >= monthStart) thisMonth += 1;
  }

  const byCategory = [...counts.entries()]
    .map(([categoryId, count]) => ({
      category: categoryId ? (catById.get(categoryId) ?? null) : null,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Last 12 months timeline.
  const timeline: Array<{ month: string; count: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = rows.filter(
      (r) => r.blockedAt >= start && r.blockedAt < end,
    ).length;
    timeline.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      count,
    });
  }

  return {
    total: rows.length,
    blocked,
    unblocked,
    thisMonth,
    dueReview,
    upcomingReview,
    byCategory,
    timeline,
  };
}
