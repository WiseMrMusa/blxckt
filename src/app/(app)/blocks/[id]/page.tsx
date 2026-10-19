import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { deleteBlock, setBlockStatus, setReview } from "@/lib/actions/blocks";
import { requireUser } from "@/lib/auth";
import { getBlock } from "@/lib/db/queries";
import { caseRef, daysUntil, formatDate, relativeDays } from "@/lib/util";

export const metadata = { title: "Entry" };

const SNOOZES = [
  { label: "30 days", days: "30" },
  { label: "90 days", days: "90" },
  { label: "1 year", days: "365" },
];

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const record = getBlock(user.id, id);
  if (!record) notFound();

  const { block, category, evidence } = record;
  const isBlocked = block.status === "blocked";

  return (
    <>
      <PageHeader
        index={`Case ${caseRef(block.seq)}`}
        title={
          <span className={isBlocked ? "strike text-paper" : "text-paper-dim"}>
            @{block.handle}
          </span>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`chip ${isBlocked ? "border-signal/40 text-signal-2" : "border-sage/40 text-sage"}`}
            >
              {isBlocked ? "Blocked" : "Reinstated"}
            </span>
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
              filed {relativeDays(block.blockedAt)}
            </span>
          </div>
        }
        actions={
          <>
            <Link href={`/blocks/${block.id}/edit`} className="btn">
              Edit
            </Link>
            <form action={setBlockStatus}>
              <input type="hidden" name="blockId" value={block.id} />
              <input
                type="hidden"
                name="status"
                value={isBlocked ? "unblocked" : "blocked"}
              />
              <button
                className={`btn ${isBlocked ? "" : "btn-primary"}`}
                type="submit"
              >
                {isBlocked ? "Reinstate" : "Re-block"}
              </button>
            </form>
          </>
        }
      />

      <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section>
            <p className="eyebrow mb-3">Reason</p>
            <p className="font-display text-2xl leading-snug text-paper sm:text-3xl">
              {block.reason}
            </p>
          </section>

          {block.displayName ? (
            <section>
              <p className="eyebrow mb-2">Display name</p>
              <p className="text-sm text-paper-dim">{block.displayName}</p>
            </section>
          ) : null}

          {block.notes ? (
            <section>
              <p className="eyebrow mb-2">Notes</p>
              <div className="whitespace-pre-wrap rounded-card border border-line bg-ink-2 p-4 text-sm leading-relaxed text-paper-dim">
                {block.notes}
              </div>
            </section>
          ) : null}

          <section>
            <p className="eyebrow mb-3">Evidence</p>
            {evidence.length === 0 ? (
              <p className="rounded-card border border-dashed border-line-2 px-4 py-4 text-sm text-muted">
                No links attached.
              </p>
            ) : (
              <ul className="space-y-2">
                {evidence.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-card border border-line bg-ink-2 px-4 py-3"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      {item.label ?? "link"}
                    </span>
                    <a
                      href={item.url ?? "#"}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link min-w-0 flex-1 truncate font-mono text-[13px]"
                    >
                      {item.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="panel">
            <div className="panel-header">
              <p className="eyebrow">Record</p>
            </div>
            <dl className="divide-y divide-line text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted">Blocked on</dt>
                <dd className="font-mono text-[13px]">
                  {formatDate(block.blockedAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted">Review on</dt>
                <dd className="font-mono text-[13px]">
                  {block.reviewAt ? formatDate(block.reviewAt) : "—"}
                </dd>
              </div>
              {block.reviewAt && isBlocked ? (
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-muted">Status</dt>
                  <dd className="font-mono text-[13px] text-amber">
                    {(() => {
                      const days = daysUntil(block.reviewAt);
                      if (days <= 0) return "due now";
                      return `in ${days} days`;
                    })()}
                  </dd>
                </div>
              ) : null}
              {block.unblockedAt ? (
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-muted">Reinstated on</dt>
                  <dd className="font-mono text-[13px]">
                    {formatDate(block.unblockedAt)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted">Last updated</dt>
                <dd className="font-mono text-[13px]">
                  {formatDate(block.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <div className="panel-header">
              <p className="eyebrow">Schedule a review</p>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs leading-relaxed text-muted">
                Set a date to reconsider this block. It shows up in your review
                queue.
              </p>
              <form action={setReview} className="flex flex-wrap gap-2">
                <input type="hidden" name="blockId" value={block.id} />
                {SNOOZES.map((s) => (
                  <button
                    key={s.days}
                    type="submit"
                    name="days"
                    value={s.days}
                    className="btn btn-sm"
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="submit"
                  name="clear"
                  value="1"
                  className="btn btn-ghost btn-sm"
                >
                  Clear
                </button>
              </form>

              <form action={setReview} className="mt-3 flex gap-2">
                <input type="hidden" name="blockId" value={block.id} />
                <input
                  type="date"
                  name="reviewAt"
                  className="input"
                  defaultValue=""
                  aria-label="Exact review date"
                />
                <button className="btn btn-sm" type="submit">
                  Set
                </button>
              </form>
            </div>
          </div>

          <div className="panel border-signal/20">
            <div className="panel-header">
              <p className="eyebrow text-signal-2/80">Danger</p>
            </div>
            <div className="p-4">
              <form action={deleteBlock}>
                <input type="hidden" name="blockId" value={block.id} />
                <ConfirmButton
                  className="btn btn-danger btn-sm w-full"
                  message={`Delete the entry for @${block.handle}? This cannot be undone.`}
                >
                  Delete this entry
                </ConfirmButton>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
