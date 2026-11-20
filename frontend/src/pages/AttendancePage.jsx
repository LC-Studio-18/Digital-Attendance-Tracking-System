import { useAttendancePagination } from "../hooks/useAttendancePagination";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";
import Pagination from "../components/Pagination/Pagination";
import "./AttendancePage.css";

const PAGE_SIZE = 10; // backend default is 20, max 100

// TODO: replace these three with the loading / empty / error components you built in Feature 1.
function LoadingMessage() {
  return <p role="status">Loading attendance records...</p>;
}
function EmptyMessage() {
  return <p>No attendance records found.</p>;
}
function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert">
      <p>{message || "Something went wrong while loading attendance records."}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export default function AttendancePage() {
  // Existing filters/sorting go in here later, e.g. { department, date, sort }
  const filters = {};

  const { status, records, page, total, totalPages, hasNext, error, next, prev, retry } =
    useAttendancePagination({ limit: PAGE_SIZE, filters });

  const loading = status === "loading";
  const hasRecords = records.length > 0;

  return (
    <main className="attendance-page">
      <h1>Attendance</h1>

      {loading && !hasRecords && <LoadingMessage />}
      {status === "error" && <ErrorMessage message={error?.message} onRetry={retry} />}
      {status === "empty" && <EmptyMessage />}

      {hasRecords && status !== "error" && <AttendanceTable records={records} busy={loading} />}

      {(hasRecords || loading) && status !== "error" && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          hasNext={hasNext}
          loading={loading}
          onPrev={prev}
          onNext={next}
        />
      )}
    </main>
  );
}
