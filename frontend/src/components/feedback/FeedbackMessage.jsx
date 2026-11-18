import StatusBanner from './StatusBanner';

/**
 * Compact, in-context message (for example above the login form or above the
 * clock-in button). Pass the result of mapApiError() or getMessage().
 *
 *   <FeedbackMessage message={mapApiError(error, { action: 'clock-in' })}
 *                    onRetry={run} onSignIn={goToLogin} onDismiss={reset} />
 *
 * The action link is chosen from the message's nextStep, so every screen
 * offers the same next step for the same problem.
 */
export default function FeedbackMessage({ message, onRetry, onSignIn, onDismiss }) {
  if (!message) return null;

  let action;
  if (message.nextStep === 'sign-in' && onSignIn) {
    action = { label: 'Sign in again', onClick: onSignIn };
  } else if (message.retryable && message.nextStep === 'retry' && onRetry) {
    action = { label: 'Try again', onClick: onRetry };
  }

  return (
    <StatusBanner variant={message.variant} title={message.title} action={action} onDismiss={onDismiss}>
      {message.message}
    </StatusBanner>
  );
}
