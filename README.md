# 360 Stadium prototype

Arabic/English sports prototype with RTL support and organizer credibility profiles, local reviews and inquiries, participant/spectator records, check-ins, and event activity export.

## Run

From the repository root:

```sh
python -m http.server 4173 --bind 0.0.0.0 --directory prototype
```

No install or build step is needed to serve the static app. Netlify publishes `prototype/` using `netlify.toml`.

- `prototype/`: deployable site and readable enhancement modules.
- `360-stadium-arabic-organizers.zip`: updated deployment ZIP.
- `360-stadium-mobile-v2-netlify.zip`: original supplied prototype, preserved unchanged.
- `tests/`: Playwright browser regression tests; requires Node, Playwright and Chromium. Run both `.cjs` files with Node while the server runs. Set `PROTOTYPE_URL` to override the default port 4173.

The supplied app was already compiled. Its original React source project is not included. Editable additions are in `prototype/assets/prototype-enhancements.js`, `translations-ar.js`, and `prototype-enhancements.css`.

Verification requests, reviews, organizer inquiries, attendance and event history are local demonstrations. No real identity verification, message delivery, payment, or backend authorization is provided. See `prototype/README.md` for details.
