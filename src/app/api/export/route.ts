import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth";
import {
  evidenceForUser,
  listBlocks,
  listCategories,
} from "@/lib/db/queries";

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const stamp = new Date().toISOString().slice(0, 10);

  const categories = listCategories(userId);
  const { rows } = listBlocks(
    userId,
    { status: "all", sort: "recent" },
    { limit: 100_000 },
  );
  const evidenceRows = evidenceForUser(userId);

  const evidenceByBlock = new Map<string, typeof evidenceRows>();
  for (const row of evidenceRows) {
    const list = evidenceByBlock.get(row.blockId) ?? [];
    list.push(row);
    evidenceByBlock.set(row.blockId, list);
  }

  const records = rows.map(({ block, category }) => ({
    seq: block.seq,
    handle: block.handle,
    displayName: block.displayName,
    status: block.status,
    reason: block.reason,
    category: category?.name ?? null,
    notes: block.notes,
    blockedAt: block.blockedAt,
    reviewAt: block.reviewAt,
    unblockedAt: block.unblockedAt,
    createdAt: block.createdAt,
    updatedAt: block.updatedAt,
    evidence: (evidenceByBlock.get(block.id) ?? []).map((e) => ({
      kind: e.kind,
      label: e.label,
      url: e.url,
    })),
  }));

  if (format === "csv") {
    const header = [
      "seq",
      "handle",
      "display_name",
      "status",
      "reason",
      "category",
      "blocked_at",
      "review_at",
      "unblocked_at",
      "notes",
      "evidence",
    ];
    const lines = [header.join(",")];
    for (const r of records) {
      lines.push(
        [
          r.seq,
          r.handle,
          r.displayName,
          r.status,
          r.reason,
          r.category,
          r.blockedAt,
          r.reviewAt,
          r.unblockedAt,
          r.notes,
          r.evidence
            .map((e) => (e.label ? `${e.label} ${e.url}` : e.url))
            .join(" | "),
        ]
          .map(csvCell)
          .join(","),
      );
    }
    return new Response(lines.join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="blxckt-${stamp}.csv"`,
      },
    });
  }

  const payload = {
    app: "blxckt",
    version: 1,
    exportedAt: new Date().toISOString(),
    account: { email: session.user.email, handle: session.user.handle },
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
    })),
    blocks: records,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="blxckt-${stamp}.json"`,
    },
  });
}
