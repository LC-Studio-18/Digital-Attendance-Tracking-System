import { describe, expect, it } from 'vitest';
import {
  DATE_FILTER_MODES,
  EMPTY_ATTENDANCE_FILTERS,
  filterAttendanceRecords,
  getEmployeeOptions,
  normalizeDateFilters,
  toApiParams,
} from './attendanceFilters.js';

const records = [
  {
    id: '1',
    date: '2026-11-18T09:00:00Z',
    status: 'OUT',
    staffId: 'emp-1',
    staffName: 'Alice Brown',
    email: 'alice@example.com',
  },
  {
    id: '2',
    date: '2026-11-19T09:00:00Z',
    status: 'IN',
    staffId: 'emp-2',
    staffName: 'Bob Carter',
    email: 'bob@example.com',
  },
];

describe('attendance filters', () => {
  it('mirrors a specific date into the inclusive range fields', () => {
    expect(
      normalizeDateFilters(
        { ...EMPTY_ATTENDANCE_FILTERS, date: '2026-11-19' },
        DATE_FILTER_MODES.SPECIFIC
      )
    ).toEqual(
      expect.objectContaining({
        date: '2026-11-19',
        startDate: '2026-11-19',
        endDate: '2026-11-19',
      })
    );
  });

  it('clears date values in any-date mode', () => {
    const result = normalizeDateFilters(
      {
        ...EMPTY_ATTENDANCE_FILTERS,
        date: '2026-11-19',
        startDate: '2026-11-19',
        endDate: '2026-11-19',
      },
      DATE_FILTER_MODES.ANY
    );

    expect(result.date).toBe('');
    expect(result.startDate).toBe('');
    expect(result.endDate).toBe('');
  });

  it('sends date and employee values as query parameters', () => {
    expect(
      toApiParams({
        ...EMPTY_ATTENDANCE_FILTERS,
        date: '2026-11-19',
        startDate: '2026-11-19',
        endDate: '2026-11-19',
        employee: 'alice',
      })
    ).toEqual({
      date: '2026-11-19',
      startDate: '2026-11-19',
      endDate: '2026-11-19',
      employee: 'alice',
    });
  });

  it('builds unique employee options from attendance records', () => {
    expect(getEmployeeOptions([...records, records[0]])).toEqual([
      {
        id: 'emp-1',
        name: 'Alice Brown',
        email: 'alice@example.com',
        value: 'Alice Brown',
        label: 'Alice Brown (alice@example.com)',
      },
      {
        id: 'emp-2',
        name: 'Bob Carter',
        email: 'bob@example.com',
        value: 'Bob Carter',
        label: 'Bob Carter (bob@example.com)',
      },
    ]);
  });

  it('filters by a specific date and employee together', () => {
    expect(
      filterAttendanceRecords(records, {
        ...EMPTY_ATTENDANCE_FILTERS,
        date: '2026-11-19',
        employee: 'bob',
      }).map((record) => record.id)
    ).toEqual(['2']);

    expect(
      filterAttendanceRecords(records, {
        ...EMPTY_ATTENDANCE_FILTERS,
        startDate: '2026-11-18',
        endDate: '2026-11-19',
        employee: 'alice@example.com',
      }).map((record) => record.id)
    ).toEqual(['1']);
  });
});
