const ICONS = {
  success: (
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  error: (
    <>
      <path d="M12 7v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.4" fill="currentColor" />
    </>
  ),
  info: (
    <>
      <path d="M12 11v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
    </>
  ),
};

/**
 * One banner for success | error | info.
 * Errors use role="alert"; the others use role="status".
 * Colour is never the only signal: icon + text are always shown.
 */
export default function StatusBanner({ variant = 'info', title, children, action, onDismiss }) {
  return (
    <div className={`fb-banner fb-banner--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <svg className="fb-banner__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {ICONS[variant]}
      </svg>
      <div className="fb-banner__body">
        {title && <p className="fb-banner__title">{title}</p>}
        {children && <div className="fb-banner__text">{children}</div>}
        {action && (
          <button type="button" className="fb-link" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button type="button" className="fb-banner__close" onClick={onDismiss} aria-label="Dismiss message">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}