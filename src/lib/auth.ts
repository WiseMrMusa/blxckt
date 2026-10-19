import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";

import { db } from "./db";
import { sessions, users, type User } from "./db/schema";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;
const SESSION_COOKIE = "blxckt_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* -------------------------------------------------------------------------- */
/* Passwords                                                                  */
/* -------------------------------------------------------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = await scrypt(password, salt, KEYLEN);
  return `scrypt:${salt}:${key.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, encoded] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !encoded) return false;
  const expected = Buffer.from(encoded, "base64url");
  const actual = await scrypt(password, salt, expected.length || KEYLEN);
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                   */
/* -------------------------------------------------------------------------- */

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  db.insert(sessions)
    .values({
      id: hashToken(token),
      userId,
      userAgent: userAgent?.slice(0, 300) ?? null,
      expiresAt,
    })
    .run();

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export type Session = { sessionId: string; user: User };

/** Resolve the current session, or null. Memoized per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const id = hashToken(token);
  const row = db
    .select({
      sessionId: sessions.id,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .get();

  return row ?? null;
});

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** For pages: redirect to login when there is no valid session. */
export async function requireUser(): Promise<User> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    db.delete(sessions).where(eq(sessions.id, hashToken(token))).run();
  }
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  db.delete(sessions).where(eq(sessions.userId, userId)).run();
}
