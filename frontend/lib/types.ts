// Types li kayt9ablo m3a schemas dyal backend (FastAPI)

export type Category = "trending" | "popular" | "top-rated" | "upcoming";

export const CATEGORIES: Record<Category, string> = {
  trending: "Trending this week",
  popular: "Popular",
  "top-rated": "Top rated",
  upcoming: "Coming soon",
};

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface MovieList {
  page: number;
  total_pages: number;
  total_results: number;
  results: MovieSummary[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_url: string | null;
}

export interface MovieDetail {
  id: number;
  title: string;
  original_title: string;
  tagline: string | null;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string | null;
  runtime: number | null;
  status: string | null;
  original_language: string | null;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  cast: CastMember[];
  trailer_url: string | null;
  imdb_id: string | null;
}

/** Film f hero dyal home m3a key dyal trailer YouTube. */
export interface HeroMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string | null;
  vote_average: number;
  backdrop_url: string | null;
  trailer_key: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface SavedMovie {
  id: number;
  movie_id: number;
  title: string;
  poster_url: string | null;
  created_at: string;
  watched?: boolean;
}

export interface LibraryStatus {
  movie_id: number;
  is_favorite: boolean;
  in_watchlist: boolean;
  watched: boolean;
}

export function year(date: string | null): string {
  return date ? date.slice(0, 4) : "—";
}
