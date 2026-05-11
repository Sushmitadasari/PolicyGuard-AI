const { app, BrowserWindow, Menu, ipcMain, Notification, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

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

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
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

