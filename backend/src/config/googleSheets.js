import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  return key
    .trim()
    .replace(/^["']|["'],?$/g, '') // Remove accidental outer quotes or trailing commas
    .replace(/\\n/g, '\n');        // Convert literal \n into real newlines
};

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/^["']|["'],?$/g, ''),
    private_key: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const sheetsClient = google.sheets({ version: 'v4', auth });
export const spreadsheetId = process.env.SPREADSHEET_ID?.trim().replace(/^["']|["'],?$/g, '');
