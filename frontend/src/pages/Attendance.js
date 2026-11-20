import { useEffect, useState } from 'react';

const mockAttendance = [];

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);

      try {
        setAttendance(mockAttendance);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return <div className="loading">Loading attendance...</div>;
  }

  return <div>{attendance.length} attendance records</div>;
}