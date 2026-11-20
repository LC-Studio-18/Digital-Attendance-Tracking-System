
import "./AttendanceStatus.css";
import checktick from '../assets/check-tick-icon.png';
import greenchecktick from '../assets/green-check-tick-icon.png';

// Display-only component: it shows the attendance status it is given.
// Props:
//   status        - "IN" or "OUT"
//   since         - time the employee clocked in
//   clockOutTime  - time the employee clocked out
//   loading       - true while attendance data is being fetched
//   error         - error message if status could not be loaded
//   onRetry       - function called when "Try Again" is clicked

function AttendanceStatus({status, since, loading, error, onRetry, clockOutTime}) {

  // 1. Loading state: show a spinner while attendance data is being retrieved
  if (loading) {
    return (
      <div
        className="attendance-status attendance-status--loading"
        role="status"
        aria-busy="true"
      >
        {/* Bootstrap spinner */}
        <div className="spinner-border" aria-hidden="true" />
        <p className="attendance-status__title">Processing...</p>
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

        <button
          type="button"
          className="btn btn-dark"
          onClick={onRetry}
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. IN state: the employee is currently clocked in
  if (status === "IN") {
    return (
      <div className="attendance-status attendance-status--in">

        <img
          className="attendance-status-check-tick-in"
          src={checktick}
          alt=""
        />

        <span className="attendance-status__badge">
          Clocked In!
        </span>

        <p className="attendance-status__title">
          You are currently Clocked In
        </p>

        <p className="attendance-status__text">
          <span className="attendance-status__time">
            {since}
          </span>
        </p>

      </div>
    );
  }

  // 4. OUT state: the employee has clocked out
  if (status === "OUT") {
    return (
      <div className="attendance-status attendance-status--out">

        <img
          className="attendance-status-check-tick-out"
          src={greenchecktick}
          alt=""
        />

        <span className="attendance-status__badge">
          Clocked Out!
        </span>

        <p className="attendance-status__title">
          Thank you for your time
        </p>

        <p className="attendance-status__text">
          <span className="attendance-status__time">
            {clockOutTime}
          </span>
        </p>

      </div>
    );
  }

  // 5. Empty state: employee has not clocked in today
  return (
    <div className="attendance-status attendance-status--empty">
      <p className="attendance-status__title">
        You haven't clocked in yet
      </p>

      <p className="attendance-status__text">
        Your attendance hasn't been recorded for today
      </p>
    </div>
  );
}

// Export so other files can import this component
export default AttendanceStatus;
