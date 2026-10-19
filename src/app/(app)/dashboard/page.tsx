import Link from "next/link";

import { BlockRow } from "@/components/block-row";
import { Empty, PageHeader } from "@/components/page-header";
import { StatCard, Timeline } from "@/components/stats";
import { requireUser } from "@/lib/auth";
import { getStats, recentBlocks, reviewQueue } from "@/lib/db/queries";
import { daysUntil, formatDate } from "@/lib/util";

export const metadata = { title: "Docket" };

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = getStats(user.id);
  const recent = recentBlocks(user.id, 5);
  const due = reviewQueue(user.id, 0).overdue;

  return (
    <>
      <PageHeader
        index="01 · Docket"
        title="Docket"
        meta={
          <>
            <span className="font-mono text-xs">{stats.blocked} blocked</span>
            <span className="mx-2 text-line-2">/</span>
            <span className="font-mono text-xs">{stats.total} on file</span>
          </>
        }
        actions={
          <Link href="/blocks/new" className="btn btn-primary">
            + New entry
          </Link>
        }
      />

      <div className="space-y-8 px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Blocked"
            value={stats.blocked}
            accent="signal"
            hint={stats.total ? `${stats.total} total entries` : undefined}
          />
          <StatCard
            label="This month"
            value={stats.thisMonth}
            hint="added to the ledger"
          />
          <StatCard
            label="Due for review"
            value={stats.dueReview}
            accent="amber"
            hint={
              stats.upcomingReview
                ? `${stats.upcomingReview} coming up`
                : "nothing pending"
            }
          />
          <StatCard
            label="Reinstated"
            value={stats.unblocked}
            accent="sage"
            hint="blocks you lifted"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <p className="eyebrow">Recently filed</p>
              <Link
                href="/blocks"
                className="font-mono text-[11px] uppercase tracking-widest text-muted transition hover:text-paper"
              >
                View ledger →
              </Link>
            </div>
            {recent.length === 0 ? (
              <Empty
                title="The ledger is empty"
                action={
                  <Link href="/blocks/new" className="btn btn-primary btn-sm">
                    File your first entry
                  </Link>
                }
              >
                Next time you block someone on X, come here and write down why.
              </Empty>
            ) : (
              <div>
                {recent.map(({ block, category }) => (
                  <BlockRow key={block.id} block={block} category={category} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Timeline data={stats.timeline} />

            <div className="panel overflow-hidden">
              <div className="panel-header">
                <p className="eyebrow">Review queue</p>
                <p className="font-mono text-[11px] text-muted">
                  {due.length}
                </p>
              </div>
              {due.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted">
                  Nothing due. Records you flag for review land here.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {due.slice(0, 4).map(({ block }) => {
                    const days = block.reviewAt
                      ? daysUntil(block.reviewAt)
                      : 0;
                    return (
                      <li key={block.id}>
                        <Link
                          href={`/blocks/${block.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-ink-3/60"
                        >
                          <span className="truncate font-mono text-sm text-paper">
                            @{block.handle}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-amber">
                            {days <= 0 ? "due" : `in ${days}d`}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {due.length > 0 ? (
                <div className="border-t border-line px-4 py-3">
                  <Link
                    href="/review"
                    className="font-mono text-[11px] uppercase tracking-widest text-muted transition hover:text-paper"
                  >
                    Open review →
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {stats.byCategory.length > 0 ? (
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <p className="eyebrow">By category</p>
              <p className="font-mono text-[11px] text-muted">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
              {stats.byCategory.map(({ category, count }) => (
                <div key={category?.id ?? "none"} className="bg-ink-2 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: category?.color ?? "#3f3223" }}
                    />
                    <span className="truncate text-sm text-paper-dim">
                      {category?.name ?? "Unfiled"}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl">{count}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
