const { app, BrowserWindow, ipcMain, shell, webContents, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_EXE = path.join(ROOT, 'backend', 'target', 'debug', 'browser_backend.exe');
let backendProcess = null;
const activeDownloads = new Map();
const trackerHosts = [
  'doubleclick.net',
  'googlesyndication.com',
  'google-analytics.com',
  'analytics.google.com',
  'facebook.net',
  'connect.facebook.net',
  'scorecardresearch.com',
  'hotjar.com',
  'segment.io',
  'mixpanel.com',
  'adsystem.com',
  'adnxs.com',
  'taboola.com',
  'outbrain.com'
];

function isAllowedGuestUrl(src) {
  try {
    const parsed = new URL(src);
    const host = parsed.hostname.toLowerCase();
    return ['http:', 'https:'].includes(parsed.protocol)
      && host !== 'newtab.internal'
      && host !== 'browser.internal'
      && !host.endsWith('.internal');
  } catch {
    return false;
  }
}

function isTrackerUrl(src) {
  try {
    const host = new URL(src).hostname.toLowerCase();
    return trackerHosts.some(tracker => host === tracker || host.endsWith(`.${tracker}`));
  } catch {
    return false;
  }
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function ensureBackend() {
  if (await isPortOpen(4978)) return;
  try {
    backendProcess = spawn(BACKEND_EXE, {
      cwd: path.dirname(BACKEND_EXE),
      detached: false,
      stdio: 'ignore',
      windowsHide: true
    });
    backendProcess.unref();
  } catch {
    backendProcess = null;
  }
}

async function createWindow() {
  await ensureBackend();

  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: '#f8fafd',
    title: 'Aero Browser',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      webviewTag: true
    }
  });

  if (process.env.AERO_OPEN_DEVTOOLS === '1') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    delete webPreferences.preload;
    delete webPreferences.preloadURL;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    if (!isAllowedGuestUrl(params.src || '')) {
      event.preventDefault();
    }
  });

  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const allowedPermissions = new Set(['clipboard-read', 'clipboard-sanitized-write']);
    const allowed = allowedPermissions.has(permission);
    win.webContents.send('aero:permission', {
      permission,
      allowed,
      requestingUrl: details?.requestingUrl || webContents.getURL() || ''
    });
    callback(allowed);
  });

  win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    const blocked = isTrackerUrl(details.url);
    if (blocked) {
      win.webContents.send('aero:tracker-blocked', {
        url: details.url,
        resourceType: details.resourceType,
        timestamp: Date.now()
      });
    }
    callback({ cancel: blocked });
  });

  win.webContents.session.on('will-download', (_event, item) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const startedAt = Date.now();
    let lastBytes = 0;
    let lastTick = startedAt;
    activeDownloads.set(id, item);

    const payload = (type, state) => {
      const now = Date.now();
      const receivedBytes = item.getReceivedBytes();
      const deltaBytes = Math.max(0, receivedBytes - lastBytes);
      const deltaMs = Math.max(1, now - lastTick);
      const speed = Math.round(deltaBytes / (deltaMs / 1000));
      lastBytes = receivedBytes;
      lastTick = now;

      return {
        id,
        type,
        state,
        name: item.getFilename(),
        url: item.getURL(),
        savePath: item.getSavePath(),
        totalBytes: item.getTotalBytes(),
        downloadedBytes: receivedBytes,
        speed,
        startedAt
      };
    };

    win.webContents.send('aero:download', payload('started', item.getState()));
    item.on('updated', (_event, state) => {
      win.webContents.send('aero:download', payload('updated', state));
    });
    item.once('done', (_event, state) => {
      win.webContents.send('aero:download', payload('done', state));
      activeDownloads.delete(id);
    });
  });

  await win.loadFile(path.join(ROOT, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});

ipcMain.handle('aero:window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.handle('aero:window:toggle-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});

ipcMain.handle('aero:window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.handle('aero:runtime', () => ({
  engine: 'chromium',
  shell: 'electron',
  backendUrl: 'http://127.0.0.1:4978'
}));

ipcMain.handle('aero:guest:input', (_event, webContentsId, inputEvent) => {
  const guest = webContents.fromId(Number(webContentsId));
  if (!guest || guest.isDestroyed()) return false;
  guest.sendInputEvent(inputEvent);
  return true;
});

ipcMain.handle('aero:guest:insert-text', (_event, webContentsId, text) => {
  const guest = webContents.fromId(Number(webContentsId));
  if (!guest || guest.isDestroyed()) return false;
  guest.insertText(String(text || ''));
  return true;
});

ipcMain.handle('aero:guest:load-url', async (_event, webContentsId, url) => {
  if (!isAllowedGuestUrl(url)) return false;
  const guest = webContents.fromId(Number(webContentsId));
  if (!guest || guest.isDestroyed()) return false;
  await guest.loadURL(url);
  return true;
});

ipcMain.handle('aero:download:pause', (_event, id) => {
  const item = activeDownloads.get(String(id));
  if (!item || item.isPaused()) return false;
  item.pause();
  return true;
});

ipcMain.handle('aero:download:resume', (_event, id) => {
  const item = activeDownloads.get(String(id));
  if (!item || !item.canResume()) return false;
  item.resume();
  return true;
});

ipcMain.handle('aero:download:cancel', (_event, id) => {
  const item = activeDownloads.get(String(id));
  if (!item) return false;
  item.cancel();
  activeDownloads.delete(String(id));
  return true;
});

ipcMain.handle('aero:download:show', (_event, filePath) => {
  if (!filePath) return false;
  shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle('aero:download:open', async (_event, filePath) => {
  if (!filePath) return false;
  const result = await shell.openPath(filePath);
  return result || true;
});

ipcMain.handle('aero:confirm-sensitive-action', async (event, payload = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showMessageBox(win, {
    type: 'warning',
    buttons: ['Cancel', 'Allow once'],
    defaultId: 0,
    cancelId: 0,
    title: 'Aero safety confirmation',
    message: payload.title || 'Allow this browser action?',
    detail: payload.detail || 'This action needs explicit confirmation before Aero can continue.',
    noLink: true,
    normalizeAccessKeys: true
  });
  return result.response === 1;
});
