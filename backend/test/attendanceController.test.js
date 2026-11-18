
/**
 * ============================================================
 * ATTENDANCE CONTROLLER TESTS
 * ============================================================
 *
 * PURPOSE:
 * - Verify successful attendance refreshes.
 * - Verify failed refresh handling.
 * - Ensure successful cached data is preserved after failure.
 * - Ensure lastUpdated changes only after success.
 * - Verify duplicate employees are not counted twice.
 * - Verify conflicting events are not counted as onsite.
 * - Verify manual refresh can recover after a failure.
 * - Verify overlapping refreshes do not run concurrently.
 *
 * RUN:
 * npm test
 */

// Node.js built-in testing functionality.
import test from "node:test";

// Node.js assertion tools.
import assert from "node:assert/strict";

// Import the controller functions being tested.
import {
  refreshAttendance,
  getLiveAttendance,
  refreshLiveAttendance,
  setAttendanceDataProvider,
  resetAttendanceControllerForTests,
} from "../src/controllers/attendanceController.js";

// ============================================================
// 1. TEST HELPERS
// ============================================================

/**
 * Creates timestamps relative to the current test time.
 *
 * WHY:
 * Fixed dates can become future timestamps as time passes.
 * Relative timestamps keep the tests reliable.
 */
function createPastTimestamp(minutesAgo) {
  return new Date(
    Date.now() - minutesAgo * 60 * 1000
  ).toISOString();
}

/**
 * Creates a mock Express response object.
 *
 * WHY:
 * We can test the controller's HTTP responses without starting
 * an actual Express server or making network requests.
 */
function createMockResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    },
  };
}

/**
 * Runs an Express controller handler with a mock response.
 */
async function callController(handler) {
  const response = createMockResponse();

  await handler({}, response);

  return response;
}

/**
 * Resets the controller before and after each isolated test.
 *
 * WHY:
 * Each test needs its own starting cache and data provider.
 * One test must not affect the results of another test.
 */
async function runIsolatedTest(callback) {
  resetAttendanceControllerForTests();

  try {
    await callback();
  } finally {
    resetAttendanceControllerForTests();
  }
}

// ============================================================
// 2. SUCCESSFUL REFRESH
// ============================================================

test(
  "Stores valid attendance data after a successful refresh",
  async () => {
    await runIsolatedTest(async () => {
      // Supply controlled attendance records.
      setAttendanceDataProvider(async () => [
        {
          staffId: "UID001",
          name: "Employee One",
          status: "IN",
          lastClockTime: createPastTimestamp(30),
        },
        {
          staffId: "UID002",
          name: "Employee Two",
          status: "OUT",
          lastClockTime: createPastTimestamp(20),
        },
      ]);

      const state = await refreshAttendance();

      assert.equal(state.refreshSuccess, true);
      assert.equal(state.hasEverSucceeded, true);
      assert.equal(state.totalIn, 1);
      assert.equal(state.records.length, 2);

      assert.ok(state.lastUpdated);
      assert.ok(state.lastAttemptAt);

      assert.equal(state.lastError, null);
    });
  }
);

// ============================================================
// 3. DUPLICATE EMPLOYEE HANDLING
// ============================================================

test(
  "Counts each employee once and uses their latest event",
  async () => {
    await runIsolatedTest(async () => {
      setAttendanceDataProvider(async () => [
        {
          staffId: "UID001",
          name: "Employee One",
          status: "IN",
          lastClockTime: createPastTimestamp(30),
        },
        {
          staffId: "UID001",
          name: "Employee One",
          status: "OUT",
          lastClockTime: createPastTimestamp(5),
        },
        {
          staffId: "UID002",
          name: "Employee Two",
          status: "IN",
          lastClockTime: createPastTimestamp(10),
        },
      ]);

      const state = await refreshAttendance();

      // Two unique employees must remain in the records.
      assert.equal(state.records.length, 2);

      // Employee One's newer Clock Out determines their status.
      const employeeOne = state.records.find(
        (record) => record.staffId === "UID001"
      );

      assert.equal(employeeOne.status, "OUT");

      // Only Employee Two is currently counted as onsite.
      assert.equal(state.totalIn, 1);
    });
  }
);

// ============================================================
// 4. CONFLICTING EVENT HANDLING
// ============================================================

test(
  "Does not count conflicting statuses with identical timestamps",
  async () => {
    await runIsolatedTest(async () => {
      const sharedTimestamp = createPastTimestamp(10);

      setAttendanceDataProvider(async () => [
        {
          staffId: "UID001",
          name: "Employee One",
          status: "IN",
          lastClockTime: sharedTimestamp,
        },
        {
          staffId: "UID001",
          name: "Employee One",
          status: "OUT",
          lastClockTime: sharedTimestamp,
        },
      ]);

      const state = await refreshAttendance();

      assert.equal(state.records.length, 1);
      assert.equal(state.records[0].status, "UNKNOWN");
      assert.equal(state.totalIn, 0);
    });
  }
);

// ============================================================
// 5. FAILED REFRESH AND CACHE PRESERVATION
// ============================================================

test(
  "Preserves previous data and successful timestamp after failure",
  async () => {
    await runIsolatedTest(async () => {
      // First refresh succeeds and populates the cache.
      setAttendanceDataProvider(async () => [
        {
          staffId: "UID001",
          name: "Employee One",
          status: "IN",
          lastClockTime: createPastTimestamp(15),
        },
      ]);

      const successfulState = await refreshAttendance();

      const previousRecords = successfulState.records;
      const previousTotal = successfulState.totalIn;
      const previousTimestamp = successfulState.lastUpdated;

      // Replace the provider with one that simulates a source failure.
      setAttendanceDataProvider(async () => {
        throw new Error("Simulated upstream failure");
      });

      const failedState = await refreshAttendance();

      assert.equal(failedState.refreshSuccess, false);

      // Previous successfully retrieved records must remain.
      assert.deepEqual(
        failedState.records,
        previousRecords
      );

      // The previously successful onsite total must remain.
      assert.equal(
        failedState.totalIn,
        previousTotal
      );

      // A failed refresh must not change lastUpdated.
      assert.equal(
        failedState.lastUpdated,
        previousTimestamp
      );

      // The failed attempt must have its own timestamp.
      assert.ok(failedState.lastAttemptAt);

// Verify that the failed refresh attempt has a valid timestamp.
// Two separate operations may occur within the same millisecond,
// so this timestamp is not required to differ from lastUpdated.
assert.ok(
  Number.isFinite(Date.parse(failedState.lastAttemptAt)),
  "Failed refresh should have a valid attempt timestamp."
);

      // The API should identify the cached data as stale.
      const response = await callController(getLiveAttendance);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.meta.refreshStatus, "failed");
      assert.equal(response.body.meta.stale, true);
      assert.equal(response.body.meta.retryAvailable, true);

      assert.equal(
        response.body.meta.lastUpdated,
        previousTimestamp
      );
    });
  }
);

// ============================================================
// 6. INITIAL REFRESH FAILURE
// ============================================================

test(
  "Returns an unavailable response when no successful data exists",
  async () => {
    await runIsolatedTest(async () => {
      setAttendanceDataProvider(async () => {
        throw new Error("Simulated initial connection failure");
      });

      await refreshAttendance();

      const response = await callController(getLiveAttendance);

      assert.equal(response.statusCode, 503);
      assert.equal(response.body.ok, false);

      assert.equal(
        response.body.meta.refreshStatus,
        "failed"
      );

      assert.equal(
        response.body.meta.lastUpdated,
        null
      );

      assert.equal(
        response.body.meta.retryAvailable,
        true
      );

      assert.equal(
        response.body.data.records.length,
        0
      );
    });
  }
);

// ============================================================
// 7. MANUAL RETRY AND RECOVERY
// ============================================================

test(
  "Manual refresh recovers after a previous failure",
  async () => {
    await runIsolatedTest(async () => {
      let providerCalls = 0;

      // The first request fails.
      // The second request succeeds.
      setAttendanceDataProvider(async () => {
        providerCalls += 1;

        if (providerCalls === 1) {
          throw new Error("Simulated temporary failure");
        }

        return [
          {
            staffId: "UID001",
            name: "Employee One",
            status: "IN",
            lastClockTime: createPastTimestamp(5),
          },
        ];
      });

      await refreshAttendance();

      const failedResponse = await callController(
        getLiveAttendance
      );

      assert.equal(failedResponse.body.meta.refreshStatus, "failed");

      // The manual refresh endpoint should perform another attempt.
      const retryResponse = await callController(
        refreshLiveAttendance
      );

      assert.equal(retryResponse.statusCode, 200);
      assert.equal(retryResponse.body.ok, true);

      assert.equal(
        retryResponse.body.meta.refreshStatus,
        "success"
      );

      assert.equal(
        retryResponse.body.meta.stale,
        false
      );

      assert.equal(
        retryResponse.body.meta.retryAvailable,
        false
      );

      assert.equal(retryResponse.body.data.totalIn, 1);
      assert.equal(providerCalls, 2);
    });
  }
);

// ============================================================
// 8. EMPTY ATTENDANCE DATA
// ============================================================

test(
  "Treats an empty valid data source as a successful zero-employee result",
  async () => {
    await runIsolatedTest(async () => {
      setAttendanceDataProvider(async () => []);

      const state = await refreshAttendance();

      assert.equal(state.refreshSuccess, true);
      assert.equal(state.hasEverSucceeded, true);
      assert.equal(state.records.length, 0);
      assert.equal(state.totalIn, 0);
      assert.ok(state.lastUpdated);
    });
  }
);

// ============================================================
// 9. OVERLAPPING REFRESH PROTECTION
// ============================================================

test(
  "Reuses an active refresh instead of starting another one",
  async () => {
    await runIsolatedTest(async () => {
      let providerCalls = 0;

      setAttendanceDataProvider(async () => {
        providerCalls += 1;

        // Simulate a slower upstream request.
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });

        return [
          {
            staffId: "UID001",
            name: "Employee One",
            status: "IN",
            lastClockTime: createPastTimestamp(5),
          },
        ];
      });

      // Start two refresh requests before the first one finishes.
      const firstRefresh = refreshAttendance();
      const secondRefresh = refreshAttendance();

      await Promise.all([
        firstRefresh,
        secondRefresh,
      ]);

      // Only one upstream request should have been made.
      assert.equal(providerCalls, 1);
    });
  }
);
