import { useEffect, useId } from 'react';
import '../styles/components.css';

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.8 12.2l2.8 2.8 5.6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Reusable confirmation message.
 *
 * Render this only after the server confirms the action. `autoHideMs` is
 * opt-in because a message that disappears can be missed; when used, keep the
 * timeout long enough to read (the demo uses 4 seconds).
 */
export default function SuccessMessage({
  title,
  message = 'Success!',
  onDismiss,
  dismissible = true,
  autoHideMs = 0,
  className = '',
  children,
}) {
  const titleId = useId();
  const messageId = useId();
  const canDismiss = Boolean(onDismiss) && dismissible;

  useEffect(() => {
    if (!onDismiss || !Number.isFinite(autoHideMs) || autoHideMs <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onDismiss, autoHideMs);
    return () => window.clearTimeout(timeoutId);
  }, [autoHideMs, onDismiss]);

  return (
    <div
      className={`status-message status-message--success${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={messageId}
    >
      <span className="status-message__icon">
        <CheckIcon />
      </span>

      <div className="status-message__body">
        {title ? (
          <p className="status-message__title" id={titleId}>
            {title}
          </p>
        ) : null}
        <p className="status-message__text" id={messageId}>
          {message}
        </p>
        {children ? (
          <div className="status-message__extra">{children}</div>
        ) : null}
      </div>

      {canDismiss ? (
        <button
          type="button"
          className="status-message__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
