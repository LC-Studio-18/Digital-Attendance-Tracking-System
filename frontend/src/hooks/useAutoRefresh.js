import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback, intervalMs = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!intervalMs) return undefined;

    const id = setInterval(() => {
      if (!document.hidden) savedCallback.current(); // this functionn skips while tab is hidden
    }, intervalMs);

    return () => clearInterval(id); // cleans up on the unmount
  }, [intervalMs]);
}
