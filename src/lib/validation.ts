import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Shared                                                                     */
/* -------------------------------------------------------------------------- */

export type FieldErrors = Record<string, string>;

export type ActionState =
  | {
      ok?: boolean;
      message?: string;
      errors?: FieldErrors;
    }
  | undefined;

/** Collapse a ZodError into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Treat "" / null / undefined as absent. */
const blankToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const optionalText = (max: number) =>
  z.preprocess(
    blankToNull,
    z
      .string()
      .trim()
      .max(max, `Keep it under ${max} characters.`)
      .nullish(),
  );

/** Parse a yyyy-mm-dd (or ISO) string into a Date, or null. */
const optionalDate = z.preprocess(
  blankToNull,
  z
    .union([z.string(), z.date()])
    .nullish()
    .transform((v) => {
      if (!v) return null;
      const d = v instanceof Date ? v : new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
);

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200, "That password is too long.")
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const handleSchema = z
  .string({ error: "Handle is required." })
  .trim()
  .transform((v) => v.replace(/^@+/, "").toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Handle is required.")
      .max(15, "X handles are at most 15 characters.")
      .regex(/^[a-z0-9_]+$/, "Use letters, numbers, and underscores only."),
  );

export const optionalHandleSchema = z.preprocess(
  blankToNull,
  handleSchema.nullish(),
);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  handle: optionalHandleSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const profileSchema = z.object({
  handle: optionalHandleSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the category a name.")
    .max(40, "Keep the name under 40 characters."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color.")
    .default("#ff4d2e"),
});

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

export const blockSchema = z.object({
  handle: handleSchema,
  displayName: optionalText(80),
  reason: z
    .string()
    .trim()
    .min(1, "Write down why you blocked them.")
    .max(500, "Keep the reason under 500 characters."),
  categoryId: z.preprocess(blankToNull, z.string().nullish()),
  notes: optionalText(5000),
  blockedAt: optionalDate,
  reviewAt: optionalDate,
});

export type BlockInput = z.infer<typeof blockSchema>;

/** Pull the repeating evidence rows out of a FormData body. */
export function readEvidence(formData: FormData) {
  const labels = formData.getAll("evidenceLabel").map(String);
  const urls = formData.getAll("evidenceUrl").map(String);
  const rows: Array<{ label: string | null; url: string }> = [];
  const max = Math.max(labels.length, urls.length);
  for (let i = 0; i < max; i++) {
    const url = (urls[i] ?? "").trim();
    if (!url) continue;
    rows.push({ label: (labels[i] ?? "").trim() || null, url });
  }
  return rows;
}
