
/**
 * ============================================================
 * ONSITE SERVICE - GOOGLE SHEETS INTEGRATION TEST
 * ============================================================
 *
 * PURPOSE:
 * - Test the actual connection to Google Sheets.
 * - Retrieve the real Users and Events spreadsheet data.
 * - Run the complete onsite employee calculation.
 * - Verify that the service returns a valid employee count.
 *
 * Unlike the unit tests, this test does not supply hardcoded
 * employee records or clock events.
 */

// Import Node.js test functionality.
import test from "node:test";

// Import assertion tools.
import assert from "node:assert/strict";

// Import the function that retrieves actual spreadsheet data
// and calculates the current onsite employee count.
import {
  getCurrentOnsiteCountFromSheets,
} from "../src/services/onSiteService.js";

test(
  "Reads Google Sheets and calculates the current onsite count",
  async () => {

    // This calls the complete service.
    // It connects to Google Sheets, retrieves the Users and
    // Events tabs, processes their records, and calculates
    // how many active employees are currently onsite.
    const onsiteCount = await getCurrentOnsiteCountFromSheets();

    // Verify that the returned value is a number.
    assert.equal(typeof onsiteCount, "number");

    // Verify that the count is a whole number.
    assert.ok(Number.isInteger(onsiteCount));

    // An employee count cannot be negative.
    assert.ok(onsiteCount >= 0);

    // Display the result retrieved from the real spreadsheet.
    console.log(
      `Current onsite employees from Google Sheets: ${onsiteCount}`
    );
  }
);

