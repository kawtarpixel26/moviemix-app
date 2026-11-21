import type { Metadata } from "next";

import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = { title: "Watchlist" };

export default function WatchlistPage() {
  return <SavedList kind="watchlist" />;
}
