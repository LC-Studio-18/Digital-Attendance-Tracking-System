import { useState, useEffect } from "react";

function AttendanceList() {

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
  const fetchAttendance = async () => {
    setLoading(true);

    try {
      // Load your mock attendance data here

const mockAttendance = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Mubaarik Davids",
    date: "2026-11-18",
    checkIn: "08:00",
    checkOut: "16:30",
    status: "Present",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Charlie Kirk",
    date: "2026-11-18",
    checkIn: "08:15",
    checkOut: "16:30",
    status: "Late",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Rosa Parks",
    date: "2026-11-18",
    checkIn: "07:55",
    checkOut: "16:30",
    status: "Present",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Logan Paul",
    date: "2026-11-18",
    checkIn: "--",
    checkOut: "--",
    status: "Absent",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Hariet Tubman",
    date: "2026-11-18",
    checkIn: "08:05",
    checkOut: "16:30",
    status: "Present",
  },
  {
    id: 6,
    employeeId: "EMP006",
    name: "George Droyd",
    date: "2026-11-18",
    checkIn: "08:25",
    checkOut: "16:30",
    status: "Late",
  },
  {
    id: 7,
    employeeId: "EMP007",
    name: "Michelle Obama",
    date: "2026-11-18",
    checkIn: "07:50",
    checkOut: "16:30",
    status: "Present",
  },
  {
    id: 8,
    employeeId: "EMP008",
    name: "LeBron James",
    date: "2026-11-18",
    checkIn: "--",
    checkOut: "--",
    status: "Absent",
  },
];

      setAttendance(mockAttendance);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAttendance();
}, []);

  return (
    <div>
      {loading ? "Loading attendance..." : `Attendance records: ${attendance.length}`}
    </div>
  );
}

export default AttendanceList;