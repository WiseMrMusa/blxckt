import Link from "next/link";

import { Empty, PageHeader } from "@/components/page-header";
import { setBlockStatus, setReview } from "@/lib/actions/blocks";
import { requireUser } from "@/lib/auth";
import { reviewQueue, type BlockWithCategory } from "@/lib/db/queries";
import { caseRef, daysUntil, formatDate } from "@/lib/util";

export const metadata = { title: "Review" };

function ReviewItem({
  record,
  overdue,
}: {
  record: BlockWithCategory;
  overdue: boolean;
}) {
  const { block, category } = record;
  const days = block.reviewAt ? daysUntil(block.reviewAt) : 0;

  return (
    <article className="panel reveal overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-wider text-muted">
            {caseRef(block.seq)}
          </span>
          <Link
            href={`/blocks/${block.id}`}
            className="link font-mono text-sm"
          >
            @{block.handle}
          </Link>
        </div>
        <span
          className={`font-mono text-[11px] uppercase tracking-widest ${overdue ? "text-signal-2" : "text-amber"}`}
        >
          {overdue ? "due" : `in ${days}d`}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="eyebrow mb-2">The reason you wrote</p>
          <p className="font-display text-xl leading-snug text-paper">
            {block.reason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <span className="chip">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: category.color }}
              />
              {category.name}
            </span>
          ) : (
            <span className="chip border-dashed text-muted">Unfiled</span>
          )}
          <span className="font-mono text-[11px] text-muted">
            blocked {formatDate(block.blockedAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-ink-3/40 px-5 py-3">
        <form action={setReview}>
          <input type="hidden" name="blockId" value={block.id} />
          <button
            type="submit"
            name="days"
            value="90"
            className="btn btn-sm"
          >
            Keep blocked · 90d
          </button>
        </form>
        <form action={setBlockStatus}>
          <input type="hidden" name="blockId" value={block.id} />
          <input type="hidden" name="status" value="unblocked" />
          <button type="submit" className="btn btn-sm">
            Reinstate
          </button>
        </form>
        <form action={setReview} className="ml-auto">
          <input type="hidden" name="blockId" value={block.id} />
          <button
            type="submit"
            name="clear"
            value="1"
            className="btn btn-ghost btn-sm"
          >
            Done — no reminder
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function ReviewPage() {
  const user = await requireUser();
  const queue = reviewQueue(user.id, 30);
  const { overdue, upcoming } = queue;

  return (
    <>
      <PageHeader
        index="04 · Review"
        title="Review"
        meta="Reconsiderations you asked for. Look at the reason, then decide again."
      />

      <div className="space-y-10 px-5 py-8 sm:px-8">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow">Due now</p>
            <span className="font-mono text-[11px] text-signal-2">
              {overdue.length}
            </span>
          </div>
          {overdue.length === 0 ? (
            <div className="panel">
              <Empty title="Nothing due">You&apos;re all caught up.</Empty>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {overdue.map((record) => (
                <ReviewItem
                  key={record.block.id}
                  record={record}
                  overdue
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow">Coming up · next 30 days</p>
            <span className="font-mono text-[11px] text-muted">
              {upcoming.length}
            </span>
          </div>
          {upcoming.length === 0 ? (
            <div className="panel">
              <Empty title="Nothing scheduled">
                Set a review date on any entry to see it here.
              </Empty>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map((record) => (
                <ReviewItem
                  key={record.block.id}
                  record={record}
                  overdue={false}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
