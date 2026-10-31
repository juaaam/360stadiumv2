# 360 Stadium bilingual prototype

This is the updated static prototype from the provided Netlify ZIP. It includes the original compiled React application, not the original editable React project. Enhancements are maintained in readable JavaScript and CSS:

- assets/prototype-enhancements.js — language control, presentation localization, organizer profiles, event roster, attendance, activity history, JSON export.
- assets/translations-ar.js — Arabic UI dictionary. Internal event IDs, select values, and stored records retain their original values.
- assets/prototype-enhancements.css — added screens and RTL layout.
- assets/index-CwwsKbfS.js — original compiled app with integration points for the enhancement module, navigation, state audit, and localized dates.

## Run and deploy

Run `python -m http.server 4173 --bind 0.0.0.0 --directory prototype` in this environment, or serve this folder with any static web server. Upload the contents of this folder to Netlify. No dependency installation or build step is required. Navigation uses hash routes; organizer profiles are at `/#/trace` and `/#/trace?event=volley-social`.

Use the header language button to switch Arabic/English. This reloads the current route and preserves browser data. The profile settings also include a language button.

## Prototype behavior

Organizer credibility includes organization details, explicit verification status, recorded past/upcoming events, illustrative sample reviews, local review submission for accounts with confirmed bookings, and a local inquiry form. Real identity verification and message delivery are not implemented. A verification request is a local demo request and never results in a verified badge.

Past events are derived from event dates; no past events or credentials are invented. Sample reviews are explicitly fictional. Local reviews do not prove attendance.

Player requests, player bookings, spectator bookings, and court bookings are linked by event and booking/request IDs. Group bookings have one row per place and a booking holder name, not invented individual guest identities. Legacy bookings without a holder use an explicit fallback. Search, role filters, and JSON export include canceled/rejected records. Only locally organized events expose check-in controls, and canceled or unapproved records cannot be checked in.

New bookings, cancellations, event edits/publication, request decisions, team assignment, and attendance are timestamped. Existing records have no fabricated timestamps. Dates in the UI use the chosen locale; activity timestamps display in Asia/Riyadh. These are editable local browser records, not a secure server audit log. Data is stored under `360-stadium-demo-v1`; language under `360-language`. Reset Demo clears app activity along with other demo state.

The app remains a static demonstration. Backend accounts, authorization, identity verification, real review eligibility, cross-device synchronization, and actual organizer contact require original source and backend integration. Content entered by users is not machine-translated.

## Validation

Browser tests are retained separately at tests:

- prototype.spec.cjs: eight routes, Arabic/English switching, RTL overflow checks, organizer inquiry/review persistence, verification request, approval history, check-in, spectator filter, search, JSON download, cancellation, and participant-mode controls.
- booking.spec.cjs: complete player and spectator booking flows, booking holder/timestamp capture, linked activity records, and Arabic reload.

Run with Node.js and Playwright available, while the static server is running. Tests use isolated browser contexts and fictional local records.
