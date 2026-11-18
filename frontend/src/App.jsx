import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // this has to connect to the actual dashboard page but idk the name of the name the page or the file path
import Login from './pages/Login';         // Where users go on 401 expiration

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route for your login page */}
        <Route path="/login" element={<Login />} />

        {/* Route for your main attendance dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Default fallback redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}