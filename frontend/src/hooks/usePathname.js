import { useSyncExternalStore } from 'react';

const subscribe = (callback) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};

const getPathname = () => window.location.pathname || '/';

export const navigateTo = (path, { replace = false } = {}) => {
  if (window.location.pathname === path) return;

  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const usePathname = () =>
  useSyncExternalStore(subscribe, getPathname, () => '/');
