import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScannerFeedback from '../components/ScannerFeedback';
import QrScanner from '../components/QrScanner';
import { submitAttendanceScan } from '../services/attendanceServices';

export default function QrScannerPage() {
  const navigate = useNavigate();

  const [submissionState, setSubmissionState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'scanning' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDecoded = async (payload) => {
    if (submissionState === 'loading' || submissionState === 'success') return;

    setSubmissionState('loading');

    try {
      await submitAttendanceScan(payload);
      setSubmissionState('success');
      setCameraStatus('idle');
    } catch (err) {
      setSubmissionState('error');
      setCameraStatus('idle');
      setErrorMessage(
        err?.message ||
          "We couldn't read that QR code. It may be invalid or expired. Please scan the current code at the entrance."
      );
    }
  };

  const handleCameraError = (error) => {
    setCameraError(error);
    setCameraStatus('error');
  };

  const handleStartScan = () => {
    setSubmissionState('idle');
    setErrorMessage('');
    setCameraError(null);
    setCameraStatus('scanning');
  };

  const handleReset = () => {
    setSubmissionState('idle');
    setErrorMessage('');
    setCameraError(null);
    setCameraStatus('idle');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const isScanning =
    submissionState === 'idle' && cameraStatus === 'scanning';

  const showScannerView =
    submissionState === 'idle' && cameraStatus !== 'error';

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: '#EDF0F5' }}
    >
      {/* Top Navigation Bar */}
      <header
        className="w-100 px-3 py-3 d-flex align-items-center justify-content-center position-relative"
        style={{ backgroundColor: '#1B2430' }}
      >
        <button
          type="button"
          onClick={handleBackHome}
          aria-label="Back to Home"
          className="btn btn-link text-white text-decoration-none p-0 position-absolute start-0 ms-3 d-flex align-items-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="d-flex align-items-center gap-1 fw-bold">
          <span className="text-white">LC</span>
          <span style={{ color: '#CEDB27' }}>Attends</span>
          <span className="text-secondary fw-normal small ms-1">• Scan</span>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-grow-1 d-flex align-items-start justify-content-center px-3 py-4">
        <div className="w-100" style={{ maxWidth: '380px' }}>
          {showScannerView ? (
            <div className="d-flex flex-column align-items-center text-center">
              <h1 className="h4 fw-bold text-dark mb-2">Scan QR Code</h1>
              <p
                className="small text-secondary mb-4 px-2"
                style={{ lineHeight: 1.5 }}
              >
                Position the QR code at the entrance inside the frame to record
                your attendance.
              </p>

              {/* Dark Scanner Viewfinder */}
              <div
                className="position-relative w-100 rounded-4 overflow-hidden d-flex align-items-center justify-content-center mb-3 shadow-sm"
                style={{
                  backgroundColor: '#0D131A',
                  aspectRatio: '1 / 1',
                  maxWidth: '290px',
                }}
              >
                {isScanning ? (
                  <div className="w-100 h-100">
                    <QrScanner
                      active={isScanning}
                      onDecoded={handleDecoded}
                      onCameraError={handleCameraError}
                    />
                  </div>
                ) : (
                  /* Idle QR Icon Placeholder */
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8A99AD"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3z" />
                    <path d="M20 14v3h-1" />
                    <path d="M14 20h3" />
                    <path d="M20 20h1" />
                  </svg>
                )}

                {/* Lime Corner Brackets */}
                <span
                  className="position-absolute"
                  style={{
                    top: '22px',
                    left: '22px',
                    width: '28px',
                    height: '28px',
                    borderTop: '3px solid #CEDB27',
                    borderLeft: '3px solid #CEDB27',
                    borderTopLeftRadius: '8px',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  className="position-absolute"
                  style={{
                    top: '22px',
                    right: '22px',
                    width: '28px',
                    height: '28px',
                    borderTop: '3px solid #CEDB27',
                    borderRight: '3px solid #CEDB27',
                    borderTopRightRadius: '8px',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  className="position-absolute"
                  style={{
                    bottom: '34px',
                    left: '22px',
                    width: '28px',
                    height: '28px',
                    borderBottom: '3px solid #CEDB27',
                    borderLeft: '3px solid #CEDB27',
                    borderBottomLeftRadius: '8px',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  className="position-absolute"
                  style={{
                    bottom: '34px',
                    right: '22px',
                    width: '28px',
                    height: '28px',
                    borderBottom: '3px solid #CEDB27',
                    borderRight: '3px solid #CEDB27',
                    borderBottomRightRadius: '8px',
                    pointerEvents: 'none',
                  }}
                />

                {/* Bottom helper caption inside viewfinder */}
                <span
                  className="position-absolute bottom-0 start-50 translate-middle-x mb-2 text-nowrap"
                  style={{
                    color: '#CBD5E1',
                    fontSize: '0.72rem',
                    pointerEvents: 'none',
                  }}
                >
                  Keep the whole code inside the frame
                </span>
              </div>

              {/* Ready to Scan Info Card */}
              <div
                className="w-100 rounded-3 p-3 text-start mb-4"
                style={{ backgroundColor: '#E5E9F0' }}
              >
                <p className="small fw-semibold text-dark mb-1">
                  Ready to scan?
                </p>
                <p
                  className="small text-secondary mb-0"
                  style={{ lineHeight: 1.5 }}
                >
                  Hold your phone about 20 cm from the code. Make sure there is
                  enough light, then tap Scan QR Code.
                </p>
              </div>

              {/* Primary & Secondary Buttons */}
              <div className="w-100 d-grid gap-2">
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="btn fw-semibold py-2 rounded-3 border-0"
                  style={{
                    backgroundColor: '#CEDB27',
                    color: '#1B2430',
                  }}
                >
                  {isScanning ? 'Scanning...' : 'Scan QR Code'}
                </button>
                <button
                  type="button"
                  onClick={handleBackHome}
                  className="btn fw-semibold py-2 rounded-3 border-0 text-white"
                  style={{
                    backgroundColor: '#4888B7',
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <ScannerFeedback
              submissionState={submissionState}
              errorMessage={errorMessage}
              cameraStatus={cameraStatus}
              cameraError={cameraError}
              onReset={handleReset}
              onBackHome={handleBackHome}
            />
          )}
        </div>
      </main>
    </div>
  );
}