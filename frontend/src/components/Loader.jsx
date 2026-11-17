import './Loader.css';

export default function Loader({ size = 'medium', text = 'Processing', description }) {
  if (size === 'large') {
    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <div className="spinner" aria-label="Loading"></div>
          <p className="modal-title">{text}</p>
          {description && <p className="modal-description">{description}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loader-container ${size}`}>
      <div className="spinner" aria-label="Loading"></div>
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}