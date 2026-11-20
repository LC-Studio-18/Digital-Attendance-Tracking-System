// TEMPORARY: lets you test the page while the backend / Google Sheet data is unavailable.
// Do NOT commit this file. Enabled with VITE_USE_MOCK=true. Delete it when the real API works.
// It returns the same shape as GET /api/attendance and understands page, limit,
// date, startDate, endDate and employeeId.

const EMPLOYEES = [
  ["EMP001", "Thando Mokoena"], ["EMP002", "Lerato Nkosi"], ["EMP003", "Sipho Dlamini"],
  ["EMP004", "Ayesha Patel"], ["EMP005", "Kabelo Ndlovu"], ["EMP006", "Zanele Khumalo"],
  ["EMP007", "Musa Jacobs"], ["EMP008", "Nandi Cele"], ["EMP009", "Ryan Smith"],
  ["EMP010", "Palesa Molefe"],
];
const STATUSES = ["Present", "Late", "Present", "Absent"];
const DATES = ["2026-11-18", "2026-11-19", "2026-11-20"];

// 3 days x 10 employees = 30 rows (3 pages at 10 per page)
const ROWS = DATES.flatMap((date, d) =>
  EMPLOYEES.map(([employeeId, employeeName], i) => ({
    employeeId,
    employeeName,
    date,
    checkIn: `08:${String((i * 7 + d * 3) % 60).padStart(2, "0")}`,
    checkOut: d === 2 && i % 3 === 0 ? null : `17:${String((i * 5) % 60).padStart(2, "0")}`,
    status: STATUSES[(i + d) % STATUSES.length],
  }))
);

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export async function mockFetchAttendancePage({ page, limit, signal, date, startDate, endDate, employeeId }) {
  await delay(600, signal); // so you can see the loading state

  const matches = ROWS.filter(
    (row) =>
      (!employeeId || row.employeeId === employeeId) &&
      (!date || row.date === date) &&
      (!startDate || row.date >= startDate) &&
      (!endDate || row.date <= endDate)
  );

  const start = (page - 1) * limit;
  const data = matches.slice(start, start + limit);
  return {
    success: true,
    count: data.length,
    totalRecords: matches.length,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(matches.length / limit)),
    data,
  };
}
