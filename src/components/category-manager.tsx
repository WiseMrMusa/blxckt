"use client";

import { useActionState, useState } from "react";

import { ConfirmButton } from "@/components/confirm-button";
import { SubmitButton } from "@/components/submit-button";
import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/db/schema";
import { cn } from "@/lib/util";

const PALETTE = [
  "#ff4d2e",
  "#e0a33a",
  "#9d7bff",
  "#5aa9e6",
  "#8bab7f",
  "#e05a9b",
  "#c9c2b6",
];

function CategoryForm({
  category,
  onDone,
}: {
  category?: Category;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveCategory, undefined);
  const [color, setColor] = useState(category?.color ?? PALETTE[0]);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      {category ? (
        <input type="hidden" name="categoryId" value={category.id} />
      ) : null}
      <input type="hidden" name="color" value={color} />

      <input
        name="name"
        required
        defaultValue={category?.name ?? ""}
        placeholder="Category name"
        className="input w-full sm:w-56"
        aria-label="Category name"
      />

      <div className="flex items-center gap-1.5">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Use color ${c}`}
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={cn(
              "h-5 w-5 rounded-full border transition",
              color === c
                ? "scale-110 border-paper"
                : "border-transparent opacity-70 hover:opacity-100",
            )}
          />
        ))}
      </div>

      <SubmitButton className="btn-primary btn-sm" pendingText="Saving…">
        {category ? "Save" : "Add"}
      </SubmitButton>

      {onDone ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
          Cancel
        </button>
      ) : null}

      {state?.errors?.name || state?.errors?.color ? (
        <p className="w-full text-xs text-signal-2">
          {state.errors.name ?? state.errors.color}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="w-full text-xs text-sage">{state.message}</p>
      ) : null}
    </form>
  );
}

function CategoryRow({
  category,
  count,
}: {
  category: Category;
  count: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="border-b border-line bg-ink-3/40 px-4 py-3 last:border-b-0">
        <CategoryForm category={category} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: category.color }}
      />
      <span className="flex-1 truncate text-sm text-paper">{category.name}</span>
      <span className="font-mono text-[11px] text-muted">
        {count} {count === 1 ? "entry" : "entries"}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setEditing(true)}
      >
        Edit
      </button>
      <form action={deleteCategory}>
        <input type="hidden" name="categoryId" value={category.id} />
        <ConfirmButton
          className="btn btn-danger btn-sm"
          message={`Delete “${category.name}”? Entries keep existing, just unfiled.`}
        >
          Delete
        </ConfirmButton>
      </form>
    </div>
  );
}

export function CategoryManager({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  return (
    <div className="space-y-6">
      <div className="panel">
        <div className="panel-header">
          <p className="eyebrow">New category</p>
        </div>
        <div className="p-4">
          <CategoryForm />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <p className="eyebrow">Your categories</p>
          <p className="font-mono text-[11px] text-muted">
            {categories.length}
          </p>
        </div>
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No categories yet. Add one above.
          </p>
        ) : (
          categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              count={counts[category.id] ?? 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
