# NICU Work — Android

English-only Android application for prescribed-dose preparation in a neonatal ward. Supports Android 8.0 and later. The interface is bundled in the APK and works offline.

## Features

- Rooms, patients, bed codes, and medication orders.
- One, two, or three prescribed doses per day, grouped or split across microdrips.
- Standard and fluid-restricted volume presets, with editable actual device dead space.
- Stock withdrawal, added diluent, final volume, microdrip counts, and vial counts.
- Caffeine uses the same formula as other drugs; no wash step.
- Separate caffeine citrate/base, colistin CBA/IU, and piperacillin/total-product units.
- English whole-ward PDF, JSON backup export and restore using Android's document picker.
- Automatic, atomic on-device saving. No account, backend, analytics, or internet permission.

## Calculation

`factor = doses in container + dead-space volume / volume per dose`

`withdrawal = prescribed single dose × factor / stock concentration`

`final volume = doses in container × volume per dose + dead space`

`diluent = final volume − withdrawal`

The supplied images assume 20 mL per dose and 10 mL dead space for the standard method (factors 1.5, 2.5, 3.5), or 10 mL per dose for fluid restriction (factors 2, 3, 4). Actual product and device values must be checked.

This is preparation arithmetic, not prescribing, a dose-range check, infusion-rate advice, compatibility clearance, or a beyond-use-date assignment. Verify the prescribed single dose, unit, actual stock, diluent, device volume, and stability against an approved ward protocol. Settings are marked unreviewed until the user checks them.

Vial counts assume new vials per preparation, with no sharing or carry-over. Quantity-equivalent counts are theoretical inventory quantities, not instructions to pool single-dose vials. Ceftriaxone and the incomplete phenytoin syringe method are blocked in this workflow. Missing ampoule strengths must be entered from the label.

## Records and privacy

Records are stored in the Android application's private internal directory. Android cloud backup is disabled. Export a JSON backup before uninstalling, clearing app data, or changing devices. The app does not synchronize with the separately hosted web version. JSON backups from the web version use the same schema and can be imported.

This public repository contains application code and synthetic tests only, never patient records. The production signing key must stay outside this repository.

## Build

Prerequisites: Node 22+, Java 17, Gradle 8.11.1, Android SDK platform 35 and build-tools 35.0.0.

```sh
npm install
npm test
npm run check
npm run build
gradle -p android lintRelease assembleRelease
```

`npm run build` creates the assets bundled into the Android project. The GitHub Actions workflow performs the same checks and uploads an unsigned release APK for private signing. Do not install the unsigned artifact: use the separately signed APK delivered with the project.

Release APKs must be signed with the same private key for updates. Keep the signing backup private; never commit it. Increment Android `versionCode` for future releases.

## Validation

The calculation suite covers all supplied standard and restricted examples, split-dose dead space, whole-ward aggregation, vial rounding, caffeine citrate/base equivalence, stock-versus-infusion concentrations, required intermediate containers, missing strengths, and invalid inputs.

## References

- User-supplied preparation images, pages 2–5 and 8–11.
- DailyMed: vancomycin, caffeine citrate, AmBisome, and ceftriaxone product labels (links in the app).
- CDC injection-safety guidance (link in the app).
- Reference review date: 26 September 2026. Actual product labeling and the local approved protocol remain authoritative.

## Appearance and installable test APK — v1.0.1

The Android interface is English-only. Use the Appearance control in the header to select **Light**, **Dark**, or **System**. The setting is saved separately from ward records, and System follows Android appearance changes. The native navigation bar also follows the active mode. Printed PDF reports stay white.

The Actions artifact now contains:
- `NICU-Work-1.0.1-debug-installable.apk` — signed with an Android debug key and installable for testing.
- `NICU-Work-1.0.1-release-unsigned.apk` — requires private production signing; do not attempt to install it directly.

**The debug APK is not a production release** and will not update a different-signature app in place. A stable private release keystore is necessary before public distribution. Export a JSON backup before uninstalling or changing app signatures. Never commit real patient records or keystores to this public repository.
