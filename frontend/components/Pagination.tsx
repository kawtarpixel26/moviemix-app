import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const btn =
    "rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent";
  const disabled = "rounded-full border border-border px-4 py-2 text-sm text-muted opacity-40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn}>← Previous</Link>
      ) : (
        <span className={disabled}>← Previous</span>
      )}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={btn}>Next →</Link>
      ) : (
        <span className={disabled}>Next →</span>
      )}
    </nav>
  );
}
