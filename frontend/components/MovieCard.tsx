import Image from "next/image";
import Link from "next/link";

import { year, type MovieSummary } from "@/lib/types";

export function Poster({
  src,
  title,
  sizes = "(max-width: 640px) 45vw, 200px",
  priority = false,
}: {
  src: string | null;
  title: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface-2">
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full place-items-center p-3 text-center text-xs text-muted">
          {title}
        </div>
      )}
    </div>
  );
}

export function Rating({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-gold">
      ★ {value.toFixed(1)}
    </span>
  );
}

export function MovieCard({ movie }: { movie: MovieSummary }) {
  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative">
        <Poster src={movie.poster_url} title={movie.title} />
        <div className="absolute left-2 top-2">
          <Rating value={movie.vote_average} />
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-medium group-hover:text-accent">
        {movie.title}
      </h3>
      <p className="text-xs text-muted">{year(movie.release_date)}</p>
    </Link>
  );
}

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="aspect-[2/3] animate-pulse rounded-lg bg-surface-2" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
