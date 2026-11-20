export const sortAttendanceRecords = (records = []) => {
  const getTimestamp = (record) => {
    for (const value of [record?.timestamp, record?.date]) {
      if (value instanceof Date) {
        const timestamp = value.getTime();
        if (Number.isFinite(timestamp)) return timestamp;
        continue;
      }

      if (typeof value === 'string' && value.trim()) {
        const timestamp = Date.parse(value.trim());
        if (Number.isFinite(timestamp)) return timestamp;
      }
    }

    return null;
  };

  return [...records].sort((a, b) => {
    const aTimestamp = getTimestamp(a);
    const bTimestamp = getTimestamp(b);

    if (aTimestamp === null) return bTimestamp === null ? 0 : 1;
    if (bTimestamp === null) return -1;
    return bTimestamp - aTimestamp;
  });
};

export const buildAttendanceHistoryResponse = ({
  records = [],
  totalRecords = 0,
  page = 1,
  limit = 50,
} = {}) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeTotalRecords =
    Number.isSafeInteger(totalRecords) && totalRecords >= 0 ? totalRecords : 0;
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? limit : 20;

  return {
    success: true,
    count: safeRecords.length,
    totalRecords: safeTotalRecords,
    currentPage: safePage,
    totalPages:
      safeTotalRecords === 0 ? 0 : Math.ceil(safeTotalRecords / safeLimit),
    data: safeRecords,
  };
};
