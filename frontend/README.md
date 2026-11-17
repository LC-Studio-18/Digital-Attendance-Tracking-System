# Digital Attendance Tracking System – Frontend

The frontend application for the Digital Attendance Tracking System, built using React and Vite.

## Prerequisites

- Node.js (LTS version recommended)
- npm

## Installation

Navigate to the frontend directory:

    cd frontend

Install dependencies:

    npm install

Create a `.env` file in the frontend directory:

    VITE_API_URL=http://localhost:5000

Alternatively, copy `.env.example` and configure the value.

## Running the application

Start the development server:

    npm run dev

Vite will provide a local URL, normally:

http://localhost:5173

## Available scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Starts the development server        |
| `npm run build`        | Creates a production build           |
| `npm run preview`      | Previews the production build        |
| `npm run lint`         | Runs ESLint                          |
| `npm run format`       | Formats project files using Prettier |
| `npm run format:check` | Checks code formatting               |

## Project structure

    frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── .gitignore
    ├── .prettierrc
    ├── eslint.config.js
    ├── package.json
    └── vite.config.js

## Technologies

- React
- Vite
- React Router
- Axios
- Bootstrap
- ESLint
- Prettier

**Note:** Never commit `.env` files or expose private credentials in frontend environment variables.
