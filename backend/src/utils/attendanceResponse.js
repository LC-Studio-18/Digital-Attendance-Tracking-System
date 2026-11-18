export const sortAttendanceRecords = (records = []) => {
  return [...records].sort((a, b) =>
    String(b.date ?? '').localeCompare(String(a.date ?? ''))
  );
};

export const buildAttendanceHistoryResponse = ({
  records = [],
  totalRecords = 0,
  page = 1,
  limit = 50,
} = {}) => ({
  success: true,
  count: records.length,
  totalRecords,
  currentPage: page,
  totalPages: totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit),
  data: records,
});
