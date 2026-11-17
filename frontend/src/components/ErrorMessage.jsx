import { useId } from 'react';
import { resolveErrorMessage } from '../utils/errorMessages.js';
import '../styles/components.css';

function ErrorIcon() {
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
        d="M12 7.5v5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
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
 * Friendly, reusable error message.
 *
 * Pass `code` (an HTTP status or a stable application code) to use the shared
 * copy, or pass `message` for screen-specific wording. Raw error objects are
 * intentionally not accepted, so stack traces and status codes cannot leak.
 */
export default function ErrorMessage({
  title,
  message,
  code,
  onRetry,
  retryLabel = 'Try again',
  onDismiss,
  dismissible = true,
  className = '',
  children,
}) {
  const titleId = useId();
  const messageId = useId();
  const text = message ?? resolveErrorMessage(code);
  const canDismiss = Boolean(onDismiss) && dismissible;

  return (
    <div
      className={`status-message status-message--error${className ? ` ${className}` : ''}`}
      role="alert"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={messageId}
    >
      <span className="status-message__icon">
        <ErrorIcon />
      </span>

      <div className="status-message__body">
        {title ? (
          <p className="status-message__title" id={titleId}>
            {title}
          </p>
        ) : null}
        <p className="status-message__text" id={messageId}>
          {text}
        </p>
        {children ? (
          <div className="status-message__extra">{children}</div>
        ) : null}
        {onRetry ? (
          <div className="status-message__actions">
            <button
              type="button"
              className="status-message__action"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          </div>
        ) : null}
      </div>

      {canDismiss ? (
        <button
          type="button"
          className="status-message__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
