import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar navbar-dark bg-dark px-3 flex-wrap">
      <span className="navbar-brand">Attendance</span>
      <div className="d-flex flex-wrap gap-3 align-items-center">
        {user && (
          <Link className="nav-link text-white" to="/clock">
            Clock
          </Link>
        )}
        {isAdmin && (
          <Link className="nav-link text-white" to="/dashboard">
            Dashboard
          </Link>
        )}
        {user && (
          <button className="btn btn-outline-light btn-sm" onClick={logout}>
            Log out
          </button>
        )}
      </div>
    </nav>
  );
}
