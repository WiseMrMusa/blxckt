"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { login, signup } from "@/lib/actions/auth";
import type { FieldErrors } from "@/lib/validation";

function FieldError({ errors, name }: { errors?: FieldErrors; name: string }) {
  const message = errors?.[name];
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-signal-2">{message}</p>;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, formAction] = useActionState(
    isSignup ? signup : login,
    undefined,
  );

  return (
    <div className="reveal">
      <p className="eyebrow mb-3">{isSignup ? "Open a ledger" : "Return"}</p>
      <h1 className="text-3xl leading-tight">
        {isSignup ? "Start your ledger" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignup
          ? "Keep a record of who you blocked, and why."
          : "Sign in to your record of blockings."}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="input"
          />
          <FieldError errors={state?.errors} name="email" />
        </div>

        {isSignup ? (
          <div>
            <label className="label" htmlFor="handle">
              Your X handle <span className="normal-case opacity-60">(optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
                @
              </span>
              <input
                id="handle"
                name="handle"
                autoComplete="off"
                placeholder="yourhandle"
                className="input pl-7"
              />
            </div>
            <FieldError errors={state?.errors} name="handle" />
          </div>
        ) : null}

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            placeholder={isSignup ? "8+ characters, a number" : "••••••••"}
            className="input"
          />
          <FieldError errors={state?.errors} name="password" />
        </div>

        {state?.message ? (
          <p className="rounded-card border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal-2">
            {state.message}
          </p>
        ) : null}

        <SubmitButton
          className="btn-primary w-full"
          pendingText={isSignup ? "Opening…" : "Signing in…"}
        >
          {isSignup ? "Create ledger" : "Sign in"}
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already have one? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="link">
          {isSignup ? "Sign in" : "Create a ledger"}
        </Link>
      </p>
    </div>
  );
}
