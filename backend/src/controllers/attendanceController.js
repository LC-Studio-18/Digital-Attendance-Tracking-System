export const getAttendanceHistory = async (req, res, next) => {
    try {
        // 1. Extract query parameters for pagination (Subtask 04)
        // Default to page 1 and 50 items per page if not provided
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // 2. Mock User & Data (Subtask 03 & 04)
        // Later when Firebase is fixed, req.user will come from auth middleware.
        // For now, toggle role between 'admin' and 'staff' to test both scenarios!
        const mockUser = {
            uid: "user_12345",
            role: "admin" // Try changing this to "staff" to test role-based filtering
        };

        // Simulated raw attendance records (mimicking what will come from Google Sheets)
        const mockAttendanceRecords = [
            { id: 1, uid: "user_12345", date: "2026-11-01", status: "Present" },
            { id: 2, uid: "user_99999", date: "2026-11-01", status: "Absent" },
            { id: 3, uid: "user_12345", date: "2026-11-02", status: "Present" },
            { id: 4, uid: "user_88888", date: "2026-11-02", status: "Late" },
            // Add more mock items if you want to test pagination limits
        ];

        // 3. Implement Role-Based Fetching Logic (Subtask 03)
        let filteredRecords = [];
        if (mockUser.role === 'admin') {
            // Admins can see all records
            filteredRecords = mockAttendanceRecords;
        } else {
            // Staff can only see records matching their own UID
            filteredRecords = mockAttendanceRecords.filter(record => record.uid === mockUser.uid);
        }

        // 4. Apply Pagination (Subtask 04)
        const paginatedData = filteredRecords.slice(startIndex, endIndex);

        // 5. Send Response
        res.status(200).json({
            success: true,
            count: paginatedData.length,
            totalRecords: filteredRecords.length,
            currentPage: page,
            totalPages: Math.ceil(filteredRecords.length / limit),
            data: paginatedData
        });
    } catch (err) {
        next(err);
    }
};

// TODO: Replace mockUser with req.user once Firebase Auth middleware (Subtask 02) is resolved
// TODO: Replace mockAttendanceRecords with live Google Sheets query once config is ready