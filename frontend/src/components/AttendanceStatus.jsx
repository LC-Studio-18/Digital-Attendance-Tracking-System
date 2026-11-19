import "./AttendanceStatus.css"

function AttendanceStatus({ status, since, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="attendance-status attendance-status--loading">
        <div className="spinner-border" role="status" />
        <p className="attendance-status__title">Checking Status...</p>
        <p className="attendance-status__text">
          Please wait while we check your attendance
        </p>
      </div>
    );
  }

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

  if (status === "IN") {
    return (
      <div className="attendance-status attendance-status--in">
        <span className="attendance-status__icon">&#10003;</span>
        <div>
          <p className="attendance-status__title">Clocked In</p>
          <p className="attendance-status__text">Since {since}</p>
        </div>
      </div>
    );
  }

  if (status === "OUT") {
    return (
      <div className="attendance-status attendance-status--out">
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

  return (
    <div className="attendance-status attendance-status--empty">
      <p className="attendance-status__title">No attendance record</p>
      <p className="attendance-status__text">
        You have no attendance record yet
      </p>
    </div>
  );
}

export default AttendanceStatus;