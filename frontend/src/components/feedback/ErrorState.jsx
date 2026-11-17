import LoadingButton from './LoadingButton';

/**
 * Shows an error from mapApiError() with the right next step.
 *   <ErrorState error={mapApiError(err)} onRetry={run} onSignIn={goToLogin} retrying={isLoading} />
 */
export default function ErrorState({ error, onRetry, onSignIn, onDismiss, retrying = false }) {
  if (!error) return null;
  const { title, message, nextStep, retryable } = error;

  return (
    <div className="fb-error" role="alert">
      <svg className="fb-error__icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.3" fill="currentColor" />
      </svg>
      <h2 className="fb-error__title">{title}</h2>
      <p className="fb-error__text">{message}</p>

      <div className="fb-error__actions">
        {nextStep === 'sign-in' && onSignIn && (
          <LoadingButton onClick={onSignIn}>Sign in again</LoadingButton>
        )}
        {retryable && onRetry && (nextStep === 'retry' || nextStep === 'fix-input') && (
          <LoadingButton onClick={onRetry} loading={retrying} loadingText="Trying again…">
            Try again
          </LoadingButton>
        )}
        {onDismiss && (
          <LoadingButton variant="secondary" onClick={onDismiss}>
            Close
          </LoadingButton>
        )}
      </div>
    </div>
  );
}