import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page isn’t showing</h1>
      <p className="mt-2 text-muted">The movie or page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
      >
        Back home
      </Link>
    </div>
  );
}
