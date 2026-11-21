// Fonctions li katkhdem GHIR f server (Server Components).
// Kayhdro m3a backend directement w kaydiro cache b "use cache".

import { cacheLife } from "next/cache";

import type { Category, Genre, HeroMovie, MovieDetail, MovieList } from "./types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Backend error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getMovieList(
  category: Category,
  page = 1,
): Promise<MovieList> {
  "use cache";
  cacheLife("hours");
  const data = await get<MovieList>(`/movies/${category}?page=${page}`);
  return data ?? { page, total_pages: 0, total_results: 0, results: [] };
}

export async function searchMovies(query: string, page = 1): Promise<MovieList> {
  "use cache";
  cacheLife("minutes");
  const params = new URLSearchParams({ query, page: String(page) });
  const data = await get<MovieList>(`/movies/search?${params}`);
  return data ?? { page, total_pages: 0, total_results: 0, results: [] };
}

export async function getMovie(id: number): Promise<MovieDetail | null> {
  "use cache";
  cacheLife("hours");
  return get<MovieDetail>(`/movies/${id}`);
}

/**
 * Films mn trending li 3ndhom trailer YouTube (l hero dyal home).
 * Kaytjebdo merra f sa3a; browser kaykhtar wa7ed random f kol visite.
 */
export async function getHeroMovies(): Promise<HeroMovie[]> {
  "use cache";
  cacheLife("hours");
  const { results } = await getMovieList("trending");
  const candidates = results.filter((m) => m.backdrop_url).slice(0, 10);

  const details = await Promise.all(
    candidates.map((m) => getMovie(m.id).catch(() => null)),
  );

  return details.flatMap((d) => {
    const key = d?.trailer_url ? new URL(d.trailer_url).searchParams.get("v") : null;
    if (!d || !key) return [];
    return [
      {
        id: d.id,
        title: d.title,
        overview: d.overview,
        release_date: d.release_date,
        vote_average: d.vote_average,
        backdrop_url: d.backdrop_url,
        trailer_key: key,
      },
    ];
  });
}

export async function getGenres(): Promise<Genre[]> {
  "use cache";
  cacheLife("days");
  return (await get<Genre[]>("/movies/genres")) ?? [];
}
