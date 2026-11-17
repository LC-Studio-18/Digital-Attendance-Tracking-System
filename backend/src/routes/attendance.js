const express = require('express');
const router = express.Router();

// Placeholder for now — we'll fill this in step by step
router.post('/qr-checkin', (req, res) => {
  res.status(200).json({ success: true, message: 'placeholder' });
});

module.exports = router;