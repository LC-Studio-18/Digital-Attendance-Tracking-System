export default function ScannerFeedback({
  submissionState,
  errorMessage,
  cameraStatus,
  cameraError,
  onReset,
  onBackHome,
}) {
  const isError =
    submissionState === 'error' || cameraStatus === 'error';

  if (submissionState === 'loading') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3">
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ width: '3rem', height: '3rem', color: '#1B2430' }}
        >
          <span className="visually-hidden">Verifying attendance...</span>
        </div>
        <h2 className="h5 fw-bold text-dark mb-1">Recording attendance...</h2>
        <p className="small text-secondary mb-0">
          Please wait while we verify your scan.
        </p>
      </div>
    );
  }

  if (isError) {
    const displayError =
      cameraStatus === 'error'
        ? cameraError?.message ||
          "We couldn't access your camera. Please check camera permissions and try again."
        : errorMessage ||
          "We couldn't read that QR code. It may be invalid or expired. Please scan the current code at the entrance.";

    return (
      <div className="d-flex flex-column align-items-center text-center">
        {/* Pink circular badge with dashed scan-X icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#F3D8DC',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9B3B48"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="m9 9 6 6" />
            <path d="m15 9-6 6" />
          </svg>
        </div>

        <h1 className="h4 fw-bold text-dark mb-2">Scan unsuccessful</h1>
        <p className="small text-secondary mb-4 px-2" style={{ lineHeight: 1.5 }}>
          {displayError}
        </p>

        {/* Checklist card */}
        <div
          className="w-100 rounded-3 p-3 text-start mb-3"
          style={{ backgroundColor: '#E5E9F0' }}
        >
          <p className="small fw-semibold text-dark mb-2">
            Before you try again
          </p>
          <ul className="small text-secondary ps-3 mb-0" style={{ lineHeight: 1.6 }}>
            <li>Hold your phone about 20 cm from the code</li>
            <li>Make sure there is enough light</li>
            <li>Keep the whole code inside the frame</li>
          </ul>
        </div>

        <p className="small text-secondary mb-4" style={{ fontSize: '0.78rem' }}>
          Still not working? Please contact your administrator.
        </p>

        {/* Action buttons */}
        <div className="w-100 d-grid gap-2 mt-2">
          <button
            type="button"
            onClick={onReset}
            className="btn fw-semibold py-2 rounded-3 border-0"
            style={{
              backgroundColor: '#CEDB27',
              color: '#1B2430',
            }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onBackHome}
            className="btn fw-semibold py-2 rounded-3 border-0 text-white"
            style={{
              backgroundColor: '#4888B7',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (submissionState === 'success') {
    return (
      <div className="d-flex flex-column align-items-center text-center">
        {/* Soft slate circular badge with checkmark */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#CBD5E1',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B2430"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="h4 fw-bold text-dark mb-2">Check-in successful</h1>
        <p className="small text-secondary mb-4 px-2" style={{ lineHeight: 1.5 }}>
          Your attendance has been recorded. You&apos;re checked in and ready to go.
        </p>

        {/* Attendance status card */}
        <div
          className="w-100 rounded-3 p-3 text-start mb-3"
          style={{ backgroundColor: '#E5E9F0' }}
        >
          <p className="small fw-semibold text-dark mb-2">Attendance status</p>
          <div className="bg-white rounded-2 px-3 py-2 mb-2 d-flex align-items-center gap-2">
            <span
              className="rounded-circle d-inline-block"
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: '#1B2430',
              }}
            />
            <span className="small fw-medium text-dark">Checked in</span>
          </div>
          <p className="small text-secondary mb-0" style={{ fontSize: '0.78rem' }}>
            No further action is needed.
          </p>
        </div>

        <p className="small text-secondary mb-4" style={{ fontSize: '0.78rem' }}>
          Scan the QR code again when you check out.
        </p>

        {/* Action buttons */}
        <div className="w-100 d-grid gap-2 mt-2">
          <button
            type="button"
            onClick={onBackHome}
            className="btn fw-semibold py-2 rounded-3 border-0"
            style={{
              backgroundColor: '#CEDB27',
              color: '#1B2430',
            }}
          >
            Back to Home
          </button>
          <button
            type="button"
            onClick={onReset}
            className="btn fw-semibold py-2 rounded-3 border-0 text-white"
            style={{
              backgroundColor: '#4888B7',
            }}
          >
            Scan another code
          </button>
        </div>
      </div>
    );
  }

  return null;
}