import Link from "next/link";

import type { Block, Category } from "@/lib/db/schema";
import { caseRef, formatDate } from "@/lib/util";

export function BlockRow({
  block,
  category,
}: {
  block: Block;
  category: Category | null;
}) {
  return (
    <Link href={`/blocks/${block.id}`} className="ledger-row group">
      <span className="shrink-0 font-mono text-[11px] tracking-wider text-muted sm:w-12">
        {caseRef(block.seq)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm text-paper transition group-hover:text-signal-2">
          @{block.handle}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-muted">{block.reason}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
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
        <span className="hidden font-mono text-[11px] text-muted sm:inline">
          {formatDate(block.blockedAt)}
        </span>
      </div>
    </Link>
  );
}

export function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="chip">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: category.color }}
      />
      {category.name}
    </span>
  );
}
