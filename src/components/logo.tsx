import Link from "next/link";

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="relative font-display text-[26px] leading-none tracking-tight text-paper">
        blxckt
        <span className="absolute -right-3 top-0.5 h-1.5 w-1.5 rounded-full bg-signal transition-transform group-hover:scale-125" />
      </span>
    </Link>
  );
}
