# ST-05 - Add Loading State and Prevent Double Submission

## Information

- Ticket ID: S1-19
- Assigned developer: Imaan
- Current QA status: Pass

## Objective

- Provide visible feedback during login and prevent duplicate authentication submissions.

## Acceptance Criteria

- [✓] Login button displays a loading state while authentication is pending.
- [✓] Additional login submissions are prevented while the first request is pending.
- [✓] Additional login submissions are prevented while the first request is pending.
- [✓] Loading state ends after successful authentication.
- [✓] Loading state ends after failed authentication.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-01 | Submit login credentials with network throttling | Loading state is visible while request is pending | Pass |
| TC-02 | Attempt multiple clicks during login | Only one authentication submission occurs | Pass |
| TC-03 | Complete a successful login | Loading state ends and application proceeds | Pass |
| TC-04 | Submit incorrect credentials | Loading state ends and user can retry | Pass |


## Testing History

### 19 November 2026 - Loading State and Duplicate Submission Testing

- Tester: Team 3 QA
- Test case ID: TC-01, TC-02, TC-03, TC-04.
- Branch: `QA3`, testing work from `frontend3-feature/s1-07-admin-controls`.
- Commit SHA: Not captured at execution time.
- Environment: Windows, React, Vite, local browser with Developer Tools and 3G network throttling.
- Preconditions: Firebase Web app configuration completed; valid Firebase test account available; login page accessible.

#### Steps to Reproduce

1. Open the login page in the browser.
2. Open Developer Tools and select the Network tab.
3. Set network throttling to 3G.
4. Enter a correctly formatted email address and an incorrect test password.
5. Click Login once and observe the button while Firebase processes the authentication request.
6. Verify that the loading state ends after authentication fails.
7. Repeat the login process using valid Firebase credentials.
8. Verify that the loading state ends and authentication succeeds.
9. Return to the login page.
10. Clear the Network log and enter a correctly formatted email address with an incorrect test password.
11. Click Login repeatedly while authentication is processing.
12. Filter the Network tab for `signInWithPassword` and count the authentication requests generated.

#### Expected Result

- The Login button displays a visible loading indicator while authentication is pending.
- The Login button becomes disabled during authentication.
- Repeated clicks do not generate multiple authentication requests.
- The loading state ends after unsuccessful authentication.
- The loading state ends after successful authentication, allowing the application to proceed.

#### Actual Result

- The Login button text changed to "Logging".
- A loading spinner appeared while Firebase processed the authentication request.
- The Login button became disabled during authentication.
- After incorrect credentials were rejected, the loading state ended.
- After valid credentials were accepted, the loading state ended and login completed successfully.
- Repeated clicks generated only one `signInWithPassword` authentication request, as observed in the Network tab.

#### Result

- TC-01: Pass.
- TC-02: Pass.
- TC-03: Pass.
- TC-04: Pass.

**Overall Result: Pass (4/4 test cases).**

#### Bug Reference

None.

#### Evidence

- Manual browser observations reported by QA.
- Browser Developer Tools Network tab used to verify authentication request count.
- One `signInWithPassword` request observed during the repeated-click test.
- No screenshots or exported network logs recorded.

#### Notes

- All four functional test cases passed in the local testing environment.
- The disabled Login button and single authentication request support successful duplicate-submission prevention for the tested scenario.
- Testing was performed using 3G network throttling to make the loading state observable.
- The exact commit SHA tested was not recorded.
- Testing results apply to the observed local implementation; additional browser and device combinations were not tested.
