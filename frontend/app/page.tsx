import Image from "next/image";
import Link from "next/link";

import { HeroTrailerLoader } from "@/components/HeroTrailerLoader";
import { MovieRow } from "@/components/MovieRow";
import { getHeroMovies, getMovieList } from "@/lib/server-api";
import { year } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-16">
      <Hero />
      <MovieRow category="trending" />
      <MovieRow category="popular" />
      <MovieRow category="top-rated" />
      <MovieRow category="upcoming" />
    </div>
  );
}

/** Trailer dyal film random mn trending (kol visite film akhor). */
async function Hero() {
  const movies = await getHeroMovies();
  if (movies.length === 0) return <StaticHero />;
  return <HeroTrailerLoader movies={movies} />;
}

/** Fallback: l-film lewel f trending b backdrop kbir (ila ma kan ta trailer). */
async function StaticHero() {
  const { results } = await getMovieList("trending");
  const movie = results.find((m) => m.backdrop_url) ?? results[0];
  if (!movie) return null;

  return (
    <section className="relative isolate overflow-hidden">
      {movie.backdrop_url && (
        <Image
          src={movie.backdrop_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-top opacity-60"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/40 to-transparent" />

      <div className="mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[32rem] sm:px-8">
        <span className="mb-3 w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          #1 trending this week
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          {movie.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {year(movie.release_date)} · ★ {movie.vote_average.toFixed(1)}
        </p>
        <p className="mt-4 line-clamp-3 max-w-xl text-sm text-foreground/80 sm:text-base">
          {movie.overview}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/movie/${movie.id}`}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
          >
            View details
          </Link>
          <Link
            href="/browse/trending"
            className="rounded-full border border-border bg-surface/60 px-6 py-2.5 text-sm hover:bg-surface-2"
          >
            All trending
          </Link>
        </div>
      </div>
    </section>
  );
}
