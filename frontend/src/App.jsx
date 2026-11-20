<<<<<<< HEAD
import { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ErrorScreen from './components/ErrorScreen';

//Update these two imports to match the other team's exact page file names and paths
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          mode="api"
          error={this.state.error}
          onRetry={() => window.location.assign('/dashboard')}
        />
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Default entry redirect (adjust if their root path '/' goes to /login instead) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Team routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 404 Page Not Found for any unknown URL */}
      <Route
        path="*"
        element={
          <ErrorScreen
            mode="404"
            onRetry={() => navigate('/dashboard')}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <RouteErrorBoundary>
        <AppRoutes />
      </RouteErrorBoundary>
    </Router>
  );
=======
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
>>>>>>> origin/frontend6-loading-state
}