import { useEffect, useMemo, useState } from 'react';
import lifeChoicesLogo from '../assets/life-choices-logo.png';
import './Attendance.css';

/*
Live attendance-hook integration to enable after bringing in the
frontend5-attendance-hook branch files:
import { useAttendance } from '../hooks/useAttendance';
import { auth } from '../services/firebase';
*/

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

const formatTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatTimestamp = (date) => {
  if (!date) return 'Waiting for first update';
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

function createAttendanceRecords(events, employees, now) {
  const activityByUser = new Map();
  let latestSampleDay = null;
  let latestSampleEventAt = null;

  for (const event of events) {
    const userId = event['User ID'];
    const timestamp = new Date(event.Timestamp);
    if (!userId || Number.isNaN(timestamp.getTime()) || timestamp > now) {
      continue;
    }

    if (!latestSampleDay || timestamp > latestSampleDay) {
      latestSampleDay = timestamp;
    }
  }

  if (!latestSampleDay) {
    return {
      records: employees.map((employee) => ({
        id: employee['User ID'],
        name: employee['Full Name'],
        employeeId: employee['Employee ID'],
        department: employee.Department,
        status: 'UNKNOWN',
        employmentStatus: employee.Status,
        lastClockTime: null,
        lastCheckInAt: null,
        lastCheckOutAt: null,
      })),
      lastUpdated: null,
    };
  }

  const sampleDayKey = `${latestSampleDay.getFullYear()}-${latestSampleDay.getMonth()}-${latestSampleDay.getDate()}`;

  for (const event of events) {
    const userId = event['User ID'];
    const sourceTimestamp = new Date(event.Timestamp);
    if (
      !userId ||
      Number.isNaN(sourceTimestamp.getTime()) ||
      `${sourceTimestamp.getFullYear()}-${sourceTimestamp.getMonth()}-${sourceTimestamp.getDate()}` !==
        sampleDayKey
    ) {
      continue;
    }

    const timestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      sourceTimestamp.getHours(),
      sourceTimestamp.getMinutes(),
      sourceTimestamp.getSeconds(),
      sourceTimestamp.getMilliseconds()
    );
    if (timestamp > now) continue;

    if (!latestSampleEventAt || timestamp > latestSampleEventAt) {
      latestSampleEventAt = timestamp;
    }

    const activity = activityByUser.get(userId) ?? {
      latestEvent: null,
      lastCheckInAt: null,
      lastCheckOutAt: null,
    };

    if (event['Event Type'] === 'Clock In') {
      if (!activity.lastCheckInAt || timestamp > activity.lastCheckInAt) {
        activity.lastCheckInAt = timestamp;
      }
    } else if (event['Event Type'] === 'Clock Out') {
      if (!activity.lastCheckOutAt || timestamp > activity.lastCheckOutAt) {
        activity.lastCheckOutAt = timestamp;
      }
    }

    if (!activity.latestEvent || timestamp > activity.latestEvent.timestamp) {
      activity.latestEvent = {
        event,
        timestamp,
      };
    }

    activityByUser.set(userId, activity);
  }

  return {
    records: employees.map((employee) => {
      const userId = employee['User ID'];
      const activity = activityByUser.get(userId);
      const latestEvent = activity?.latestEvent;
      const status =
        latestEvent?.event['Event Type'] === 'Clock In'
          ? 'IN'
          : latestEvent
            ? 'OUT'
            : 'UNKNOWN';

      return {
        id: userId,
        name: employee['Full Name'],
        employeeId: employee['Employee ID'],
        department: employee.Department,
        status,
        employmentStatus: employee.Status,
        lastClockTime: latestEvent?.timestamp ?? null,
        lastCheckInAt: activity?.lastCheckInAt ?? null,
        lastCheckOutAt: activity?.lastCheckOutAt ?? null,
      };
    }),
    lastUpdated: latestSampleEventAt,
  };
}

function Attendance() {
  const [records, setRecords] = useState([]);
  const [totalIn, setTotalIn] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('IN');
  const [sortBy, setSortBy] = useState('name');

  /*
  After importing the hook and auth above, call the hook unconditionally here:

  const liveAttendance = useAttendance({
    getToken: () => auth.currentUser?.getIdToken(),
    refreshInterval: 5000,
  });
    const liveRecords = liveAttendance.staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      employeeId: staff.id,
      department: '',
      status: staff.status,
      lastClockTime: staff.lastClockEvent,
      lastCheckInAt:
        staff.status === 'IN' ? staff.lastClockEvent : null,
      lastCheckOutAt:
        staff.status === 'OUT' ? staff.lastClockEvent : null,
    }));

  useAttendance calls the branch's fetchAttendance, validateAttendance, and
    useAutoRefresh functions. Replace demo `records`, `totalIn`, `loading`,
    `error`, and `lastUpdated` with `liveRecords` and the matching
    `liveAttendance` fields, and remove the demo JSON effect.
  The committed hook branch currently expects a data.staff payload. Use the
  updated validator in the attendance-hook stash if the backend returns
  data.records.
  */

  useEffect(() => {
    let cancelled = false;

    async function loadDemoData() {
      setLoading(true);
      setError('');

      try {
        const [attendanceModule, employeeModule] = await Promise.all([
          import('../data/attendance.json'),
          import('../data/employees.json'),
        ]);
        if (cancelled) return;

        const demoData = createAttendanceRecords(
          attendanceModule.default,
          employeeModule.default,
          new Date()
        );
        setRecords(demoData.records);
        setTotalIn(
          demoData.records.filter((record) => record.status === 'IN').length
        );
        setLastUpdated(demoData.lastUpdated);
      } catch {
        if (!cancelled) {
          setError('Could not load the sample attendance data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDemoData();
    return () => {
      cancelled = true;
    };
  }, []);

  /*
  Live API mode for when the backend is ready:
  Uncomment the Firebase/API imports and replace the demo-data effect with:

  const firebaseReady = isFirebaseConfigured && Boolean(auth);
  useEffect(() => {
    if (!firebaseReady) return undefined;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('Sign in with an admin account to view attendance.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const payload = await fetchLiveAttendance(undefined, user);
        const result = validateLiveAttendance(payload);
        setRecords(result.records);
        setTotalIn(result.totalIn);
        setLastUpdated(result.lastUpdated);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load attendance.');
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [firebaseReady]);
  */

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records
      .filter((record) => {
        const matchesSearch =
          !query ||
          record.name.toLowerCase().includes(query) ||
          record.employeeId.toLowerCase().includes(query);
        const matchesStatus =
          statusFilter === 'ALL' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .slice()
      .sort((first, second) => {
        if (sortBy === 'status') {
          return (
            first.status.localeCompare(second.status) ||
            first.name.localeCompare(second.name)
          );
        }
        if (sortBy === 'lastActivity') {
          return (
            (second.lastClockTime?.getTime() ?? 0) -
            (first.lastClockTime?.getTime() ?? 0)
          );
        }
        return first.name.localeCompare(second.name);
      });
  }, [records, search, sortBy, statusFilter]);

  const today = formatDate(new Date());

  return (
    <div className="attendance-page">
      <aside className="dashboard-sidebar">
        <a className="brand-lockup" href="#dashboard" aria-label="LC Attends">
          <span className="brand-emblem" aria-hidden="true">
            <img src={lifeChoicesLogo} alt="" />
          </span>
          <span className="brand-name">
            <strong>LC</strong>
            <em>Attends</em>
          </span>
        </a>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a
            className="sidebar-nav-link active"
            href="#dashboard"
            aria-current="page"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="2" y="2" width="4" height="4" rx=".5" />
              <rect x="10" y="2" width="4" height="4" rx=".5" />
              <rect x="2" y="10" width="4" height="4" rx=".5" />
              <rect x="10" y="10" width="4" height="4" rx=".5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a className="sidebar-nav-link" href="#attendance-log">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 5v4l2.5 1.5" />
            </svg>
            <span>Attendance log</span>
          </a>
          <a className="sidebar-nav-link" href="#staff-directory">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="5" r="2.5" />
              <path d="M4.5 15v-1.3a4.5 4.5 0 0 1 9 0V15zM3 8a2 2 0 0 0 0 4m12-4a2 2 0 0 1 0 4" />
            </svg>
            <span>Staff Directory</span>
          </a>
        </nav>

        <button className="add-employee-button" type="button">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2.5 13a3.5 3.5 0 0 1 7 0M12 5v5m-2.5-2.5h5" />
          </svg>
          <span>Add Employee</span>
        </button>

        <section className="admin-access-card" aria-label="Account status">
          <span className="admin-access-label">Admin Access</span>
          <span className="admin-role">Admin</span>
          <span className="admin-workspace">Life Choices Lansdowne</span>
          <span className="admin-live">
            <i aria-hidden="true" />
            Live
          </span>
        </section>

        <a className="logout-link" href="#logout">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M10 3H4v12h6M8 9h8m-3-3 3 3-3 3" />
          </svg>
          <span>LOGOUT</span>
        </a>
      </aside>

      <main className="dashboard-main" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b> Overview
          </div>
          <div className="topbar-meta">
            <span className="demo-badge">SAMPLE DATA</span>
            <span className="topbar-date">{today}</span>
          </div>
        </header>

        <section className="welcome-heading">
          <div>
            <p className="eyebrow">STAFF PRESENCE</p>
            <h1>Staff attendance</h1>
            <p className="welcome-subtitle">
              View who is currently clocked in.
            </p>
          </div>
        </section>

        <section className="summary-row" aria-label="Attendance summary">
          <article className="summary-card">
            <span className="summary-label">Currently clocked IN</span>
            <strong>{totalIn ?? '—'}</strong>
            <span className="summary-caption">Today's sample schedule</span>
          </article>
        </section>

        {error && (
          <div className="error-state" role="alert">
            <strong>Sample attendance unavailable</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="attendance-card" aria-labelledby="attendance-title">
          <div className="card-heading">
            <div>
              <h2 id="attendance-title">Staff attendance</h2>
              <p>Employees currently clocked in</p>
            </div>
            <div className="last-updated" aria-live="polite">
              <span>Latest demo event today</span>
              <strong>{formatTimestamp(lastUpdated)}</strong>
            </div>
          </div>

          <div className="attendance-toolbar">
            <div
              className="status-filters"
              role="group"
              aria-label="Filter by status"
            >
              {[
                ['IN', 'Currently IN'],
                ['ALL', 'All'],
                ['OUT', 'OUT'],
                ['UNKNOWN', 'Unknown'],
              ].map(([value, label]) => (
                <button
                  className={statusFilter === value ? 'selected' : ''}
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  type="button"
                  aria-pressed={statusFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="list-controls">
              <label className="search-control">
                <span className="visually-hidden">
                  Search by name or employee ID
                </span>
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Search staff"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="sort-control">
                <span className="visually-hidden">Sort attendance list</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="name">Sort by name</option>
                  <option value="status">Sort by status</option>
                  <option value="lastActivity">Sort by last activity</option>
                </select>
              </label>
            </div>
          </div>

          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">In</th>
                  <th scope="col">Out</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <tr className="skeleton-row" key={`loading-${index}`}>
                      <td>
                        <span />
                      </td>
                      <td>
                        <span />
                      </td>
                      <td>
                        <span />
                      </td>
                      <td>
                        <span />
                      </td>
                      <td>
                        <span />
                      </td>
                    </tr>
                  ))
                ) : visibleRecords.length > 0 ? (
                  visibleRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="member-cell">
                          <span className="member-avatar" aria-hidden="true">
                            {record.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <strong>{record.name}</strong>
                            <small>{record.employeeId}</small>
                          </span>
                        </div>
                      </td>
                      <td>{record.department || '—'}</td>
                      <td>
                        <span
                          className={`status-pill status-${record.status.toLowerCase()}`}
                        >
                          <i aria-hidden="true" />
                          {record.status}
                        </span>
                      </td>
                      <td>{formatTime(record.lastCheckInAt)}</td>
                      <td>{formatTime(record.lastCheckOutAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="empty-state" colSpan={5}>
                      {error
                        ? 'Attendance could not be loaded.'
                        : 'No employees match this filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="attendance-footer">
            <span>
              {error
                ? 'Attendance list unavailable'
                : `Showing ${visibleRecords.length} of ${records.length} employees`}
            </span>
          </footer>
        </section>

        <footer className="site-footer">
          <section className="footer-brand">
            <div className="footer-brand-lockup">
              <span className="brand-emblem" aria-hidden="true">
                <img src={lifeChoicesLogo} alt="" />
              </span>
              <span className="brand-name">
                <strong>LC</strong>
                <em>Attends</em>
              </span>
            </div>
            <p>
              Life Choices invests in young people from all over South Africa,
              so every one of them has a fair chance in life.
            </p>
          </section>
          <span className="footer-divider" aria-hidden="true" />
          <section className="footer-contact">
            <h2>VISIT OR CONTACT US</h2>
            <address>
              314 Imam Haron Rd, Lansdowne,
              <br />
              Cape Town, 7780
              <br />
              <a href="tel:+27216964157">+27 (0) 21 696 4157</a>
              <br />
              <a href="mailto:theteam@lcstudio.co.za">theteam@lcstudio.co.za</a>
              <br />
              <a href="https://www.lcstudio.co.za">www.lcstudio.co.za</a>
            </address>
            <small>Employee access only - Presence attendance system</small>
          </section>
        </footer>
      </main>
    </div>
  );
}

export default Attendance;
