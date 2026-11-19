import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExportCsvControl from './ExportCsvControl.jsx';

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
});
