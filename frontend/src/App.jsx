import { useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorMessage, Loader, SuccessMessage } from './components/index.js';
import { AttendanceDataProvider } from './context/AttendanceDataProvider.jsx';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage.jsx';

function PreviewCard({ title, tag, note, children }) {
  return (
    <article className="preview-card">
      <div className="preview-card__head">
        <h3>{title}</h3>
        {tag ? <span className="preview-card__tag">{tag}</span> : null}
      </div>
      <div className="preview-canvas">{children}</div>
      {note ? <p className="preview-card__note">{note}</p> : null}
    </article>
  );
}

function RetryExample({ code, successMessage }) {
  const [state, setState] = useState('error');
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function retry() {
    setState('loading');
    timerRef.current = window.setTimeout(() => setState('success'), 900);
  }

  function reset() {
    window.clearTimeout(timerRef.current);
    setState('error');
  }

  if (state === 'loading') {
    return <Loader label="Trying again…" size="sm" />;
  }

  if (state === 'success') {
    return (
      <div className="stack-sm">
        <SuccessMessage message={successMessage} />
        <button type="button" className="text-button" onClick={reset}>
          Reset example
        </button>
      </div>
    );
  }

  return <ErrorMessage code={code} onRetry={retry} />;
}

function DismissibleSuccessExample() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <button
        type="button"
        className="button button--secondary"
        onClick={() => setVisible(true)}
      >
        Show message again
      </button>
    );
  }

  return (
    <SuccessMessage
      message="Your clock-out was recorded."
      onDismiss={() => setVisible(false)}
    />
  );
}

function AutoHideSuccessExample() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <button
        type="button"
        className="button button--secondary"
        onClick={() => setVisible(true)}
      >
        Show message again
      </button>
    );
  }

  return (
    <SuccessMessage
      message="Settings saved."
      autoHideMs={4000}
      onDismiss={() => setVisible(false)}
    />
  );
}

function ClockInDemo() {
  const [status, setStatus] = useState('idle');
  const [code, setCode] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function run(outcome) {
    if (status === 'loading') return;
    setStatus('loading');
    setCode(null);
    timerRef.current = window.setTimeout(() => {
      if (outcome === 'success') {
        setStatus('success');
      } else {
        setCode(outcome);
        setStatus('error');
      }
    }, 1100);
  }

  function reset() {
    window.clearTimeout(timerRef.current);
    setStatus('idle');
    setCode(null);
  }

  const isLoading = status === 'loading';
  const isIn = status === 'success';

  const pillClass =
    status === 'success'
      ? 'is-in'
      : status === 'error'
        ? 'is-error'
        : status === 'loading'
          ? 'is-busy'
          : '';

  return (
    <div className="demo-card">
      <div className="demo-card__head">
        <div>
          <p className="demo-card__eyebrow">Live demo · simulated API</p>
          <h3>Clock in</h3>
        </div>
        <span className={`status-pill ${pillClass}`}>
          {isLoading
            ? 'Working…'
            : isIn
              ? 'IN'
              : status === 'error'
                ? 'Action failed'
                : 'OUT'}
        </span>
      </div>

      <p className="demo-card__copy">
        Press a button to see the full cycle: the controls disable, a labelled
        loader runs, then a success or friendly error appears.
      </p>

      <div className="demo-card__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={isLoading || isIn}
          onClick={() => run('success')}
        >
          {isLoading ? (
            <Loader label="Clocking in…" size="sm" inline />
          ) : (
            'Clock in'
          )}
        </button>
        <button
          type="button"
          className="button button--secondary"
          disabled={isLoading || isIn}
          onClick={() => run('server')}
        >
          Simulate failure
        </button>
        <button
          type="button"
          className="button button--secondary"
          disabled={isLoading || isIn}
          onClick={() => run('offline')}
        >
          Simulate offline
        </button>
      </div>

      <div className="demo-card__feedback">
        {status === 'success' ? (
          <>
            <SuccessMessage message="You're clocked in. Have a good day!" />
            <button type="button" className="text-button" onClick={reset}>
              Run the demo again
            </button>
          </>
        ) : null}

        {status === 'error' ? (
          <ErrorMessage
            code={code}
            onRetry={() => run('success')}
            onDismiss={reset}
          />
        ) : null}

        {status === 'idle' ? (
          <p className="demo-card__hint">
            Current status: <strong>OUT</strong>. No message is shown until an
            action is taken.
          </p>
        ) : null}

        {isLoading ? (
          <p className="demo-card__hint" aria-hidden="true">
            Waiting for the server to confirm…
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FeedbackPreviewPage() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero__top">
          <span className="hero__kicker">S1-16 · Frontend + Design</span>
          <span className="hero__badge">Staging build</span>
        </div>
        <h1>Loading, error &amp; success states</h1>
        <p className="hero__lede">
          Three reusable React components for login, clock in/out and the
          attendance dashboard. Friendly copy, clear icons and accessible
          announcements — never raw errors, status codes or stack traces.
        </p>
        <div className="hero__tags" aria-label="Component principles">
          <span>Reusable</span>
          <span>Mobile + desktop</span>
          <span>Screen-reader friendly</span>
          <span>Reduced-motion aware</span>
          <span>No colour-only signals</span>
        </div>
      </header>

      <nav className="section-nav" aria-label="Component sections">
        <a href="#loader">Loader</a>
        <a href="#errors">Error messages</a>
        <a href="#success">Success messages</a>
        <a href="#live-demo">Live demo</a>
      </nav>

      <main>
        <section className="section" id="loader" aria-labelledby="loader-title">
          <div className="section__head">
            <p className="section__kicker">01 · Feedback</p>
            <h2 id="loader-title">Loader</h2>
            <p>
              Use a visible label with every spinner. Place the loader inside
              the button it relates to, and disable that button while the
              request is running.
            </p>
          </div>

          <div className="preview-grid">
            <PreviewCard title="Default" tag="block">
              <Loader />
            </PreviewCard>

            <PreviewCard
              title="With context"
              tag="lg"
              note="Say what is loading, not just “Loading…”."
            >
              <Loader size="lg" label="Loading live attendance…" />
            </PreviewCard>

            <PreviewCard
              title="Inside a disabled button"
              tag="inline"
              note="The label changes and the button is disabled, so double submits are blocked."
            >
              <button type="button" className="button button--primary" disabled>
                <Loader label="Signing in…" size="sm" inline />
              </button>
            </PreviewCard>

            <PreviewCard
              title="Page or panel load"
              tag="centered"
              note="Keep the surrounding layout stable so content does not jump when data arrives."
            >
              <div className="loader-stage">
                <Loader label="Loading attendance status…" />
              </div>
            </PreviewCard>
          </div>
        </section>

        <section className="section" id="errors" aria-labelledby="errors-title">
          <div className="section__head">
            <p className="section__kicker">02 · Feedback</p>
            <h2 id="errors-title">Error messages</h2>
            <p>
              Pass a status code or app error code and the component picks the
              approved wording, or pass <code>message</code> for a
              screen-specific message. Add <code>onRetry</code> for failed data
              loads.
            </p>
          </div>

          <div className="preview-grid">
            <PreviewCard title="Invalid credentials" tag="401 copy">
              <ErrorMessage code="invalid-credentials" />
            </PreviewCard>

            <PreviewCard
              title="No access"
              tag="403"
              note="Staff who open an admin-only screen see this, then return to their own view."
            >
              <ErrorMessage code={403} />
            </PreviewCard>

            <PreviewCard
              title="Duplicate clock-in"
              tag="409"
              note="Agreed wording for the duplicate check on the server."
            >
              <ErrorMessage code="duplicate-clock-in" />
            </PreviewCard>

            <PreviewCard
              title="Session expired"
              tag="401"
              note="The screen handles the redirect to login; the component supplies the copy."
            >
              <ErrorMessage code={401} />
            </PreviewCard>

            <PreviewCard
              title="Server error + retry"
              tag="500"
              note="Click Try again to see the loader and the confirmed success state."
            >
              <RetryExample code={500} successMessage="Attendance loaded." />
            </PreviewCard>

            <PreviewCard
              title="Offline + retry"
              tag="network"
              note="Use this copy when the browser is offline or the request cannot reach the API."
            >
              <RetryExample
                code="offline"
                successMessage="Back online. Attendance loaded."
              />
            </PreviewCard>
          </div>
        </section>

        <section
          className="section"
          id="success"
          aria-labelledby="success-title"
        >
          <div className="section__head">
            <p className="section__kicker">03 · Feedback</p>
            <h2 id="success-title">Success messages</h2>
            <p>
              Show success only after the server confirms the action. Keep the
              message specific: what happened, and when it helps, the recorded
              time.
            </p>
          </div>

          <div className="preview-grid">
            <PreviewCard title="After clock-in" tag="confirmed">
              <SuccessMessage message="You're clocked in. Have a good day!" />
            </PreviewCard>

            <PreviewCard title="With detail" tag="title">
              <SuccessMessage
                title="Clocked in"
                message="Your arrival time was recorded at 09:02."
              />
            </PreviewCard>

            <PreviewCard
              title="Dismissible"
              tag="opt-in"
              note="Use a dismiss control when the message would otherwise stay on screen."
            >
              <DismissibleSuccessExample />
            </PreviewCard>

            <PreviewCard
              title="Auto-hide"
              tag="opt-in"
              note="Auto-hide is opt-in and uses a 4-second timeout here; critical confirmations should stay until dismissed."
            >
              <AutoHideSuccessExample />
            </PreviewCard>
          </div>
        </section>

        <section
          className="section"
          id="live-demo"
          aria-labelledby="live-title"
        >
          <div className="section__head">
            <p className="section__kicker">04 · Integration</p>
            <h2 id="live-title">Live demo</h2>
            <p>
              A front-end-only simulation of the clock-in flow. In the real
              screen, replace the timeout with the S1-09b API call and pass the
              returned status code to <code>ErrorMessage</code>.
            </p>
          </div>

          <ClockInDemo />
        </section>

        <section
          className="section section--notes"
          aria-labelledby="notes-title"
        >
          <div className="section__head">
            <p className="section__kicker">Handover</p>
            <h2 id="notes-title">Usage at a glance</h2>
          </div>
          <div className="notes-grid">
            <div className="note-card">
              <h3>Import</h3>
              <pre>
                <code>{`import {
  Loader,
  ErrorMessage,
  SuccessMessage,
} from './components';`}</code>
              </pre>
            </div>
            <div className="note-card">
              <h3>Error codes</h3>
              <p>
                <code>401</code>, <code>403</code>, <code>409</code>,{' '}
                <code>500</code>, <code>offline</code>,{' '}
                <code>invalid-credentials</code>,{' '}
                <code>duplicate-clock-in</code>,{' '}
                <code>duplicate-clock-out</code>.
              </p>
            </div>
            <div className="note-card">
              <h3>Rules</h3>
              <p>
                Never pass raw errors to the UI. Show success only after
                confirmation. Keep the loading label next to the spinner. Wire{' '}
                <code>onRetry</code> for failed data loads.
              </p>
            </div>
          </div>
          <p className="docs-note">
            Full notes: <code>docs/COMPONENT-USAGE.md</code> · Review record:{' '}
            <code>docs/CODE-REVIEW.md</code> · Staging and PO checklist:{' '}
            <code>docs/STAGING-AND-PO-APPROVAL.md</code>
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>Digital Time Attendance System · Sprint 1 · S1-16</p>
        <p className="footer__muted">
          Frontend only. API calls are simulated in this preview.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceDataProvider>
      <Routes>
        <Route path="/" element={<FeedbackPreviewPage />} />
        <Route path="/attendance-history" element={<AttendanceHistoryPage />} />
      </Routes>
    </AttendanceDataProvider>
  );
}
