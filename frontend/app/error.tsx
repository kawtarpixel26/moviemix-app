"use client"; // Error boundaries must be Client Components

export default function Error({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-5xl">🎞️</p>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        We couldn’t load this page. Make sure the backend is running, then try again.
      </p>
      <button
        onClick={() => retry()}
        className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}
