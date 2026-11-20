import { Component } from 'react';
import { QRCodeSVG } from 'qrcode.react';

class QrRenderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.payload !== this.props.payload && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const isValidPayload = (value) =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 256;

export default function EntranceQrDisplay({
  payload,
  locationLabel = 'Life Choices Lansdowne',
  size = 220,
}) {
  const normalizedPayload = typeof payload === 'string' ? payload.trim() : '';
  const valid = isValidPayload(normalizedPayload);

  const fallbackBox = (title, message) => (
    <div
      role="alert"
      className="w-100 rounded-4 border border-danger-subtle bg-danger-subtle text-danger-emphasis p-4 text-center"
      style={{ maxWidth: '280px' }}
    >
      <p className="fw-semibold mb-1">{title}</p>
      <p className="small mb-0">{message}</p>
    </div>
  );

  return (
    <section
      aria-label="Entrance QR Code Display"
      className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center mx-auto"
      style={{
        maxWidth: '380px',
        backgroundColor: '#f8f9fb',
      }}
    >
      <h2 className="h4 fw-bold text-dark mb-1">QR Code</h2>
      {locationLabel && (
        <p className="small text-secondary mb-4">{locationLabel}</p>
      )}

      <div className="d-flex justify-content-center align-items-center">
        {!valid ? (
          fallbackBox(
            'QR Code Unavailable',
            'Missing or invalid entrance location payload. Please check the location configuration.'
          )
        ) : (
          <QrRenderErrorBoundary
            payload={normalizedPayload}
            fallback={fallbackBox(
              'QR Generation Failed',
              'Unable to render the entrance QR code right now. Please refresh or contact support.'
            )}
          >
            <div className="bg-white p-3 rounded-3 border shadow-sm d-inline-flex align-items-center justify-content-center">
              <QRCodeSVG
                value={normalizedPayload}
                size={size}
                level="M"
                bgColor="#ffffff"
                fgColor="#111827"
                title={`Entrance QR code for ${locationLabel || normalizedPayload}`}
              />
            </div>
          </QrRenderErrorBoundary>
        )}
      </div>

      {valid && (
        <p className="small text-muted mt-3 mb-0">
          Scan at the entrance to record attendance
        </p>
      )}
    </section>
  );
}