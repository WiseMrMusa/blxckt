"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { changePassword, updateProfile } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/validation";

function Status({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <p className={`text-xs ${state.ok ? "text-sage" : "text-signal-2"}`}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ handle }: { handle: string | null }) {
  const [state, action] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="profile-handle">
          Your X handle
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
            @
          </span>
          <input
            id="profile-handle"
            name="handle"
            defaultValue={handle ?? ""}
            placeholder="yourhandle"
            autoComplete="off"
            spellCheck={false}
            className="input pl-7 font-mono"
          />
        </div>
        {state?.errors?.handle ? (
          <p className="mt-1.5 text-xs text-signal-2">
            {state.errors.handle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary btn-sm">Save</SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input"
        />
        {state?.errors?.currentPassword ? (
          <p className="mt-1.5 text-xs text-signal-2">
            {state.errors.currentPassword}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className="input"
          />
          {state?.errors?.newPassword ? (
            <p className="mt-1.5 text-xs text-signal-2">
              {state.errors.newPassword}
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input"
          />
          {state?.errors?.confirmPassword ? (
            <p className="mt-1.5 text-xs text-signal-2">
              {state.errors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary btn-sm" pendingText="Updating…">
          Update password
        </SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}
