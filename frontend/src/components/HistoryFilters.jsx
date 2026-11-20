import { useState } from 'react';
import { EMPTY_ATTENDANCE_FILTERS } from '../utils/attendanceFilters.js';

/**
 * Date range, status and text filters for the attendance history page.
 * Filters are applied when the form is submitted (or Enter is pressed).
 */
export default function HistoryFilters({ onApply, onClear, disabled = false }) {
  const [draft, setDraft] = useState({ ...EMPTY_ATTENDANCE_FILTERS });
  const [error, setError] = useState('');

  function update(key) {
    return (event) => {
      setDraft((current) => ({ ...current, [key]: event.target.value }));
      setError('');
    };
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
      setError('The start date must be on or before the end date.');
      return;
    }

    setError('');
    onApply({ ...draft });
  }

  function handleClear() {
    setDraft({ ...EMPTY_ATTENDANCE_FILTERS });
    setError('');
    onClear();
  }

  return (
    <form className="history-filters" onSubmit={handleSubmit} noValidate>
      <div className="history-filters__fields">
        <label className="history-filters__field">
          <span className="history-filters__label">From</span>
          <input
            type="date"
            className="history-filters__input"
            value={draft.startDate}
            max={draft.endDate || undefined}
            disabled={disabled}
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
            min={draft.startDate || undefined}
            disabled={disabled}
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
            onChange={update('status')}
          >
            <option value="">All statuses</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </label>

        <label className="history-filters__field history-filters__field--wide">
          <span className="history-filters__label">Search</span>
          <input
            type="search"
            className="history-filters__input"
            placeholder="Name, email or department"
            value={draft.search}
            disabled={disabled}
            onChange={update('search')}
          />
        </label>
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
