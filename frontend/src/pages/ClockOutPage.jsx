import { useEffect, useRef, useState } from 'react';
import logo from '../assets/lc-attends-logo.png';
import './ClockOutPage.css';
import ClockOut from '../components/Clockout/Clockout';

// ---------- Mock employee data (replace with the API later) ----------
function todayAt(hours, minutes) {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// Test states in the browser: ?status=in, ?status=out, ?status=unknown, ?status=banana
const MOCK_EMPLOYEES = {
  in: { name: 'Thandi Nkosi', status: 'IN', clockInTime: todayAt(8, 15), clockOutTime: null },
  out: { name: 'Thandi Nkosi', status: 'OUT', clockInTime: todayAt(8, 15), clockOutTime: todayAt(16, 30) },
  unknown: { name: 'Thandi Nkosi', status: null, clockInTime: null, clockOutTime: null },
};

// Only IN and OUT are valid. Anything else becomes UNKNOWN, so nobody can clock in or out by mistake.
function normaliseStatus(status) {
  const value = String(status ?? '').toUpperCase();
  return value === 'IN' || value === 'OUT' ? value : 'UNKNOWN';
}

function getMockEmployee() {
  const key = (new URLSearchParams(window.location.search).get('status') || 'in').toLowerCase();
  const employee = MOCK_EMPLOYEES[key] ?? { name: 'Thandi Nkosi', status: key, clockInTime: null, clockOutTime: null };
  return { ...employee, status: normaliseStatus(employee.status) };
}

function formatTime12(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(iso)).toUpperCase();
}

// ---------- Small components ----------
function Header() {
  return (
    <header className="topbar">
      <a className="topbar__brand" href="#home">
        <img src={logo} alt="" className="topbar__logo" />
        <span>LC <em>Attends</em></span>
      </a>
    </header>
  );
}

function ClockIcon() {
  return (
    <span className="clock-icon" aria-hidden="true">
      <span className="clock-icon__face">
        <span className="clock-icon__hand" />
      </span>
    </span>
  );
}

// Pop-up 1: "Are you sure?" (works for Clock In and Clock Out)
function ConfirmDialog({ action, onCancel, onConfirm }) {
  const label = action === 'clockin' ? 'Clock In' : 'Clock Out';
  return (
    <div className="confirm-overlay" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <svg className="confirm-dialog__icon" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
          <rect x="6" y="9" width="36" height="33" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <line x1="6" y1="19" x2="42" y2="19" stroke="currentColor" strokeWidth="2.5" />
          <line x1="15" y1="4" x2="15" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="33" y1="4" x2="33" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h2 id="confirm-title" className="confirm-dialog__title">
          Are you sure you<br />want to {label}?
        </h2>
        <p className="confirm-dialog__text">
          This will record your attendance<br />for the day
        </p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-btn confirm-btn--cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="confirm-btn confirm-btn--yes" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

// Pop-up 2: "Processing" while the attendance is being recorded
function ProcessingDialog() {
  return (
    <div className="confirm-overlay" role="presentation">
      <div className="confirm-dialog confirm-dialog--processing" role="alertdialog" aria-modal="true" aria-labelledby="processing-title" aria-busy="true">
        <svg className="spinner" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={i}
              x1="24" y1="4" x2="24" y2="12"
              stroke="#000" strokeWidth="2.5" strokeLinecap="round"
              opacity={0.2 + (i * 0.1)}
              transform={`rotate(${i * 45} 24 24)`}
            />
          ))}
        </svg>
        <h2 id="processing-title" className="confirm-dialog__title">Processing</h2>
        <p className="confirm-dialog__text">
          Please wait here while we<br />record your attendance
        </p>
      </div>
    </div>
  );
}

// Compact success card with the green tick. Sits in the right-hand slot of the page.
function SuccessCard({ action, time }) {
  const isOut = action === 'clockout';
  return (
    <aside className="success-slot" aria-live="polite">
      <div className="success-card">
        <span className="success-card__check" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="32" height="32">
            <path d="M11 25 L21 35 L38 13" fill="none" stroke="#B2EE1C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="success-card__title">{isOut ? 'Clocked Out!' : 'Clocked In!'}</p>
        <p className="success-card__text">{isOut ? 'Thank you for your time.' : 'Your attendance has been recorded.'}</p>
        <p className="success-card__time">{formatTime12(time)}</p>
      </div>
    </aside>
  );
}

// ---------- Page ----------
export default function ClockoutPage() {
  const [now, setNow] = useState(() => new Date());
  const [employee, setEmployee] = useState(getMockEmployee); // name, status (IN / OUT / UNKNOWN), clock times
  const [step, setStep] = useState('idle'); // idle | confirm | processing | success
  const [action, setAction] = useState('clockout'); // clockout | clockin
  const timerRef = useRef(null);

  useEffect(() => {  // Updates the displayed time every 30 seconds
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []); // stop the mock timer if the page closes

  const dateLabel = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(now).toUpperCase();

  // Employee is IN -> next action is Clock Out. Employee is OUT -> next action is Clock In.
  function openConfirm() {
    if (employee.status === 'UNKNOWN') return;
    setAction(employee.status === 'IN' ? 'clockout' : 'clockin');
    setStep('confirm');
  }

  // Mock request. Replace the timeout with the real API call later.
  function handleConfirmYes() {
    if (step === 'processing') return; // prevents duplicate submissions
    setStep('processing');
    timerRef.current = window.setTimeout(() => {
      const time = new Date().toISOString();
      setEmployee((prev) =>
        action === 'clockout'
          ? { ...prev, status: 'OUT', clockOutTime: time }
          : { ...prev, status: 'IN', clockInTime: time, clockOutTime: null }
      );
      setStep('success');
    }, 1500);
  }

  const showSuccess = step === 'success';
  const successTime = action === 'clockout' ? employee.clockOutTime : employee.clockInTime;
  const buttonLabel = employee.status === 'IN' ? 'Clock Out' : 'Clock In';

  return (
    <main className="clock-in-page">
      <Header />

      <section className="clock-in-content">

        <div className={`welcome-panel${showSuccess ? ' welcome-panel--split' : ''}`}>
          <div className="welcome-panel__identity">
            <ClockIcon />

            <div className="welcome-copy">
              <p className="welcome-copy__greeting">Good Day</p>

              <h1>Welcome, <span className="clockout-h1">{employee.name || 'Employee'}</span></h1>

              <p className="welcome-copy__datetime">{dateLabel} • {timeLabel}</p>
            </div>
          </div>

          {showSuccess && <SuccessCard action={action} time={successTime} />}
        </div>

        <div className="clock-action">

          {showSuccess ? (
            <button type="button" className="back-btn" onClick={() => setStep('idle')}>Back to Home</button>
          ) : employee.status === 'UNKNOWN' ? (
            <p className="status-unavailable" role="alert">
              We couldn&apos;t confirm your attendance status. Please contact your supervisor.
            </p>
          ) : (
            <ClockOut onClockOut={openConfirm} disabled={step !== 'idle'} label={buttonLabel} />
          )}

          {!showSuccess && (
            <p className="location-notice">
              <svg className="location-notice__icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="7.5" r="1.1" fill="currentColor" />
              </svg>
              Your Attendance is Active
            </p>
          )}

        </div>

      </section>

      {step === 'confirm' && (
        <ConfirmDialog action={action} onCancel={() => setStep('idle')} onConfirm={handleConfirmYes} />
      )}
      {step === 'processing' && <ProcessingDialog />}
    </main>
  );
}