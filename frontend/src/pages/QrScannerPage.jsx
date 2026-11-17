import { useState } from 'react';
import ScannerFeedback from '../components/scanner/ScannerFeedback';
import { submitAttendanceScan } from '../services/attendanceServices';

export default function QrScannerPage() {
  const [submissionState, setSubmissionState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [cameraStatus, setCameraStatus] = useState('scanning'); // 'scanning' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const [scannedPayload, setScannedPayload] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle decoded payload trigger
  const handleDecoded = async (payload) => {
    if (submissionState === 'loading' || submissionState === 'success') return;

    setScannedPayload(payload);
    setSubmissionState('loading');

    try {
      await submitAttendanceScan(payload);
      setSubmissionState('success');
    } catch (err) {
      setSubmissionState('error');
      setErrorMessage(err.message);
    }
  };

  const handleReset = () => {
    setSubmissionState('idle');
    setScannedPayload('');
    setErrorMessage('');
    setCameraStatus('scanning');
    setCameraError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Scan the office QR code to check in
          </p>
        </header>

        {/* Camera Preview Area with Targeting Overlay */}
        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            [Camera Stream Placeholder]
          </div>

          {/* Target Box Overlay */}
          <div className="absolute pointer-events-none border-2 border-dashed border-white/80 w-52 h-52 rounded-xl flex items-center justify-center shadow-2xl">
            <div className="absolute w-full h-0.5 bg-red-500 animate-pulse"></div>
          </div>

          {/* Feedback & Loading Overlays */}
          <ScannerFeedback
            submissionState={submissionState}
            scannedPayload={scannedPayload}
            errorMessage={errorMessage}
            cameraStatus={cameraStatus}
            cameraError={cameraError}
            onReset={handleReset}
          />
        </div>

        {/* Feedback display below if not overlayed */}
        <ScannerFeedback
          submissionState={submissionState}
          scannedPayload={scannedPayload}
          errorMessage={errorMessage}
          cameraStatus={cameraStatus}
          cameraError={cameraError}
          onReset={handleReset}
        />

        {/* Testing Controls */}
        {submissionState === 'idle' && cameraStatus === 'scanning' && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleDecoded('LC-EMP-992')}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
            >
              Test Success Scan
            </button>
            <button
              onClick={() => handleDecoded('FAIL-CODE')}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition"
            >
              Test Error Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
