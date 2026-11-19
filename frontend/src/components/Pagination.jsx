export default function Pagination({ page, totalPages, total, hasNext, loading, onPrev, onNext }) {
  const atFirst = page <= 1;
  const atLast = totalPages != null ? page >= totalPages : !hasNext;
  return (
    <nav className="pagination" aria-label="Attendance pagination">
      <button type="button" onClick={onPrev} disabled={atFirst || loading}>Previous</button>
      <p className="pagination__status" aria-live="polite">
        Page {page}
        {totalPages != null && ` of ${totalPages}`}
        {total != null && ` · ${total} records`}
      </p>
      <button type="button" onClick={onNext} disabled={atLast || loading}>Next</button>
    </nav>
  );
}