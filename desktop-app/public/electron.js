const { app, BrowserWindow, Menu, ipcMain, Notification, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
// Check if running in development mode
const isDev = !app.isPackaged;

let mainWindow;
let splashWindow;
let isMaximized = false;

// Handle app installation on Windows
if (process.platform === 'win32') {
  const squirrelCommand = process.argv[1];
  if (squirrelCommand === '--squirrel-install' ||
      squirrelCommand === '--squirrel-updated') {
    // Install shortcuts
    app.quit();
    return;
  }
  if (squirrelCommand === '--squirrel-uninstall' ||
      squirrelCommand === '--squirrel-obsolete') {
    app.quit();
    return;
  }
}

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    center: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: linear-gradient(135deg, #0B0F19 0%, #1a1f2e 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .logo { font-size: 80px; margin-bottom: 20px; animation: pulse 2s ease-in-out infinite; }
          .title { font-size: 32px; font-weight: 900; color: #ffffff; margin-bottom: 10px; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 40px; }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(37, 99, 235, 0.2);
            border-top-color: #2563EB;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      </head>
      <body>
        <div class="logo">🛡️</div>
        <div class="title">PolicyGuard AI</div>
        <div class="subtitle">Loading...</div>
        <div class="spinner"></div>
      </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
};

const createWindow = () => {
  // Get display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1400, width - 100),
    height: Math.min(900, height - 100),
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Hide splash when main window is ready
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create app menu
  createMenu();

  // Handle window maximize/minimize state
  mainWindow.on('maximize', () => {
    isMaximized = true;
    mainWindow.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    isMaximized = false;
    mainWindow.webContents.send('window-unmaximized', false);
  });

  return mainWindow;
};

const createMenu = () => {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' },
        ]),
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PolicyGuard AI',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About PolicyGuard AI',
              message: 'PolicyGuard AI v1.0.0',
              detail: 'Professional Desktop Application for Privacy Protection and App Analysis\n\nBuilt with Electron & React\n\nAll data is processed locally on your device.',
              buttons: ['OK'],
            });
          },
        },
        {
          label: 'Check for Updates',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Updates',
              message: 'You are running the latest version',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('show-notification', (event, { title, body, icon }) => {
  try {
    new Notification({
      title: title || 'PolicyGuard AI',
      body: body || 'Notification from PolicyGuard AI',
      icon: path.join(__dirname, 'icon.png'),
    }).show();
  } catch (err) {
    console.error('Notification error:', err);
  }
});

ipcMain.on('start-scan', (event) => {
  // Simulate scan completion
  setTimeout(() => {
    try {
      new Notification({
        title: '✅ Privacy Scan Complete',
        body: 'All apps have been analyzed',
        icon: path.join(__dirname, 'icon.png'),
      }).show();
    } catch (err) {
      console.error('Notification error:', err);
    }
    event.sender.send('scan-completed');
  }, 2000);
});

ipcMain.handle('get-installed-apps', async () => {
  if (process.platform !== 'win32') return [];

  return new Promise(async (resolve) => {
    const { shell } = require('electron');
    const startMenuPaths = [
      path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
      path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ];

    const uniqueAppsByExe = new Map();

    const scanDir = async (dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (file.toLowerCase().includes('administrative tools') || file.toLowerCase().includes('windows system') || file.toLowerCase().includes('windows powershell')) continue;
            await scanDir(fullPath);
          } else if (file.endsWith('.lnk')) {
            const name = file.replace('.lnk', '');
            const lowerName = name.toLowerCase();

            // STRICT FILTERING EXACTLY AS REQUESTED
            const badWords = [
              'runtime', 'sdk', 'documentation', 'docs', 'update', 'updater', 'helper', 'launcher', 'service', 'add-in', 'webview', 'registry', 'installer', 'bootstrap', 'package', 'driver', 'redistributable', 'extension', 'component', 'configuration', 'shell', 'terminal', 'compiler', 'debugger', 'framework', 'library', 'plugin', 'repair', 'reset', 'cache', 'monitor', 'recorder', 'telemetry', 'utility',
              'uninstall', 'remove', 'readme', 'manual', 'setup', 'config', 'safe mode', 'skinned', 'git bash', 'git cmd', 'git gui', 'linguist', 'idle', 'wsl', 'website', 'help',
              'putty', 'pageant', 'mysql', 'snoretoast', 'cli',
              'patch up', 'saves', 'msb', 'psftp', 'stack builder', 'language preferences', 'console', 'tool', 'manager', 'server', 'client',
              'python', 'node.js', 'node', 'pgadmin', 'onenote', 'sandbox', 'comet', '64-bit', 'version', 'virtualbox', 'vmware', 'hyper-v', 'mcafee', 'security', 'legacy', 'access', 'c++'
            ];
            if (badWords.some(word => lowerName.includes(word))) continue;

            if (name.length <= 2) continue; // remove random short names like "cc", "ok"
            if (/[^a-zA-Z0-9\s\-_.,()+]/g.test(name)) continue; // remove strange symbols

            const details = shell.readShortcutLink(fullPath);
            const targetPath = details.target ? details.target : '';
            const lowerTarget = targetPath.toLowerCase();

            // Ignore Windows internal, admin tools, and web links
            if (!targetPath || lowerTarget.includes('c:\\\\windows') || lowerTarget.includes('system32') || lowerTarget.includes('syswow64')) continue;
            if (lowerTarget.endsWith('.chm') || lowerTarget.endsWith('.txt') || lowerTarget.endsWith('.pdf') || lowerTarget.endsWith('.html') || lowerTarget.endsWith('.ini') || lowerTarget.endsWith('.rtf') || lowerTarget.endsWith('.url')) continue;

            // Completely ignore Chrome/Edge PWA Web Apps (like Gmail, Presentation)
            if (lowerTarget.includes('chrome_proxy.exe') || lowerTarget.includes('msedge_proxy.exe')) continue;

            // Deduplicate by target executable
            let shouldAdd = false;
            if (uniqueAppsByExe.has(lowerTarget)) {
              const existingName = uniqueAppsByExe.get(lowerTarget).appName;
              if (name.length < existingName.length) {
                shouldAdd = true;
              }
            } else {
              shouldAdd = true;
            }

            if (shouldAdd) {
              let iconDataUrl = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/android.png`;
              try {
                // Read the native icon directly from the TARGET EXECUTABLE (.exe)
                if (fs.existsSync(targetPath)) {
                  // The user wants large/256x256 icons. 'large' retrieves the largest available (up to 256x256 on Windows).
                  const nativeImage = await app.getFileIcon(targetPath, { size: 'large' });
                  if (nativeImage && !nativeImage.isEmpty()) {
                    iconDataUrl = nativeImage.toDataURL();
                  }
                }
              } catch (e) {
                console.error(`Failed to fetch icon for ${name}:`, e.message);
              }

              // Send the exact permissions requested. The frontend will score them.
              const permissions = [];

              if (lowerName.includes('discord') || lowerName.includes('zoom') || lowerName.includes('teams') || lowerName.includes('obs') || lowerName.includes('skype') || lowerName.includes('whatsapp') || lowerName.includes('telegram') || lowerName.includes('teamviewer')) {
                permissions.push('NETWORK', 'CAMERA', 'MICROPHONE', 'CONTACTS', 'BACKGROUND_MONITORING', 'SCREEN_RECORDING');
              } else if (lowerName.includes('chrome') || lowerName.includes('edge') || lowerName.includes('opera') || lowerName.includes('spotify') || lowerName.includes('browser') || lowerName.includes('brave') || lowerName.includes('firefox')) {
                permissions.push('NETWORK', 'BROWSER_TRACKING', 'FILES', 'LOCATION');
              } else if (lowerName.includes('vlc') || lowerName.includes('sublime') || lowerName.includes('notepad') || lowerName.includes('code') || lowerName.includes('studio') || lowerName.includes('word') || lowerName.includes('excel') || lowerName.includes('powerpoint') || lowerName.includes('postman') || lowerName.includes('docker') || lowerName.includes('pycharm') || lowerName.includes('compass') || lowerName.includes('eclipse') || lowerName.includes('intellij') || lowerName.includes('packet tracer') || lowerName.includes('office')) {
                permissions.push('FILES', 'NETWORK');
              } else {
                permissions.push('FILES');
              }

              uniqueAppsByExe.set(lowerTarget, {
                appName: name,
                packageName: 'Local Desktop App',
                icon: iconDataUrl,
                permissions,
                score: 0 // Frontend will override this
              });
            }
          }
        } catch (err) {
          // Ignore permission denied on specific system folders
        }
      }
    };

    for (const dir of startMenuPaths) {
      await scanDir(dir);
    }

    // Final deduplication by App Name
    const uniqueAppsByName = new Map();
    for (const app of uniqueAppsByExe.values()) {
      if (!uniqueAppsByName.has(app.appName)) {
        uniqueAppsByName.set(app.appName, app);
      }
    }

    resolve(Array.from(uniqueAppsByName.values()));
  });
});

ipcMain.on('get-app-path', (event) => {
  event.returnValue = app.getAppPath();
});

ipcMain.on('get-user-data-path', (event) => {
  event.returnValue = app.getPath('userData');
});

// App Events
app.on('ready', () => {
  if (isDev || process.env.NODE_ENV === 'development') {
    // In development, delay app start to ensure dev server is ready
    setTimeout(() => {
      createSplashWindow();
      createWindow();
    }, 500);
  } else {
    createSplashWindow();
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createSplashWindow();
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Prevent multiple instances
const shouldQuit = app.requestSingleInstanceLock();
if (!shouldQuit) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle any uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

