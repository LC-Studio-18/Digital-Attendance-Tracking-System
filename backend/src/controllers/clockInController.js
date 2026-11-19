import { getStaffMember, recordClockIn } from '../services/sheets.js';

const fail = (status, message) => Object.assign(new Error(message), { status });

const VALID_LOCATIONS = (process.env.VALID_LOCATION_IDS || '')
  .split(',').map((l) => l.trim()).filter(Boolean);

export async function clockIn(req, res) {
  const { uid } = req.user;
  const { locationId } = req.body ?? {};

  const staff = await getStaffMember(uid);
  if (!staff || !staff.active) throw fail(403, 'Not an active staff member');

  if (locationId && !VALID_LOCATIONS.includes(locationId)) {
    throw fail(400, 'Invalid location ID');
  }

  if (staff.status === 'IN') throw fail(409, 'Already clocked in');

  const timestamp = new Date().toISOString();
  await recordClockIn({ ...staff, uid, locationId: locationId || '', timestamp });

  res.status(201).json({ status: 'success', message: 'Clocked in', timestamp });
}