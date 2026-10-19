"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "../auth";
import { db } from "../db";
import { categories } from "../db/schema";
import { getCategory } from "../db/queries";
import { newId } from "../util";
import { categorySchema, fieldErrors, type ActionState } from "../validation";

function revalidate() {
  revalidatePath("/categories");
  revalidatePath("/blocks");
  revalidatePath("/dashboard");
}

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("categoryId") ?? "") || null;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#ff4d2e",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { name, color } = parsed.data;

  const dupe = db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, user.id), eq(categories.name, name)))
    .get();
  if (dupe && dupe.id !== id) {
    return { errors: { name: "You already have a category with that name." } };
  }

  if (id) {
    if (!getCategory(user.id, id)) return { message: "Category not found." };
    db.update(categories)
      .set({ name, color })
      .where(eq(categories.id, id))
      .run();
  } else {
    db.insert(categories)
      .values({ id: newId(), userId: user.id, name, color })
      .run();
  }

  revalidate();
  return { ok: true, message: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("categoryId") ?? "");

  db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .run();

  revalidate();
}
