"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "./AuthProvider";
import { SearchForm } from "./SearchForm";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {/* logo.png fih bzaf d l-k7el 7dah, scale kay9ess dak l-fragh */}
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/logo.png"
              alt=""
              fill
              priority
              sizes="36px"
              className="scale-[1.4] object-cover"
            />
          </span>
          MOVIEMIX
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/browse/popular" className="hover:text-foreground">Popular</Link>
          <Link href="/favorites" className="hover:text-foreground">Favorites</Link>
          <Link href="/watchlist" className="hover:text-foreground">Watchlist</Link>
        </nav>

        <div className="ml-auto hidden w-full max-w-xs sm:block">
          <SearchForm />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-surface-2" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-2"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {user.username[0]?.toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.username}</span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-surface text-sm shadow-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/favorites" className="block px-4 py-2 hover:bg-surface-2">
                    My favorites
                  </Link>
                  <Link href="/watchlist" className="block px-4 py-2 hover:bg-surface-2">
                    My watchlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="block w-full border-t border-border px-4 py-2 text-left text-accent hover:bg-surface-2"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile: search + links ta7t */}
      <div className="flex flex-col gap-2 px-4 pb-3 sm:hidden">
        <SearchForm />
        <nav className="no-scrollbar flex gap-4 overflow-x-auto whitespace-nowrap text-sm text-muted">
          <Link href="/">Home</Link>
          <Link href="/browse/popular">Popular</Link>
          <Link href="/favorites">Favorites</Link>
          <Link href="/watchlist">Watchlist</Link>
        </nav>
      </div>
    </header>
  );
}
