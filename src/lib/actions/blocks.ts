"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "../auth";
import { db } from "../db";
import { blocks, evidence } from "../db/schema";
import { findBlockByHandle, getCategory, nextSeq } from "../db/queries";
import { newId } from "../util";
import {
  blockSchema,
  fieldErrors,
  readEvidence,
  type ActionState,
} from "../validation";

function revalidateBlockSurfaces(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/blocks");
  revalidatePath("/review");
  if (id) revalidatePath(`/blocks/${id}`);
}

export async function saveBlock(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const rawId = String(formData.get("blockId") ?? "");
  const blockId = rawId || null;

  const parsed = blockSchema.safeParse({
    handle: formData.get("handle"),
    displayName: formData.get("displayName"),
    reason: formData.get("reason"),
    categoryId: formData.get("categoryId"),
    notes: formData.get("notes"),
    blockedAt: formData.get("blockedAt"),
    reviewAt: formData.get("reviewAt"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  const existing = blockId
    ? db
        .select()
        .from(blocks)
        .where(and(eq(blocks.id, blockId), eq(blocks.userId, user.id)))
        .get()
    : null;
  if (blockId && !existing) return { message: "That entry no longer exists." };

  const dupe = findBlockByHandle(user.id, data.handle);
  if (dupe && dupe.id !== blockId) {
    return { errors: { handle: "You already have an entry for that handle." } };
  }

  let categoryId: string | null = data.categoryId ?? null;
  if (categoryId && !getCategory(user.id, categoryId)) categoryId = null;

  const now = new Date();
  const blockedAt = data.blockedAt ?? existing?.blockedAt ?? now;
  const evidenceRows = readEvidence(formData);
  const id = blockId ?? newId();

  if (existing) {
    db.update(blocks)
      .set({
        handle: data.handle,
        displayName: data.displayName ?? null,
        reason: data.reason,
        categoryId,
        notes: data.notes ?? null,
        blockedAt,
        reviewAt: data.reviewAt,
        updatedAt: now,
      })
      .where(eq(blocks.id, id))
      .run();
    db.delete(evidence).where(eq(evidence.blockId, id)).run();
  } else {
    db.insert(blocks)
      .values({
        id,
        userId: user.id,
        seq: nextSeq(user.id),
        handle: data.handle,
        displayName: data.displayName ?? null,
        reason: data.reason,
        categoryId,
        notes: data.notes ?? null,
        blockedAt,
        reviewAt: data.reviewAt,
        status: "blocked",
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  if (evidenceRows.length) {
    db.insert(evidence)
      .values(
        evidenceRows.map((row) => ({
          id: newId(),
          blockId: id,
          kind: "link" as const,
          label: row.label,
          url: row.url,
          createdAt: now,
        })),
      )
      .run();
  }

  revalidateBlockSurfaces(id);
  redirect(`/blocks/${id}`);
}

export async function setBlockStatus(formData: FormData): Promise<void> {
  const user = await requireUser();
  const blockId = String(formData.get("blockId") ?? "");
  const status = formData.get("status") === "unblocked" ? "unblocked" : "blocked";

  const row = db
    .select()
    .from(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.userId, user.id)))
    .get();
  if (!row) return;

  db.update(blocks)
    .set({
      status,
      unblockedAt: status === "unblocked" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blocks.id, row.id))
    .run();

  revalidateBlockSurfaces(row.id);
}

export async function setReview(formData: FormData): Promise<void> {
  const user = await requireUser();
  const blockId = String(formData.get("blockId") ?? "");

  const row = db
    .select()
    .from(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.userId, user.id)))
    .get();
  if (!row) return;

  const clear = formData.get("clear") === "1";
  const days = Number(formData.get("days") ?? "");
  const dateStr = String(formData.get("reviewAt") ?? "");

  let reviewAt: Date | null = null;
  if (!clear) {
    if (Number.isFinite(days) && days > 0) {
      reviewAt = new Date(Date.now() + days * 86_400_000);
    } else if (dateStr) {
      const parsed = new Date(dateStr);
      if (!Number.isNaN(parsed.getTime())) reviewAt = parsed;
    } else {
      return;
    }
  }

  db.update(blocks)
    .set({ reviewAt, updatedAt: new Date() })
    .where(eq(blocks.id, row.id))
    .run();

  revalidateBlockSurfaces(row.id);
}

export async function deleteBlock(formData: FormData): Promise<void> {
  const user = await requireUser();
  const blockId = String(formData.get("blockId") ?? "");

  db.delete(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.userId, user.id)))
    .run();

  revalidateBlockSurfaces();
  redirect("/blocks");
}
