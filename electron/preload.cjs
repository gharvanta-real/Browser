const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aeroNative', {
  runtime: () => ipcRenderer.invoke('aero:runtime'),
  minimize: () => ipcRenderer.invoke('aero:window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('aero:window:toggle-maximize'),
  close: () => ipcRenderer.invoke('aero:window:close'),
  dispatchGuestInput: (webContentsId, inputEvent) => ipcRenderer.invoke('aero:guest:input', webContentsId, inputEvent),
  insertGuestText: (webContentsId, text) => ipcRenderer.invoke('aero:guest:insert-text', webContentsId, text),
  loadGuestUrl: (webContentsId, url) => ipcRenderer.invoke('aero:guest:load-url', webContentsId, url),
  pauseDownload: (id) => ipcRenderer.invoke('aero:download:pause', id),
  resumeDownload: (id) => ipcRenderer.invoke('aero:download:resume', id),
  cancelDownload: (id) => ipcRenderer.invoke('aero:download:cancel', id),
  showDownload: (filePath) => ipcRenderer.invoke('aero:download:show', filePath),
  openDownload: (filePath) => ipcRenderer.invoke('aero:download:open', filePath),
  onDownload: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('aero:download', listener);
    return () => ipcRenderer.removeListener('aero:download', listener);
  },
  onPermission: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('aero:permission', listener);
    return () => ipcRenderer.removeListener('aero:permission', listener);
  },
  onTrackerBlocked: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('aero:tracker-blocked', listener);
    return () => ipcRenderer.removeListener('aero:tracker-blocked', listener);
  }
});
