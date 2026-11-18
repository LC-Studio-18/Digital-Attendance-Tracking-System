// Mock attendance service for testing the QR check-in flow
export const submitAttendanceScan = async (payload) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Reproducible mock success and failure scenarios
      if (!payload || payload.includes('FAIL')) {
        reject(new Error('Invalid or expired attendance QR code.'));
      } else {
        resolve({
          success: true,
          message: 'Check-in recorded successfully',
          timestamp: new Date().toLocaleTimeString(),
          payload,
        });
      }
    }, 1200);
  });
};
