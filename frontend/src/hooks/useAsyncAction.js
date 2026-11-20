import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps ANY async function (your login, clockIn, clockOut, fetchStaff...)
 * and tracks its status: idle | loading | success | error.
 * A second call while one is still running is ignored, which prevents
 * duplicate submissions (double taps, double clicks).
 *
 * The hook never calls the API itself and never invents data: `data` is
 * whatever your function returns, `error` is whatever it throws.
 */
export function useAsyncAction(action) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (...args) => {
    if (pendingRef.current) return undefined;
    pendingRef.current = true;
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await actionRef.current(...args);
      if (mountedRef.current) setState({ status: 'success', data, error: null });
      return data;
    } catch (error) {
      if (mountedRef.current) setState({ status: 'error', data: null, error });
      return undefined;
    } finally {
      pendingRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    if (!pendingRef.current) setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    ...state,
    run,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}

export default useAsyncAction;