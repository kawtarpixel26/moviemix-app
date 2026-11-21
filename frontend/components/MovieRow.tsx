import Link from "next/link";

import { getMovieList } from "@/lib/server-api";
import { CATEGORIES, type Category } from "@/lib/types";

import { MovieCard } from "./MovieCard";

export async function MovieRow({ category }: { category: Category }) {
  const { results } = await getMovieList(category);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{CATEGORIES[category]}</h2>
        <Link href={`/browse/${category}`} className="text-sm text-muted hover:text-accent">
          See all →
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
        {results.map((m) => (
          <div key={m.id} className="w-36 shrink-0 snap-start sm:w-44">
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
