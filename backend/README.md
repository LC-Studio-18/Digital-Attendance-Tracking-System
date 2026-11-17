# Digital Attendance Tracking System – Backend

## Overview

The backend provides the API server for the Digital Attendance Tracking System, built using Node.js and Express.

## Prerequisites

- Node.js (LTS)
- npm

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
```

## Running the Server

Development mode (automatically restarts when files change):

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks whether the API is running |

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   │   └── healthController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
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
- Nodemon

**Note:** Never commit `.env` files or private credentials to the repository.