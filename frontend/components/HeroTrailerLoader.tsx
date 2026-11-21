"use client";

import dynamic from "next/dynamic";

import { HeroSkeleton } from "./HeroTrailer";

// ssr: false -> film random kaytkhtar ghir f browser (kol visite film akhor)
export const HeroTrailerLoader = dynamic(
  () => import("./HeroTrailer").then((m) => m.HeroTrailer),
  { ssr: false, loading: () => <HeroSkeleton /> },
);
