# ST-20a - Develop attendance history page 

### Information

**Ticket ID**: S1-16 <br> 
**Assigned developer**: Rasool Federicks <br>
**Current QA status**: Pass <br> 

### Objective
- Design Loading State: Create the design for the page while it is fetching data from the server. <br>

### Acceptance Criteria
[x]  The page displays a clear table/list of attendance records.<br> 
[x]  If logged in as Staff, the page only shows the logged-in user’s records.<br> 
[x]  If logged in as Admin, the page shows all staff records.<br> 
[x]  The UI matches the approved Figma design.<br>
[x]  The page is fully responsive (mobile 320px+ and desktop).<br>
[x]  A loading state is displayed while fetching data.

## Test Cases

| Test ID | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| TC-20a-C07 | Verify build of page and loading | Create the React page component and set up the route | Pass |
| TC-20a-C08 | Verify implementation of role-based rendering | Logic to check the Firebase token. | Pass |
| TC-20a-C09 | Verify API intergration | Connect the page to the attendance history endpoint  | Pass |
| TC-20a-C10 | Verify implementation of UI States | Loading state and the Empty State based on the Figma designs | Pass |


## Linked Bugs

None recorded.

## Testing History

### 20 November 2026, 13:04 SAST -  test

- Tester: Kirsten
- Test case ID: TC-20a-C07
- Branch: frontend6-feature/s1-20a-routes
- Environment: Windows, Chrome (Desktop & 360px Mobile Viewport), local Vite preview (`http://localhost:5173`), React and Vite
- Preconditions: Developer feature branch loaded locally and Vite development server running.

#### Steps to Reproduce

1. Start the local Vite development server and open the component showcase preview (`http://localhost:5173`).
2. Inspect React components and routes.
3. Inspect logic to check the Firebase token.
4. Inspect connection in the page to the GET /api/v1/attendance/history endpoint using Axios/Fetch.
5. Trigger **live demo**, **success messages**, **error messages**, and **loaders**  buttons in live demo
6. Resize the browser viewport to `360px` width in Chrome DevTools to verify mobile responsiveness and icon/text pairing.

#### Expected Result

- All React components and routes are working, Logic to the firebase token are present and operative, connection to the page is accurate, mobile responsiveness.

#### Actual Result

- React components and routes are working provided with a live demo
- Logic to firebase token is present and operative
- Connection to the page is present and operative
- Components are responvsive

#### Result

Pass

#### Bug Reference

None.

#### Evidence

- `[(image-1.png)] `
- `[(image-2.png)] `
- `[(image-3.png)] `
- `[(image-4.png)] `

