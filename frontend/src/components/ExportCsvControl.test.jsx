import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportAttendanceReport } from '../services/reportsApi.js';
import ExportCsvControl from './ExportCsvControl.jsx';

vi.mock('../services/reportsApi.js', () => ({
  DEFAULT_EXPORT_ERROR: 'We could not export the CSV. Please try again.',
  exportAttendanceReport: vi.fn(),
}));

const records = [
  {
    id: 1,
    date: '2026-11-17T09:02:00Z',
    staffName: 'Alice Brown',
    status: 'OUT',
  },
  {
    id: 2,
    date: '2026-11-19T09:15:00Z',
    staffName: 'Ben Carter',
    status: 'IN',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ExportCsvControl', () => {
  it('renders the date filter next to the Export CSV button', () => {
    render(<ExportCsvControl records={records} />);

    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Export CSV/ })
    ).toBeInTheDocument();
  });

  it('disables the controls and shows a spinner while exporting', async () => {
    let finishExport;
    const onExport = vi.fn(
      () => new Promise((resolve) => (finishExport = resolve))
    );
    render(
      <ExportCsvControl
        records={records}
        onExport={onExport}
        minLoadingMs={0}
      />
    );

    const button = screen.getByRole('button', { name: /Export CSV/ });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('Exporting…')).toBeInTheDocument();
    expect(screen.getByLabelText('Start date')).toBeDisabled();
    expect(screen.getByLabelText('End date')).toBeDisabled();

    await act(async () => finishExport());

    expect(button).not.toBeDisabled();
    expect(screen.getByText('Exported 2 records.')).toBeInTheDocument();
    expect(onExport).toHaveBeenCalledWith(records, {
      startDate: '',
      endDate: '',
    });
  });

  it('exports only records inside the selected date range', async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(
      <ExportCsvControl
        records={records}
        onExport={onExport}
        minLoadingMs={0}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-11-18' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-19' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(await screen.findByText('Exported 1 record.')).toBeInTheDocument();
    expect(onExport).toHaveBeenCalledWith([records[1]], {
      startDate: '2026-11-18',
      endDate: '2026-11-19',
    });
  });

  it('rejects a reversed date range without exporting', () => {
    const onExport = vi.fn();
    render(
      <ExportCsvControl
        records={records}
        onExport={onExport}
        minLoadingMs={0}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-11-19' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-17' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(
      screen.getByText('The start date must be on or before the end date.')
    ).toBeInTheDocument();
    expect(onExport).not.toHaveBeenCalled();
  });

  it('shows a safe error when the export fails', async () => {
    const onExport = vi.fn().mockRejectedValue(new Error('boom'));
    render(
      <ExportCsvControl
        records={records}
        onExport={onExport}
        minLoadingMs={0}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(
      await screen.findByText('We could not export the CSV. Please try again.')
    ).toBeInTheDocument();
  });

  it('calls the reports API with the selected range and downloads the blob', async () => {
    const blob = new Blob(['Date,Staff\r\n'], { type: 'text/csv' });
    exportAttendanceReport.mockResolvedValue({
      blob,
      filename: 'attendance-November.csv',
      message: 'Report ready.',
    });

    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
    let downloadedName = '';
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function mockClick() {
        downloadedName = this.download;
      });

    render(<ExportCsvControl minLoadingMs={0} />);

    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-11-18' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-11-19' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(
      await screen.findByText('Report ready.')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Report ready.');
    expect(exportAttendanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-11-18',
        endDate: '2026-11-19',
      })
    );
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(downloadedName).toBe('attendance-November.csv');
    expect(document.querySelector('a[download]')).toBeNull();

    click.mockRestore();
  });

  it('shows a safe error toast when the API rejects the export', async () => {
    exportAttendanceReport.mockRejectedValue({ code: 500 });

    render(<ExportCsvControl minLoadingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(
      await screen.findByText('We could not export the CSV. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(exportAttendanceReport).toHaveBeenCalledTimes(1);
  });

  it('uses the API error message when the response reports a failure', async () => {
    exportAttendanceReport.mockRejectedValue({
      code: 'export_failed',
      message: 'No records in range.',
    });

    render(<ExportCsvControl minLoadingMs={0} />);
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(await screen.findByText('No records in range.')).toBeInTheDocument();
  });
});
