import dotenv from 'dotenv';
const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'SPREADSHEET_ID', 'SHEET_RANGE'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env variables: ${missing.join(', ')}`);
  process.exit(1);
}
dotenv.config();

const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});