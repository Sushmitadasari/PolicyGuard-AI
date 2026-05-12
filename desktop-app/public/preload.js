const { contextBridge, ipcRenderer } = require('electron');

// Expose secure IPC methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Notifications
  showNotification: (title, body, icon) => {
    ipcRenderer.send('show-notification', { title, body, icon });
  },

  // Scan operations
  startScan: () => ipcRenderer.send('start-scan'),
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  onScanCompleted: (callback) => {
    ipcRenderer.on('scan-completed', callback);
  },

  // Window state listeners
  onWindowMaximized: (callback) => {
    ipcRenderer.on('window-maximized', callback);
  },

  onWindowUnmaximized: (callback) => {
    ipcRenderer.on('window-unmaximized', callback);
  },

  // App paths
  getAppPath: () => ipcRenderer.sendSync('get-app-path'),
  getUserDataPath: () => ipcRenderer.sendSync('get-user-data-path'),

  // Platform info
  getPlatform: () => process.platform,
  getVersion: () => process.versions.electron,
});
