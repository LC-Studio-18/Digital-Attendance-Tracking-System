import {
  sortAttendanceRecords,
  buildAttendanceHistoryResponse,
} from '../utils/attendanceResponse.js';

export const getAttendanceHistory = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Temporary mock user until Firebase middleware is integrated
    const mockUser = {
      uid: 'user_12345',
      role: 'admin',
    };

    // Temporary mock attendance records until Google Sheets integration
    const mockAttendanceRecords = [
      { id: 1, uid: 'user_12345', date: '2026-11-01', status: 'Present' },
      { id: 2, uid: 'user_99999', date: '2026-11-01', status: 'Absent' },
      { id: 3, uid: 'user_12345', date: '2026-11-02', status: 'Present' },
      { id: 4, uid: 'user_88888', date: '2026-11-02', status: 'Late' },
    ];

    // Role-based filtering
    let filteredRecords = [];

    if (mockUser.role === 'admin') {
      filteredRecords = mockAttendanceRecords;
    } else {
      filteredRecords = mockAttendanceRecords.filter(
        (record) => record.uid === mockUser.uid,
      );
    }

    // Sort newest first before applying pagination
    const sortedRecords = sortAttendanceRecords(filteredRecords);

    // Apply pagination
    const paginatedData = sortedRecords.slice(startIndex, endIndex);

    // Format response, including empty results
    const response = buildAttendanceHistoryResponse({
      records: paginatedData,
      totalRecords: sortedRecords.length,
      page,
      limit,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
