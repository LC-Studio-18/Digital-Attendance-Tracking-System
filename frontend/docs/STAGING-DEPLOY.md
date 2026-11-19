# Staging preview deployment

This branch adds a GitHub Actions workflow that publishes the frontend staging build to GitHub Pages.

## Branch and PR

- Deployment branch: `deploy/staging-preview-pages`
- Target branch for review: `frontend6-components`
- `main` is not touched by this work.

## How the deployment runs

The workflow `.github/workflows/staging-pages.yml` runs when:

- changes are pushed to `deploy/staging-preview-pages`, or
- it is started manually with `workflow_dispatch`.

It installs the frontend dependencies with `npm ci`, builds with `npm run build:staging`, sets the Vite base path to `/Digital-Attendance-Tracking-System/`, and publishes `frontend/dist` through the official GitHub Pages actions.

## One-time repository prerequisite

A repository administrator must enable GitHub Pages with **GitHub Actions** as the source (Settings → Pages → Build and deployment). The token used for this setup has push access but not admin access, so that switch could not be enabled here. Once enabled, the workflow deploys automatically on the next push to the branch.

First workflow run on `deploy/staging-preview-pages`: [run #44531304968](https://github.com/LC-Studio-18/Digital-Attendance-Tracking-System/actions/runs/44531304968) — **failed** at the `Configure Pages` step because Pages is not enabled. Build and dependency steps succeeded. This is the only outstanding deployment blocker.

Expected URL after the first successful run:

`https://lc-studio-18.github.io/Digital-Attendance-Tracking-System/`

## What is and is not covered

- Covered: the built React frontend, including the attendance-history filters from PRs #5–#7.
- Not covered: the Express backend, Google Sheets/Firebase Admin integration, or the `/api/v1/attendance/history` endpoint. Until that API is deployed, history data calls from the preview will fail or return no records.
- Staging API base URL must be configured separately; do not place credentials in `VITE_*` variables.

## Approval status

- Review PRs: #4 (S1-05), #5 (Phase2-12), #6 (Phase2-13), #7 (Phase2-14), #8 (docs), #9 (this deployment).
- Reviewer and product-owner names will be supplied later. PO sign-off is **pending** and must be recorded only after someone verifies the running staging site on desktop and phone.
