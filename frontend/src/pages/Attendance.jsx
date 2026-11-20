import { useEffect, useMemo, useState } from 'react';
import lifeChoicesLogo from '../assets/life-choices-logo.png';
import './Attendance.css';

/*
Live attendance-hook integration to enable after bringing in the
frontend5-attendance-hook branch files:
import { useAttendance } from '../hooks/useAttendance';
import { auth } from '../services/firebase';
*/

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

function Attendance({ onLogout } = {}) {
  const [records, setRecords] = useState([]);
  const [totalIn, setTotalIn] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('IN');
  const [sortBy, setSortBy] = useState('name');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

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

  const recentRecords = [...records]
    .filter((record) => record.lastClockTime)
    .sort((first, second) => second.lastClockTime - first.lastClockTime)
    .slice(0, 5);

  const departmentCounts = records.reduce((counts, record) => {
    const department = record.department || 'General';
    counts[department] = (counts[department] || 0) + 1;
    return counts;
  }, {});
  const departmentColors = ['#42a5f5', '#ff5055', '#39f878', '#a443f1', '#ffb347', '#ee3fe9'];
  const departmentOrder = ['LC Studio', 'Finance', 'Placements', 'LCA', 'HR', "Leader's Quest"];
  const departmentEntries = Object.entries(departmentCounts)
    .sort(([first], [second]) => {
      const firstPosition = departmentOrder.indexOf(first);
      const secondPosition = departmentOrder.indexOf(second);
      return (firstPosition < 0 ? departmentOrder.length : firstPosition) -
        (secondPosition < 0 ? departmentOrder.length : secondPosition);
    })
    .slice(0, 6);
  const departmentTotal = departmentEntries.reduce((sum, [, count]) => sum + count, 0);
  const departmentLabelPositions = [
    { x: 180, y: 20, anchor: 'middle' },
    { x: 270, y: 82, anchor: 'start' },
    { x: 270, y: 190, anchor: 'start' },
    { x: 180, y: 237, anchor: 'middle' },
    { x: 90, y: 190, anchor: 'end' },
    { x: 90, y: 82, anchor: 'end' },
  ];

  const earlyArrivals = [...records]
    .filter((record) => record.lastCheckInAt)
    .sort((first, second) => first.lastCheckInAt - second.lastCheckInAt)
    .slice(0, 5);

  const weekData = [42, 62, 40, 76, 54].map((value, index) =>
    weekOffset === 0 ? value : Math.max(15, value + ((weekOffset * (index + 2)) % 18))
  );

  const exportAttendance = () => {
    const header = ['Member', 'Employee ID', 'Department', 'Status', 'In', 'Out'];
    const rows = visibleRecords.map((record) => [
      record.name,
      record.employeeId,
      record.department || '',
      record.status,
      record.lastCheckInAt ? formatTime(record.lastCheckInAt) : '',
      record.lastCheckOutAt ? formatTime(record.lastCheckOutAt) : '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff-attendance.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const lateCount = records.filter((record) => {
    if (!record.lastCheckInAt) return false;
    return (
      record.lastCheckInAt.getHours() > 8 ||
      (record.lastCheckInAt.getHours() === 8 && record.lastCheckInAt.getMinutes() > 30)
    );
  }).length;

  const openAddEmployee = () => setShowAddEmployee(true);

  const addEmployee = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const employeeId = String(form.get('employeeId') || '').trim();
    const department = String(form.get('department') || '').trim();
    if (!name || !employeeId) return;

    setRecords((current) => [
      ...current,
      {
        id: `new-${employeeId}`,
        name,
        employeeId,
        department: department || 'General',
        status: 'UNKNOWN',
        employmentStatus: 'Active',
        lastClockTime: null,
        lastCheckInAt: null,
        lastCheckOutAt: null,
      },
    ]);
    setStatusFilter('ALL');
    setShowAddEmployee(false);
  };

  const filterMetric = (filter) => {
    setStatusFilter(filter);
    document.getElementById('attendance-log')?.scrollIntoView({ behavior: 'smooth' });
  };

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

        <button className="add-employee-button" type="button" onClick={openAddEmployee}>
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

        <button className="logout-link" type="button" onClick={() => window.confirm('Log out of the admin dashboard?') && (onLogout ? onLogout() : (window.location.href = '#logout'))}>
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M10 3H4v12h6M8 9h8m-3-3 3 3-3 3" />
          </svg>
          <span>LOGOUT</span>
        </button>
      </aside>

      <main className="dashboard-main" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b> Overview
          </div>
          <div className="topbar-meta">
            <button className="notification-button" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
              <i aria-hidden="true" />
            </button>
            <button className="profile-avatar" type="button" aria-label="Admin profile">AD</button>
          </div>
        </header>

        <section className="welcome-heading">
          <div className="welcome-copy">
            <h1>Good morning, Admin.</h1>
            <div className="system-notice">
              <i aria-hidden="true" />
              <span><strong>All systems are operational.</strong> You have <b>4 pending approvals</b> and <b>2 user sign-ups today</b></span>
            </div>
          </div>
          <div className="welcome-actions">
            <button type="button" onClick={() => filterMetric('IN')}>View Staff Attendance</button>
            <button type="button" onClick={() => document.getElementById('attendance-log')?.scrollIntoView({ behavior: 'smooth' })}>Attendance Log</button>
          </div>
        </section>

        <section className="summary-row" aria-label="Attendance summary">
          <button className="summary-card" type="button" onClick={() => filterMetric('IN')}>
            <span className="summary-label">Currently Onsite</span>
            <strong>{totalIn ?? '—'}</strong>
            <span className="summary-caption">People in the building</span>
          </button>
          <button className="summary-card" type="button" onClick={() => filterMetric('OUT')}>
            <span className="summary-label">Offsite</span>
            <strong>{records.filter((record) => record.status === 'OUT').length}</strong>
            <span className="summary-caption">Clocked Out Today</span>
          </button>
          <button className="summary-card" type="button" onClick={() => filterMetric('UNKNOWN')}>
            <span className="summary-label">Not Checked In</span>
            <strong>{records.filter((record) => record.status === 'UNKNOWN').length}</strong>
            <span className="summary-caption">No Entry Recorded Today</span>
          </button>
          <button className="summary-card" type="button" onClick={() => filterMetric('ALL')}>
            <span className="summary-label">Late Comings</span>
            <strong>{lateCount}</strong>
            <span className="summary-caption">People Late Today</span>
          </button>
        </section>

        {error && (
          <div className="error-state" role="alert">
            <strong>Sample attendance unavailable</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="dashboard-primary-row">
        <section className="attendance-card" id="attendance-log" aria-labelledby="attendance-title">
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

        <aside className="recent-activity-card">
          <div className="panel-heading">
            <h2>Recent Activity</h2>
            <span><i /> Live</span>
          </div>
          <div className="activity-list">
            {recentRecords.length ? recentRecords.map((record) => (
              <div className="activity-item" key={record.id}>
                <i aria-hidden="true" />
                <div>
                  <strong>{record.name}</strong>
                  <span>{record.status === 'OUT' ? 'Checked out' : 'Checked in'} at {formatTime(record.lastClockTime)}</span>
                </div>
                <time>{record.lastClockTime ? `${Math.max(2, Math.round((new Date() - record.lastClockTime) / 60000))}m ago` : ''}</time>
              </div>
            )) : <p className="panel-empty">No recent activity</p>}
          </div>
        </aside>
        </div>

        <div className="dashboard-secondary-row">
          <section className="weekly-card">
            <div className="panel-heading">
              <h2>Attendance this week</h2>
              <div className="week-controls">
                <button type="button" aria-label="Previous week" onClick={() => setWeekOffset((value) => value - 1)}>‹</button>
                <button type="button" aria-label="Next week" onClick={() => setWeekOffset((value) => value + 1)}>›</button>
              </div>
            </div>
            <div className="bar-chart" role="img" aria-label="Weekly attendance bar chart">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                <div className="bar-column" key={day}>
                  <span className="bar-value">{weekData[index]}</span>
                  <div className={`bar bar-${index}`} style={{ height: `${weekData[index] * 1.15}%` }} />
                  <small>{day}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="departments-card">
            <div className="panel-heading">
              <h2>Departments</h2>
            </div>
            <div className="department-content">
              <div className="department-chart">
                <svg viewBox="0 0 360 265" role="img" aria-label={`Staff distribution by department: ${departmentEntries.map(([name, count]) => `${name}, ${count}`).join('; ')}`}>
                  {departmentEntries.map(([department, count], index) => {
                    const priorTotal = departmentEntries.slice(0, index).reduce((sum, [, value]) => sum + value, 0);
                    const start = -90 + (priorTotal / (departmentTotal || 1)) * 360;
                    const end = start + (count / (departmentTotal || 1)) * 360;
                    const startRadians = (start * Math.PI) / 180;
                    const endRadians = (end * Math.PI) / 180;
                    const x1 = 180 + 67 * Math.cos(startRadians);
                    const y1 = 140 + 67 * Math.sin(startRadians);
                    const x2 = 180 + 67 * Math.cos(endRadians);
                    const y2 = 140 + 67 * Math.sin(endRadians);
                    const largeArc = end - start > 180 ? 1 : 0;
                    const labelPosition = departmentLabelPositions[index];
                    return (
                      <g key={department}>
                        <path d={`M 180 140 L ${x1} ${y1} A 67 67 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={departmentColors[index]} stroke="white" strokeWidth="2" />
                        <text className="department-chart-label" x={labelPosition.x} y={labelPosition.y} textAnchor={labelPosition.anchor}>
                          <tspan>{department}:</tspan>
                          <tspan x={labelPosition.x} dy="15">{count}</tspan>
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="department-legend">
                {departmentEntries.map(([department], index) => (
                  <span key={department}><i style={{ backgroundColor: departmentColors[index] }} />{department}</span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-bottom-row">
          <section className="arrivals-card">
            <div className="arrivals-heading">
              <div>
                <h2>Weekly early arrivals report</h2>
                <p>Week of 16 Nov to 20 Nov 2026. Early means clocked in before 08:00</p>
              </div>
              <button type="button" onClick={exportAttendance}>Export CSV</button>
            </div>
            <div className="arrivals-table-wrap">
              <table>
                <thead><tr><th>#</th><th>Member</th><th>Department</th><th>Early days</th><th>Earliest arrival</th></tr></thead>
                <tbody>
                  {earlyArrivals.length ? earlyArrivals.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}.</td>
                      <td><span className="mini-avatar">{record.name.charAt(0)}</span>{record.name}</td>
                      <td>{record.department || '—'}</td>
                      <td>{Math.max(1, 6 - index)} of 5</td>
                      <td>{formatTime(record.lastCheckInAt)}</td>
                    </tr>
                  )) : <tr><td colSpan="5" className="empty-state">No early arrival data</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sheets-card">
            <span className="sheets-live"><i />Live</span>
            <div className="panel-heading">
              <h2>Google Sheets</h2>
              <button className={sheetsConnected ? 'connected' : ''} type="button" onClick={() => setSheetsConnected((value) => !value)}>
                {sheetsConnected ? 'Connected' : 'Connect'}
              </button>
            </div>
            <p className="sheets-sync">Last Synced today at 13:30</p>
            <strong>Your attendance, backed up.</strong>
            <p>Attendance records sync automatically to your organisation's spreadsheet.</p>
            <button className="open-spreadsheet" type="button">Open Spreadsheet ›</button>
          </section>
        </div>

        {showAddEmployee && (
          <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowAddEmployee(false)}>
            <section className="add-employee-modal" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
              <div className="modal-heading">
                <div>
                  <p>STAFF DIRECTORY</p>
                  <h2 id="add-employee-title">Add employee</h2>
                </div>
                <button type="button" aria-label="Close" onClick={() => setShowAddEmployee(false)}>×</button>
              </div>
              <form onSubmit={addEmployee}>
                <label>Full name<input name="name" required placeholder="Employee name" /></label>
                <label>Employee ID<input name="employeeId" required placeholder="EMP000" /></label>
                <label>Department<input name="department" placeholder="Department" /></label>
                <div className="modal-actions">
                  <button className="modal-cancel" type="button" onClick={() => setShowAddEmployee(false)}>Cancel</button>
                  <button className="modal-submit" type="submit">Add Employee</button>
                </div>
              </form>
            </section>
          </div>
        )}

        <footer className="site-footer" id="staff-directory">
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
            <small>Admin access only - LC Attends System</small>
          </section>
        </footer>
      </main>
    </div>
  );
}

export default Attendance;
