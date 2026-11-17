import Spinner from '../Spinner';

/**
 * Section-level loading message (staff list, dashboard refresh).
 * Sits inside the section so the rest of the page stays usable.
 */
export default function InlineLoader({ label = 'Loading…', compact = false }) {
  return (
    <div className={`fb-inline-loader${compact ? ' fb-inline-loader--compact' : ''}`} role="status" aria-live="polite">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}