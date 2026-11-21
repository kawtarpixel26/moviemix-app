import type { Metadata } from "next";
import { Suspense } from "react";

import { GridSkeleton, MovieGrid } from "@/components/MovieCard";
import { Pagination } from "@/components/Pagination";
import { SearchForm } from "@/components/SearchForm";
import { searchMovies } from "@/lib/server-api";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <Suspense fallback={<GridSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), 500);

  return (
    <>
      <div className="mx-auto mb-10 max-w-xl">
        {/* key={q}: kat3awd tcréé input ila tbdlat recherche */}
        <SearchForm key={q} defaultValue={q} autoFocus={!q} large />
      </div>

      {!q ? (
        <p className="text-center text-muted">Type a movie title to start searching.</p>
      ) : (
        <Results q={q} page={page} />
      )}
    </>
  );
}

async function Results({ q, page }: { q: string; page: number }) {
  const data = await searchMovies(q, page);

  if (data.results.length === 0) {
    return (
      <p className="text-center text-muted">
        No movies found for <span className="text-foreground">“{q}”</span>.
      </p>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">
        {data.total_results.toLocaleString("en-US")} results for{" "}
        <span className="text-accent">“{q}”</span>
      </h1>
      <MovieGrid movies={data.results} />
      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        href={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
      />
    </>
  );
}
