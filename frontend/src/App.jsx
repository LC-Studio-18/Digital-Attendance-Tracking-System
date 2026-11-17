import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import QrScannerPage from './pages/QrScannerPage';

// Temporary routing so the scanner page can be opened at /scan.
// The app shell (login, clock-in, dashboards) will replace this later.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan" element={<QrScannerPage />} />
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
