import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GridSkeleton, MovieGrid } from "@/components/MovieCard";
import { Pagination } from "@/components/Pagination";
import { getMovieList } from "@/lib/server-api";
import { CATEGORIES, type Category } from "@/lib/types";

export default function BrowsePage(props: PageProps<"/browse/[category]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <Suspense
        fallback={
          <>
            <div className="mb-8 h-9 w-64 animate-pulse rounded bg-surface-2" />
            <GridSkeleton />
          </>
        }
      >
        <BrowseContent {...props} />
      </Suspense>
    </div>
  );
}

async function BrowseContent({ params, searchParams }: PageProps<"/browse/[category]">) {
  const { category } = await params;
  if (!(category in CATEGORIES)) notFound();
  const cat = category as Category;

  const sp = await searchParams;
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), 500);

  const data = await getMovieList(cat, page);

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{CATEGORIES[cat]}</h1>
      <MovieGrid movies={data.results} />
      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        href={(p) => `/browse/${cat}?page=${p}`}
      />
    </>
  );
}
