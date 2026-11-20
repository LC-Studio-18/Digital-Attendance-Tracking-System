// useState holds values, useEffect runs code when the component loads,
// useCallback keeps a function stable between renders
import { useState, useEffect, useCallback } from "react";
// Function that gets the status (dummy data for now, real API later)
import { getAttendanceStatus } from "../services/attendanceService";

// Custom hook: fetches the logged-in employee's attendance status and
// gives back everything the AttendanceStatus component needs.
// token - the Firebase token (not needed while we use dummy data)
export function useAttendanceStatus(token = null) {
  // "IN", "OUT" or null (null means no attendance record)
  const [status, setStatus] = useState(null);
  // Clock-in time, e.g. "08:32 AM" (only set when status is "IN")
  const [since, setSince] = useState(null);
  // True while the status is being fetched (starts true so loading shows first)
  const [ClockOutTime, setClockOutTime] = useState(null);
  // Clock-out-time, e.g. "16:54 PM" (Only set when status is "OUT")
  const [loading, setLoading] = useState(true);
  // Error message if the status could not be loaded
  const [error, setError] = useState(null);
  // Goes up by 1 each time we want to fetch the status again
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch the status when the component first appears,
  // and again whenever refreshKey or token changes
  useEffect(() => {
    // Set to true if the component goes away before the fetch finishes,
    // so we don't update state that no longer exists
    let cancelled = false;

    async function loadStatus() {
      try {
        const data = await getAttendanceStatus(token);
        if (cancelled) return;
        setStatus(data.status ?? null);
        setSince(data.since ?? null);
        setClockOutTime(data.ClockOutTime ?? null);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Please check your connection and try again.");
      } finally {
        // Whether it worked or failed, loading is finished
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();

    // Cleanup: runs when the component goes away or the effect runs again
    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  // Fetch the status again. Used by "Try Again" and after clock-in/clock-out.
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }, []);

  return { status, since, loading, error, refresh, ClockOutTime };
}