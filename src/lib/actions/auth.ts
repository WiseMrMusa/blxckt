"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  createSession,
  destroyAllSessions,
  destroySession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "../auth";
import { db } from "../db";
import { users } from "../db/schema";
import { createDefaultCategories } from "../db/queries";
import { newId } from "../util";
import {
  changePasswordSchema,
  fieldErrors,
  loginSchema,
  profileSchema,
  signupSchema,
  type ActionState,
} from "../validation";

async function currentUserAgent() {
  return (await headers()).get("user-agent");
}

export async function signup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    handle: formData.get("handle"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password, handle } = parsed.data;

  const existing = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (existing) {
    return { errors: { email: "An account with that email already exists." } };
  }

  const id = newId();
  db.insert(users)
    .values({
      id,
      email,
      handle: handle ?? null,
      passwordHash: await hashPassword(password),
    })
    .run();

  createDefaultCategories(id);
  await createSession(id, await currentUserAgent());
  redirect("/dashboard");
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password } = parsed.data;
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { message: "Those credentials did not match an account." };
  }

  await createSession(user.id, await currentUserAgent());
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function logoutEverywhere(): Promise<void> {
  const user = await requireUser();
  await destroyAllSessions(user.id);
  redirect("/login");
}

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ handle: formData.get("handle") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  db.update(users)
    .set({ handle: parsed.data.handle ?? null })
    .where(eq(users.id, user.id))
    .run();

  revalidatePath("/settings");
  return { ok: true, message: "Saved." };
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { errors: { currentPassword: "That is not your current password." } };
  }

  db.update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword) })
    .where(eq(users.id, user.id))
    .run();

  return { ok: true, message: "Password changed." };
}

export async function deleteAccount(): Promise<void> {
  const user = await requireUser();
  db.delete(users).where(eq(users.id, user.id)).run();
  await destroySession();
  redirect("/");
}
