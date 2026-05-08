const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onNewApp: (callback) =>
    ipcRenderer.on("new-app", (_, data) => callback(data))
});