import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Posters w tsawer dyal acteurs kayjiw mn TMDB
    // (Next kayjibhom w kay7wlhom l WebP sghar, w kaydir lihom cache)
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
  async rewrites() {
    // Browser kaysifet l /api/... w Next kaydouzha l backend FastAPI
    // (bla mochkil dyal CORS)
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
