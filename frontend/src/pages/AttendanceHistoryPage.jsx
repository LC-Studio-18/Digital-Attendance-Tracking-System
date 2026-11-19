import { useCallback, useEffect, useState } from 'react';
import { ErrorMessage, Loader } from '../components/index.js';
import { getAttendanceHistory } from '../services/attendanceApi.js';
import { getAuthSession } from '../services/authService.js';
import '../styles/attendance-history.css';

const BASE_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'clockIn', label: 'Clock in' },
  { key: 'clockOut', label: 'Clock out' },
  { key: 'duration', label: 'Hours' },
  { key: 'status', label: 'Status' },
];

// Only admins may see these person-identifying fields.
const ADMIN_COLUMNS = [
  { key: 'staff', label: 'Staff' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
];

function field(record, ...keys) {
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((current, part) => current?.[part], record);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '—';
}

function formatDate(value) {
  if (value === '—') return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function formatTime(value) {
  if (value === '—') return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
}

function getDuration(record) {
  const supplied = field(record, 'duration', 'totalHours', 'hours');
  if (supplied !== '—') return String(supplied);

  const start = new Date(field(record, 'clockIn', 'checkIn', 'inTime'));
  const end = new Date(field(record, 'clockOut', 'checkOut', 'outTime'));
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return '—';
  }

  const minutes = Math.round((end - start) / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function renderCell(record, key) {
  switch (key) {
    case 'date':
      return formatDate(field(record, 'date', 'createdAt', 'timestamp'));
    case 'clockIn':
      return formatTime(field(record, 'clockIn', 'checkIn', 'inTime'));
    case 'clockOut':
      return formatTime(field(record, 'clockOut', 'checkOut', 'outTime'));
    case 'duration':
      return getDuration(record);
    case 'status': {
      const status = getRecordStatus(record);
      return (
        <span
          className={`history-status history-status--${
            status === 'IN' ? 'in' : 'out'
          }`}
        >
          {status}
        </span>
      );
    }
    case 'staff':
      return field(record, 'staffName', 'employeeName', 'name', 'user.name');
    case 'email':
      return field(record, 'email', 'staffEmail', 'user.email');
    case 'department':
      return field(record, 'department', 'team');
    default:
      return '—';
  }
}

function EmptyState({ isAdmin, onRefresh, isFiltered, onClear }) {
  return (
    <div className="history-empty">
      <span className="history-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M9 3.5V5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3.5M8.5 10h7M8.5 14h7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h3 className="history-empty__title">No attendance records yet</h3>
      <p className="history-empty__text">
        {isAdmin
          ? 'When a staff member clocks in or out, their record will appear here.'
          : 'When you clock in or out, your record will appear here.'}
      </p>
      <button type="button" className="history-refresh" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}

export default function AttendanceHistoryPage({
  fetchHistory = getAttendanceHistory,
  getSession = getAuthSession,
}) {
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorCode, setErrorCode] = useState(null);

  const token = session?.token ?? null;
  const isAdmin = (session?.role ?? 'staff') === 'admin';
  const columns = isAdmin ? [...ADMIN_COLUMNS, ...BASE_COLUMNS] : BASE_COLUMNS;

  const request = useCallback(
    (signal) => fetchHistory({ token, signal }),
    [fetchHistory, token]
  );

  const refresh = useCallback(async () => {
    setStatus('loading');
    setErrorCode(null);

    try {
      const result = await request();
      setRecords(Array.isArray(result) ? result : []);
      setStatus('ready');
    } catch (error) {
      if (error?.code === 'cancelled') return;
      setErrorCode(error?.code ?? 500);
      setStatus('error');
    }
  }, [request]);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => getSession())
      .then((result) => {
        if (active) setSession(result ?? { token: null, role: 'staff' });
      })
      .catch(() => {
        if (active) setSession({ token: null, role: 'staff' });
      });

    return () => {
      active = false;
    };
  }, [getSession]);

  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();

    Promise.resolve()
      .then(() => request(controller.signal))
      .then((result) => {
        if (controller.signal.aborted) return;
        setRecords(Array.isArray(result) ? result : []);
        setStatus('ready');
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === 'cancelled') return;
        setErrorCode(error?.code ?? 500);
        setStatus('error');
      });

    return () => controller.abort();
  }, [session, request]);

  return (
    <div className="history-page">
      <header className="history-page__header">
        <div>
          <p className="history-page__kicker">Attendance</p>
          <h1 className="history-page__title">Attendance history</h1>
          <p className="history-page__subtitle">
            {isAdmin
              ? 'Review clock-in and clock-out records for all staff.'
              : 'Review your clock-in and clock-out records.'}
          </p>
        </div>
        <div className="history-page__actions">
          <span
            className={`history-role${isAdmin ? ' history-role--admin' : ''}`}
          >
            {isAdmin ? 'Admin view' : 'Staff view'}
          </span>
          <button
            type="button"
            className="history-refresh"
            onClick={refresh}
            disabled={status === 'loading'}
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="history-card" aria-label="Attendance history">
        <div className="history-card__head">
          <h2>Records</h2>
          {status === 'ready' && records.length > 0 ? (
            <span className="history-card__count">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </span>
          ) : null}
        </div>

        {status === 'loading' ? (
          <div className="history-loading">
            <Loader size="lg" label="Loading attendance history…" />
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="history-feedback">
            <ErrorMessage code={errorCode} onRetry={refresh} />
          </div>
        ) : null}

        {status === 'ready' && records.length === 0 ? (
          <EmptyState isAdmin={isAdmin} onRefresh={refresh} />
        ) : null}

        {status === 'ready' && records.length > 0 ? (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record, index) => (
                  <tr key={record.id ?? `${record.date ?? index}-${index}`}>
                    {columns.map((column) => (
                      <td key={column.key}>{renderCell(record, column.key)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
