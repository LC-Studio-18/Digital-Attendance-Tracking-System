import { useEffect, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Login from './pages/Login';
import { getUserRole, logoutUser } from './services/authService';
import AdminControls from './components/AdminControls';
import './App.css';



const people = [
  { initials: 'AM', name: 'Ava Mitchell', role: 'Product Design', time: '08:42 AM', status: 'On time', color: 'coral' },
  { initials: 'JM', name: 'Jordan Miller', role: 'Engineering', time: '08:51 AM', status: 'On time', color: 'blue' },
  { initials: 'SK', name: 'Sofia Khan', role: 'Marketing', time: '09:12 AM', status: 'Late', color: 'gold' },
  { initials: 'DL', name: 'Daniel Lee', role: 'Operations', time: '08:36 AM', status: 'On time', color: 'green' },
  { initials: 'EP', name: 'Ella Park', role: 'People & Culture', time: '—', status: 'Away', color: 'violet' },
];

function Dashboard({ user, userRole, onLogout }) {
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home"><span className="brand-mark"><i /><i /><i /></span><span>daymark<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span className="nav-icon">▦</span>Overview</a>
          <a className="nav-item" href="#attendance"><span className="nav-icon">◷</span>Attendance</a>
          <a className="nav-item" href="#team"><span className="nav-icon">♧</span>Team</a>
          <a className="nav-item" href="#reports"><span className="nav-icon">▤</span>Reports</a>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-spark">✳</span><strong>Need a hand?</strong><span>Visit our help center</span><a href="mailto:support@daymark.app">Get support <span>↗</span></a></div><AdminControls userRole={userRole}><button className="nav-item settings-link"><span className="nav-icon">{'\u2699'}</span>Settings</button></AdminControls><div className="profile-row"><span className="avatar profile-avatar">{name.slice(0, 2).toUpperCase()}</span><span className="profile-meta"><strong>{user?.displayName || name}</strong><small>{userRole === 'admin' ? 'Administrator' : 'Team member'}</small></span><button className="more-button" onClick={onLogout} aria-label="Sign out" title="Sign out">↗</button></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="date-chip"><span>◷</span> Monday, 18 November 2024</span><button className="icon-button" aria-label="Notifications">♧<i /></button><span className="avatar top-avatar">{name.slice(0, 2).toUpperCase()}</span></div></header>
        <div className="dashboard-content">
          <section className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 18, 2024</div><h1>Good morning, {name}<span className="wave">✳</span></h1><p>Here’s what’s happening with your team today.</p></div><button className="export-button" onClick={() => window.print()}><span>↓</span> Export report</button></section>
          <section className="stats-grid" aria-label="Attendance summary">
            <article className="stat-card"><div className="stat-top"><span>Present today</span><span className="stat-icon mint">✓</span></div><div className="stat-value">24<span className="stat-total">/ 32</span></div><div className="stat-foot"><span className="trend">↗ 12.5%</span><span>vs. last week</span></div><div className="progress-track"><span style={{width:'75%'}} /></div></article>
            <article className="stat-card"><div className="stat-top"><span>Late arrivals</span><span className="stat-icon peach">◷</span></div><div className="stat-value">03</div><div className="stat-foot"><span className="trend neutral">Today</span><span>across all teams</span></div><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-top"><span>On leave</span><span className="stat-icon lavender">☼</span></div><div className="stat-value">05</div><div className="stat-foot"><span className="soft-note">2 planned · 3 sick leave</span></div><div className="leave-avatars"><b>JM</b><b>AL</b><b>+3</b></div></article>
            <article className="stat-card"><div className="stat-top"><span>Attendance rate</span><span className="stat-icon sky">⌁</span></div><div className="stat-value">92<span className="percent">%</span></div><div className="stat-foot"><span className="trend">↗ 4.8%</span><span>this month</span></div><div className="sparkline"><svg viewBox="0 0 200 34" preserveAspectRatio="none"><path d="M0 28 C18 27 20 13 37 18 S61 26 76 16 S98 21 114 11 S141 17 153 8 S181 11 200 2" /></svg></div></article>
          </section>
          <section className="content-grid">
            <article className="panel attendance-panel" id="attendance"><div className="panel-heading"><div><h2>Today’s attendance</h2><p>Keep an eye on who’s here and who’s not.</p></div><button className="filter-button">All teams <span>⌄</span></button></div><div className="table-wrap"><table><thead><tr><th>TEAM MEMBER</th><th>CHECK IN</th><th>STATUS</th><th></th></tr></thead><tbody>{people.map((person) => <tr key={person.name}><td><div className="person-cell"><span className={`avatar ${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.role}</small></span></div></td><td className="time-cell">{person.time}</td><td><span className={`status ${person.status.toLowerCase().replace(' ', '-')}`}><i />{person.status}</span></td><td><button className="row-menu" aria-label={`More options for ${person.name}`}>···</button></td></tr>)}</tbody></table></div><button className="view-all">View all team members <span>→</span></button></article>
            <article className="panel activity-panel"><div className="panel-heading"><div><h2>Live activity</h2><p>Updates from your workplace</p></div><span className="live-indicator"><i /> LIVE</span></div><div className="timeline"><div className="activity-item"><span className="activity-avatar coral">AM</span><div><p><strong>Ava Mitchell</strong> checked in</p><small>Design team <span>·</span> Just now</small></div></div><div className="activity-item"><span className="activity-avatar blue">JM</span><div><p><strong>Jordan Miller</strong> checked in</p><small>Engineering <span>·</span> 8:51 AM</small></div></div><div className="activity-item"><span className="activity-avatar gold">SK</span><div><p><strong>Sofia Khan</strong> checked in</p><small>Marketing <span>·</span> 9:12 AM</small></div></div><div className="activity-item"><span className="activity-avatar gray">↗</span><div><p><strong>Weekly report</strong> is ready</p><small>Attendance summary <span>·</span> 8:00 AM</small></div></div></div><button className="activity-link">See all activity <span>→</span></button></article>
          </section>
          <footer className="dashboard-footer"><span>© 2024 Daymark. Made for better workdays.</span><span><a href="#privacy">Privacy</a><a href="#help">Help center</a></span></footer>
        </div>
      </main>
    </div>
  );
}



function App() {
  const [authState, setAuthState] = useState({
    loading: Boolean(auth),
    user: null,
    role: null,
  });

  useEffect(() => {
    if (!auth) return;

    let isActive = true;
    let roleRequest = 0;

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

  if (authState.loading) {
    return <div className="auth-loading" aria-label="Loading account" />;
  }

  if (!authState.user) {
    return <Login onLoginSuccess={(user) => setAuthState({ loading: false, user, role: 'user' })} />;
  }

  return (
    <Dashboard
      user={authState.user}
      userRole={authState.role}
      onLogout={logoutUser}
    />
  );
}

export default App;
