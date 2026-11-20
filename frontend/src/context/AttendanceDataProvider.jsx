import { useMemo, useState } from 'react';
import { AttendanceDataContext } from './attendanceDataStore.js';

export function AttendanceDataProvider({ children }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [visibleAttendanceData, setVisibleAttendanceData] = useState([]);

  const value = useMemo(
    () => ({
      attendanceData,
      visibleAttendanceData,
      setAttendanceData,
      setVisibleAttendanceData,
    }),
    [attendanceData, visibleAttendanceData]
  );

  return (
    <AttendanceDataContext.Provider value={value}>
      {children}
    </AttendanceDataContext.Provider>
  );
}

export default AttendanceDataProvider;
