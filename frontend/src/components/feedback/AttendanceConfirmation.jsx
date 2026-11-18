import StatusBanner from './StatusBanner';
import { formatRecordedTime } from '../../services/feedbackMessages';

const LABELS = {
  'clock-in': 'Clocked in',
  'clock-out': 'Clocked out',
  submission: 'Attendance record submitted',
};

/**
 * Pass the record the API returned AFTER it confirmed the save.
 * If there is no confirmed record, nothing is rendered, so a success
 * message can never appear before the system has confirmed it.
 *
 * TODO(confirm with backend): the field name that holds the recorded time
 * (assumed here: record.recordedAt).
 */
export default function AttendanceConfirmation({ action = 'clock-in', record, onDismiss }) {
  if (!record) return null;
  const time = formatRecordedTime(record.recordedAt);
  const label = LABELS[action] ?? LABELS.submission;

  return (
    <StatusBanner variant="success" title={time ? `${label} at ${time}` : label} onDismiss={onDismiss}>
      Your attendance has been recorded.
    </StatusBanner>
  );
}
