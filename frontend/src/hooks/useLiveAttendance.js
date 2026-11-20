import { useAttendance } from './useAttendance';

export function useLiveAttendance(options = {}) {
  const attendance = useAttendance(options);

  return {
    data: {
      records: attendance.staff,
      totalIn: attendance.totalIn,
    },
    meta: attendance.meta,
    error: attendance.error,
    loading: attendance.loading,
    refreshing: attendance.refreshing,
    permissionDenied: attendance.permissionDenied,
    unauthenticated: attendance.unauthenticated,
    refetch: attendance.refetch,
  };
}
