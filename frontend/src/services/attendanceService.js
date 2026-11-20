import { mockFetchAttendancePage } from "./mockAttendanceApi"; // TEMPORARY: delete with the mock file

const BASE_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"; // TEMPORARY: delete with the mock file

// Official endpoint confirmed by the backend developer (Xabiso).
const ATTENDANCE_PATH = "/api/attendance";

// TODO: replace with your project's real way of getting the Firebase ID token.
// It should return the token string, e.g. () => auth.currentUser?.getIdToken()
async function getAuthToken() {
  return null;
}

/**
 * Fetch ONE page of attendance records.
 * Backend query params: page, limit, date, startDate, endDate, employeeId.
 * Any filter keys you pass in are sent as query parameters.
 */
export async function fetchAttendancePage({ page, limit, signal, ...filters }) {
  // TEMPORARY: delete this block with the mock file
  if (USE_MOCK) {
    return normalizePage(await mockFetchAttendancePage({ page, limit, signal, ...filters }), page, limit);
  }

  const params = new URLSearchParams({ page, limit });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });

  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${ATTENDANCE_PATH}?${params}`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(`Could not load attendance records (error ${response.status}).`);
  }

  const body = await response.json();
  if (body.success === false) {
    throw new Error(body.message || "Could not load attendance records.");
  }
  return normalizePage(body, page, limit);
}

// Backend response: { success, count, totalRecords, currentPage, totalPages, data: [...] }
export function normalizePage(body, page, limit) {
  const records = body.data ?? [];
  const currentPage = body.currentPage ?? page;
  const total = body.totalRecords ?? null;
  const totalPages = body.totalPages ?? (total != null ? Math.max(1, Math.ceil(total / limit)) : null);
  const hasNext = totalPages != null ? currentPage < totalPages : records.length === limit;

  return { records, page: currentPage, limit, total, totalPages, hasNext };
}
