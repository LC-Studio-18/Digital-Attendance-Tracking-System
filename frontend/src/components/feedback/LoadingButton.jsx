import Spinner from '../Spinner';

/**
 * A button that disables itself while its action is running.
 * Stays the same width/position so the layout does not jump.
 */
export default function LoadingButton({
  loading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`fb-btn fb-btn--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Spinner />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}