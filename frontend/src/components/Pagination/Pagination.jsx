import "./Pagination.css";

export default function Pagination({
  page,
  totalPages,
  total,
  hasNext,
  loading,
  onPrev,
  onNext,
}) {
  const atFirstPage = page <= 1;
  const atLastPage = totalPages != null ? page >= totalPages : !hasNext;

  return (
    <nav className="pagination" aria-label="Attendance pagination">
      <button type="button" onClick={onPrev} disabled={atFirstPage || loading}>
        Previous
      </button>

      <p className="pagination__status" aria-live="polite">
        Page {page}
        {totalPages != null && ` of ${totalPages}`}
        {total != null && ` (${total} records)`}
      </p>

      <button type="button" onClick={onNext} disabled={atLastPage || loading}>
        Next
      </button>
    </nav>
  );
}
