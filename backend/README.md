# Digital Attendance Tracking System – Backend

## Overview

The backend provides the API server for the Digital Attendance Tracking System, built using Node.js and Express. Authentication uses Firebase: the frontend signs users in, and the backend verifies their Firebase ID tokens.

## Prerequisites

- Node.js (LTS)
- npm
- Access to the team's Firebase project (ask the team lead for the credentials)

## Installation

From the project root:

```bash
cd backend
npm install
```

## Environment Configuration

Create a `.env` file in the backend directory using `.env.example` as a reference.

Required variables:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_YOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### Firebase credentials

1. Firebase console → Project settings → Service accounts → Generate new private key.
2. From the downloaded JSON, copy `project_id`, `client_email`, and `private_key` into your local `backend/.env`.
3. Copy only the value, not the JSON syntax: no quotes or trailing comma on the ID and email.
4. Keep `private_key` on one line, in double quotes, with `\n` left as text.
5. Delete the downloaded JSON, or store it outside the repo. Never commit it or share it in chat.
6. Ask the team lead for the credentials rather than generating a new key.
7. After editing `.env`, fully restart the server (Ctrl+C, then `npm run dev`). Nodemon does not reload it.

## Running the Server

Development mode (automatically restarts when code files change):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server runs at:

`http://localhost:5000`

## Available Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Checks whether the API is running |
| GET | `/api/protected-test` | Firebase ID token | Returns the authenticated user's `uid` and `email` |

### Authenticating requests

Protected endpoints require the user's Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <idToken>
```

| Status | Meaning |
|---|---|
| `401` | Token missing, malformed, invalid, or expired. The frontend should refresh the token (`getIdToken(true)`) and retry once, then redirect to login. |
| `200` | Token verified. The route runs with `req.uid` and `req.user` set. |

To protect a route, add the middleware:

```js
import { verifyToken } from '../middleware/authMiddleware.js';

router.get('/example', verifyToken(), handler);
```

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── firebase.js
│   ├── controllers/
│   │   ├── authTestController.js
│   │   └── healthController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authTestRoutes.js
│   │   └── healthRoutes.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── package-lock.json
```

## Technologies

- Node.js
- Express
- CORS
- dotenv
- Firebase Admin SDK
- Nodemon

**Note:** Never commit `.env` files or private credentials to the repository.