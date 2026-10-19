export function PageHeader({
  index,
  title,
  meta,
  actions,
}: {
  index: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line px-5 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow mb-2.5">{index}</p>
          <h1 className="text-3xl leading-none sm:text-[40px]">{title}</h1>
          {meta ? (
            <div className="mt-3 text-sm text-muted">{meta}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="mb-1 h-9 w-9 rounded-full border border-dashed border-line-2" />
      <h2 className="text-xl text-paper">{title}</h2>
      {children ? (
        <p className="max-w-sm text-sm leading-relaxed text-muted">{children}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
