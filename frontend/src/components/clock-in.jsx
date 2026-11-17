import { useEffect, useState } from 'react';
import '../App.css';

function ClockIcon() {
  return (
    <span className="clock-icon" aria-hidden="true">
      <span className="clock-icon__face">
        <span className="clock-icon__hand" />
      </span>
    </span>
  );
}

function AttendanceStatus({ clockedIn, clockInTime }) {
  return (
    <aside className="attendance-status" aria-live="polite">
      <span className="attendance-status__badge">
        {clockedIn ? 'Clocked In' : 'Clocked Out'}
      </span>
      <p className="attendance-status__headline">
        {clockedIn ? `You clocked in at ${clockInTime}` : "You haven't clocked in yet"}
      </p>
      <p className="attendance-status__description">
        {clockedIn
          ? 'Your attendance has been recorded for today'
          : "Your attendance hasn't been recorded for today"}
      </p>
    </aside>
  );
}

export default function ClockIn() {
  const [now, setNow] = useState(() => new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState('');
  const [requestState, setRequestState] = useState('idle');
  const [clockInError, setClockInError] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(now)
    .toUpperCase();
  const greeting =
    now.getHours() < 12
      ? 'Good Morning!'
      : now.getHours() < 18
        ? 'Good Afternoon!'
        : 'Good Evening!';

  async function handleClockIn() {
    if (clockedIn || requestState === 'loading') return;

    setRequestState('loading');
    setClockInError('');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Check your connection and try again.');
      }

      setClockInTime(
        new Intl.DateTimeFormat('en-ZA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
          .format(new Date())
          .toUpperCase(),
      );
      setClockedIn(true);
      setRequestState('success');
    } catch (error) {
      setClockInError(
        error instanceof Error
          ? error.message
          : 'Clock-in could not be completed. Please try again.',
      );
      setRequestState('error');
    }
  }

  const requestMessage =
    requestState === 'loading'
      ? 'Clocking you in...'
      : requestState === 'success'
        ? 'Clock-in confirmed successfully.'
        : requestState === 'error'
          ? clockInError
          : '';

  return (
    <main className="clock-in-page">
      <header className="topbar">
        <a className="topbar__brand" href="#home" aria-label="LC Studio home">
          LC Studio
        </a>
        <span className="topbar__subtitle">Digital Attendance</span>
      </header>

      <section className="clock-in-content" aria-labelledby="welcome-heading">
        <div className="welcome-panel">
          <div className="welcome-panel__identity">
            <ClockIcon />
            <div className="welcome-copy">
              <p className="welcome-copy__greeting">{greeting}</p>
              <h1 id="welcome-heading">Welcome, {'{Employee}'}</h1>
              <p className="welcome-copy__datetime">
                {dateLabel} <span aria-hidden="true">•</span> {timeLabel}
              </p>
            </div>
          </div>
          <AttendanceStatus clockedIn={clockedIn} clockInTime={clockInTime} />
        </div>

        <div className="clock-action">
          <button
            className="clock-action__button"
            type="button"
            onClick={handleClockIn}
            disabled={clockedIn || requestState === 'loading'}
            aria-busy={requestState === 'loading'}
          >
            {requestState === 'loading' ? (
              <span className="clock-action__spinner" aria-hidden="true" />
            ) : (
              <span className="clock-action__play" aria-hidden="true" />
            )}
            {requestState === 'loading'
              ? 'Clocking In...'
              : clockedIn
                ? 'Clocked In'
                : 'Clock In'}
          </button>
          {requestMessage && (
            <p
              className={`clock-action__message${
                requestState === 'error' ? ' clock-action__message--error' : ''
              }`}
              role={requestState === 'error' ? 'alert' : 'status'}
              aria-live={requestState === 'error' ? 'assertive' : 'polite'}
            >
              {requestMessage}
            </p>
          )}
          <p className="location-notice">
            <svg
              className="location-notice__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 11v5m0-8h.01"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
            <span>
              Your Live Location is being recorded, please reach out to your supervisor for more
              information
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
