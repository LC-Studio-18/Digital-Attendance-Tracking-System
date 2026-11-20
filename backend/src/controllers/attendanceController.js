import { appendRow, findTodayCheckin, } from '../services/googleSheetsService.js';
import { getEmployeeByUid } from '../services/employeeService.js';
import { randomUUID } from 'node:crypto';

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
      locationId !== locationId.trim() ||
      !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(locationId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'locationId must be a non-empty, hyphen-separated alphanumeric string',
      });
    }

    const validLocationIds = (process.env.VALID_LOCATION_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!validLocationIds.includes(locationId)) {
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

    await appendRow('Attendance', [
      randomUUID(),
      timestamp,
      req.user.uid,
      'Clock In',
      locationId,
      '',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: { timestamp, userId: req.user.uid },
    });
  } catch (err) {
    next(err);
  }
}



export async function getMyDashboard(req, res, next) {
  try {
    const uid = req.user.uid;

    const employee = await getEmployeeByUid(uid);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    if (!employee.active) {
      return res.status(403).json({
        success: false,
        message: 'Employee is not active',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: employee.name,
        status: employee.active ? 'Present' : 'Inactive',
        lastClockIn: employee.lastClockIn,
        lastClockOut: employee.lastClockOut,
        history: employee.history,
      },
    });
  } catch (err) {
    next(err);
  }
}
