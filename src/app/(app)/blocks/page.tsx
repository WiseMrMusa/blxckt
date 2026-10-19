import Link from "next/link";

import { BlockFilters } from "@/components/block-filters";
import { BlockRow } from "@/components/block-row";
import { Empty, PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { listBlocks, listCategories } from "@/lib/db/queries";

export const metadata = { title: "Ledger" };

const PER_PAGE = 25;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = (
  sp: Record<string, string | string[] | undefined>,
  key: string,
  fallback = "",
) => {
  const value = sp[key];
  return typeof value === "string" ? value : fallback;
};

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const status = (["blocked", "unblocked", "all"] as const).includes(
    pick(sp, "status") as "blocked",
  )
    ? (pick(sp, "status", "blocked") as "blocked" | "unblocked" | "all")
    : "blocked";

  const sort = (["recent", "oldest", "handle"] as const).includes(
    pick(sp, "sort") as "recent",
  )
    ? (pick(sp, "sort", "recent") as "recent" | "oldest" | "handle")
    : "recent";

  const current = {
    q: pick(sp, "q"),
    status,
    category: pick(sp, "category"),
    sort,
  };

  const page = Math.max(1, Number(pick(sp, "page", "1")) || 1);

  const categories = listCategories(user.id);
  const { rows, total } = listBlocks(
    user.id,
    {
      query: current.q,
      status,
      categoryId: current.category,
      sort,
    },
    { limit: PER_PAGE, offset: (page - 1) * PER_PAGE },
  );

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  function href(targetPage: number) {
    const params = new URLSearchParams();
    if (current.q) params.set("q", current.q);
    if (status !== "blocked") params.set("status", status);
    if (current.category) params.set("category", current.category);
    if (sort !== "recent") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/blocks?${qs}` : "/blocks";
  }

  return (
    <>
      <PageHeader
        index="02 · Ledger"
        title="Ledger"
        meta={
          <span className="font-mono text-xs">
            {total} {total === 1 ? "entry" : "entries"}
            {status === "blocked" ? " blocked" : ""}
          </span>
        }
        actions={
          <Link href="/blocks/new" className="btn btn-primary">
            + New entry
          </Link>
        }
      />

      <BlockFilters categories={categories} current={current} />

      <div className="px-5 py-8 sm:px-8">
        <div className="panel overflow-hidden">
          {rows.length === 0 ? (
            total === 0 && !current.q && !current.category ? (
              <Empty
                title="Nothing filed yet"
                action={
                  <Link href="/blocks/new" className="btn btn-primary btn-sm">
                    File your first entry
                  </Link>
                }
              >
                Your ledger starts with one entry.
              </Empty>
            ) : (
              <Empty title="No matches">
                Nothing fits that search or filter.
              </Empty>
            )
          ) : (
            rows.map(({ block, category }) => (
              <BlockRow key={block.id} block={block} category={category} />
            ))
          )}
        </div>

        {pages > 1 ? (
          <div className="mt-6 flex items-center justify-between">
            <Link
              href={href(page - 1)}
              aria-disabled={page <= 1}
              className={`btn btn-sm ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
            >
              ← Previous
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Page {page} / {pages}
            </span>
            <Link
              href={href(page + 1)}
              aria-disabled={page >= pages}
              className={`btn btn-sm ${page >= pages ? "pointer-events-none opacity-40" : ""}`}
            >
              Next →
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
