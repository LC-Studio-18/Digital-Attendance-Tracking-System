import { useEffect, useRef, useState } from 'react';
import '../App.css';
import { postClockIn } from '../services/clockInService.js';

function ClockIcon() {
  return (
    <span className="clock-icon" aria-hidden="true">
      <svg viewBox="0 0 112 112" focusable="false">
        <circle cx="56" cy="56" r="48" />
        <path d="M56 20v37l21 12" />
      </svg>
    </span>
  );
}


export default function ClockIn({ user }) {
  const employeeName = user?.displayName || 'Employee';
  const [now, setNow] = useState(() => new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState('');
  const [requestState, setRequestState] = useState('idle');
  const [clockInError, setClockInError] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const confirmationRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!confirmationOpen) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (requestState === 'loading') {
      confirmationRef.current?.focus();
    } else {
      cancelButtonRef.current?.focus();
    }

    function handleDialogKeyDown(event) {
      if (event.key === 'Escape' && requestState !== 'loading') {
        setConfirmationOpen(false);
      }

      if (event.key === 'Tab') {
        const controls = confirmationRef.current?.querySelectorAll('button:not(:disabled)');
        if (!controls?.length) {
          event.preventDefault();
          confirmationRef.current?.focus();
          return;
        }

        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
        }
      }
    }

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [confirmationOpen, requestState]);

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

  async function confirmClockIn() {
    if (clockedIn || requestState === 'loading') return;

    setRequestState('loading');
    setClockInError('');

    try {
      const token = await user.getIdToken();
      const { timestamp } = await postClockIn(token);

      setClockInTime(
        new Intl.DateTimeFormat('en-ZA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
          .format(new Date(timestamp))
          .toUpperCase(),
      );
      setClockedIn(true);
      setRequestState('success');
      setConfirmationOpen(false);
    } catch (error) {
      setClockInError(
        error.response?.data?.message ||
          (error.request
            ? 'Could not reach the server. Check your connection and try again.'
            : 'Clock-in could not be completed. Please try again.'),
      );
      setRequestState('error');
    }
  }

  const requestMessage =
    requestState === 'success' ? 'Clock-in confirmed successfully.' : '';

  return (
    <>
    <main className="clock-in-page">
      <header className={`topbar${clockedIn ? ' topbar--success' : ''}`}>
        <a className="topbar__brand" href="#home" aria-label="Life Choices home">
          <svg className="topbar__mark" viewBox="0 0 50 34" aria-hidden="true">
            <path d="M4 29V14l8-8 8 8v15M20 29V11l8-7 8 7v18M34 29V16l7-7 7 7v13" />
            <path d="M1 16 12 4l9 9L30 2l10 10 7-7" />
          </svg>
          <span className="topbar__life">life</span><span className="topbar__choices">choices</span>
        </a>
      </header>

      {clockedIn ? (
        <section className="clock-success" aria-labelledby="success-greeting">
          <div className="clock-success__layout">
            <div className="clock-success__copy">
              <h1 id="success-greeting">{greeting.replace(' ', '\n')}</h1>
              <p className="clock-success__welcome">
                Welcome, <span>{employeeName}</span>
              </p>
              <div className="clock-success__brand-copy">
                <p>WELCOME TO</p>
                <strong>LC <em>ATTENDS.</em></strong>
              </div>
            </div>
            <div className="clock-success__divider" aria-hidden="true" />
            <aside className="clock-success__card" aria-live="polite">
              <span className="clock-success__check" aria-hidden="true">
                <svg viewBox="0 0 100 100" fill="none">
                  <path d="m20 51 22 23 40-51" stroke="currentColor" strokeWidth="8" />
                </svg>
              </span>
              <h2>Clocked In!</h2>
              <p>Your arrival has been recorded. Live tracking has been enabled</p>
              <time>{clockInTime}</time>
            </aside>
          </div>
          <button className="clock-success__dashboard" type="button">View Dashboard</button>
        </section>
      ) : (
      <section className="clock-in-content" aria-labelledby="welcome-heading">
        <div className="welcome-panel">
          <div className="welcome-panel__identity">
            <ClockIcon />
            <div className="welcome-copy">
              <p className="welcome-copy__greeting">{greeting}</p>
              <h1 id="welcome-heading">Welcome, <span>{employeeName}</span></h1>
              <p className="welcome-copy__datetime">
                {dateLabel} <span aria-hidden="true">•</span> {timeLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="clock-action">
          <button
            className="clock-action__button"
            type="button"
            onClick={() => {
              setClockInError('');
              setRequestState('idle');
              setConfirmationOpen(true);
            }}
            disabled={clockedIn || requestState === 'loading'}
            aria-haspopup="dialog"
          >
            {requestState === 'loading' ? (
              <span className="clock-action__spinner" aria-hidden="true" />
            ) : (
              <span className="clock-action__play" aria-hidden="true" />
            )}
            {clockedIn ? 'Clocked In' : 'Clock In'}
          </button>
          {requestMessage && (
            <p
              className={`clock-action__message${
                requestState === 'error' ? ' clock-action__message--error' : ''
              }`}
              role="status"
              aria-live="polite"
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
      )}
    </main>
    {confirmationOpen && (
      <div
        className="clock-confirmation-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && requestState !== 'loading') {
            setConfirmationOpen(false);
          }
        }}
      >
        <section
          className="clock-confirmation"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clock-confirmation-title"
          aria-describedby="clock-confirmation-description"
          ref={confirmationRef}
          tabIndex={-1}
          aria-busy={requestState === 'loading'}
        >
          {requestState === 'loading' ? (
            <div className="clock-confirmation__processing" role="status" aria-live="polite">
              <svg className="clock-confirmation__spinner" viewBox="0 0 80 80" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8.64 8.64"
                />
              </svg>
              <h2 id="clock-confirmation-title">Processing</h2>
              <p id="clock-confirmation-description">
                Please wait here while we record your attendance
              </p>
            </div>
          ) : (
            <>
              <svg className="clock-confirmation__icon" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <rect x="7" y="13" width="66" height="59" rx="5" stroke="currentColor" strokeWidth="4" />
                <path d="M8 30h64M25 5v16M55 5v16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <h2 id="clock-confirmation-title">Are you sure you<br />want to Clock In?</h2>
              <p id="clock-confirmation-description">
                This will record your attendance<br className="clock-confirmation__desktop-break" /> for the day
              </p>
              {requestState === 'error' && (
                <p className="clock-confirmation__error" role="alert">{clockInError}</p>
              )}
              <div className="clock-confirmation__actions">
                <button
                  className="clock-confirmation__cancel"
                  type="button"
                  ref={cancelButtonRef}
                  onClick={() => setConfirmationOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="clock-confirmation__confirm"
                  type="button"
                  onClick={confirmClockIn}
                >
                  Yes
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    )}
    </>
  );
}
