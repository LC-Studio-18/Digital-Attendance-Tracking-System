/**
 * Visually hidden announcer for screen readers.
 * Keep it mounted and change `message`; do not mount it with the message.
 * urgent=true uses role="alert" (errors), otherwise role="status".
 */
export default function LiveRegion({ message = '', urgent = false }) {
  return (
    <div
      className="fb-sr-only"
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}