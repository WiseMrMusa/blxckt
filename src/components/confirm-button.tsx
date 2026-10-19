"use client";

import { cn } from "@/lib/util";

/**
 * A submit button that asks for confirmation first. Used for destructive
 * actions (delete entry, delete account) that submit a plain server action.
 */
export function ConfirmButton({
  children,
  message,
  className,
  name,
  value,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={cn("btn", className)}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
