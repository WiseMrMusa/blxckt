import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

const LINES = [
  "The moment passes. The reason doesn't have to.",
  "Six months later you'll wonder why.",
  "Screenshots rot. Write it down.",
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-ink-2 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 38px, var(--line-2) 38px 39px)",
          }}
        />
        <div className="relative">
          <Logo href="/" />
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow mb-6">Est. for the chronically done</p>
          <h2 className="text-4xl leading-[1.05] text-paper">
            You blocked them for a reason.
            <br />
            <span className="text-signal">Write it down.</span>
          </h2>
          <ul className="mt-8 space-y-2.5">
            {LINES.map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 font-mono text-[13px] text-muted"
              >
                <span className="h-px w-5 bg-line-2" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Private by default
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Yours to export
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-14 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-tight">
                blxckt
              </span>
            </Link>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
