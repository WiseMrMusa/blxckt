import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

const STEPS = [
  {
    index: "01",
    title: "Block them on X",
    body: "Same as you always have. blxckt doesn't need access to your account — no connecting, no scraping.",
  },
  {
    index: "02",
    title: "Write down why",
    body: "One line, a category, whatever receipts you have. Thirty seconds now saves the loop later.",
  },
  {
    index: "03",
    title: "Revisit the call",
    body: "Set a review date. When it comes due, look at the reason with fresh eyes and decide.",
  },
];

const FEATURES = [
  ["Categories", "Sort every block by why: harassment, spam, bad faith, personal."],
  ["Search", "Find a handle, a reason, or a note in a breath."],
  ["Evidence", "Attach links so the reason isn't just a feeling."],
  ["Review queue", "A gentle nudge when it's time to reconsider."],
  ["Insights", "See the shape of your blocking over time."],
  ["Export", "JSON or CSV. Your ledger leaves with you."],
];

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <Logo href="/" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Start a ledger
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="reveal">
            <p className="eyebrow mb-5">The block ledger</p>
            <h1 className="text-[44px] leading-[0.98] sm:text-6xl">
              A record of who you
              <br />
              cut off — <span className="text-signal">and why.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-paper-dim">
              X doesn&apos;t ask for a reason. A year from now, neither will your
              memory. blxckt is a private place to put the reason down while it&apos;s
              still clear — and to check back when it isn&apos;t.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn btn-primary">
                Start your ledger
              </Link>
              <Link href="/login" className="btn">
                I have an account
              </Link>
            </div>
          </div>

          <div className="reveal" style={{ animationDelay: "120ms" }}>
            <div className="panel overflow-hidden">
              <div className="panel-header">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  Case #014
                </span>
                <span className="chip border-signal/40 text-signal-2">
                  Blocked
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="font-mono text-lg text-paper">
                    <span className="strike text-paper">@replyguy_42</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    blocked 3 months ago
                  </p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5">Reason</p>
                  <p className="text-sm leading-relaxed text-paper-dim">
                    Quote-tweeted my thread to dunk on it, then followed me to
                    keep going in the replies.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="chip">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#9d7bff" }}
                    />
                    Bad Faith
                  </span>
                  <span className="chip">2 receipts</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  Review in 9 days
                </span>
                <span className="font-mono text-[11px] text-muted">
                  blxckt
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-14">
          <p className="eyebrow mb-8">How it works</p>
          <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.index} className="bg-ink-2 p-6">
                <span className="font-mono text-xs tracking-widest text-signal">
                  {step.index}
                </span>
                <h3 className="mt-4 text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-14">
          <p className="eyebrow mb-8">Everything in the ledger</p>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([title, body]) => (
              <div key={title}>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          blxckt — private by default
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Not affiliated with X Corp.
        </p>
      </footer>
    </div>
  );
}
