import { auth } from "./src/config/firebase.js";

const API_KEY = "AIzaSyAvvKmuL1PaYoV3qGRbXZBcNUZF9Il-FN4";
const TEST_UID = "test-admin-qasim";

async function runLiveAuthTest() {
  const customToken = await auth.createCustomToken(TEST_UID);
  const tokenRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  ).then(r => r.json());

  if (!tokenRes.idToken) {
    console.error("Failed to get ID token:", tokenRes);
    process.exit(1);
  }
  console.log("Real Firebase ID Token obtained!\n");

  const getRes = await fetch("http://localhost:5000/api/attendance", {
    headers: { Authorization: `Bearer ${tokenRes.idToken}` }
  }).then(r => r.json());
  console.log("GET /api/attendance response:", JSON.stringify(getRes, null, 2), "\n");

  const checkInRes = await fetch("http://localhost:5000/api/attendance/check-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenRes.idToken}`
    },
    body: JSON.stringify({ qrCode: "EMP004" })
  }).then(r => r.json());
  console.log("POST /api/attendance/check-in response:", JSON.stringify(checkInRes, null, 2));

  process.exit(0);
}

runLiveAuthTest().catch(err => { console.error(err); process.exit(1); });
