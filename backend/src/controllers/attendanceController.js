import { appendRow, findTodayCheckin } from '../services/googleSheetsService.js';

export async function qrCheckin(req, res, next) {
  try {
    const { locationId } = req.body;

    if (locationId !== process.env.VALID_LOCATION_IDS) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code or unknown location',
      });
    }
    const alreadyCheckedIn = await findTodayCheckin('Attendance', req.user.uid);

    if (alreadyCheckedIn) {
      return res.status(409).json({
      success: false,
      message: 'Already checked in today',
      });
    }

    const timestamp = new Date().toISOString();

    await appendRow('Attendance', [req.user.uid, timestamp]);

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: { timestamp, userId: req.user.uid },
    });
  } catch (err) {
    next(err);
  }
}