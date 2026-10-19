"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { Category } from "@/lib/db/schema";

export type FilterState = {
  q: string;
  status: string;
  category: string;
  sort: string;
};

export function BlockFilters({
  categories,
  current,
}: {
  categories: Category[];
  current: FilterState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(current.q);
  const mounted = useRef(false);

  function navigate(next: Partial<FilterState>) {
    const merged: FilterState = { ...current, q, ...next };
    const params = new URLSearchParams();
    if (merged.q.trim()) params.set("q", merged.q.trim());
    if (merged.status && merged.status !== "blocked")
      params.set("status", merged.status);
    if (merged.category) params.set("category", merged.category);
    if (merged.sort && merged.sort !== "recent")
      params.set("sort", merged.sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (q === current.q) return;
    const timer = setTimeout(() => navigate({ q }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const isFiltered = Boolean(
    current.q ||
      current.category ||
      current.status !== "blocked" ||
      current.sort !== "recent",
  );

  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:px-8">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
          /
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search handles, reasons, notes…"
          aria-label="Search entries"
          className="input pl-7"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Category"
          className="select w-auto"
          value={current.category}
          onChange={(e) => navigate({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Status"
          className="select w-auto"
          value={current.status}
          onChange={(e) => navigate({ status: e.target.value })}
        >
          <option value="blocked">Blocked</option>
          <option value="unblocked">Reinstated</option>
          <option value="all">All</option>
        </select>

        <select
          aria-label="Sort"
          className="select w-auto"
          value={current.sort}
          onChange={(e) => navigate({ sort: e.target.value })}
        >
          <option value="recent">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="handle">By handle</option>
        </select>

        {isFiltered ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setQ("");
              router.replace(pathname, { scroll: false });
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
