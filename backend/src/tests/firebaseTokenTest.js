
const apiKey = process.env.FIREBASE_WEB_API_KEY;
const email = process.env.TEST_FIREBASE_EMAIL;
const password = process.env.TEST_FIREBASE_PASSWORD;

if (!apiKey || !email || !password) {
  console.error('Missing Firebase test variables.');
  process.exit(1);
}

try {
  // Sign in to Firebase and obtain an ID token.
  const loginResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );

  const loginData = await loginResponse.json();

  if (!loginResponse.ok) {
    console.error('Firebase login failed:', loginData.error?.message);
    process.exit(1);
  }

  console.log('Firebase login successful!');

  // Test the protected backend route.
  const testResponse = await fetch(
    'http://localhost:5000/api/protected-test',
    {
      headers: {
        Authorization: `Bearer ${loginData.idToken}`,
      },
    },
  );

  const result = await testResponse.json();

  console.log('Backend authentication status:', testResponse.status);
  console.log('Backend response:', result);

} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
