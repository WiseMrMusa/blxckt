import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="flex flex-col border-b border-line bg-ink-2/50 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Logo />
          <form action={logout} className="lg:hidden">
            <button className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </div>

        <Nav />

        <div className="mt-auto hidden border-t border-line px-5 py-4 lg:block">
          <p className="eyebrow mb-2">Signed in</p>
          <p className="truncate text-sm text-paper" title={user.email}>
            {user.email}
          </p>
          <p className="mb-3 font-mono text-xs text-muted">
            {user.handle ? `@${user.handle}` : "no handle set"}
          </p>
          <form action={logout}>
            <button className="btn btn-ghost btn-sm w-full">Sign out</button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
