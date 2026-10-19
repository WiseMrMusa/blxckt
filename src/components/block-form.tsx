"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { saveBlock } from "@/lib/actions/blocks";
import type { Block, Category, Evidence } from "@/lib/db/schema";
import { toDateInput } from "@/lib/util";
import type { FieldErrors } from "@/lib/validation";

type EvidenceRow = { label: string; url: string };

function ErrorText({
  errors,
  name,
}: {
  errors?: FieldErrors;
  name: string;
}) {
  const message = errors?.[name];
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-signal-2">{message}</p>;
}

export function BlockForm({
  categories,
  block,
  evidence = [],
}: {
  categories: Category[];
  block?: Block;
  evidence?: Evidence[];
}) {
  const [state, action] = useActionState(saveBlock, undefined);
  const [rows, setRows] = useState<EvidenceRow[]>(
    evidence.length
      ? evidence.map((e) => ({ label: e.label ?? "", url: e.url ?? "" }))
      : [],
  );

  const isEdit = Boolean(block);

  return (
    <form action={action} className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      {block ? <input type="hidden" name="blockId" value={block.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="label" htmlFor="handle">
            Handle
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
              @
            </span>
            <input
              id="handle"
              name="handle"
              required
              defaultValue={block?.handle ?? ""}
              placeholder="replyguy_42"
              autoComplete="off"
              spellCheck={false}
              className="input pl-7 font-mono"
            />
          </div>
          <ErrorText errors={state?.errors} name="handle" />
        </div>

        <div className="sm:col-span-1">
          <label className="label" htmlFor="displayName">
            Display name <span className="normal-case opacity-60">(optional)</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={block?.displayName ?? ""}
            placeholder="How they show up in your timeline"
            className="input"
          />
          <ErrorText errors={state?.errors} name="displayName" />
        </div>
      </div>

      <div className="mt-5">
        <label className="label" htmlFor="reason">
          Why you blocked them
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          defaultValue={block?.reason ?? ""}
          placeholder="One clear line. The thing you'd forget by next year."
          className="textarea"
        />
        <ErrorText errors={state?.errors} name="reason" />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={block?.categoryId ?? ""}
            className="select"
          >
            <option value="">Unfiled</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="blockedAt">
            Blocked on
          </label>
          <input
            id="blockedAt"
            name="blockedAt"
            type="date"
            defaultValue={toDateInput(block?.blockedAt ?? new Date())}
            className="input"
          />
          <ErrorText errors={state?.errors} name="blockedAt" />
        </div>

        <div>
          <label className="label" htmlFor="reviewAt">
            Review on <span className="normal-case opacity-60">(optional)</span>
          </label>
          <input
            id="reviewAt"
            name="reviewAt"
            type="date"
            defaultValue={toDateInput(block?.reviewAt ?? null)}
            className="input"
          />
          <ErrorText errors={state?.errors} name="reviewAt" />
        </div>
      </div>

      <div className="mt-5">
        <label className="label" htmlFor="notes">
          Notes <span className="normal-case opacity-60">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={block?.notes ?? ""}
          placeholder="Context, the thread, what happened after."
          className="textarea"
        />
        <ErrorText errors={state?.errors} name="notes" />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">
            Evidence <span className="normal-case opacity-60">(links)</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setRows((r) => [...r, { label: "", url: "" }])}
          >
            + Add link
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-card border border-dashed border-line-2 px-3 py-3 text-xs text-muted">
            Nothing attached. Links to the post, the screenshot, the receipt.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <input
                  name="evidenceLabel"
                  value={row.label}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((item, i) =>
                        i === index ? { ...item, label: e.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Label (optional)"
                  className="input sm:w-44"
                />
                <input
                  name="evidenceUrl"
                  value={row.url}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((item, i) =>
                        i === index ? { ...item, url: e.target.value } : item,
                      ),
                    )
                  }
                  placeholder="https://…"
                  inputMode="url"
                  className="input flex-1 font-mono text-[13px]"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setRows((r) => r.filter((_, i) => i !== index))
                  }
                  aria-label="Remove link"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state?.message ? (
        <p className="mt-6 rounded-card border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal-2">
          {state.message}
        </p>
      ) : null}

      <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
        <SubmitButton
          className="btn-primary"
          pendingText={isEdit ? "Saving…" : "Filing…"}
        >
          {isEdit ? "Save changes" : "File entry"}
        </SubmitButton>
        <Link
          href={block ? `/blocks/${block.id}` : "/blocks"}
          className="btn btn-ghost"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
