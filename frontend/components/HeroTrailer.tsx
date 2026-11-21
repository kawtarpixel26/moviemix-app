"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { year, type HeroMovie } from "@/lib/types";

const LAST_HERO_KEY = "movie_app_last_hero";

/**
 * Kankhtarou film random, machi nfs l-film li ba9i tchaf
 * (excludeId, wla dyal visite li fatet mn localStorage).
 */
function pickMovie(movies: HeroMovie[], excludeId?: number): HeroMovie {
  let exclude = excludeId != null ? String(excludeId) : null;
  if (exclude === null) {
    try {
      exclude = localStorage.getItem(LAST_HERO_KEY);
    } catch {
      // localStorage ma-kaynch
    }
  }
  const pool =
    movies.length > 1 ? movies.filter((m) => String(m.id) !== exclude) : movies;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Ch7al mn l-hero khasso ykoun bayn bach l-video ykhdem. */
const VISIBLE_RATIO = 0.3;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Hero dyal home: trailer YouTube kaykhdem f l-background (muted). */
export function HeroTrailer({ movies }: { movies: HeroMovie[] }) {
  const [movie, setMovie] = useState(() => pickMovie(movies));
  const [reducedMotion] = useState(prefersReducedMotion);
  const [inView, setInView] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // L-video ykhdem ghir mlli l-hero bayn f l-écran
  const playVideo = !reducedMotion && inView;

  // Mlli l-user ydouz l-hero: n7ebsso l-video w s-sout (iframe kaytm7a),
  // w nwjdo film akhor; mlli yrje3, kaykhdem trailer jdid.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let wasVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio >= VISIBLE_RATIO;
        if (visible === wasVisible) return;
        wasVisible = visible;
        setInView(visible);
        if (!visible) {
          clearTimeout(fadeTimer.current);
          setVideoVisible(false);
          setMuted(true);
          setMovie((current) => pickMovie(movies, current.id));
        }
      },
      { threshold: [0, VISIBLE_RATIO, 1] },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(fadeTimer.current);
    };
  }, [movies]);

  // N3a9lo 3la film bach f visite jaya nkhtarou wa7ed akhor
  useEffect(() => {
    try {
      localStorage.setItem(LAST_HERO_KEY, String(movie.id));
    } catch {
      // ma kayn mochkil
    }
  }, [movie.id]);

  function toggleSound() {
    const command = muted ? "unMute" : "mute";
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*",
    );
    setMuted(!muted);
  }

  const key = movie.trailer_key;
  const src =
    `https://www.youtube-nocookie.com/embed/${key}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}` +
    `&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`;

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden">
      {/* Background: tswira, w l-video kayban fo9ha mlli ykoun wajed */}
      <div className="absolute inset-0 -z-10 overflow-hidden [container-type:size]">
        {movie.backdrop_url && (
          <Image
            src={movie.backdrop_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-60"
          />
        )}
        {playVideo && (
          <iframe
            key={movie.id}
            ref={iframeRef}
            src={src}
            title={`${movie.title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
            aria-hidden="true"
            // ntsennaw chwiya bach ma yban-ch logo dyal YouTube f lwel
            onLoad={() => {
              clearTimeout(fadeTimer.current);
              fadeTimer.current = setTimeout(() => setVideoVisible(true), 1500);
            }}
            className={`pointer-events-none absolute left-1/2 top-1/2 transition-opacity duration-1000 ${
              videoVisible ? "opacity-70" : "opacity-0"
            }`}
            style={{
              // "cover": l-video 16:9 kay3mmer section kamla
              width: "max(100cqw, 177.78cqh)",
              height: "max(100cqh, 56.25cqw)",
              transform: "translate(-50%, -50%) scale(1.2)",
              border: 0,
            }}
          />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/40 to-transparent" />

      <div className="mx-auto flex min-h-[28rem] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[36rem] sm:px-8">
        <span className="mb-3 flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Trending trailer
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight drop-shadow-lg sm:text-6xl">
          {movie.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {year(movie.release_date)} · ★ {movie.vote_average.toFixed(1)}
        </p>
        <p className="mt-4 line-clamp-3 max-w-xl text-sm text-foreground/85 sm:text-base">
          {movie.overview}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/movie/${movie.id}`}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
          >
            View details
          </Link>
          <a
            href={`https://www.youtube.com/watch?v=${key}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border bg-surface/60 px-6 py-2.5 text-sm backdrop-blur hover:bg-surface-2"
          >
            ▶ Full trailer
          </a>
          {playVideo && videoVisible && (
            <button
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-surface/60 backdrop-blur hover:bg-surface-2"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative">
      <div className="mx-auto flex min-h-[28rem] max-w-7xl flex-col justify-end gap-3 px-4 pb-10 pt-24 sm:min-h-[36rem] sm:px-8">
        <div className="h-5 w-36 animate-pulse rounded-full bg-surface-2" />
        <div className="h-12 w-2/3 max-w-xl animate-pulse rounded bg-surface-2" />
        <div className="h-16 w-full max-w-xl animate-pulse rounded bg-surface-2" />
      </div>
    </section>
  );
}
