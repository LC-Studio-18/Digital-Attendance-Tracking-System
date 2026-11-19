# S1-16 staging and product-owner checklist

Use this checklist when an API and staging environment are available. The current repository is a frontend-only preview with simulated requests, so environment-dependent items remain for the delivery team.

## Before staging

- [ ] Configure the API base URL for the staging frontend; do not put credentials in `VITE_*` variables.
- [ ] Connect the login, clock-in/out, and dashboard flows to their backend requests.
- [ ] Map backend error responses to the stable status/application codes documented in [component usage](COMPONENT-USAGE.md).
- [ ] Confirm that a 401 is handled by the authentication layer and returns the user to login.
- [ ] Confirm that successful feedback appears only after a successful server response.
- [ ] Build and deploy the frontend using the team's staging process over HTTPS.

## Verify on desktop and phone

- [ ] Login shows a labelled loading state and disables submission while pending.
- [ ] Invalid credentials show “Email or password is incorrect.” without revealing which field failed.
- [ ] A 401 prompts the login flow; a 403 shows the friendly access-denied message.
- [ ] Clock-in/out actions show labelled loading feedback and prevent duplicate submissions.
- [ ] A 409 duplicate, 500 server failure, and offline condition show the agreed copy.
- [ ] Failed dashboard loads offer a working “Try again” action.
- [ ] Success feedback follows server confirmation and communicates the completed action.
- [ ] Text and controls remain readable and usable at phone and desktop widths.
- [ ] Errors are understandable without colour, and no raw status, exception, or stack trace is exposed.

## Product-owner sign-off

- [ ] Product owner reviewed the loading, error, and success wording and behavior.
- [ ] Product owner confirmed the staging flows on desktop and phone.
- [ ] Record reviewer, date, environment/build, and any follow-up issues in the project release record.
