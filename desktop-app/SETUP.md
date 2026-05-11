# PolicyGuard AI Desktop - Setup & Developer Guide

## 📁 Installation Files Generated
The desktop application installers have been successfully generated in the `dist/` directory:
- **Installer**: `dist/PolicyGuard AI Setup 1.0.0.exe` (Standard installation)
- **Portable**: `dist/PolicyGuard AI-1.0.0.exe` (Run without installing)

---

## 🚀 Running the App Locally (Developer Mode)

To test the application locally with hot-reloading (ideal for development):

```bash
# Start the React dev server and Electron wrapper simultaneously
npm run dev
```

*(Note: This uses `concurrently` to start the React app on port 3000, wait for it to load, and then open the Electron window automatically.)*

---

## 📦 Building for Production

If you make further changes to the React code or Electron main process, you can regenerate the installers using:

```bash
# This will build the React production bundle and then package the .exe
npm run build
```

---

## ✅ Final Verification Checklist

When you launch the app, verify the following:
1. **Window Constraints**: Ensure the window starts at 1200x800 and cannot be shrunk below 900x600.
2. **Splash Screen**: A sleek loading screen should appear before the main UI loads.
3. **Menu Bar**: Check the custom application menu (File, Edit, View, Window, Help).
4. **Notifications**: System desktop notifications should trigger for background tasks or app events.
5. **Pixel-Perfect UI**: The dark theme (#0B0F19), modern gradients, animations, and typography should perfectly match the mobile original.

Enjoy your new, production-ready desktop app!
