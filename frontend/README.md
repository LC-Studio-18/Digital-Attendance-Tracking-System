# Digital Attendance Tracking System – Frontend

The frontend application for the Digital Attendance Tracking System, built using React and Vite.

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
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

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Starts the development server               |
| `npm run build`         | Creates a production build                  |
| `npm run build:staging` | Creates a staging build (`--mode staging`)  |
| `npm run preview`       | Previews the production build               |
| `npm run lint`          | Runs ESLint                                 |
| `npm run format`        | Formats project files using Prettier        |
| `npm run format:check`  | Checks code formatting                      |
| `npm test`              | Runs the Vitest component and utility tests |
| `npm run test:watch`    | Runs the tests in watch mode                |
| `npm run check`         | Runs lint, tests and a production build     |

## S1-16 feedback components

The app entry point (`src/App.jsx`) is a reusable-state preview for the loading, error and success
states used on the login, clock in/out and attendance dashboard screens. Requests are simulated —
the preview does not call an API or Firebase.

```jsx
import { ErrorMessage, Loader, SuccessMessage } from './components';
```

| File                              | Purpose                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `src/components/`                 | Shared feedback components, barrel export and their tests  |
| `src/utils/errorMessages.js`      | Approved safe error copy and HTTP/application code mapping |
| `src/styles/`                     | Base, component and preview-page styles                    |
| `src/test/setup.js`               | Vitest + Testing Library setup                             |
| `docs/COMPONENT-USAGE.md`         | Props, examples and API integration guidance               |
| `docs/CODE-REVIEW.md`             | Review record                                              |
| `docs/STAGING-AND-PO-APPROVAL.md` | Staging and product-owner acceptance checklist             |
| `wireframes/`                     | Reference wireframes                                       |

Rules: never render raw errors, status codes or stack traces; show success only after the server
confirms; keep the loading label next to the spinner; wire `onRetry` for failed data loads.

## Project structure

    frontend/
    ├── docs/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── test/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── wireframes/
    ├── .env.example
    ├── .gitignore
    ├── .prettierrc
    ├── eslint.config.js
    ├── package.json
    └── vite.config.js

## Technologies

- React
- Vite
- Vitest + Testing Library
- React Router
- Axios
- Bootstrap
- ESLint
- Prettier

**Note:** Never commit `.env` files or expose private credentials in frontend environment variables.
Vite exposes every `VITE_*` value to browser code.
