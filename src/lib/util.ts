import { randomUUID } from "node:crypto";

export const newId = () => randomUUID();

/** Tiny classnames joiner. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Normalize a handle: strip leading @, trim, lowercase. Returns "" if empty. */
export function normalizeHandle(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/^@+/, "").toLowerCase();
}

/** Human-friendly display of a stored handle. */
export function displayHandle(handle: string) {
  return `@${handle}`;
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export function formatDate(value: Date | number | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFmt.format(date);
}

/** Value for an <input type="date">. */
export function toDateInput(value: Date | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function relativeDays(value: Date | number) {
  const date = value instanceof Date ? value : new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.round(diff / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} mo ago`;
  return `${Math.round(days / 365)} yr ago`;
}

/** Days until a future date (negative if overdue). */
export function daysUntil(value: Date | number) {
  const date = value instanceof Date ? value : new Date(value);
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Case reference, e.g. "#014". */
export function caseRef(seq: number) {
  return `#${String(seq).padStart(3, "0")}`;
}
