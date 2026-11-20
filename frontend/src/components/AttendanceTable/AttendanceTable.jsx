import "./AttendanceTable.css";

export default function AttendanceTable({ records, busy }) {
  return (
    <div className="attendance-table__wrapper" aria-busy={busy}>
      <table className={`attendance-table ${busy ? "attendance-table--busy" : ""}`}>
        <caption className="attendance-table__caption">Attendance records</caption>
        <thead>
          <tr>
            <th scope="col">Employee</th>
            <th scope="col">Date</th>
            <th scope="col">Check in</th>
            <th scope="col">Check out</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={`${record.employeeId}-${record.date}`}>
              <td>
                {record.employeeName} ({record.employeeId})
              </td>
              <td>{record.date}</td>
              <td>{record.checkIn || "-"}</td>
              <td>{record.checkOut || "-"}</td>
              <td>{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
