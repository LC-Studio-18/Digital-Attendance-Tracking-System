import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AttendanceDataProvider } from './AttendanceDataProvider.jsx';
import { useAttendanceData } from './attendanceDataStore.js';

const sampleRecords = [
  {
    id: '1',
    date: '2026-11-18T09:02:00Z',
    staffName: 'Alice Brown',
    status: 'OUT',
  },
];

function DataConsumer() {
  const {
    attendanceData,
    visibleAttendanceData,
    setAttendanceData,
    setVisibleAttendanceData,
  } = useAttendanceData();

  return (
    <div>
      <span data-testid="all">{JSON.stringify(attendanceData)}</span>
      <span data-testid="visible">{JSON.stringify(visibleAttendanceData)}</span>
      <button
        type="button"
        onClick={() => {
          setAttendanceData(sampleRecords);
          setVisibleAttendanceData(sampleRecords.slice(0, 1));
        }}
      >
        Publish records
      </button>
    </div>
  );
}

describe('attendance data store', () => {
  it('starts with empty arrays so consumers can read before data loads', () => {
    render(
      <AttendanceDataProvider>
        <DataConsumer />
      </AttendanceDataProvider>
    );

    expect(screen.getByTestId('all')).toHaveTextContent('[]');
    expect(screen.getByTestId('visible')).toHaveTextContent('[]');
  });

  it('shares published arrays with every consumer', () => {
    render(
      <AttendanceDataProvider>
        <DataConsumer />
        <DataConsumer />
      </AttendanceDataProvider>
    );

    act(() => {
      screen.getAllByRole('button', { name: 'Publish records' })[0].click();
    });

    expect(screen.getAllByTestId('all')).toHaveLength(2);
    screen.getAllByTestId('all').forEach((node) => {
      expect(node).toHaveTextContent(JSON.stringify(sampleRecords));
    });
    screen.getAllByTestId('visible').forEach((node) => {
      expect(node).toHaveTextContent(JSON.stringify(sampleRecords));
    });
  });

  it('is safe to read without a provider', () => {
    render(<DataConsumer />);

    expect(screen.getByTestId('all')).toHaveTextContent('[]');
    expect(screen.getByTestId('visible')).toHaveTextContent('[]');
  });
});
