import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback, intervalMs = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!(intervalMs > 0)) return undefined; // 0, negative or invalid = off

    const tick = () => {
      if (!document.hidden) savedCallback.current();
    };

    const id = setInterval(tick, intervalMs);
    // Refresh straight away when the user comes back to the tab
    document.addEventListener('visibilitychange', tick);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [intervalMs]);
}
