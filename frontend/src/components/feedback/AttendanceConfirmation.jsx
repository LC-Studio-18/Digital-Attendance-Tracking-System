import StatusBanner from './StatusBanner';

const LABELS = {
  'clock-in': 'Clocked in',
  'clock-out': 'Clocked out',
  submission: 'Attendance record submitted',
};

function formatTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

/**
 * Pass the record the API returned AFTER it confirmed the save.
 * If there is no confirmed record, nothing is rendered, so a success
 * message can never appear before the system has confirmed it.
 *
 * `recordedAt` is read from the API response (ISO string or Date).
 * TODO(confirm with backend): the field name that holds the recorded time.
 */
export default function AttendanceConfirmation({ action = 'clock-in', record, onDismiss }) {
  if (!record) return null;
  const time = formatTime(record.recordedAt);
  const label = LABELS[action] ?? LABELS.submission;

  return (
    <StatusBanner variant="success" title={time ? `${label} at ${time}` : label} onDismiss={onDismiss}>
      Your attendance has been recorded.
    </StatusBanner>
  );
}