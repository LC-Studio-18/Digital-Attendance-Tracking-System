export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Digital Attendance Tracking System API is running',
  });
};