// Fonctions li katkhdem f browser (Client Components).
// Kaysifto l /api/... w Next kaydouzhom l backend (chouf next.config.ts).

import type { LibraryStatus, SavedMovie, User } from "./types";

const TOKEN_KEY = "movie_app_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage ma-kaynch (private mode...)
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      }
    } catch {
      // réponse machi JSON
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export async function login(identifier: string, password: string) {
  const body = new URLSearchParams({ username: identifier, password });
  return api<{ access_token: string }>("/auth/login", { method: "POST", body });
}

export function register(email: string, username: string, password: string) {
  return api<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

/** "Continue with Google": kansifto credential dyal Google l backend. */
export const loginWithGoogle = (credential: string) =>
  api<{ access_token: string }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });

export const getMe = () => api<User>("/auth/me");

// ---------- Favorites / Watchlist ----------

export type ListKind = "favorites" | "watchlist";

export const getSaved = (kind: ListKind) => api<SavedMovie[]>(`/${kind}`);

export const addSaved = (kind: ListKind, movieId: number) =>
  api<SavedMovie>(`/${kind}`, {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId }),
  });

export const removeSaved = (kind: ListKind, movieId: number) =>
  api<void>(`/${kind}/${movieId}`, { method: "DELETE" });

export const setWatched = (movieId: number, watched: boolean) =>
  api<SavedMovie>(`/watchlist/${movieId}`, {
    method: "PATCH",
    body: JSON.stringify({ watched }),
  });

export const getLibraryStatus = (movieId: number) =>
  api<LibraryStatus>(`/library/${movieId}`);
