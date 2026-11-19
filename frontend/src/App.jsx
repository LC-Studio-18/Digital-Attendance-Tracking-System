import { useState } from 'react';
import Loader from './components/Loader';
import LoginLoader from './pages/LoginLoader';
import AttendanceLoader from './pages/AttendanceLoader';
import DashboardLoader from './pages/DashboardLoader';

export default function App() {
  const activeScreen = 'login';
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Processing');

  function startLoading(label) {
    setLoadingLabel(label);
    setIsLoading(true);
  }

  return (
    <div>
      {activeScreen === 'login' && (
        <LoginLoader
          isLoading={isLoading}
          onLogin={() => startLoading('Signing in...')}
        />
      )}

      {activeScreen === 'attendance' && (
        <AttendanceLoader
          isLoading={isLoading}
          onClockIn={() => startLoading('Clocking in...')}
          onClockOut={() => startLoading('Clocking out...')}
        />
      )}

      {activeScreen === 'dashboard' && (
        <DashboardLoader
          isLoading={isLoading}
          onReload={() => startLoading('Loading dashboard...')}
        />
      )}

      {isLoading && <Loader size="large" text={loadingLabel} />}
    </div>
  );
}