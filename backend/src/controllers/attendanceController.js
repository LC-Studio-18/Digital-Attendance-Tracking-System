// Demo records for GET /api/attendance until a database is connected.
const attendance = [
  { id: 1, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-18', checkIn: '08:30', checkOut: '--', status: 'On premises' },
  { id: 2, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-17', checkIn: '08:30', checkOut: '16:32', status: 'Present' },
  { id: 3, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-16', checkIn: '08:27', checkOut: '16:32', status: 'Present' },
  { id: 4, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-13', checkIn: '08:35', checkOut: '16:30', status: 'Present' },
  { id: 5, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-12', checkIn: '09:12', checkOut: '16:35', status: 'Late' },
  { id: 6, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-11', checkIn: '08:29', checkOut: '16:31', status: 'Present' },
  { id: 7, employeeId: 'EMP001', name: 'Mubaarik Davids', date: '2026-11-10', checkIn: '08:31', checkOut: '16:30', status: 'Present' },
];

export const getAttendance = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { attendance },
  });
};
