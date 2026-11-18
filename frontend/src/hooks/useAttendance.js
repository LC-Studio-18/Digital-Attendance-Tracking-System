import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAttendance } from '../services/attendanceService';
import { validateAttendance } from '../services/attendanceValidator';
import { useAutoRefresh } from './useAutoRefresh';

function getErrorMessage(err) {
  const status = err.response?.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You need admin access to view this dashboard.';
  if (err.response?.data?.message) return err.response.data.message;
  if (status) return `Server error (${status}).`;
  if (err.request) return 'Could not reach the server.';
  return err.message || 'Something went wrong.';
}

export function useAttendance({ getToken, refreshInterval = 30000 } = {}) {
  const [staff, setStaff] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(true);
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
      setStaff(result.staff);
      setTotalIn(result.totalIn);
      setSkipped(result.skipped);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError(getErrorMessage(err)); // this will keep the last good data on screen
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  useAutoRefresh(load, refreshInterval);

  return {
    staff,
    totalIn,
    skipped,
    loading,
    error,
    lastUpdated,
    refresh: load,
  };
}
