import { createContext, useContext } from 'react';

/*
 * Shared home for the attendance records fetched by AttendanceHistoryPage.
 *
 * The context is readable without a provider (it returns empty arrays and
 * no-op setters), so existing screens and tests keep working in isolation.
 * Wrap the app in AttendanceDataProvider to actually share the data, e.g.
 * with the S2-03 CSV export screen.
 */
export const AttendanceDataContext = createContext({
  attendanceData: [],
  visibleAttendanceData: [],
  setAttendanceData: () => {},
  setVisibleAttendanceData: () => {},
});

/** Returns plain record arrays plus their setters. Safe outside a provider. */
export function useAttendanceData() {
  return useContext(AttendanceDataContext);
}
