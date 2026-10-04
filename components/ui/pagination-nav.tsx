import { Button } from "@/components/ui/button";

type Props = {
  /** Path the links point at, e.g. "/admin/participants". */
  baseUrl: string;
  page: number;
  perPage: number;
  total: number;
  /** Active filters to carry across pages so paging never drops the filter. */
  params?: Record<string, string | undefined>;
  /** Plural noun used in the "Showing … of …" line. */
  noun?: string;
};

/**
 * Server-rendered pagination footer. Uses plain anchors rather than next/link
 * so paging still works if client-side routing is unavailable.
 */
export function PaginationNav({
  baseUrl,
  page,
  perPage,
  total,
  params = {},
  noun = "rows",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...params, page: String(page), ...over };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, k === "page" && v === "1" ? "" : v);
    }
    const s = p.toString();
    return s ? `${baseUrl}?${s}` : baseUrl;
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {total === 0
          ? `No ${noun} to show`
          : `Showing ${from}–${to} of ${total} ${noun} · page ${Math.min(page, totalPages)} of ${totalPages}`}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <a href={qs({ page: String(page - 1) })}>Previous</a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="outline" size="sm">
            <a href={qs({ page: String(page + 1) })}>Next</a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}