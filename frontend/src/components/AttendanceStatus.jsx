// Styles for this component (colours, spacing, layout)
import "./AttendanceStatus.css";

// Display-only component: it shows the attendance status it is given.
// Props:
//   status  - "IN" or "OUT" (leave empty if there is no attendance record)
//   since   - time the employee clocked in, e.g. "08:32 AM" (used for IN)
//   loading - true while the status is being fetched
//   error   - error message to show if the status could not be loaded
//   onRetry - function called when the "Try Again" button is clicked
function AttendanceStatus({ status, since, loading, error, onRetry }) {
  // 1. Loading state: show a spinner while attendance data is being retrieved
  if (loading) {
    return (
      <div className="attendance-status attendance-status--loading">
        {/* Bootstrap spinner */}
        <div className="spinner-border" role="status" />
        <p className="attendance-status__title">Checking Status...</p>
        <p className="attendance-status__text">
          Please wait while we check your attendance
        </p>
      </div>
    );
  }

  // 2. Error state: show the error message and a button to try again
  if (error) {
    return (
      <div className="attendance-status attendance-status--error">
        <p className="attendance-status__title">Unable to load status</p>
        <p className="attendance-status__text">{error}</p>
        <button type="button" className="btn btn-dark" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  // 3. IN state: the employee is clocked in (tick icon, lime green card)
  if (status === "IN") {
    return (
      <div className="attendance-status attendance-status--in">
        {/* &#10003; is a tick mark */}
        <span className="attendance-status__icon">&#10003;</span>
        <div>
          <p className="attendance-status__title">Clocked In</p>
          <p className="attendance-status__text">Since {since}</p>
        </div>
      </div>
    );
  }

  // 4. OUT state: the employee is clocked out (X icon, teal card)
  if (status === "OUT") {
    return (
      <div className="attendance-status attendance-status--out">
        {/* &#10005; is an X mark */}
        <span className="attendance-status__icon">&#10005;</span>
        <div>
          <p className="attendance-status__title">Clocked Out</p>
          <p className="attendance-status__text">
            You haven&apos;t clocked in yet
          </p>
        </div>
      </div>
    );
  }

  // 5. Empty state: no attendance record exists for this employee yet
  return (
    <div className="attendance-status attendance-status--empty">
      <p className="attendance-status__title">No attendance record</p>
      <p className="attendance-status__text">
        You have no attendance record yet
      </p>
    </div>
  );
}

// Export so other files (e.g. the staff dashboard) can import this component
export default AttendanceStatus;