import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { getAttendanceHistory } from '../services/attendanceApi.js';
import AttendanceHistoryPage from './AttendanceHistoryPage.jsx';

vi.mock('../services/attendanceApi.js', () => ({
  getAttendanceHistory: vi.fn(),
  API_BASE_URL: 'http://localhost:5000',
  ATTENDANCE_HISTORY_PATH: '/api/v1/attendance/history',
}));

vi.mock('../firebase/firebase.js', () => ({
  auth: { currentUser: null },
}));

function tokenFor(role) {
  const payload = btoa(JSON.stringify({ role }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
}

const record = {
  id: '1',
  date: '2026-11-18T09:02:00Z',
  clockIn: '2026-11-18T09:02:00Z',
  clockOut: '2026-11-18T17:30:00Z',
  duration: '8h 28m',
  status: 'OUT',
  staffName: 'Alice Brown',
  email: 'alice@example.com',
  department: 'Facilities',
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('AttendanceHistoryPage', () => {
  it('shows the loading state while the API request is running', async () => {
    getAttendanceHistory.mockReturnValue(new Promise(() => {}));
    render(<AttendanceHistoryPage />);

    expect(screen.getByText('Loading attendance history…')).toBeInTheDocument();
  });

  it('shows admin columns and sends the Firebase token for admins', async () => {
    const token = tokenFor('admin');
    window.localStorage.setItem('firebaseIdToken', token);
    getAttendanceHistory.mockResolvedValue([record]);

    render(<AttendanceHistoryPage />);

    expect(await screen.findByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Admin view')).toBeInTheDocument();
    expect(getAttendanceHistory).toHaveBeenCalledWith(
      expect.objectContaining({ token })
    );
  });

  it('hides admin columns for staff even when the API returns them', async () => {
    window.localStorage.setItem('firebaseIdToken', tokenFor('staff'));
    getAttendanceHistory.mockResolvedValue([record]);

    render(<AttendanceHistoryPage />);

    expect(await screen.findByText('Clock in')).toBeInTheDocument();
    expect(screen.queryByText('Staff')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('Staff view')).toBeInTheDocument();
  });

  it('shows the empty state when there are no records', async () => {
    getAttendanceHistory.mockResolvedValue([]);
    render(<AttendanceHistoryPage />);

    expect(
      await screen.findByText('No attendance records yet')
    ).toBeInTheDocument();
  });

  it('shows a safe error with a retry action', async () => {
    getAttendanceHistory.mockRejectedValueOnce({ code: 500 });
    render(<AttendanceHistoryPage />);

    expect(
      await screen.findByText('Something went wrong. Please try again.')
    ).toBeInTheDocument();

    getAttendanceHistory.mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => {
      expect(getAttendanceHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('registers the /attendance-history route', async () => {
    getAttendanceHistory.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/attendance-history']}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'Attendance history' })
    ).toBeInTheDocument();
  });
});
