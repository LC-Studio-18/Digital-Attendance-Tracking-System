import { useEffect, useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const CAMERA_ERROR_CODES = {
  'permission-denied': 'PERMISSION_DENIED',
  'no-camera': 'NO_CAMERA',
  'insecure-context': 'INSECURE_CONTEXT',
  'in-use': 'CAMERA_UNAVAILABLE',
  overconstrained: 'CAMERA_UNAVAILABLE',
  unsupported: 'CAMERA_UNAVAILABLE',
  aborted: 'CAMERA_UNAVAILABLE',
  security: 'CAMERA_UNAVAILABLE',
  'type-error': 'CAMERA_UNAVAILABLE',
  unknown: 'CAMERA_UNAVAILABLE',
};

const ActiveQrScanner = ({ onDecoded, onCameraError }) => {
  const hasScanned = useRef(false);
  const isMounted = useRef(true);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCameraError = (error) => {
    if (!isMounted.current) return;

    const code = CAMERA_ERROR_CODES[error?.kind] || 'CAMERA_UNAVAILABLE';

    onCameraError?.({
      code,
      message: error?.message || 'Unable to access the camera.',
    });
  };

  const handleScan = (codes) => {
    if (!isMounted.current || hasScanned.current) return;

    const payload = codes[0]?.rawValue;

    if (payload) {
      hasScanned.current = true;
      setIsScanning(false);

      if (isMounted.current) {
        onDecoded?.(payload);
      }
    }
  };

  if (!isScanning) return null;

  return (
    <Scanner
      onScan={handleScan}
      onError={handleCameraError}
      formats={['qr_code']}
      constraints={{
        width: { ideal: 1280 },
        height: { ideal: 480 },
      }}
    />
  );
};

const QrScanner = ({ active, onDecoded, onCameraError }) => {
  if (!active) return null;

  return (
    <ActiveQrScanner onDecoded={onDecoded} onCameraError={onCameraError} />
  );
};

export default QrScanner;
