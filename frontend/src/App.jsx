// useState remembers whether a clock action is running
import { useState } from "react";
// Bootstrap styles (spinner, buttons)
import "bootstrap/dist/css/bootstrap.min.css";
// The status card we built in subtask 1
import AttendanceStatus from "./components/AttendanceStatus";
// Hook that fetches the status (dummy data for now)
import { useAttendanceStatus } from "./hooks/useAttendanceStatus";
// Dummy clock-in and clock-out functions
import { clockIn, clockOut } from "./services/attendanceService";

// TEMPORARY test page. Do not commit this file.
function App() {
  // Get the status, loading and error values from the hook
  const { status, since, loading, error, refresh } = useAttendanceStatus();
  // True while a clock-in or clock-out request is running
  const [busy, setBusy] = useState(false);

  // Runs a clock action, then refreshes the status card
  async function handleAction(action) {
    setBusy(true);
    try {
      await action();
      // Fetch the new status so the card updates after the action
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", padding: 16 }}>
      {/* Pass the hook's values straight into the component */}
      <AttendanceStatus
        status={status}
        since={since}
        loading={loading}
        error={error}
        onRetry={refresh}
      />

      {/* Test buttons standing in for the real clock-in and clock-out screens */}
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <button
          className="btn btn-dark"
          disabled={busy || loading || status === "IN"}
          onClick={() => handleAction(clockIn)}
        >
          Clock In
        </button>
        <button
          className="btn btn-outline-dark"
          disabled={busy || loading || status !== "IN"}
          onClick={() => handleAction(clockOut)}
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}

export default App;