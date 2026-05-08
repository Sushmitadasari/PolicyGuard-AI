const { app, BrowserWindow } = require("electron");
const path = require("path");
const notifier = require("node-notifier");
const axios = require("axios");

const psList = (...args) =>
  import("ps-list").then((m) => m.default(...args));

require("../backend/server");

let win;

let scannedApps = new Set();

function createWindow() {

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#081120",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {

  createWindow();

  // wait backend startup
  setTimeout(() => {
    monitorApps();
  }, 3000);

});


// ✅ Better App Names
function formatAppName(name) {

  const names = {

    chrome: "Google Chrome",
    msedge: "Microsoft Edge",
    firefox: "Firefox",

    spotify: "Spotify",

    discord: "Discord",

    telegram: "Telegram",

    whatsapp: "WhatsApp",

    zoom: "Zoom",

    teams: "Microsoft Teams",

    steam: "Steam",

    obs64: "OBS Studio",

    vlc: "VLC Media Player",

    code: "VS Code",

    vscode: "VS Code",

    photoshop: "Adobe Photoshop"

  };

  return names[name] || (
    name.charAt(0).toUpperCase() +
    name.slice(1)
  );
}


// 🔐 Permission Database
function getPermissions(app) {

  const permissionsDB = {

    chrome: ["location", "storage"],

    msedge: ["location", "storage"],

    firefox: ["location"],

    zoom: ["camera", "microphone"],

    teams: ["camera", "microphone"],

    discord: ["microphone"],

    whatsapp: ["contacts", "storage"],

    telegram: ["contacts"],

    spotify: ["storage"],

    obs64: [
      "camera",
      "microphone",
      "storage"
    ],

    photoshop: ["storage"],

    vscode: ["storage"],

    code: ["storage"],

    steam: ["storage"]

  };

  // unknown apps
  if (!permissionsDB[app]) {

    return ["storage"];

  }

  return permissionsDB[app];
}


// 🔍 Monitor Applications
async function monitorApps() {

  // ❌ system processes to ignore
const blockedKeywords = [

  // Windows core
  "svchost",
  "csrss",
  "wininit",
  "lsass",
  "lsaiso",
  "memory compression",
  "runtime",
  "registry",
  "spoolsv",
  "ngciso",
  "wmiprvse",
  "wlanext",
  "unsecapp",
  "winlogon",
  "dwm",
  "ctfmon",
  "lockapp",
  "smartscreen",
  "mousocoreworker",

  // System/internal
  "service",
  "system",
  "broker",
  "security",
  "update",
  "crash",
  "helper",
  "monitor",
  "audio",
  "font",
  "input",
  "task",
  "background",
  "shell",
  "experience",
  "host",
  "container",

  // Drivers
  "nvidia",
  "amd",
  "intel",
  "igfx",

  // Terminal/dev
  "powershell",
  "cmd",
  "conhost",
  "python",
  "git",
  "bash",
  "mintty",
  "node",
  "electron",
  "winpty",

  // Databases
  "mysql",
  "mysqld",
  "postgres",
  "mongodb",
  "redis",

  // Microsoft internals
  "webview",
  "microsoft",
  "edgeupdate",

  // WPS
  "wpscloud",
  "wpscenter",

  // launchers
  "launcher",

  // backend/ai
  "ollama",

  // hidden apps
  "appactions",
  "crossdevice",
  "copilot",
  "search",
  "widget",

  // security
  "shield",

  // misc
  "snoretoast",
  "fastlist",
  "mc-dad"

];

  setInterval(async () => {

    try {

      const processes = await psList();

      for (const proc of processes) {

        let appName = proc.name
          .replace(".exe", "")
          .trim()
          .toLowerCase();

        // ignore empty
        if (!appName) continue;
        // ✅ ignore weird names
        // ignore background/service style names
        // ignore names with numbers only
if (/^\d+$/.test(appName)) {
  continue;
}

// ignore weird technical names
if (
  appName.length > 25 ||
  appName.includes("manager") ||
  appName.includes("agent") ||
  appName.includes("defense") ||
  appName.includes("optimizer")
) {
  continue;
}
        if (
          appName.includes("service") ||
          appName.includes("helper") ||
          appName.includes("launcher") ||
          appName.includes("update") ||
          appName.includes("cloud") ||
          appName.includes("provider")
        ) {
          continue;
        }
        if (
          appName.includes("-") ||
          appName.includes("_") ||
          appName.includes(".")
        ) {
          continue;
        }
                // ignore duplicates
        if (scannedApps.has(appName)) {
          continue;
        }

        // ignore short names
        if (appName.length <= 2) {
          continue;
        }

        // ignore hidden/system apps
        const blocked = blockedKeywords.some(
          keyword =>
            appName.includes(keyword)
        );

        if (blocked) {
          continue;
        }

        scannedApps.add(appName);

        const permissions =
          getPermissions(appName);

        try {

          const res = await axios.post(
            "http://127.0.0.1:5000/analyze",
            {
              app: appName,
              permissions
            },
            {
              timeout: 5000
            }
          );

          const data = {

            name: formatAppName(appName),

            permissions,

            risk: res.data.risk,

            score: res.data.score,

            recommendation:
              res.data.recommendation

          };

          // ✅ send to frontend
          win.webContents.send(
            "new-app",
            data
          );

          // ✅ desktop notification
          notifier.notify({

            title: "Privacy Alert ⚠️",

            message:
              `${formatAppName(appName)} detected (${res.data.risk} Risk)`,

            timeout: 5

          });

          console.log(
            "Detected App:",
            appName
          );

        } catch (apiErr) {

          console.error(
            "API ERROR:",
            apiErr.message
          );

        }
      }

    } catch (err) {

      console.error(
        "PROCESS ERROR:",
        err.message
      );

    }

  }, 5000);
}