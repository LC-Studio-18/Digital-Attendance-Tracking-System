export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.status || 500; //[cite: 1, 2]
  const message = err.message || 'Unable to retrieve attendance records. Please try again later.'; //[cite: 2]

  res.status(statusCode).json({
    success: false,
    status: 'error',
    error: message,
    message,
  });
};