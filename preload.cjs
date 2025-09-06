const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readDB: () => ipcRenderer.invoke('db:read'),
  writeDB: (obj) => ipcRenderer.invoke('db:write', obj),
  backupDB: () => ipcRenderer.invoke('db:backup')
});
