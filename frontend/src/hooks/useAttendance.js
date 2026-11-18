import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAttendance } from '../services/attendanceService';
import { validateAttendance } from '../services/attendanceValidator';
import { useAutoRefresh } from './useAutoRefresh';

function getErrorMessage(err) {
  const status = err?.response?.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You need admin access to view this dashboard.';
  const serverMessage = err?.response?.data?.message;
  if (typeof serverMessage === 'string' && serverMessage) return serverMessage;
  if (status) return `Server error (${status}).`;
  if (err?.code === 'ECONNABORTED')
    return 'The server took too long to respond.';
  if (err?.request) return 'Could not reach the server.';
  return err?.message || 'Something went wrong.';
}

export function useAttendance({ getToken, refreshInterval = 30000 } = {}) {
  const [staff, setStaff] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // later refreshes
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const controllerRef = useRef(null);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const token = getTokenRef.current ? await getTokenRef.current() : null;
      const raw = await fetchAttendance(controller.signal, token);
      const result = validateAttendance(raw);

      // Every record was unreadable, so treat it as a failed fetch
      if (result.staff.length === 0 && result.skipped > 0) {
        throw new Error('Attendance data could not be read.');
      }

      setStaff(result.staff);
      setTotalIn(result.totalIn);
      setSkipped(result.skipped);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError(getErrorMessage(err)); // last good data stays; lastUpdated doesn't change
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Used by the timer and the retry/refresh button
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  useAutoRefresh(refresh, refreshInterval);

  return {
    staff,
    totalIn,
    skipped,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
  };
}
