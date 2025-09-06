const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(app.getPath('documents'), 'SysmeLite');
const DB_FILE = path.join(DB_DIR, 'data.json'); // simple JSON store for scaffold

function ensureDbDir(){
  if(!fs.existsSync(DB_DIR)){
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if(!fs.existsSync(DB_FILE)){
    fs.writeFileSync(DB_FILE, JSON.stringify({clientes:[], habitaciones:[], reservas:[], facturas:[]}, null, 2));
  }
}

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // load built renderer if exists, otherwise load renderer/index.html for dev preview
  const prodIndex = path.join(__dirname, 'renderer', 'dist', 'index.html');
  if(fs.existsSync(prodIndex)){
    win.loadFile(prodIndex);
  } else {
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  ensureDbDir();
  createWindow();
  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});

// Simple JSON DB IPC
ipcMain.handle('db:read', async () => {
  ensureDbDir();
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
});

ipcMain.handle('db:write', async (event, obj) => {
  ensureDbDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
  return { status: 'ok', path: DB_FILE };
});

// Backup: copy DB_FILE to Documents with timestamp
ipcMain.handle('db:backup', async () => {
  ensureDbDir();
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const backupPath = path.join(app.getPath('documents'), `sysmelite_backup_${ts}.json`);
  fs.copyFileSync(DB_FILE, backupPath);
  return { status: 'ok', path: backupPath };
});
