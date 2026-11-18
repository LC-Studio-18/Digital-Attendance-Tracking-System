
function validateAttendanceRows(rows) {
  const valid = [];
  const validStatuses = ["IN", "OUT"];

  rows.forEach((row) => {
    if (!row.staffId || !row.name) return;
    if (!validStatuses.includes(row.status)) return;
    if (isNaN(Date.parse(row.lastClockTime))) return;

    valid.push({
      staffId: row.staffId,
      name: row.name,
      status: row.status,
      lastClockTime: new Date(row.lastClockTime).toISOString()
    });
  });

  return valid;
}

let cache = {
  records: [],
  totalIn: 0,
  lastUpdated: null,
  refreshSuccess: false,
  hasEverSucceeded: false
};

export async function fetchAndCacheAttendance() {
  try {
    const rawSheetData = [
      { staffId: "1", name: "Jane Doe", status: "IN", lastClockTime: new Date().toISOString() },
      { staffId: "2", name: "John Smith", status: "OUT", lastClockTime: new Date().toISOString() }
    ];

    const cleanRecords = validateAttendanceRows(rawSheetData);

    cache = {
      records: cleanRecords,
      totalIn: cleanRecords.filter((record) => record.status === "IN").length,
      lastUpdated: new Date().toISOString(),
      refreshSuccess: true,
      hasEverSucceeded: true
    };
  } catch (error) {
    console.error("Sheets fetch failed:", error.message);
    cache.refreshSuccess = false; // Mark refresh as failed
  }
}

const initialRefresh = fetchAndCacheAttendance();

// Poll every 3 seconds
setInterval(fetchAndCacheAttendance, 3000);

export async function getLiveAttendance(req, res) {
  await initialRefresh;

  // Fallback: Backend is unavailable and has no old data
  if (!cache.hasEverSucceeded && !cache.refreshSuccess) {
    return res.status(503).json({
      ok: false,
      error: { code: "UPSTREAM_UNAVAILABLE", message: "Attendance data temporarily unavailable" }
    });
  }

  // Fallback: Serving old data because latest refresh failed
  const isStale = !cache.refreshSuccess;

  return res.status(200).json({
    ok: true,
    data: { records: cache.records, totalIn: cache.totalIn },
    meta: { 
      lastUpdated: cache.lastUpdated, 
      stale: isStale, 
      refreshSuccess: cache.refreshSuccess 
    }
  });
}