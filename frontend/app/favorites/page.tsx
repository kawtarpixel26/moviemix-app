import type { Metadata } from "next";

import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return <SavedList kind="favorites" />;
}
