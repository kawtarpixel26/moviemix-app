import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LibraryButtons } from "@/components/LibraryButtons";
import { Poster, Rating } from "@/components/MovieCard";
import { getMovie } from "@/lib/server-api";
import { year } from "@/lib/types";

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <MovieContent params={params} />
    </Suspense>
  );
}

async function MovieContent({ params }: Pick<PageProps<"/movie/[id]">, "params">) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId) || movieId <= 0) notFound();

  const movie = await getMovie(movieId);
  if (!movie) notFound();

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <article>
      {/* Backdrop */}
      <div className="relative isolate h-64 overflow-hidden sm:h-96">
        {movie.backdrop_url && (
          <Image
            src={movie.backdrop_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover object-top opacity-50"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background to-background/20" />
      </div>

      <div className="relative mx-auto -mt-40 max-w-7xl px-4 sm:-mt-56 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="w-48 shrink-0 self-center md:w-64 md:self-start">
            <Poster
              src={movie.poster_url}
              title={movie.title}
              sizes="256px"
              priority
            />
          </div>

          <div className="flex-1 md:pt-24">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              {movie.title}{" "}
              <span className="font-normal text-muted">({year(movie.release_date)})</span>
            </h1>
            {movie.tagline && (
              <p className="mt-2 italic text-muted">“{movie.tagline}”</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              <Rating value={movie.vote_average} />
              <span>{movie.vote_count.toLocaleString("en-US")} votes</span>
              {movie.release_date && <span>· {movie.release_date}</span>}
              {runtime && <span>· {runtime}</span>}
              {movie.status && movie.status !== "Released" && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                  {movie.status}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <LibraryButtons movieId={movie.id} />
              {movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-2"
                >
                  ▶ Watch trailer
                </a>
              )}
            </div>

            <h2 className="mt-8 text-lg font-semibold">Overview</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-foreground/85">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>

        {movie.cast.length > 0 && (
          <section className="mt-12 pb-16">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Cast</h2>
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
              {movie.cast.map((c) => (
                <div key={`${c.id}-${c.character}`} className="w-28 shrink-0 sm:w-32">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-2">
                    {c.profile_url ? (
                      <Image
                        src={c.profile_url}
                        alt={c.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-2xl text-muted">
                        {c.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm font-medium">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-muted">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <div className="h-64 animate-pulse bg-surface sm:h-96" />
      <div className="relative mx-auto -mt-40 flex max-w-7xl flex-col gap-8 px-4 sm:-mt-56 sm:px-8 md:flex-row">
        <div className="aspect-[2/3] w-48 animate-pulse self-center rounded-lg bg-surface-2 md:w-64" />
        <div className="flex-1 space-y-4 md:pt-24">
          <div className="h-10 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-24 w-full animate-pulse rounded bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
