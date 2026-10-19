"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/util";

const ITEMS = [
  { href: "/dashboard", index: "01", label: "Docket" },
  { href: "/blocks", index: "02", label: "Ledger" },
  { href: "/blocks/new", index: "03", label: "New entry" },
  { href: "/review", index: "04", label: "Review" },
  { href: "/categories", index: "05", label: "Categories" },
  { href: "/settings", index: "06", label: "Account" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/blocks") {
    return pathname === "/blocks" || /^\/blocks\/[^/]+$/.test(pathname);
  }
  return pathname === href;
}

export function Nav({ badges }: { badges?: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:px-3 lg:py-1">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const badge = badges?.[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex shrink-0 items-center gap-3 rounded-card px-3 py-2 text-sm transition",
              active
                ? "bg-ink-3 text-paper"
                : "text-paper-dim hover:bg-ink-3/60 hover:text-paper",
            )}
          >
            <span
              className={cn(
                "font-mono text-[10px] tracking-widest transition",
                active ? "text-signal" : "text-muted group-hover:text-paper-dim",
              )}
            >
              {item.index}
            </span>
            <span className="whitespace-nowrap">{item.label}</span>
            {badge ? (
              <span className="ml-auto hidden rounded-full bg-signal px-1.5 py-0.5 font-mono text-[10px] text-ink lg:inline">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
