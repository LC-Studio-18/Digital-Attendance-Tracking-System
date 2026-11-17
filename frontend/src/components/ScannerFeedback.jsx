export default function ScannerFeedback({
  submissionState,
  scannedPayload,
  errorMessage,
  cameraStatus,
  cameraError,
  onReset,
}) {
  return (
    <div className="w-full mt-4">
      {/* 1. Camera Error / Denied Permission Fallback UI */}
      {cameraStatus === 'error' ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <h3 className="text-red-700 font-semibold text-base mb-1">
            Camera Access Issue
          </h3>
          <p className="text-xs text-red-600 mb-2">
            {cameraError?.message || 'Unable to access camera feed.'}
          </p>
          <div className="text-xs bg-white p-3 rounded-lg border border-red-100 text-left mb-3">
            <span className="font-medium text-gray-700">Error Code:</span>{' '}
            <code className="text-red-500">
              {cameraError?.code || 'UNKNOWN'}
            </code>
            <p className="font-medium text-gray-700 mt-2">
              Recovery Instructions:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-600">
              <li>Check your browser settings to grant camera permission.</li>
              <li>Ensure you are using localhost or a secure HTTPS context.</li>
              <li>Verify your device has a working connected camera.</li>
            </ul>
          </div>
          <button
            onClick={onReset}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {/* 2. Loading State */}
      {submissionState === 'loading' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-3"></div>
          <p className="text-sm font-medium tracking-wide">
            Processing check-in...
          </p>
        </div>
      )}

      {/* 3. Success Feedback State */}
      {submissionState === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <h3 className="text-green-800 font-semibold text-lg">
            Check-In Successful!
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Payload:{' '}
            <code className="bg-white px-2 py-0.5 rounded border border-green-200">
              {scannedPayload}
            </code>
          </p>
          <button
            onClick={onReset}
            className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
          >
            Scan Again
          </button>
        </div>
      )}

      {/* 4. Submission Error State */}
      {submissionState === 'error' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <h3 className="text-amber-800 font-semibold text-base">
            Check-In Failed
          </h3>
          <p className="text-xs text-amber-700 mt-1">{errorMessage}</p>
          <button
            onClick={onReset}
            className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
