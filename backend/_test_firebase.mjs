import { auth } from "./src/config/firebase.js";

const PORT = process.env.PORT || 5000;
const API_KEY = "AIzaSyAvvKmuL1PaYoV3qGRbXZBcNUZF9Il-FN4";
const base = "http://127.0.0.1:" + PORT;

async function getIdToken(uid, claims = {}) {
  const customToken = await auth.createCustomToken(uid, claims);
  const res = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );
  const data = await res.json();
  if (!data.idToken) throw new Error("Token exchange failed: " + JSON.stringify(data));
  return data.idToken;
}

try {
  const noAuth = await fetch(base + "/api/attendance");
  console.log("1. 401 Missing Token:", noAuth.status, await noAuth.json());

  const badAuth = await fetch(base + "/api/attendance", {
    headers: { Authorization: "Bearer invalid-token-123" }
  });
  console.log("2. 401 Invalid Token:", badAuth.status, await badAuth.json());

  const staffToken = await getIdToken("test-staff-user", { role: "staff", status: "active" });
  const nonAdminRes = await fetch(base + "/api/attendance", {
    headers: { Authorization: "Bearer " + staffToken }
  });
  console.log("3. 403 Non-Admin Token:", nonAdminRes.status, await nonAdminRes.json());

  const adminToken = await getIdToken("test-admin-qasim", { role: "admin", status: "active" });
  const headers = { Authorization: "Bearer " + adminToken };

  const okRes = await fetch(base + "/api/attendance", { headers });
  const okBody = await okRes.json();
  console.log("4. 200 Valid Admin GET:", okRes.status, {
    success: okBody.success,
    count: okBody.count,
    hasAttendance: Array.isArray(okBody.attendance),
    hasData: Array.isArray(okBody.data)
  });

  const badDate = await fetch(base + "/api/attendance?date=not-a-date", { headers });
  console.log("5. 400 Invalid Date:", badDate.status, await badDate.json());

  process.exit(0);
} catch (err) {
  console.error("Test Error:", err);
  process.exit(1);
}
