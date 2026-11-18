import { sheets } from '../config/sheets.js';
import { VALID_ROLES, ACTIVE_STATUS } from '../constants/roles.js';

const { SPREADSHEET_ID, USERS_SHEET_NAME } = process.env;

// Header text exactly as it appears in row 1 of the sheet
const COLUMNS = Object.freeze({
  UID: 'User ID (Firebase UID)',
  ROLE: 'Role (Staff/Admin)',
  STATUS: 'Status (Active/Inactive)',
});

const CACHE_TTL_MS = 60 * 1000; // re-read the sheet at most once a minute
let cache = { users: [], loadedAt: 0 };

const loadUsers = async () => {
  const isFresh = Date.now() - cache.loadedAt < CACHE_TTL_MS;
  if (isFresh) return cache.users;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${USERS_SHEET_NAME}'`, // whole tab, quotes allow spaces in the name
  });

  const [headerRow = [], ...rows] = response.data.values ?? [];
  const headers = headerRow.map((h) => String(h).trim());

  // Turn each row into an object keyed by the header names,
  // so the code doesn't depend on column order
  const users = rows.map((row) =>
    Object.fromEntries(headers.map((header, i) => [header, String(row[i] ?? '').trim()]))
  );

  cache = { users, loadedAt: Date.now() };
  return users;
};

export const getUserByFirebaseUid = async (uid) => {
  if (!uid) return null;
  const users = await loadUsers();
  return users.find((user) => user[COLUMNS.UID] === uid) ?? null;
};

/**
 * Returns 'Admin' or 'Staff' for a verified Firebase UID,
 * or null if the user is not found, not active, or has an invalid/blank role.
 * null must always be treated as NO ACCESS.
 */
export const getUserRoleByUid = async (uid) => {
  const user = await getUserByFirebaseUid(uid);
  if (!user) return null;
  if (user[COLUMNS.STATUS] !== ACTIVE_STATUS) return null;

  const role = user[COLUMNS.ROLE];
  return VALID_ROLES.includes(role) ? role : null;
};