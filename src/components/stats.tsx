export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "signal" | "amber" | "sage" | "muted";
}) {
  const color =
    accent === "signal"
      ? "text-signal"
      : accent === "amber"
        ? "text-amber"
        : accent === "sage"
          ? "text-sage"
          : "text-paper";

  return (
    <div className="panel p-5">
      <p className="eyebrow">{label}</p>
      <p className={`mt-3 font-display text-4xl leading-none ${color}`}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Timeline({
  data,
}: {
  data: Array<{ month: string; count: number }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="panel p-5">
      <div className="mb-5 flex items-baseline justify-between">
        <p className="eyebrow">Entries per month</p>
        <p className="font-mono text-[11px] text-muted">last 12 months</p>
      </div>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((d, i) => (
          <div
            key={`${d.month}-${i}`}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            title={`${d.count} in ${d.month}`}
          >
            <span className="font-mono text-[10px] text-muted opacity-0 transition group-hover:opacity-100">
              {d.count}
            </span>
            <div
              className="w-full rounded-sm bg-line-2 transition group-hover:bg-signal"
              style={{
                height: `${Math.max(2, (d.count / max) * 100)}%`,
                minHeight: d.count > 0 ? 4 : 2,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-1.5">
        {data.map((d, i) => (
          <span
            key={`${d.month}-label-${i}`}
            className="flex-1 text-center font-mono text-[10px] uppercase text-muted"
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}
