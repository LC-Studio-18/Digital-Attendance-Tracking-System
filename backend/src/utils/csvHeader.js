export const setCsvDownloadHeaders = (res, filename = 'attendance.csv') => {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeFilename}"`,
  );
};