
/**
 * ENVIRONMENT CONFIGURATION TEST
 *
 * Checks whether the shared backend .env file is loaded
 * and whether the required credentials are available.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Locate the shared .env file in the backend root.
const envPath = fileURLToPath(
  new URL("../../.env", import.meta.url)
);

// Load the environment variables.
dotenv.config({ path: envPath });

// Check whether each required variable is available.
// Secret values are never printed.
const checks = {
  clientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
  spreadsheetId: !!process.env.SPREADSHEET_ID,
  googleKey: !!process.env.GOOGLE_PRIVATE_KEY,
  firebaseKey: !!process.env.FIREBASE_PRIVATE_KEY,
};

// Display the results.
console.log("\nENVIRONMENT CONFIGURATION CHECK\n");

for (const [name, passed] of Object.entries(checks)) {
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}`);
}

// Report whether all required variables were loaded.
const allPassed = Object.values(checks).every(Boolean);

console.log(
  allPassed
    ? "\nAll required environment variables are loaded."
    : "\nSome environment variables are missing."
);

if (!allPassed) {
  process.exitCode = 1;
}
