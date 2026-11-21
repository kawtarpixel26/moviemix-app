"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "./AuthProvider";
import { GoogleButton, googleEnabled } from "./GoogleButton";

/** Ghir paths dakhel l-app (bach ma ndiroch redirect l site akhor). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, loginWithGoogle, register } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function onGoogle(credential: string) {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setSubmitting(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) await login(email.trim(), password);
      else await register(email.trim(), username.trim(), password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const input =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isLogin
          ? "Log in to see your favorites and watchlist."
          : "Save favorites and build your watchlist."}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6"
      >
        {googleEnabled && (
          <>
            <GoogleButton onCredential={onGoogle} />
            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm">{isLogin ? "Email or username" : "Email"}</span>
          <input
            type={isLogin ? "text" : "email"}
            required
            autoComplete={isLogin ? "username" : "email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </label>

        {!isLogin && (
          <label className="block space-y-1.5">
            <span className="text-sm">Username</span>
            <input
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9_]+"
              title="Letters, numbers and _ only"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={input}
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm">Password</span>
          <input
            type="password"
            required
            minLength={isLogin ? 1 : 8}
            maxLength={72}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
          {!isLogin && <span className="text-xs text-muted">At least 8 characters.</span>}
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "No account yet? " : "Already have an account? "}
        <Link
          href={`${isLogin ? "/register" : "/login"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-accent hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
