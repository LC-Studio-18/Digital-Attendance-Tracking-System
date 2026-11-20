import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAttendance, requestRefresh } from '../services/attendanceService';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  validateAttendance,
  validateMeta,
} from '../services/attendanceValidator';
import { useAutoRefresh } from './useAutoRefresh';

function getErrorMessage(err) {
  const status = err?.response?.status;
  const body = err?.response?.data;
  const serverMessage =
    body?.meta?.error?.message ??
    (typeof body?.error === 'string' ? body.error : body?.error?.message) ??
    body?.message;

  if (status === 401) {
    return serverMessage || 'Unauthorized: Missing or invalid token';
  }
  if (status === 403) {
    return serverMessage || 'Forbidden: Admin access required';
  }
  if (typeof serverMessage === 'string' && serverMessage) return serverMessage;

  if (status) return `Server error (${status}).`;
  if (err?.code === 'ECONNABORTED')
    return 'The server took too long to respond.';
  if (err?.request) return 'Could not reach the server.';
  return err?.message || 'Something went wrong.';
}

export function useAttendance({ getToken, refreshInterval = 3000 } = {}) {
  const [staff, setStaff] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // later refreshes
  const [error, setError] = useState(null); // we could not get usable data
  const [errorStatus, setErrorStatus] = useState(null);
  const [meta, setMeta] = useState(null); // backend's refresh info
  const [lastUpdated, setLastUpdated] = useState(null); // when data last refreshed
  const controllerRef = useRef(null);
  const inFlightRef = useRef(false); // true while a request is running
  const pendingRef = useRef(0); // how many refreshes are running
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // force = true asks the backend to re-read Google Sheets (Retry button)
  const load = useCallback(async (force = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    inFlightRef.current = true;

    try {
      const token = getTokenRef.current
        ? await getTokenRef.current()
        : await auth?.currentUser?.getIdToken();
      if (!token) {
        const authError = new Error(
          isFirebaseConfigured
            ? 'Please sign in before loading attendance.'
            : 'Firebase is not configured. Add the Firebase web app settings to frontend/.env.',
        );
        authError.code = isFirebaseConfigured
          ? 'AUTH_REQUIRED'
          : 'FIREBASE_CONFIG_MISSING';
        throw authError;
      }

      const raw = force
        ? await requestRefresh(controller.signal, token)
        : await fetchAttendance(controller.signal, token);
      const result = validateAttendance(raw);

      // Every record was unreadable, so treat it as a failed fetch
      if (result.staff.length === 0 && result.skipped > 0) {
        throw new Error('Attendance data could not be read.');
      }

      setStaff(result.staff);
      setTotalIn(result.totalIn);
      setSkipped(result.skipped);
      setMeta(result.meta);
      if (result.meta.lastUpdated) {
        setLastUpdated(result.meta.lastUpdated);
      }
      setError(null);
      setErrorStatus(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setErrorStatus(err?.response?.status ?? err?.code ?? null);
      // Keep the last good data; remember and validate backend refresh info if sent.
      if (err?.response?.data?.meta) {
        const responseMeta = validateMeta(err.response.data.meta);
        setMeta(responseMeta);
        if (responseMeta.lastUpdated) {
          setLastUpdated(responseMeta.lastUpdated);
        }
      } else {
        setMeta(null);
      }
      setError(getErrorMessage(err));
    } finally {
      if (controllerRef.current === controller) inFlightRef.current = false;
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Runs a refresh. A normal refresh is skipped while another request is
  // still running, so a slow server never gets a pile of requests.
  const run = useCallback(
    async (force) => {
      if (inFlightRef.current && !force) return;

      pendingRef.current += 1;
      setRefreshing(true);
      await load(force);
      pendingRef.current -= 1;
      if (pendingRef.current === 0) setRefreshing(false);
    },
    [load]
  );

  const refresh = useCallback(() => run(false), [run]); // timer / manual refresh
  const retry = useCallback(() => run(true), [run]); // ask backend to re-read Sheets

  useEffect(() => {
    load(false);
    return () => {
      controllerRef.current?.abort();
      inFlightRef.current = false;
    };
  }, [load]);

  useAutoRefresh(refresh, refreshInterval);

  // Data is outdated if the backend says so, or we have old rows and can't update them
  const stale = Boolean(meta?.stale) || (Boolean(error) && staff.length > 0);
  const refreshStatus = error ? 'failed' : (meta?.refreshStatus ?? 'pending');
  const canRetry =
    errorStatus === 401 ||
    errorStatus === 403 ||
    errorStatus === 'AUTH_REQUIRED' ||
    errorStatus === 'FIREBASE_CONFIG_MISSING'
      ? false
      : meta
        ? meta.retryAvailable
        : Boolean(error);
  const responseMeta = {
    ...(meta ?? {}),
    lastUpdated,
    stale,
    refreshStatus,
    retryAvailable: canRetry,
  };

  return {
    staff,
    totalIn,
    skipped,
    loading,
    refreshing,
    error,
    errorStatus,
    permissionDenied: errorStatus === 403,
    unauthenticated: errorStatus === 401,
    meta: responseMeta,
    lastUpdated,
    stale,
    refreshStatus,
    canRetry,
    refresh,
    retry,
    refetch: retry,
  };
}