import { useEffect, useState } from "react";
import { fetchAttendancePage } from "../services/attendanceService";

/**
 * Loads attendance records one page at a time.
 * - One request per page change (stale requests are cancelled).
 * - Changing filters resets to page 1 without firing a second request.
 * - "loading" is worked out from the data, so no state is set synchronously inside the effect.
 */
export function useAttendancePagination({ limit = 10, filters = {} } = {}) {
  const filtersKey = JSON.stringify(filters);

  // The page number remembers which filters it belongs to.
  const [pageState, setPageState] = useState({ key: filtersKey, page: 1 });
  const page = pageState.key === filtersKey ? pageState.page : 1;

  const [reloadCount, setReloadCount] = useState(0);

  // Identifies the request we are waiting for.
  const requestKey = `${page}|${limit}|${filtersKey}|${reloadCount}`;

  // Holds the latest finished request (its data, or its error).
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetchAttendancePage({ page, limit, signal: controller.signal, ...JSON.parse(filtersKey) })
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return; // a newer request replaced this one
        setResult({ key: requestKey, data: null, error });
      });

    return () => controller.abort();
  }, [page, limit, filtersKey, requestKey]);

  // Still loading until the finished request matches the one we asked for.
  const settled = result.key === requestKey;
  const data = result.data;

  let status;
  if (!settled) status = "loading"; // keeps showing the previous page (dimmed) meanwhile
  else if (result.error) status = "error";
  else status = data.records.length > 0 ? "success" : "empty";

  const goToPage = (target) => setPageState({ key: filtersKey, page: Math.max(1, target) });

  return {
    status, // "loading" | "success" | "empty" | "error"
    records: data?.records ?? [],
    total: data?.total ?? null,
    totalPages: data?.totalPages ?? null,
    hasNext: data?.hasNext ?? false,
    error: settled ? result.error : null,
    page,
    limit,
    next: () => goToPage(page + 1),
    prev: () => goToPage(page - 1),
    retry: () => setReloadCount((count) => count + 1),
  };
}
