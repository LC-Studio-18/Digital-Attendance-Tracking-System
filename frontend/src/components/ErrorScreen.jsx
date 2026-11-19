import { handleApiError } from '../utils/ErrorHandlerMsg';
import './ErrorScreen.css';

const NON_API_PRESETS = {
  location: {
    showIcon: true,
    eyebrowPrefix: null,
    eyebrowSuffix: null,
    title: 'Location Error',
    message:
      'Unable to record your attendance due to incorrect location, please try again once you have entered the premises.',
    primaryLabel: 'Try Again',
    secondaryLabel: 'Go Back',
  },
  '404': {
    showIcon: false,
    eyebrowPrefix: '404',
    eyebrowSuffix: 'Error',
    title: 'Page Not Found',
    message: "The page you are looking for doesn't exist or has been moved.",
    primaryLabel: 'Back to Home',
    secondaryLabel: null,
  },
};

function WarningTriangle() {
  return (
    <div className="lc-warning-icon" aria-hidden="true">
      <svg viewBox="0 0 64 56" width="64" height="56">
        <path
          d="M28.5 3.2c1.6-2.7 5.4-2.7 7 0l26 45c1.6 2.7-.4 6.1-3.5 6.1H6c-3.1 0-5.1-3.4-3.5-6.1l26-45z"
          fill="#F4E022"
        />
        <rect x="30" y="18" width="4" height="18" rx="2" fill="#182026" />
        <circle cx="32" cy="43" r="2.5" fill="#182026" />
      </svg>
    </div>
  );
}

export default function ErrorScreen({
  mode = 'api',
  error,
  onRetry,
  onGoBack,
}) {
  const isPreset = mode === 'location' || mode === '404';
  const handled = !isPreset ? handleApiError(error) : null;
  const isNetwork =
    !isPreset &&
    (!navigator.onLine ||
      error?.message?.includes('Failed to fetch') ||
      error?.name === 'TypeError');

  const view = isPreset
    ? NON_API_PRESETS[mode]
    : {
        showIcon: true,
        eyebrowPrefix: null,
        eyebrowSuffix: null,
        title: isNetwork
          ? 'Connection Issue'
          : `Error${error?.status ? ` (${error.status})` : ''}`,
        message: handled.message,
        primaryLabel: 'Try Again',
        secondaryLabel: onGoBack ? 'Go Back' : null,
      };

  return (
    <div className="lc-error-page" role="alert">
      <header className="lc-error-navbar">
        <div className="lc-error-brand">
          <span className="lc-brand-accent">life</span>choices
        </div>
      </header>

      <main className="lc-error-main">
        <div className="lc-error-content">
          {view.showIcon && <WarningTriangle />}

          {view.eyebrowPrefix && (
            <p className="lc-error-eyebrow">
              <span className="lc-error-code">{view.eyebrowPrefix}</span>{' '}
              {view.eyebrowSuffix}
            </p>
          )}

          <h1 className="lc-error-title">{view.title}</h1>
          <p className="lc-error-message">{view.message}</p>

          <div className="lc-error-actions">
            {view.primaryLabel && (
              <button
                type="button"
                className="lc-btn lc-btn-primary"
                onClick={onRetry}
              >
                {view.primaryLabel}
              </button>
            )}

            {view.secondaryLabel && (
              <button
                type="button"
                className="lc-btn lc-btn-secondary"
                onClick={onGoBack}
              >
                {view.secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}