import { useEffect, useState } from 'react';
import logo from '../assets/lc-attends-logo.png';
import './ClockOutPage.css';
import ClockOut from '../components/Clockout/Clockout';

function ClockIcon() {
  return (
    <span className="clock-icon" aria-hidden="true">
      <span className="clock-icon__face">
        <span className="clock-icon__hand" />
      </span>
    </span>
  );
}

// Displays the employee's current attendance status and clock-out information
function AttendanceStatus({ clockedout, clockoutTime }) {
  return (
    <aside className="attendance-status" aria-live="polite">
      <div className="attendance-status__card">
        <span className="attendance-status__badge">
          {clockedout ? 'Clocked Out' : 'Clocked In'}
        </span>

        <p className="attendance-status__headline">
          {clockedout
            ? `You clocked out at ${clockoutTime}`
            : 'You are currently Clocked In'}
        </p>

        <p className="attendance-status__description">
          Since <span className="attendance-status__time">8:40</span>
        </p>
        {/* The real time clocked in will be added later using the API */}
      </div>
    </aside>
  );
}

// Pop-up that asks the employee to confirm before clocking out
function ConfirmDialog({ onCancel, onConfirm }) {
  return (
    <div className="confirm-overlay" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <svg className="confirm-dialog__icon" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="6" y="9" width="36" height="33" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <line x1="6" y1="19" x2="42" y2="19" stroke="currentColor" strokeWidth="2.5" />
          <line x1="15" y1="4" x2="15" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="33" y1="4" x2="33" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h2 id="confirm-title" className="confirm-dialog__title">
          Are you sure you<br />want to Clock Out?
        </h2>
        <p className="confirm-dialog__text">
          This will record your attendance<br />for the day
        </p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-btn confirm-btn--yes" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClockoutPage() {
  const [now, setNow] = useState(() => new Date()); // Will be used to get the current date, day and time
  const [clockedout, setClockedout] = useState(false);
  const [clockoutTime, setClockoutTime] = useState('');
  const [showConfirm, setShowConfirm] = useState(false); // Controls the "Are you sure?" pop-up

  useEffect(() => {  // Updates the displayed time every 30 seconds
    const timer = window.setInterval(
      () => setNow(new Date()),
      30000 //execute after every 30000 milliseconds
    );

    return () => window.clearInterval(timer);
  }, []);

  // functions to format the time
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
  }).format(now).toUpperCase();

  const greeting =
    now.getHours() < 12
      ? 'Good Morning!'
      : now.getHours() < 18
        ? 'Good Afternoon!'
        : 'Good Evening!';

  function handleClockout() {
    if (clockedout) return;

    const currentTime = new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date()).toUpperCase();

    setClockoutTime(currentTime);
    setClockedout(true);   // Sets clockout to true
  }

  // Clicking the Clock Out button now opens the pop-up first
  function handleConfirmYes() {
    setShowConfirm(false);
    handleClockout();
  }

  return (
    <main className="clock-in-page">

      <header className="topbar">
        <a className="topbar__brand" href="#home">
          <img src={logo} alt="" className="topbar__logo" />
          <span>LC <em>Attends</em></span>
        </a>
      </header>

      <section className="clock-in-content">

        <div className="welcome-panel">

          <div className="welcome-panel__identity">
            <ClockIcon />

            <div className="welcome-copy">
              <p className="welcome-copy__greeting">
                {greeting}
              </p>

              <h1>Welcome, <span className="clockout-h1">{'{Employee}'}</span></h1>

              <p className="welcome-copy__datetime">
                {dateLabel} • {timeLabel}
              </p>
            </div>
          </div>

          {/* Passes attendance information to the AttendanceStatus component*/}
          <AttendanceStatus clockedout={clockedout} clockoutTime={clockoutTime}/>
        </div>

        <div className="clock-action">

          {/*Opens the confirmation pop-up when the button is clicked*/}
          <ClockOut onClockOut={() => setShowConfirm(true)} disabled={clockedout}/>

          <p className="location-notice">
            Your Live Location is being recorded, please reach out to your supervisor for more
            information
          </p>

        </div>

      </section>

      {showConfirm && (
        <ConfirmDialog
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmYes}
        />
      )}
    </main>
  );
}