import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';

// TEMPORARY pages for testing. They will be replaced by the real pages.
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginAs = (role) => {
    login({ name: 'Test ' + role, role });
    navigate('/clock');
  };

  return (
    <div className="container py-4">
      <h2>Login (test only)</h2>
      <button className="btn btn-primary me-2" onClick={() => loginAs('Staff')}>
        Log in as Staff
      </button>
      <button className="btn btn-secondary" onClick={() => loginAs('Admin')}>
        Log in as Admin
      </button>
    </div>
  );
}

function Clock() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="container py-4">
      <h2>Clock in / out</h2>
      <p>Logged in as {user.name}</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="container py-4">
      <h2>Admin Dashboard</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clock" element={<Clock />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
