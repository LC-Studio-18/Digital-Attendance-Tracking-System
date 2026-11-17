import './../styles/components.css';

const SIZES = ['sm', 'md', 'lg'];

/**
 * Accessible loading indicator. Use it for page loads, data fetches and
 * in-button feedback while a request is running.
 *
 * The visible label is part of the component on purpose: the spinner is never
 * the only signal that something is happening.
 */
export default function Loader({
  label = 'Loading…',
  size = 'md',
  inline = false,
  className = '',
}) {
  const safeSize = SIZES.includes(size) ? size : 'md';

  return (
    <div
      className={`loader loader--${safeSize}${inline ? ' loader--inline' : ''}${
        className ? ` ${className}` : ''
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
