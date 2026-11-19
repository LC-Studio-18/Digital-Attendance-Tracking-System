import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCsv,
  downloadCsv,
  escapeCsvValue,
  filterRecordsByDate,
  toDateKey,
} from './csv.js';

const records = [
  { id: 1, date: '2026-11-17T09:00:00Z', staffName: 'Alice' },
  { id: 2, date: '2026-11-18T09:00:00Z', staffName: 'Bob' },
  { id: 3, date: '2026-11-19T09:00:00Z', staffName: 'Cara' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('csv utils', () => {
  it('normalises dates to local YYYY-MM-DD keys', () => {
    expect(toDateKey('2026-11-18T09:00:00Z')).toBe('2026-11-18');
    expect(toDateKey(new Date(2026, 10, 18))).toBe('2026-11-18');
    expect(toDateKey('not a date')).toBe('');
  });

  it('filters records by an inclusive date range', () => {
    expect(
      filterRecordsByDate(records, {
        startDate: '2026-11-17',
        endDate: '2026-11-18',
      })
    ).toEqual(records.slice(0, 2));
  });

  it('returns every record when no date range is set', () => {
    expect(filterRecordsByDate(records, {})).toBe(records);
  });

  it('excludes records with no usable date when filtering', () => {
    expect(
      filterRecordsByDate([{ id: 4 }], { startDate: '2026-11-01' })
    ).toEqual([]);
  });

  it('escapes commas, quotes and newlines', () => {
    expect(escapeCsvValue('Smith, A')).toBe('"Smith, A"');
    expect(escapeCsvValue('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
  });

  it('builds a CSV with a header and one row per record', () => {
    const csv = buildCsv(records.slice(0, 1), [
      { key: 'date', label: 'Date' },
      { key: 'staffName', label: 'Staff' },
    ]);

    expect(csv).toBe('Date,Staff\r\n2026-11-17T09:00:00Z,Alice\r\n');
  });

  it('downloads the CSV as a .csv file', async () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    downloadCsv('Date,Staff\r\n', 'attendance-export');

    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    // Blob.text() decodes as UTF-8 and strips the leading BOM.
    expect(await blob.text()).toBe('Date,Staff\r\n');
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
