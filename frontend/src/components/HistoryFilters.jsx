import { useId, useState } from 'react';
import {
  DATE_FILTER_MODES,
  EMPTY_ATTENDANCE_FILTERS,
  getDateFilterMode,
  normalizeDateFilters,
} from '../utils/attendanceFilters.js';

/**
 * Date, status and employee filters for the attendance history page.
 * Filters are applied when the form is submitted (or Enter is pressed).
 * The employee picker is only rendered for administrators.
 */
export default function HistoryFilters({
  onApply,
  onClear,
  disabled = false,
  isAdmin = false,
  employees = [],
  filters = EMPTY_ATTENDANCE_FILTERS,
}) {
  const [draft, setDraft] = useState(() => ({
    ...EMPTY_ATTENDANCE_FILTERS,
    ...filters,
  }));
  const [dateMode, setDateMode] = useState(() => getDateFilterMode(filters));
  const [error, setError] = useState('');
  const employeeListId = useId();

  function update(key) {
    return (event) => {
      setDraft((current) => ({ ...current, [key]: event.target.value }));
      setError('');
    };
  }

  function handleDateModeChange(event) {
    setDateMode(event.target.value);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    const next = normalizeDateFilters(draft, dateMode);

    if (
      dateMode === DATE_FILTER_MODES.RANGE &&
      next.startDate &&
      next.endDate &&
      next.startDate > next.endDate
    ) {
      setError('The start date must be on or before the end date.');
      return;
    }

    // Staff must never be able to filter on another person's identity.
    if (!isAdmin) next.employee = '';

    setError('');
    onApply(next);
  }

  function handleClear() {
    setDraft({ ...EMPTY_ATTENDANCE_FILTERS });
    setDateMode(DATE_FILTER_MODES.RANGE);
    setError('');
    onClear();
  }

  const dateIsDisabled = disabled || dateMode === DATE_FILTER_MODES.ANY;
  const specificDisabled = dateIsDisabled || dateMode !== DATE_FILTER_MODES.SPECIFIC;
  const rangeDisabled = dateIsDisabled || dateMode !== DATE_FILTER_MODES.RANGE;

  return (
    <form className="history-filters" onSubmit={handleSubmit} noValidate>
      <div className="history-filters__fields">
        <label className="history-filters__field">
          <span className="history-filters__label">Date filter</span>
          <select
            className="history-filters__input"
            value={dateMode}
            disabled={disabled}
            aria-label="Date filter"
            onChange={handleDateModeChange}
          >
            <option value={DATE_FILTER_MODES.RANGE}>Date range</option>
            <option value={DATE_FILTER_MODES.SPECIFIC}>Specific date</option>
            <option value={DATE_FILTER_MODES.ANY}>Any date</option>
          </select>
        </label>

        <label className="history-filters__field">
          <span className="history-filters__label">Date</span>
          <input
            type="date"
            className="history-filters__input"
            value={draft.date}
            disabled={specificDisabled}
            aria-label="Date"
            onChange={update('date')}
          />
        </label>

        <label className="history-filters__field">
          <span className="history-filters__label">From</span>
          <input
            type="date"
            className="history-filters__input"
            value={draft.startDate}
            max={rangeDisabled ? undefined : draft.endDate || undefined}
            disabled={rangeDisabled}
            aria-label="From"
            aria-invalid={Boolean(error) || undefined}
            onChange={update('startDate')}
          />
        </label>

        <label className="history-filters__field">
          <span className="history-filters__label">To</span>
          <input
            type="date"
            className="history-filters__input"
            value={draft.endDate}
            min={rangeDisabled ? undefined : draft.startDate || undefined}
            disabled={rangeDisabled}
            aria-label="To"
            aria-invalid={Boolean(error) || undefined}
            onChange={update('endDate')}
          />
        </label>

        <label className="history-filters__field">
          <span className="history-filters__label">Status</span>
          <select
            className="history-filters__input"
            value={draft.status}
            disabled={disabled}
            aria-label="Status"
            onChange={update('status')}
          >
            <option value="">All statuses</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </label>

        <label className="history-filters__field">
          <span className="history-filters__label">Search</span>
          <input
            type="search"
            className="history-filters__input"
            placeholder="Name, email or department"
            value={draft.search}
            disabled={disabled}
            aria-label="Search"
            onChange={update('search')}
          />
        </label>

        {isAdmin ? (
          <label className="history-filters__field history-filters__field--wide">
            <span className="history-filters__label">Employee</span>
            <input
              type="search"
              className="history-filters__input"
              list={employeeListId}
              placeholder="Search or select an employee"
              value={draft.employee}
              disabled={disabled}
              aria-label="Employee"
              onChange={update('employee')}
            />
            <datalist id={employeeListId}>
              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.value}
                  label={employee.label}
                />
              ))}
            </datalist>
          </label>
        ) : null}
      </div>

      <div className="history-filters__actions">
        <button
          type="submit"
          className="history-filters__button history-filters__button--apply"
          disabled={disabled}
        >
          Apply filters
        </button>
        <button
          type="button"
          className="history-filters__button history-filters__button--clear"
          onClick={handleClear}
          disabled={disabled}
        >
          Clear filters
        </button>
      </div>

      {error ? (
        <p className="history-filters__error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
