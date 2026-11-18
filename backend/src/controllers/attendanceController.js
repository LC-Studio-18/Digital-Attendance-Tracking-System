/**
 * ============================================================
 * ATTENDANCE CONTROLLER
 * ============================================================
 *
 * PURPOSE:
 * - Provide attendance information to the live dashboard API.
 * - Validate and normalise attendance records.
 * - Maintain a cache of successfully retrieved attendance data.
 * - Track successful and failed refresh attempts.
 * - Preserve previously successful data when refreshing fails.
 * - Prevent multiple refresh operations from running together.
 * - Support scheduled and manually requested refreshes.
 *
 * DATA SOURCE:
 * The actual attendance data provider has not yet been connected
 * on this branch.
 *
 * No employee records or attendance timestamps are generated
 * by this controller.
 *
 * FUTURE INTEGRATION:
 * The data provider will be connected to the existing
 * attendanceService.js and onsiteService.js implementations
 * when those services are merged into this branch.
 */

// ============================================================
// 1. CONFIGURATION
// ============================================================

// The attendance cache refreshes every three seconds by default.
// This interval can be changed through the environment.

/**
 * Connect the controller to the real Google Sheets data provider.
 */
import {
  getLiveAttendanceData,
} from "../services/attendanceDataprovider.js";

/**
 * ============================================================
 * ATTENDANCE CONTROLLER
 * ============================================================
 *
 * PURPOSE:
 * - Provide attendance information to the live dashboard API.
 * - Validate and normalise attendance records.
 * - Maintain a cache of successfully retrieved attendance data.
 * - Track successful and failed refresh attempts.
 * - Preserve previous data when refreshing fails.
 * - Prevent overlapping refresh operations.
 * - Support scheduled and manually requested refreshes.
 *
 * DATA SOURCE:
 * The attendance data provider retrieves information through
 * attendanceService.js and onsiteService.js.
 *
 * No employee records or attendance timestamps are generated
 * by this controller.
 */

// ============================================================
// 1. CONFIGURATION
// ============================================================

const DEFAULT_REFRESH_INTERVAL_MS = 3000;

// ============================================================
// 2. ATTENDANCE DATA PROVIDER
// ============================================================

/**
 * The real Google Sheets provider is the default data source.
 *
 * WHY:
 * The controller should retrieve real attendance information
 * rather than generating demonstration employee records.
 *
 * Tests can temporarily replace this provider using
 * setAttendanceDataProvider().
 */
let attendanceDataProvider = getLiveAttendanceData;

// ============================================================
// 3. INITIAL CACHE STATE
// ============================================================

/**
 * Creates the initial attendance cache.
 *
 * WHY THESE VALUES ARE TRACKED:
 *
 * records:
 * The latest successfully retrieved employee records.
 *
 * totalIn:
 * The number of employees currently recorded as onsite.
 *
 * lastUpdated:
 * The timestamp of the last successful refresh.
 *
 * lastAttemptAt:
 * The timestamp of the most recent refresh attempt.
 *
 * refreshSuccess:
 * Whether the most recent refresh succeeded or failed.
 *
 * hasEverSucceeded:
 * Whether usable attendance data has ever been retrieved.
 *
 * refreshInProgress:
 * Whether an attendance refresh is currently running.
 *
 * lastError:
 * A safe error description for the API response.
 */
function createInitialCache() {
  return {
    records: [],
    totalIn: 0,
    lastUpdated: null,
    lastAttemptAt: null,
    refreshSuccess: null,
    hasEverSucceeded: false,
    refreshInProgress: false,
    lastError: null,
  };
}

// The cache remains in memory while the backend process runs.
// API requests read from this cache rather than independently
// initiating attendance data retrieval.
let cache = createInitialCache();

// Stores the currently running refresh promise.
// Additional refresh requests reuse this promise instead of
// starting another simultaneous data retrieval operation.
let refreshInFlight = null;

// Stores the automatic refresh timer.
let refreshInterval = null;

// ============================================================
// 4. TIMESTAMP NORMALISATION
// ============================================================

/**
 * Converts a supplied timestamp into a standard UTC ISO string.
 *
 * WHY:
 * A consistent timestamp format makes date comparisons reliable
 * and allows the API to return predictable timestamp values.
 *
 * Invalid and future timestamps are rejected.
 */
function normaliseTimestamp(value, currentTime = Date.now()) {
  if (!value) {
    return null;
  }

  const parsedDate =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  // Future timestamps cannot represent completed clock events.
  if (parsedDate.getTime() > currentTime) {
    return null;
  }

  return parsedDate.toISOString();
}

// ============================================================
// 5. ATTENDANCE STATUS NORMALISATION
// ============================================================

/**
 * Converts supported attendance labels into standard statuses.
 *
 * SUPPORTED STATUSES:
 * IN      - Employee is currently onsite.
 * OUT     - Employee is currently offsite.
 * UNKNOWN - The employee's current status cannot be determined.
 *
 * WHY:
 * Different data sources may use different labels.
 * Normalisation keeps the dashboard API consistent.
 */
function normaliseStatus(value) {
  if (!value) {
    return null;
  }

  const status = String(value)
    .trim()
    .toUpperCase();

  if (status === "IN" || status === "CLOCK IN") {
    return "IN";
  }

  if (status === "OUT" || status === "CLOCK OUT") {
    return "OUT";
  }

  if (status === "UNKNOWN") {
    return "UNKNOWN";
  }

  return null;
}

// ============================================================
// 6. ATTENDANCE RECORD VALIDATION
// ============================================================

/**
 * Converts one attendance record into the standard API format.
 *
 * SUPPORTED IDENTIFIERS:
 * - userId: Firebase UID.
 * - staffId: Existing backend employee identifier.
 *
 * SUPPORTED TIMESTAMPS:
 * - lastClockTime.
 * - timestamp.
 * - lastCheckInAt.
 * - lastCheckOutAt.
 *
 * This structure provides compatibility with the attendance
 * records produced by the existing services in the other branch.
 */
function normaliseAttendanceRecord(row, currentTime) {
  if (!row || typeof row !== "object") {
    return null;
  }

  // Prefer the Firebase UID because it is the matching identifier
  // shared between the Users and Events spreadsheet tabs.
  const userId = String(row.userId ?? "").trim();

  // Keep staffId as a fallback for compatibility with this
  // branch's existing API record structure.
  const staffId = userId || String(row.staffId ?? "").trim();

  const name = String(
    row.name ?? row.fullName ?? ""
  ).trim();

  // Preserve the separate check-in and check-out timestamps.
  const lastCheckInAt = normaliseTimestamp(
    row.lastCheckInAt,
    currentTime
  );

  const lastCheckOutAt = normaliseTimestamp(
    row.lastCheckOutAt,
    currentTime
  );

  // Accept the general last-clock timestamp supplied by the
  // existing backend API or a timestamp supplied by an event.
  const suppliedTimestamp =
    row.lastClockTime ?? row.timestamp;

  let lastClockTime = normaliseTimestamp(
    suppliedTimestamp,
    currentTime
  );

  // When no general last-clock timestamp is provided, derive it
  // from the latest available check-in or check-out timestamp.
  if (!lastClockTime) {
    const availableTimestamps = [
      lastCheckInAt,
      lastCheckOutAt,
    ].filter(Boolean);

    if (availableTimestamps.length > 0) {
      lastClockTime = availableTimestamps.sort().at(-1);
    }
  }

  // Prefer an explicitly supplied current status.
  let status = normaliseStatus(
    row.status ?? row.eventType
  );

  // If the current status is not supplied, determine it using
  // the most recent valid check-in and check-out timestamps.
  if (
    !status &&
    lastCheckInAt &&
    lastCheckOutAt
  ) {
    if (lastCheckInAt > lastCheckOutAt) {
      status = "IN";
    } else if (lastCheckOutAt > lastCheckInAt) {
      status = "OUT";
    } else {
      status = "UNKNOWN";
    }
  }

  // A check-in without a later checkout means the employee
  // is considered onsite.
  if (!status && lastCheckInAt && !lastCheckOutAt) {
    status = "IN";
  }

  // A checkout without a later check-in means the employee
  // is considered offsite.
  if (!status && lastCheckOutAt && !lastCheckInAt) {
    status = "OUT";
  }

  // Incomplete records cannot be reliably displayed or counted.
  if (
    !staffId ||
    !name ||
    !lastClockTime ||
    !status
  ) {
    return null;
  }

  return {
    staffId,
    userId: userId || staffId,

    employeeId: row.employeeId
      ? String(row.employeeId)
      : null,

    name,
    status,
    lastClockTime,
    lastCheckInAt,
    lastCheckOutAt,
  };
}

/**
 * Validates and de-duplicates the attendance records.
 *
 * WHY DEDUPLICATION IS IMPORTANT:
 * The dashboard must not count the same employee more than once.
 *
 * When duplicate records exist, the latest valid event determines
 * the employee's current attendance status.
 *
 * Conflicting events with identical timestamps are considered
 * ambiguous and therefore receive UNKNOWN status.
 */
function validateAttendanceRows(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError(
      "Attendance data source must return an array."
    );
  }

  const currentTime = Date.now();

  // A Map ensures that each employee identifier appears once.
  const employeesById = new Map();

  for (const row of rows) {
    const record = normaliseAttendanceRecord(
      row,
      currentTime
    );

    // Invalid records cannot safely be included in the dashboard.
    if (!record) {
      continue;
    }

    const existingRecord = employeesById.get(
      record.staffId
    );

    // Store the first valid record for this employee.
    if (!existingRecord) {
      employeesById.set(record.staffId, record);
      continue;
    }

    // A newer attendance event replaces the older employee state.
    if (
      record.lastClockTime >
      existingRecord.lastClockTime
    ) {
      employeesById.set(record.staffId, record);
      continue;
    }

    // Conflicting statuses at exactly the same timestamp must
    // not cause an employee to be incorrectly counted as onsite.
    if (
      record.lastClockTime === existingRecord.lastClockTime &&
      record.status !== existingRecord.status
    ) {
      employeesById.set(record.staffId, {
        ...existingRecord,
        status: "UNKNOWN",
      });
    }
  }

  // If the source returned records but none could be validated,
  // treat the refresh as a failure instead of reporting zero staff.
  //
  // A genuinely empty array is allowed as a successful response.
  if (rows.length > 0 && employeesById.size === 0) {
    throw new Error(
      "The attendance data source returned no valid records."
    );
  }

  // Sort employees consistently for predictable API responses.
  return [...employeesById.values()].sort(
    (first, second) =>
      first.name.localeCompare(second.name)
  );
}

// ============================================================
// 7. CACHE SNAPSHOT
// ============================================================

/**
 * Returns a copy of the current attendance cache.
 *
 * WHY:
 * API responses should not expose the controller's internal
 * mutable objects directly.
 *
 * Copying the records prevents accidental modifications to
 * the cached attendance information.
 */
function getCacheSnapshot() {
  return {
    ...cache,

    records: cache.records.map((record) => ({
      ...record,
    })),
  };
}

// ============================================================
// 8. REFRESH PROCESS
// ============================================================

/**
 * Retrieves attendance information and updates the cache.
 *
 * SUCCESS:
 * - New records replace the previous cached records.
 * - The onsite total is recalculated from unique records.
 * - lastUpdated receives the successful completion timestamp.
 * - refreshSuccess becomes true.
 *
 * FAILURE:
 * - Previous records remain unchanged.
 * - Previous onsite total remains unchanged.
 * - lastUpdated remains unchanged.
 * - refreshSuccess becomes false.
 * - The latest failure is recorded.
 *
 * OVERLAPPING REQUEST PROTECTION:
 * If an automatic refresh and a manual refresh happen together,
 * both callers reuse the same active refresh operation.
 */
export async function refreshAttendance() {
  // Reuse an existing refresh rather than starting another one.
  if (refreshInFlight) {
    return refreshInFlight;
  }

  // Record when the new refresh attempt begins.
  const attemptTimestamp = new Date().toISOString();

  // Mark the cache as currently refreshing.
  // The last successful timestamp is deliberately preserved.
  cache = {
    ...cache,
    lastAttemptAt: attemptTimestamp,
    refreshInProgress: true,
    lastError: null,
  };

  const currentRefresh = (async () => {
    try {
      // Retrieve attendance information from the configured provider.


      // Retrieve attendance information from the configured provider.
      //
      // The real Google Sheets provider returns an object containing:
      // - records: employee attendance information.
      // - totalIn: the current onsite employee count.
      //
      // Existing controller tests may return an array directly.
      // Both formats are supported to preserve compatibility.

      const providerResult = await attendanceDataProvider();

      let rawRecords;
      let totalIn;

      // FORMAT 1: The provider returned an array directly.
      //
      // This supports the existing controller tests and any
      // provider that returns only employee attendance records.
      if (Array.isArray(providerResult)) {
        rawRecords = providerResult;

      // FORMAT 2: The provider returned the structured result
      // produced by attendanceDataProvider.js.
      } else if (
        providerResult &&
        typeof providerResult === "object" &&
        Array.isArray(providerResult.records)
      ) {
        rawRecords = providerResult.records;

        // Validate the onsite total supplied by the Sheets service.
        if (
          typeof providerResult.totalIn !== "number" ||
          !Number.isInteger(providerResult.totalIn) ||
          providerResult.totalIn < 0
        ) {
          throw new TypeError(
            "Attendance provider returned an invalid onsite total."
          );
        }

        // Use the onsite total calculated by onsiteService.js.
        totalIn = providerResult.totalIn;

      } else {
        // Reject unexpected provider response formats.
        throw new TypeError(
          "Attendance provider returned an invalid response."
        );
      }

      // Validate and de-duplicate the employee attendance records.
      //
      // This checks employee identifiers, names, timestamps
      // and attendance statuses before updating the cache.
      const cleanRecords = validateAttendanceRows(rawRecords);

      // When the provider returns only an array, calculate the
      // onsite total from the validated, unique employee records.
      //
      // When the real Sheets provider returns an object, retain
      // the totalIn value supplied by onsiteService.js.
      if (totalIn === undefined) {
        totalIn = cleanRecords.filter(
          (record) => record.status === "IN"
        ).length;
      }


      // Record the time at which this refresh successfully completed.
      const successfulUpdateTimestamp =
        new Date().toISOString();

      // Replace the cache only after the entire retrieval and
      // validation process has completed successfully.
      cache = {
        records: cleanRecords,
        totalIn,

        lastUpdated: successfulUpdateTimestamp,
        lastAttemptAt: attemptTimestamp,

        refreshSuccess: true,
        hasEverSucceeded: true,
        refreshInProgress: false,
        lastError: null,
      };

    } catch (error) {
      // Identify whether the failure occurred because the actual
      // attendance data provider has not yet been connected.
      const providerNotConfigured =
        error.code === "ATTENDANCE_PROVIDER_NOT_CONFIGURED";

      // Only unexpected operational failures are logged.
      // A missing provider is an expected condition on this branch.
      if (!providerNotConfigured) {
        console.error(
          "[ATTENDANCE REFRESH FAILED]",
          error.message
        );
      }

      // Preserve previously successful records, total and timestamp.
      // Only the latest refresh attempt's status and error are updated.
      cache = {
        ...cache,

        lastAttemptAt: attemptTimestamp,
        refreshSuccess: false,
        refreshInProgress: false,

        lastError: {
          code: providerNotConfigured
            ? "ATTENDANCE_PROVIDER_NOT_CONFIGURED"
            : "ATTENDANCE_REFRESH_FAILED",

          message: providerNotConfigured
            ? "Attendance data source is not configured."
            : "The latest attendance refresh failed.",
        },
      };
    }

    return getCacheSnapshot();
  })();

  // Store the active promise so other requests can reuse it.
  refreshInFlight = currentRefresh;

  try {
    return await currentRefresh;
  } finally {
    // Release the refresh lock once the operation has completed.
    if (refreshInFlight === currentRefresh) {
      refreshInFlight = null;
    }
  }
}

// ============================================================
// 9. API RESPONSE BUILDER
// ============================================================

/**
 * Builds the standard response shared by the live attendance
 * endpoint and the manual refresh endpoint.
 *
 * Keeping one response structure makes the API predictable
 * for the dashboard and future integrations.
 */
function buildAttendanceResponse() {
  const state = getCacheSnapshot();

  let refreshStatus = "pending";

  if (state.refreshInProgress) {
    refreshStatus = "refreshing";
  } else if (state.lastAttemptAt !== null) {
    refreshStatus = state.refreshSuccess
      ? "success"
      : "failed";
  }

  // A retry is useful for temporary failures.
  // It cannot resolve a provider that has not been configured.
  const retryAvailable =
    refreshStatus === "failed" &&
    state.lastError?.code !==
      "ATTENDANCE_PROVIDER_NOT_CONFIGURED";

  return {
    // This means usable attendance data has been loaded before.
    // It does not mean the latest refresh necessarily succeeded.
    ok: state.hasEverSucceeded,

    data: {
      records: state.records,
      totalIn: state.totalIn,
    },

    meta: {
      refreshStatus,
      refreshSuccess: state.refreshSuccess,
      refreshInProgress: state.refreshInProgress,
      hasData: state.hasEverSucceeded,

      // Only a successful refresh changes this timestamp.
      lastUpdated: state.lastUpdated,

      // Every refresh attempt updates this timestamp.
      lastAttemptAt: state.lastAttemptAt,

      // Previously successful cached data becomes stale after
      // a failed refresh.
      stale:
        state.hasEverSucceeded &&
        state.refreshSuccess === false,

      retryAvailable,

      error: state.lastError,
    },

    // Cached records can still be returned after an unsuccessful
    // refresh, provided an earlier successful refresh exists.
    //
    // If no successful data has ever been loaded, the response
    // communicates that attendance data is currently unavailable.
    error: state.hasEverSucceeded
      ? null
      : state.lastError ?? {
          code: "ATTENDANCE_DATA_NOT_READY",
          message:
            "Attendance data has not loaded successfully yet.",
        },
  };
}

// ============================================================
// 10. GET LIVE ATTENDANCE ENDPOINT
// ============================================================

/**
 * GET /api/attendance/live
 *
 * Returns the latest cached attendance records and refresh metadata.
 *
 * HTTP STATUS:
 * 200 - Previously successful attendance data is available.
 * 503 - No successful attendance data has been retrieved.
 *
 * When the latest refresh fails but previous successful data exists,
 * the API can still return that cached data with stale: true.
 */
export function getLiveAttendance(req, res) {
  const response = buildAttendanceResponse();

  const statusCode = response.ok
    ? 200
    : 503;

  return res.status(statusCode).json(response);
}

// ============================================================
// 11. MANUAL REFRESH ENDPOINT
// ============================================================

/**
 * POST /api/attendance/refresh
 *
 * Requests an immediate attendance refresh.
 *
 * This endpoint supports a manual retry operation.
 *
 * It calls the same refresh function used by the automatic
 * scheduler, so both operations share the same cache and
 * overlapping-request protection.
 */
export async function refreshLiveAttendance(req, res) {
  await refreshAttendance();

  const response = buildAttendanceResponse();

  const statusCode = response.ok
    ? 200
    : 503;

  return res.status(statusCode).json(response);
}

// ============================================================
// 12. AUTOMATIC REFRESH SCHEDULER
// ============================================================

/**
 * Reads the automatic refresh interval from the environment.
 *
 * Invalid values or intervals shorter than one second fall back
 * to the default interval.
 */
function getRefreshIntervalMs() {
  const configuredInterval = Number(
    process.env.ATTENDANCE_REFRESH_INTERVAL_MS
  );

  if (
    Number.isInteger(configuredInterval) &&
    configuredInterval >= 1000
  ) {
    return configuredInterval;
  }

  return DEFAULT_REFRESH_INTERVAL_MS;
}

/**
 * Starts automatic attendance refreshes.
 *
 * WHY THIS IS EXPLICIT:
 * Importing the controller should not automatically start
 * background timers.
 *
 * The server deliberately starts the scheduler during startup.
 */
export function startAttendanceRefresh(
  intervalMs = getRefreshIntervalMs()
) {
  // Prevent more than one automatic refresh timer from running.
  if (refreshInterval) {
    return;
  }

  const safeInterval =
    Number.isInteger(intervalMs) && intervalMs >= 1000
      ? intervalMs
      : DEFAULT_REFRESH_INTERVAL_MS;

  // Attempt an initial refresh immediately after startup.
  void refreshAttendance();

  // Continue attempting refreshes at the configured interval.
  // The refresh function prevents overlapping operations.
  refreshInterval = setInterval(() => {
    void refreshAttendance();
  }, safeInterval);

  // The timer should not independently keep the process alive.
  refreshInterval.unref?.();
}

/**
 * Stops the automatic attendance refresh timer.
 *
 * This is used during server shutdown and automated testing.
 */
export function stopAttendanceRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// ============================================================
// 13. TESTING AND FUTURE INTEGRATION SUPPORT
// ============================================================

/**
 * Allows a controlled data provider to be supplied during testing.
 *
 * This also provides the integration boundary for the real
 * attendance services when they are eventually merged.
 *
 * Production attendance records must come from the real provider,
 * never from hardcoded employee information.
 */
export function setAttendanceDataProvider(provider) {
  if (typeof provider !== "function") {
    throw new TypeError(
      "Attendance data provider must be a function."
    );
  }

  if (refreshInFlight) {
    throw new Error(
      "Cannot replace the data provider while a refresh is running."
    );
  }

  attendanceDataProvider = provider;
}


/**
 * Resets controller state for isolated automated tests.
 *
 * WHY:
 * Tests need a clean cache and a predictable starting state.
 *
 * The real Google Sheets provider is restored after resetting.
 * Individual tests should inject mock providers using
 * setAttendanceDataProvider() to avoid depending on live Sheets.
 */
export function resetAttendanceControllerForTests() {
  // Stop automatic refreshes before resetting controller state.
  stopAttendanceRefresh();

  // Do not reset while an asynchronous refresh is still running.
  if (refreshInFlight) {
    throw new Error(
      "Cannot reset attendance state while a refresh is running."
    );
  }

  // Restore an empty attendance cache.
  cache = createInitialCache();

  // Restore the real Google Sheets provider.
  attendanceDataProvider = getLiveAttendanceData;
}
