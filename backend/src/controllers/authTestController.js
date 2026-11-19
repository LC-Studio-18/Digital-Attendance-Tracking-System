export const getProtectedTest = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'You are authenticated',
    uid: req.uid,
    email: req.user.email,
  });
};