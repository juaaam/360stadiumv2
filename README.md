# 360 Stadium prototype

Arabic/English sports prototype with RTL support. Booking includes a required, discreet “Your details” step before confirmation for venue bookings, players, and spectators. There is no separate traceability page or navigation item.

## Run

From the repository root:

```sh
python -m http.server 4173 --bind 0.0.0.0 --directory prototype
```

No install or build is required. Netlify publishes `prototype/` using `netlify.toml`.

- `prototype/`: deployable site and readable enhancement modules.
- `360-stadium-arabic-organizers.zip`: latest deployment ZIP, with booking-only participant details.
- `360-stadium-mobile-v2-netlify.zip`: original supplied prototype, unchanged.
- `tests/`: Playwright browser regression tests. With Node, Playwright, Chromium and the server available, run `node tests/prototype.spec.cjs` and `node tests/booking.spec.cjs`. Set `PROTOTYPE_URL` to override port 4173.

The supplied app was already compiled; the original React source project is not included. Editable additions are in `prototype/assets/prototype-enhancements.js`, `translations-ar.js`, and `prototype-enhancements.css`.

Details are collected only inside booking: name, mobile number, additional participant names for group bookings, and permission for booking/check-in use. Each confirmed booking stores those details alongside its role, organizer, event ID, places, booking ID and creation timestamp. The prototype uses local browser storage only. Use fictional contact details; there is no real message delivery, identity verification, or backend service.
