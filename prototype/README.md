# 360 Stadium bilingual prototype

Deploy this directory as a static site. No build or dependency installation is required. From the repository root, run:

```sh
python -m http.server 4173 --bind 0.0.0.0 --directory prototype
```

Arabic/English switching is in the header and profile settings. The chosen language persists across reloads; Arabic uses RTL layout. User-entered content is not machine-translated.

## Booking details

The normal booking sequence adds “Your details” immediately before “Review & confirm”. It is required for venue, player, and spectator bookings. The step collects a contact name, mobile number, names for additional group participants, and a consent checkbox. Continue and confirmation are blocked for missing or invalid details. Returning to earlier steps preserves the entered data.

Confirmed bookings retain the contact, consent, participant names by place, role, organizer, event ID, booking ID and timestamp. Existing historical bookings remain intact. There is no traceability screen, navigation item, organizer credibility page, sample review section, contact inbox, or visible event activity panel. Old browser data from earlier versions is not displayed or deleted.

The prototype stores information locally in `360-stadium-demo-v1`, and language in `360-language`. Use fictional contact details. Nothing is sent to an organizer. Real authorization, identity checks, organizer communications and cross-device storage require backend integration.

## Editable enhancements

- `assets/prototype-enhancements.js`: presentation localization, language control, booking details and validation.
- `assets/translations-ar.js`: Arabic UI dictionary.
- `assets/prototype-enhancements.css`: language, RTL and booking details styling.
- `assets/index-CwwsKbfS.js`: supplied compiled React app with integration points for language support and the required booking step.

The original editable React project was not included in the uploaded ZIP.
