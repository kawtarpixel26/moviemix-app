"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchForm({
  defaultValue = "",
  autoFocus = false,
  large = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  large?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        ⌕
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search movies…"
        aria-label="Search movies"
        maxLength={100}
        className={`w-full rounded-full border border-border bg-surface pl-9 pr-4 text-foreground placeholder:text-muted focus:border-accent focus:outline-none ${
          large ? "py-3 text-base" : "py-1.5 text-sm"
        }`}
      />
    </form>
  );
}
