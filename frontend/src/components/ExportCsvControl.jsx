import { useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import Loader from './Loader.jsx';
import SuccessMessage from './SuccessMessage.jsx';
import {
  DEFAULT_EXPORT_ERROR,
  exportAttendanceReport,
} from '../services/reportsApi.js';
import {
  buildCsv,
  downloadBlob,
  downloadCsv,
  filterRecordsByDate,
  getField,
} from '../utils/csv.js';
import '../styles/export-csv.css';

function textOrDash(value) {
  return value === '' || value === undefined || value === null
    ? '—'
    : String(value);
}

function formatDate(value) {
  if (!value || value === '—') return '—';
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
  if (!value || value === '—') return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
}

function getDuration(record) {
  const supplied = getField(record, 'duration', 'totalHours', 'hours');
  if (supplied) return String(supplied);

  const start = new Date(getField(record, 'clockIn', 'checkIn', 'inTime'));
  const end = new Date(getField(record, 'clockOut', 'checkOut', 'outTime'));
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

const DEFAULT_COLUMNS = [
  {
    key: 'date',
    label: 'Date',
    getValue: (record) =>
      formatDate(getField(record, 'date', 'createdAt', 'timestamp')),
  },
  {
    key: 'staff',
    label: 'Staff',
    getValue: (record) =>
      textOrDash(
        getField(record, 'staffName', 'employeeName', 'name', 'user.name')
      ),
  },
  {
    key: 'email',
    label: 'Email',
    getValue: (record) =>
      textOrDash(getField(record, 'email', 'staffEmail', 'user.email')),
  },
  {
    key: 'department',
    label: 'Department',
    getValue: (record) => textOrDash(getField(record, 'department', 'team')),
  },
  {
    key: 'clockIn',
    label: 'Clock in',
    getValue: (record) =>
      formatTime(getField(record, 'clockIn', 'checkIn', 'inTime')),
  },
  {
    key: 'clockOut',
    label: 'Clock out',
    getValue: (record) =>
      formatTime(getField(record, 'clockOut', 'checkOut', 'outTime')),
  },
  {
    key: 'duration',
    label: 'Hours',
    getValue: getDuration,
  },
  {
    key: 'status',
    label: 'Status',
    getValue: (record) =>
      textOrDash(getField(record, 'status', 'state')).toUpperCase(),
  },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path
        d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Date-filtered CSV export control for the Admin Dashboard.
 *
 * By default the button calls `GET /api/reports/export` with the selected
 * range, then saves the returned Blob through a temporary anchor. Pass
 * `onExport(filteredRecords, range)` to replace the request, or `local` to
 * build the CSV in the browser (useful for offline previews). `columns` and
 * `records` only affect those two local paths.
 */
export default function ExportCsvControl({
  records = [],
  columns = DEFAULT_COLUMNS,
  filename = 'attendance-export',
  label = 'Export CSV',
  loadingLabel = 'Exporting…',
  minLoadingMs = 600,
  onExport,
  local = false,
  token,
  className = '',
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const range = { startDate, endDate };
  const rangeIsInvalid = Boolean(startDate && endDate && startDate > endDate);

  function handleDateChange(setter) {
    return (event) => {
      setter(event.target.value);
      setFeedback(null);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isExporting) return;

    if (rangeIsInvalid) {
      setFeedback({
        type: 'error',
        text: 'The start date must be on or before the end date.',
      });
      return;
    }

    setFeedback(null);
    setIsExporting(true);

    try {
      // Keep the spinner visible long enough to be noticed: a fast API or
      // local CSV build would otherwise finish within the same frame.
      if (minLoadingMs > 0) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, minLoadingMs)
        );
      }

      if (local) {
        const filtered = filterRecordsByDate(records, range);
        downloadCsv(buildCsv(filtered, columns), filename);
        setFeedback({
          type: 'success',
          text: `Exported ${filtered.length} ${
            filtered.length === 1 ? 'record' : 'records'
          }.`,
        });
        return;
      }

      if (onExport) {
        const filtered = filterRecordsByDate(records, range);
        await onExport(filtered, range);
        setFeedback({
          type: 'success',
          text: `Exported ${filtered.length} ${
            filtered.length === 1 ? 'record' : 'records'
          }.`,
        });
        return;
      }

      const result = await exportAttendanceReport({
        startDate,
        endDate,
        token,
      });
      downloadBlob(result.blob, result.filename);
      setFeedback({
        type: 'success',
        text: result.message || 'Report downloaded successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error?.code === 'export_failed' && error.message
            ? error.message
            : DEFAULT_EXPORT_ERROR,
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className={`export-csv${className ? ` ${className}` : ''}`}>
      <form className="export-csv__form" onSubmit={handleSubmit} noValidate>
        <div className="export-csv__fields">
          <label className="export-csv__field">
            <span className="export-csv__label">Start date</span>
            <input
              type="date"
              className="export-csv__input"
              value={startDate}
              max={endDate || undefined}
              disabled={isExporting}
              aria-invalid={rangeIsInvalid || undefined}
              onChange={handleDateChange(setStartDate)}
            />
          </label>
          <label className="export-csv__field">
            <span className="export-csv__label">End date</span>
            <input
              type="date"
              className="export-csv__input"
              value={endDate}
              min={startDate || undefined}
              disabled={isExporting}
              aria-invalid={rangeIsInvalid || undefined}
              onChange={handleDateChange(setEndDate)}
            />
          </label>
        </div>

        <button
          type="submit"
          className="export-csv__button"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader label={loadingLabel} size="sm" inline />
          ) : (
            <>
              <DownloadIcon />
              <span>{label}</span>
            </>
          )}
        </button>
      </form>

      {feedback?.type === 'success' ? (
        <SuccessMessage
          className="export-csv__feedback"
          message={feedback.text}
          autoHideMs={5000}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {feedback?.type === 'error' ? (
        <ErrorMessage
          className="export-csv__feedback"
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}
    </div>
  );
}
