import {
  sortAttendanceRecords,
  buildAttendanceHistoryResponse,
} from '../utils/attendanceResponse.js';

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { uid, role } = req.user;

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Temporary mock attendance records until Google Sheets integration
    const mockAttendanceRecords = [
      { id: 1, uid: 'user_12345', date: '2026-11-01', status: 'Present' },
      { id: 2, uid: 'user_99999', date: '2026-11-01', status: 'Absent' },
      { id: 3, uid: 'user_12345', date: '2026-11-02', status: 'Present' },
      { id: 4, uid: 'user_88888', date: '2026-11-02', status: 'Late' },
    ];

    // Admins can view all records; staff can view only their own.
    let filteredRecords;

    if (role === 'admin') {
      filteredRecords = mockAttendanceRecords;
    } else if (role === 'staff') {
      filteredRecords = mockAttendanceRecords.filter(
        (record) => record.uid === uid,
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid role',
      });
    }

    // Sort newest first before applying pagination
    const sortedRecords = sortAttendanceRecords(filteredRecords);
    const paginatedData = sortedRecords.slice(startIndex, endIndex);

    const response = buildAttendanceHistoryResponse({
      records: paginatedData,
      totalRecords: sortedRecords.length,
      page,
      limit,
    });

    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};