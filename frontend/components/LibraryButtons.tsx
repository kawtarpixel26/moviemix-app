"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import * as api from "@/lib/client-api";
import type { LibraryStatus } from "@/lib/types";

import { useAuth } from "./AuthProvider";

/** Boutons "Favorite" w "Watchlist" f page dyal détails. */
export function LibraryButtons({ movieId }: { movieId: number }) {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<LibraryStatus | null>(null);
  const [busy, setBusy] = useState<api.ListKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .getLibraryStatus(movieId)
      .then((s) => !cancelled && setStatus(s))
      .catch(() => !cancelled && setError("Could not load your lists"));
    return () => {
      cancelled = true;
    };
  }, [user, movieId]);

  if (loading) {
    return <div className="h-10 w-64 animate-pulse rounded-full bg-surface-2" />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=/movie/${movieId}`}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
      >
        Log in to save this movie
      </Link>
    );
  }

  async function toggle(kind: api.ListKind) {
    if (!status) return;
    const isOn = kind === "favorites" ? status.is_favorite : status.in_watchlist;
    setBusy(kind);
    setError(null);
    try {
      if (isOn) await api.removeSaved(kind, movieId);
      else await api.addSaved(kind, movieId);
      setStatus(await api.getLibraryStatus(movieId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const base =
    "rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60";

  return (
    <>
      <button
        onClick={() => toggle("favorites")}
        disabled={!status || busy !== null}
        aria-pressed={status?.is_favorite ?? false}
        className={`${base} ${
          status?.is_favorite
            ? "bg-accent text-white hover:brightness-110"
            : "border border-border bg-surface hover:bg-surface-2"
        }`}
      >
        {status?.is_favorite ? "♥ In favorites" : "♡ Add to favorites"}
      </button>
      <button
        onClick={() => toggle("watchlist")}
        disabled={!status || busy !== null}
        aria-pressed={status?.in_watchlist ?? false}
        className={`${base} ${
          status?.in_watchlist
            ? "bg-gold text-black hover:brightness-110"
            : "border border-border bg-surface hover:bg-surface-2"
        }`}
      >
        {status?.in_watchlist
          ? status.watched
            ? "✓ Watched"
            : "✓ In watchlist"
          : "+ Watchlist"}
      </button>
      {error && <p className="w-full text-sm text-accent">{error}</p>}
    </>
  );
}
