import { useEffect, useState } from "react";
import { fetchAttendancePage } from "../services/attendanceService";

export function useAttendancePagination({ limit = 10, filters = {} } = {}) {
  const filtersKey = JSON.stringify(filters);
  // Page is tied to the filters it was chosen under, so a filter change
  // resets to page 1 without firing a second request.
  const [pageState, setPageState] = useState({ key: filtersKey, page: 1 });
  const page = pageState.key === filtersKey ? pageState.page : 1;
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState({
    status: "loading", records: [], total: null, totalPages: null, hasNext: false, error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: null }));
    fetchAttendancePage({ page, limit, signal: controller.signal, ...JSON.parse(filtersKey) })
      .then((r) =>
        setState({
          status: r.records.length ? "success" : "empty",
          records: r.records, total: r.total, totalPages: r.totalPages,
          hasNext: r.hasNext, error: null,
        })
      )
      .catch((err) => {
        if (err.name !== "AbortError") setState((s) => ({ ...s, status: "error", error: err }));
      });
    return () => controller.abort();
  }, [page, limit, filtersKey, reloadCount]);

  const goToPage = (p) => setPageState({ key: filtersKey, page: Math.max(1, p) });
  return {
    ...state, page, limit,
    next: () => goToPage(page + 1),
    prev: () => goToPage(page - 1),
    retry: () => setReloadCount((c) => c + 1),
  };
}