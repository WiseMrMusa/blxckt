import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { PasswordForm, ProfileForm } from "@/components/settings-forms";
import { deleteAccount, logoutEverywhere } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/util";

export const metadata = { title: "Account" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        index="06 · Account"
        title="Account"
        meta={
          <span className="font-mono text-xs">
            {user.email} · member since {formatDate(user.createdAt)}
          </span>
        }
      />

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 sm:px-8">
        <section className="panel">
          <div className="panel-header">
            <p className="eyebrow">Profile</p>
          </div>
          <div className="p-5">
            <ProfileForm handle={user.handle} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="eyebrow">Password</p>
          </div>
          <div className="p-5">
            <PasswordForm />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="eyebrow">Export</p>
            <p className="font-mono text-[11px] text-muted">your data, portable</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 p-5">
            <a href="/api/export?format=json" className="btn btn-sm">
              Download JSON
            </a>
            <a href="/api/export?format=csv" className="btn btn-sm">
              Download CSV
            </a>
            <p className="w-full text-xs text-muted">
              A complete copy of your ledger — every entry, category, and
              receipt.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="eyebrow">Sessions</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              Signed in on this device. Signing out everywhere ends all other
              active sessions.
            </p>
            <form action={logoutEverywhere}>
              <button className="btn btn-sm">Sign out everywhere</button>
            </form>
          </div>
        </section>

        <section className="panel border-signal/20">
          <div className="panel-header">
            <p className="eyebrow text-signal-2/80">Danger zone</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              Deleting your account erases your ledger, categories, and receipts
              permanently. Export first if you want a copy.
            </p>
            <form action={deleteAccount}>
              <ConfirmButton
                className="btn btn-danger btn-sm"
                message="Delete your account and every entry in it? This cannot be undone."
              >
                Delete account
              </ConfirmButton>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
