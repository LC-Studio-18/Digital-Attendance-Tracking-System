
import {
  appendAttendanceRow,
  findTodayCheckin,
} from '../services/googleSheetsService.js';

export async function qrCheckin(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a JSON object',
      });
    }

    if (Object.keys(req.body).some((field) => field !== 'locationId')) {
      return res.status(400).json({
        success: false,
        message: 'Request body contains unexpected fields',
      });
    }

    const { locationId } = req.body;

    if (
      typeof locationId !== 'string' ||
      !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(locationId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'locationId must be a non-empty, hyphen-separated alphanumeric string',
      });
    }

    const normalizedLocationId = locationId.trim();

    const validLocationIds = (process.env.VALID_LOCATION_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!validLocationIds.includes(normalizedLocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code or unknown location',
      });
    }

    const userId = req.user.uid;

    const alreadyCheckedIn = await findTodayCheckin(userId);

    if (alreadyCheckedIn) {
      return res.status(409).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const timestamp = new Date().toISOString();

    await appendAttendanceRow({
      userID: userId,
      timestamp,
      eventType: 'Clock-in',
      locationId: normalizedLocationId,
      comment: 'QR scan',
    });

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: {
        timestamp,
        userId,
        locationId: normalizedLocationId,
      },
    });
  } catch (err) {
    next(err);
  }
}
