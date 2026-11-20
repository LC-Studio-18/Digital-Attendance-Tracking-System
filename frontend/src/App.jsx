import { useCallback, useEffect, useRef, useState } from 'react';
import {
  browserLocalPersistence,
  onIdTokenChanged,
  setPersistence,
} from 'firebase/auth';
import { auth } from './services/firebase';
import Login from './pages/Login';
import Attendance from './pages/Attendance.jsx';
import { getUserRole, logoutUser } from './services/authService';
import AdminControls from './components/AdminControls';
import { navigateTo, usePathname } from './hooks/usePathname';
import './App.css';



const people = [
  { initials: 'AM', name: 'Ava Mitchell', role: 'Product Design', time: '08:42 AM', status: 'On time', color: 'coral' },
  { initials: 'JM', name: 'Jordan Miller', role: 'Engineering', time: '08:51 AM', status: 'On time', color: 'blue' },
  { initials: 'SK', name: 'Sofia Khan', role: 'Marketing', time: '09:12 AM', status: 'Late', color: 'gold' },
  { initials: 'DL', name: 'Daniel Lee', role: 'Operations', time: '08:36 AM', status: 'On time', color: 'green' },
  { initials: 'EP', name: 'Ella Park', role: 'People & Culture', time: '--', status: 'Away', color: 'violet' },
];

function Dashboard({ user, userRole, onLogout, loggingOut, logoutError }) {
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home"><span className="brand-mark"><i /><i /><i /></span><span>LC Attends<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span className="nav-icon">{'\u25A0'}</span>Overview</a>
          <a className="nav-item" href="#attendance"><span className="nav-icon">{'\u25A0'}</span>Attendance</a>
          <a className="nav-item" href="#team"><span className="nav-icon">{'\u25A0'}</span>Team</a>
          <a className="nav-item" href="#reports"><span className="nav-icon">{'\u25A0'}</span>Reports</a>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-spark">*</span><strong>Need a hand?</strong><span>Visit our help center</span><a href="mailto:support@lcattends.app">Get support <span>{'\u2192'}</span></a></div><AdminControls userRole={userRole}><button className="nav-item settings-link"><span className="nav-icon">{'\u2699'}</span>Settings</button></AdminControls><div className="profile-row"><span className="avatar profile-avatar">{name.slice(0, 2).toUpperCase()}</span><span className="profile-meta"><strong>{user?.displayName || name}</strong><small>{userRole === 'admin' ? 'Administrator' : 'Team member'}</small></span><button className="logout-button" type="button" disabled={loggingOut} onClick={onLogout}><span className="logout-label">{loggingOut ? 'Signing out...' : 'Sign out'}</span><span className="logout-icon" aria-hidden="true">{'\u2192'}</span></button></div>{logoutError && <div className="logout-error" role="alert">{logoutError}</div>}</div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="date-chip"><span>{'\u25CF'}</span> Monday, 18 November 2024</span><button className="icon-button" aria-label="Notifications">{'\u2022'}<i /></button><span className="avatar top-avatar">{name.slice(0, 2).toUpperCase()}</span></div></header>
        <div className="dashboard-content">
          <section className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 18, 2024</div><h1>Good morning, {name}</h1><p>Here's what's happening with your team today.</p></div><button className="export-button" onClick={() => window.print()}><span>{'\u2193'}</span> Export report</button></section>
          <section className="stats-grid" aria-label="Attendance summary">
            <article className="stat-card"><div className="stat-top"><span>Present today</span><span className="stat-icon mint">{'\u2713'}</span></div><div className="stat-value">24<span className="stat-total">/ 32</span></div><div className="stat-foot"><span className="trend">+12.5%</span><span>vs. last week</span></div><div className="progress-track"><span style={{width:'75%'}} /></div></article>
            <article className="stat-card"><div className="stat-top"><span>Late arrivals</span><span className="stat-icon peach">{'\u25CF'}</span></div><div className="stat-value">03</div><div className="stat-foot"><span className="trend neutral">Today</span><span>across all teams</span></div><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-top"><span>On leave</span><span className="stat-icon lavender">{'\u25CF'}</span></div><div className="stat-value">05</div><div className="stat-foot"><span className="soft-note">2 planned &middot; 3 sick leave</span></div><div className="leave-avatars"><b>JM</b><b>AL</b><b>+3</b></div></article>
            <article className="stat-card"><div className="stat-top"><span>Attendance rate</span><span className="stat-icon sky">{'\u25B2'}</span></div><div className="stat-value">92<span className="percent">%</span></div><div className="stat-foot"><span className="trend">+4.8%</span><span>this month</span></div><div className="sparkline"><svg viewBox="0 0 200 34" preserveAspectRatio="none"><path d="M0 28 C18 27 20 13 37 18 S61 26 76 16 S98 21 114 11 S141 17 153 8 S181 11 200 2" /></svg></div></article>
          </section>
          <section className="content-grid">
            <article className="panel attendance-panel" id="attendance"><div className="panel-heading"><div><h2>Today's attendance</h2><p>Keep an eye on who's here and who's not.</p></div><button className="filter-button">All teams <span>{'\u25BE'}</span></button></div><div className="table-wrap"><table><thead><tr><th>TEAM MEMBER</th><th>CHECK IN</th><th>STATUS</th><th></th></tr></thead><tbody>{people.map((person) => <tr key={person.name}><td><div className="person-cell"><span className={`avatar ${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.role}</small></span></div></td><td className="time-cell">{person.time}</td><td><span className={`status ${person.status.toLowerCase().replace(' ', '-')}`}><i />{person.status}</span></td><td><button className="row-menu" aria-label={`More options for ${person.name}`}>{'\u22EF'}</button></td></tr>)}</tbody></table></div><button className="view-all">View all team members <span>{'\u2192'}</span></button></article>
            <article className="panel activity-panel"><div className="panel-heading"><div><h2>Live activity</h2><p>Updates from your workplace</p></div><span className="live-indicator"><i /> LIVE</span></div><div className="timeline"><div className="activity-item"><span className="activity-avatar coral">AM</span><div><p><strong>Ava Mitchell</strong> checked in</p><small>Design team <span>&middot;</span> Just now</small></div></div><div className="activity-item"><span className="activity-avatar blue">JM</span><div><p><strong>Jordan Miller</strong> checked in</p><small>Engineering <span>&middot;</span> 8:51 AM</small></div></div><div className="activity-item"><span className="activity-avatar gold">SK</span><div><p><strong>Sofia Khan</strong> checked in</p><small>Marketing <span>&middot;</span> 9:12 AM</small></div></div><div className="activity-item"><span className="activity-avatar gray">{'\u2192'}</span><div><p><strong>Weekly report</strong> is ready</p><small>Attendance summary <span>&middot;</span> 8:00 AM</small></div></div></div><button className="activity-link">See all activity <span>{'\u2192'}</span></button></article>
          </section>
          <footer className="dashboard-footer"><span>&copy; 2026 LC Attends. Made for better workdays.</span><span><a href="#privacy">Privacy</a><a href="#help">Help center</a></span></footer>
        </div>
      </main>
    </div>
  );
}

function App() {
  const pathname = usePathname();
  const [authState, setAuthState] = useState({
    loading: Boolean(auth),
    user: null,
    role: null,
  });

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const logoutBusyRef = useRef(false);

  const handleLoginSuccess = useCallback((user) => {
    setAuthState({ loading: false, user, role: 'user' });
  }, []);

  const handleLogout = useCallback(async () => {
    if (logoutBusyRef.current) return;

    logoutBusyRef.current = true;
    setLoggingOut(true);
    setLogoutError('');

    try {
      await logoutUser();
    } catch {
      setLogoutError('Could not sign out. Please try again.');
    } finally {
      logoutBusyRef.current = false;
      setLoggingOut(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    let isActive = true;
    let roleRequest = 0;

    setPersistence(auth, browserLocalPersistence).catch(() => undefined);

    const unsubscribe = onIdTokenChanged(auth, (user) => {
      const currentRequest = ++roleRequest;

      if (!user) {
        setAuthState({ loading: false, user: null, role: null });
        return;
      }

      setAuthState({ loading: true, user, role: null });

      getUserRole(user)
        .catch(() => 'user')
        .then((role) => {
          if (isActive && currentRequest === roleRequest) {
            setAuthState({ loading: false, user, role });
          }
        });
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const isLoginRoute = pathname === '/login';

  useEffect(() => {
    if (authState.loading) return;

    if (!authState.user) {
      if (!isLoginRoute) navigateTo('/login', { replace: true });
      return;
    }

    if (isLoginRoute || pathname === '/') {
      navigateTo('/dashboard', { replace: true });
    }
  }, [authState.loading, authState.user, isLoginRoute, pathname]);

  if (authState.loading) {
    return <div className="auth-loading" aria-label="Loading account" />;
  }

  if (!authState.user) {
    if (!isLoginRoute) {
      return (
        <div className="auth-loading" aria-label="Redirecting to sign in" />
      );
    }
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (pathname === '/dashboard') {
    return <Attendance onLogout={handleLogout} />;
  }

  return (
    <Dashboard
      user={authState.user}
      userRole={authState.role}
      onLogout={handleLogout}
      loggingOut={loggingOut}
      logoutError={logoutError}
    />
  );
}

export default App;
