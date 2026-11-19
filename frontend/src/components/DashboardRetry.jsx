import './DashboardRetry.css';

export default function DashboardRetry({ message = 'Failed to load dashboard.', onRetry }) {
  return (
    <div className="retry-container">
      <p className="retry-title">Something went wrong</p>
      <p className="retry-message">{message}</p>
      <button type="button" className="retry-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}