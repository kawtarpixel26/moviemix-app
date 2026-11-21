"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import * as api from "@/lib/client-api";
import type { SavedMovie } from "@/lib/types";

import { useAuth } from "./AuthProvider";
import { GridSkeleton, Poster } from "./MovieCard";

type Filter = "all" | "to-watch" | "watched";

/** Page dyal favorites wla watchlist (nfs component). */
export function SavedList({ kind }: { kind: api.ListKind }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<SavedMovie[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const isWatchlist = kind === "watchlist";
  const title = isWatchlist ? "My watchlist" : "My favorites";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .getSaved(kind)
      .then((data) => !cancelled && setItems(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [user, kind]);

  async function remove(movieId: number) {
    const before = items;
    setItems((list) => list?.filter((m) => m.movie_id !== movieId) ?? null);
    try {
      await api.removeSaved(kind, movieId);
    } catch (e) {
      setItems(before); // rj3 kif kan
      setError(e instanceof Error ? e.message : "Could not remove");
    }
  }

  async function toggleWatched(movie: SavedMovie) {
    try {
      const updated = await api.setWatched(movie.movie_id, !movie.watched);
      setItems((list) => list?.map((m) => (m.movie_id === movie.movie_id ? updated : m)) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update");
    }
  }

  const header = <h1 className="mb-6 text-3xl font-bold tracking-tight">{title}</h1>;

  if (loading || (user && items === null && !error)) {
    return (
      <Shell>
        {header}
        <GridSkeleton count={6} />
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        {header}
        <Empty
          text={`Log in to see ${isWatchlist ? "your watchlist" : "your favorite movies"}.`}
          href={`/login?next=/${kind}`}
          cta="Log in"
        />
      </Shell>
    );
  }

  const visible = (items ?? []).filter((m) =>
    filter === "all" ? true : filter === "watched" ? m.watched : !m.watched,
  );

  return (
    <Shell>
      {header}

      {isWatchlist && items && items.length > 0 && (
        <div className="mb-6 flex gap-2">
          {(
            [
              ["all", "All"],
              ["to-watch", "To watch"],
              ["watched", "Watched"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                filter === value
                  ? "bg-foreground text-background"
                  : "border border-border text-muted hover:text-foreground"
              }`}
            >
              {label}
              <span className="ml-1.5 opacity-60">
                {value === "all"
                  ? items.length
                  : items.filter((m) => (value === "watched" ? m.watched : !m.watched)).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {items && items.length === 0 ? (
        <Empty
          text={
            isWatchlist
              ? "Your watchlist is empty. Add movies you want to watch later."
              : "No favorites yet. Tap ♡ on any movie to save it here."
          }
          href="/"
          cta="Discover movies"
        />
      ) : visible.length === 0 ? (
        <p className="text-muted">Nothing here for this filter.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((m) => (
            <div key={m.movie_id} className="group">
              <Link href={`/movie/${m.movie_id}`} className="relative block">
                <div className={m.watched ? "opacity-50" : ""}>
                  <Poster src={m.poster_url} title={m.title} />
                </div>
                {m.watched && (
                  <span className="absolute left-2 top-2 rounded-md bg-gold px-1.5 py-0.5 text-xs font-semibold text-black">
                    ✓ Watched
                  </span>
                )}
              </Link>
              <Link
                href={`/movie/${m.movie_id}`}
                className="mt-2 line-clamp-1 block text-sm font-medium hover:text-accent"
              >
                {m.title}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2 whitespace-nowrap">
                {isWatchlist && (
                  <button
                    onClick={() => toggleWatched(m)}
                    className="flex-1 rounded-full border border-border px-2 py-1 text-xs hover:border-gold hover:text-gold"
                  >
                    {m.watched ? "Unmark" : "Mark watched"}
                  </button>
                )}
                <button
                  onClick={() => remove(m.movie_id)}
                  className="flex-1 rounded-full border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">{children}</div>;
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <p className="text-muted">{text}</p>
      <Link
        href={href}
        className="mt-5 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:brightness-110"
      >
        {cta}
      </Link>
    </div>
  );
}
