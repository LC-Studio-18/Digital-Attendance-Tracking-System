import "./Attendance.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import mockAttendance from "../data/mockAttendance";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MINIMUM_LOADING_MS = 1200;
const DASH = "\u2014";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const formatDay = (value) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
    new Date(`${value}T00:00:00`),
  );

const formatTime = (value) => {
  if (!value || value === "--") return DASH;
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = String(hour % 12 || 12).padStart(2, "0");
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const getTotalHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut || checkIn === "--" || checkOut === "--") {
    return checkIn && checkIn !== "--" ? "In progress" : DASH;
  }
  const [checkInHour, checkInMinute] = checkIn.split(":").map(Number);
  const [checkOutHour, checkOutMinute] = checkOut.split(":").map(Number);
  const minutes = checkOutHour * 60 + checkOutMinute - (checkInHour * 60 + checkInMinute);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};

const formatAttendance = (records) => records.map((record) => ({
  ...record,
  displayDate: formatDate(record.date),
  day: formatDay(record.date),
  displayCheckIn: formatTime(record.checkIn),
  displayCheckOut: formatTime(record.checkOut),
  totalHours: getTotalHours(record.checkIn, record.checkOut),
}));

const attendanceRecords = formatAttendance(mockAttendance);

const getWeekStart = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

const statusClass = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("late")) return "late";
  if (normalized.includes("absent")) return "absent";
  return "present";
};

function Attendance() {
  const [attendance, setAttendance] = useState(attendanceRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState(() => new Date());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [chartRange, setChartRange] = useState("30");
  const [filters, setFilters] = useState({
    name: "",
    employeeId: "",
    date: "",
    status: "",
    checkInFrom: "",
    checkOutFrom: "",
  });

  const loadAttendance = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    const minimumLoading = new Promise((resolve) => setTimeout(resolve, MINIMUM_LOADING_MS));
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance`, { signal });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const result = await response.json();
      if (result.status !== "success" || !Array.isArray(result.data?.attendance)) {
        throw new Error(result.message || "Unexpected response from live service");
      }
      setAttendance(formatAttendance(result.data.attendance));
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      setError("Unable to fetch live attendance data. Showing saved records instead.");
      setAttendance([...attendanceRecords]);
      setLastUpdated(new Date());
    } finally {
      if (!signal?.aborted) {
        await minimumLoading;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setTimestamp(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => loadAttendance(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadAttendance]);

  const currentEmployee = attendance[0] || attendanceRecords[0];
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(timestamp);
  const timeLabel = new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(lastUpdated)
    : "Waiting for first refresh";

  const monthOptions = useMemo(() => [...new Set(attendance.map((record) => record.date.slice(0, 7)))], [attendance]);
  const [selectedMonth, setSelectedMonth] = useState(attendanceRecords[0]?.date.slice(0, 7) || "");
  const activeMonth = selectedMonth && monthOptions.includes(selectedMonth)
    ? selectedMonth
    : selectedMonth ? monthOptions[0] || "" : "";

  const filteredAttendance = attendance.filter((record) => {
    const name = filters.name.trim().toLowerCase();
    const employeeId = filters.employeeId.trim().toLowerCase();
    return (
      (!name || record.name.toLowerCase().includes(name)) &&
      (!employeeId || record.employeeId.toLowerCase().includes(employeeId)) &&
      (!filters.date || record.date === filters.date) &&
      (!filters.status || record.status === filters.status) &&
      (!activeMonth || record.date.startsWith(activeMonth)) &&
      (!filters.checkInFrom || (record.checkIn !== "--" && record.checkIn >= filters.checkInFrom)) &&
      (!filters.checkOutFrom || (record.checkOut !== "--" && record.checkOut >= filters.checkOutFrom))
    );
  });

  const statusOptions = [...new Set(attendance.map((record) => record.status))];
  const clearFilters = () => setFilters({ name: "", employeeId: "", date: "", status: "", checkInFrom: "", checkOutFrom: "" });
  const updateFilter = (field) => (event) => setFilters((previous) => ({ ...previous, [field]: event.target.value }));

  const chartRecords = useMemo(() => {
    const cutoff = new Date(timestamp);
    cutoff.setDate(cutoff.getDate() - Number(chartRange));
    return attendance
      .filter((record) => new Date(`${record.date}T00:00:00`) >= cutoff)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [attendance, chartRange, timestamp]);

  const chartPoints = chartRecords.map((record, index) => {
    const x = chartRecords.length === 1 ? 198 : 36 + (index * 330) / (chartRecords.length - 1);
    const status = record.status.toLowerCase();
    const value = status.includes("absent") ? 12 : status.includes("late") ? 62 : 80 + ((record.id || index) % 3) * 6;
    return { x, y: 128 - value, value, label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${record.date}T00:00:00`)) };
  });
  const chartLine = chartPoints.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const chartArea = chartPoints.length ? `${chartLine} L ${chartPoints.at(-1).x} 130 L ${chartPoints[0].x} 130 Z` : "";

  const weekStart = getWeekStart(timestamp);
  const thisWeekRecords = attendance.filter((record) => {
    const recordDate = new Date(`${record.date}T00:00:00`);
    const daysSinceMonday = Math.floor((timestamp - weekStart) / 86400000);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + Math.min(daysSinceMonday, 6));
    return recordDate >= weekStart && recordDate <= weekEnd && !record.status.toLowerCase().includes("absent");
  });
  const weekPresent = Math.min(new Set(thisWeekRecords.map((record) => record.date)).size, 5);
  const attendanceRate = Math.round((weekPresent / 5) * 100);

  const downloadHistory = () => {
    const rows = [
      ["Employee", "Employee ID", "Date", "Day", "Status", "Clock-in", "Clock-out", "Total hours"],
      ...filteredAttendance.map((row) => [row.name, row.employeeId, row.displayDate, row.day, row.status, row.displayCheckIn, row.displayCheckOut, row.totalHours]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const historyRows = showAll ? filteredAttendance : filteredAttendance.slice(0, 4);

  return (
    <div className="attendance-page">
      {loading && (
        <div className="processing-overlay" role="status" aria-live="polite">
          <div className="processing-card">
            <div className="processing-spinner" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div>
            <h2>Processing</h2>
            <p>Please wait here while we record your attendance</p>
          </div>
        </div>
      )}

      <aside className="dashboard-sidebar">
        <a className="brand-lockup" href="#dashboard"><span className="brand-mark">P</span><strong>Presence</strong></a>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="sidebar-nav-link active" href="#dashboard"><span aria-hidden="true">⌂</span> Dashboard</a>
          <a className="sidebar-nav-link" href="#profile"><span aria-hidden="true">♙</span> My Profile</a>
          <a className="sidebar-nav-link" href="#attendance-history"><span aria-hidden="true">◷</span> Attendance Log</a>
          <a className="sidebar-nav-link" href="#dashboard"><span aria-hidden="true">⚙</span> Settings</a>
        </nav>
        <section className="sidebar-profile" id="profile" aria-label="Employee profile">
          <div className="profile-avatar">{currentEmployee.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
          <div className="profile-identity"><strong>{currentEmployee.name}</strong><span>Employee</span></div>
          <small>Employee Access</small>
        </section>
        <button type="button" className="logout-button"><span aria-hidden="true">⇥</span> Logout</button>
      </aside>

      <div className="dashboard-shell">
        <main className="dashboard-main" id="dashboard">
          <header className="topbar">
            <div className="topbar-date"><span aria-hidden="true">▢</span>{dateLabel}</div>
            <div className="topbar-actions">
              <span className="live-timestamp" aria-label={`Current time ${timeLabel}`}><span className="live-dot" />{timeLabel}</span>
              <button type="button" className="icon-button" aria-label="Notifications">♧</button>
              <span className="topbar-avatar">{currentEmployee.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
              <span className="topbar-name">{currentEmployee.name.split(" ")[0]} <span aria-hidden="true">⌄</span></span>
            </div>
          </header>

          <section className="welcome-heading">
            <div><h1>Good morning, {currentEmployee.name.split(" ")[0]}.</h1><p>Here’s your attendance overview for today.</p></div>
            <button type="button" className="download-history" onClick={downloadHistory}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export CSV</button>
          </section>

          {error && <div className="error-state" role="alert"><strong>Live data unavailable</strong><span>{error}</span><button type="button" className="error-retry" onClick={() => loadAttendance()} disabled={loading}>Try again</button></div>}

          <section className="status-overview" aria-label="Today's attendance status">
            <article className="status-card status-card-in">
              <div className="check-mark" aria-hidden="true">✓</div>
              <div className="status-value"><span className="card-kicker">Current Status</span><strong>{currentEmployee.status.toLowerCase().includes("absent") ? "OUT" : "IN"}</strong><span className="status-pill"><i />{currentEmployee.status}</span></div>
              <div className="status-divider" />
              <div className="clocked-at"><span className="card-kicker">Clocked In At</span><strong>{currentEmployee.displayCheckIn}</strong><small>{currentEmployee.displayDate}</small></div>
            </article>
            <div className="status-right-column">
              <article className="status-card status-card-out">
                <div className="clock-icon" aria-hidden="true">◷</div>
                <div className="status-value"><span className="card-kicker">Clocked Out</span><strong>{currentEmployee.displayCheckOut}</strong><small>{currentEmployee.checkOut === "--" ? "Not yet clocked out" : `Today at ${currentEmployee.displayCheckOut}`}</small></div>
              </article>
              <div className="last-updated" aria-live="polite">
                <div><span>Last updated</span><strong>{lastUpdatedLabel}</strong></div>
                <i aria-hidden="true" />
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <section className="dashboard-card chart-card" aria-labelledby="overview-title">
              <div className="card-heading"><h2 id="overview-title"><span aria-hidden="true">▥</span> Attendance Overview</h2><label className="select-wrap"><select value={chartRange} onChange={(event) => setChartRange(event.target.value)} aria-label="Chart date range"><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option></select></label></div>
              <div className="chart-wrap">
                <svg className="attendance-chart" viewBox="0 0 400 170" role="img" aria-label="Attendance trend chart">
                  {[20, 45, 70, 95, 120].map((y, index) => <g key={y}><line x1="36" y1={y} x2="378" y2={y} /><text x="4" y={y + 3}>{100 - index * 25}</text></g>)}
                  {chartPoints.length > 0 && <><path className="chart-area" d={chartArea} /><path className="chart-line" d={chartLine} />{chartPoints.map((point, index) => <g key={`${point.label}-${index}`}><circle cx={point.x} cy={point.y} r="3.5" /><text className="chart-date" x={point.x} y="145" textAnchor="middle">{point.label}</text></g>)}</>}
                  {chartPoints.length === 0 && <text className="chart-empty" x="205" y="80" textAnchor="middle">No attendance records in this range</text>}
                </svg>
              </div>
            </section>

            <section className="dashboard-card weekly-card" aria-labelledby="weekly-title">
              <h2 id="weekly-title"><span aria-hidden="true">▢</span> This Week</h2>
              <strong className="weekly-count">{weekPresent} / 5</strong>
              <span className="weekly-caption">Days Present</span>
              <div className="weekly-divider" />
              <div className="rate-row"><div className="rate-ring" style={{ "--rate": `${attendanceRate}%` }}><span>{attendanceRate}%</span></div><span>Attendance<br />Rate</span></div>
            </section>

            <section className="dashboard-card history-card" id="attendance-history" aria-labelledby="history-title">
              <div className="card-heading history-card-heading">
                <h2 id="history-title"><span aria-hidden="true">▤</span> Attendance History</h2>
                <div className="history-actions">
                  <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>Filters{Object.values(filters).some(Boolean) ? " · On" : ""}</button>
                  <label className="select-wrap month-select"><select aria-label="Filter by month" value={activeMonth} onChange={(event) => setSelectedMonth(event.target.value)}><option value="">All dates</option>{monthOptions.map((month) => <option key={month} value={month}>{new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`))}</option>)}</select></label>
                  <button type="button" className="view-all-button" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show Less" : "View All"}<span aria-hidden="true">→</span></button>
                </div>
              </div>
              {filtersOpen && <div className="filter-bar" aria-label="Filter attendance history">
                <div className="filter-field"><label htmlFor="filter-name">Name</label><input id="filter-name" type="text" placeholder="Search name" value={filters.name} onChange={updateFilter("name")} /></div>
                <div className="filter-field"><label htmlFor="filter-employee-id">Employee ID</label><input id="filter-employee-id" type="text" placeholder="e.g. EMP001" value={filters.employeeId} onChange={updateFilter("employeeId")} /></div>
                <div className="filter-field"><label htmlFor="filter-date">Date</label><input id="filter-date" type="date" value={filters.date} onChange={updateFilter("date")} /></div>
                <div className="filter-field"><label htmlFor="filter-status">Status</label><select id="filter-status" value={filters.status} onChange={updateFilter("status")}><option value="">All statuses</option>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
                <div className="filter-field"><label htmlFor="filter-check-in-from">Clock-in from</label><input id="filter-check-in-from" type="time" value={filters.checkInFrom} onChange={updateFilter("checkInFrom")} /></div>
                <div className="filter-field"><label htmlFor="filter-check-out-from">Clock-out from</label><input id="filter-check-out-from" type="time" value={filters.checkOutFrom} onChange={updateFilter("checkOutFrom")} /></div>
                <div className="filter-actions"><span className="filter-summary">{filteredAttendance.length} of {attendance.length} records</span><button type="button" className="clear-filters" onClick={clearFilters}>Clear filters</button></div>
              </div>}
              <div className="history-table-wrap"><table className="history-table"><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr></thead><tbody>
                {historyRows.length > 0 ? historyRows.map((record) => <tr key={record.id}><td>{record.day}, {record.displayDate}</td><td>{record.displayCheckIn}</td><td>{record.displayCheckOut}</td><td><span className={`history-status ${statusClass(record.status)}`}><i />{record.status}</span></td></tr>) : <tr><td colSpan={4} className="empty-state">No attendance records match these filters.</td></tr>}
              </tbody></table></div>
              <footer className="history-footer"><span>Showing {historyRows.length} of {filteredAttendance.length} records</span><button type="button" onClick={downloadHistory}>Download history <span aria-hidden="true">↓</span></button></footer>
            </section>

            <aside className="dashboard-card help-card"><div className="help-icon" aria-hidden="true">◉</div><h2>Need Help?</h2><p>Contact your HR department<br />for assistance.</p><a href="mailto:theteam@lcstudio.co.za">✉ Contact HR</a></aside>
          </section>
        </main>

        <footer className="company-footer" id="settings">
          <div className="footer-brand"><span className="footer-symbol">✿</span><span><b>life</b> choices</span></div>
          <div className="footer-contact"><h2>Visit or Contact Us</h2><p>314 Imam Haron Rd, Lansdowne, Cape Town, 7780</p><p>▣ &nbsp;+27 696 4157</p><p>✉ &nbsp;theteam@lcstudio.co.za</p><a href="https://www.lcstudio.co.za">www.lcstudio.co.za</a></div>
        </footer>
      </div>
    </div>
  );
}

export default Attendance;
