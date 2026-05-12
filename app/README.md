# PolicyGuardAI Mobile App

PolicyGuardAI is a React Native mobile app that helps users understand app privacy risk on-device. The current version is an app-only MVP/prototype focused on local risk scoring, privacy insights, alerts, and simple reports. It does **not** depend on a backend for the current demo flow.

## Current Status

This repository contains the **mobile app only**.

What is implemented today:
- On-device privacy risk scoring
- Dashboard, Applications, Live Scan, Alerts, Reports, and Settings screens
- App search and filtering
- Risk labels and score badges
- App detail and alert modal views
- Local privacy recommendations
- Known privacy policy links for popular apps
- Basic installed-app detection hooks for Android

What is still limited or static:
- No backend integration yet
- No cloud sync or login
- No database persistence
- No server-side AI document processing
- Some content and data are demo/local-data based for now

## Features

### Dashboard
- Overall device privacy score
- Safety status indicator: Good / Moderate / At Risk
- Summary cards for high-risk apps, safe apps, total apps, and active alerts
- Search for installed apps by name
- Top risky apps preview with a view-all option

### Applications
- Full list of installed apps
- Search bar to filter apps by name
- Risk filter tabs: All, High Risk, Medium Risk, Low Risk, Safe
- App cards with icon, name, package name, risk score, risk label, flagged reason, and permissions

### Live Scan
- Manual scan trigger
- Scanning/loading state
- Refreshed results after scan
- Overall privacy score and safety header

### Alerts
- High-risk apps list
- Alert cards with app details
- Empty state when no risky apps are found

### AI Analysis
- Document upload UI for Privacy Policy or Terms of Service files
- Loading state while analyzing
- Designed for future backend-powered AI analysis

### Reports
- Risk breakdown summary
- Average score across apps
- Plain-English privacy summary

### Settings
- Scan behavior information
- Privacy note that explains how data is handled
- About section and app version info

### App Detail Modal
- Full risk score and risk label
- Privacy summary and risk reasons
- Up to three actionable recommendations

### Alert Modal
- App name, score, and risk level
- Top privacy risk reasons
- View details / ignore actions

## How the Risk Engine Works

The app includes a built-in local risk engine that assigns scores using simple rules.

### Permission-based scoring
Examples used in the current app:
- Camera: +15
- Microphone: +15
- SMS: +20
- Contacts: +15
- Location: +10
- Storage: +10

### App name keyword rules
Examples used in the current app:
- VPN / Proxy / Tunnel: +35
- Mod / Hack / Crack: +40
- Wallet / Pay / Bank / UPI: +20
- Cleaner / Booster / Optimizer / Speed: +30
- Flashlight / Torch: +25
- Scanner / QR / Barcode: +15

### Human-readable reasons
The app converts detected permissions and keywords into simple privacy explanations so users can understand why an app was flagged.

### Recommendations
The app generates short practical suggestions based on the detected risk reasons.

### Known privacy policy links
The app includes built-in privacy policy links for common apps such as:
- WhatsApp
- Instagram
- Facebook
- Telegram
- Spotify
- Snapchat

## Project Structure

```text
app/
├── App.js
├── android/
├── ios/
├── options/
├── index.js
├── package.json
└── __tests__/
```

## Setup

### Prerequisites
- Node.js
- npm
- React Native environment
- Android Studio and Android SDK for Android builds
- Xcode for iOS builds on macOS

### Install dependencies
```bash
npm install
```

### Start Metro
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

## Android Release Build

For a local release build:

```bash
cd android
./gradlew assembleRelease
```

The release APK is typically generated in:

```text
android/app/build/outputs/apk/release/
```

Note: the current Android setup uses the debug keystore for release-style builds, so this is suitable for internal testing. A proper release signing key should be added before publishing to Play Store.

## Limitations

- The app is currently designed as a frontend/mobile prototype
- Backend features are planned for future implementation
- Real AI document analysis is not connected yet
- Cloud storage, user authentication, and synced history are not included yet
- Some data shown in the UI is local/demo data
- Android device-level app scanning and background monitoring depend on native implementation and platform permissions

## Future Enhancements

Planned improvements for later versions:
- Backend API integration
- Real AI-powered privacy policy analysis
- User authentication and role-based access
- Cloud sync and analysis history
- Push notifications
- Remote rules and policy updates
- More advanced risk scoring models
- Production release signing setup

## Notes

- This app is intentionally documented as an MVP/prototype.
- The README should be updated as features move from demo/local mode to fully implemented production features.

## License

Add your preferred license here.
