export async function fetchAttendancePage({ page, limit, signal, ...filters }) {
  const params = new URLSearchParams({ page, limit });
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, v);
  });
  // Use your existing base URL / request helper here
  const res = await fetch(`${ATTENDANCE_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return normalizePage(await res.json(), page, limit);
}

function normalizePage(body, page, limit) {
  const records = Array.isArray(body) ? body : body.data ?? body.records ?? [];
  const current = body.page ?? page;
  const total = body.total ?? body.totalRecords ?? null;
  const totalPages =
    body.totalPages ?? (total != null ? Math.max(1, Math.ceil(total / limit)) : null);
  const hasNext = totalPages != null ? current < totalPages : records.length === limit;
  return { records, page: current, limit, total, totalPages, hasNext };
}