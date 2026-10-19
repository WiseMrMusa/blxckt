"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/util";

export function SubmitButton({
  children,
  pendingText = "Working…",
  className,
  title,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={title}
      disabled={pending}
      className={cn("btn", className)}
    >
      {pending ? pendingText : children}
    </button>
  );
}
