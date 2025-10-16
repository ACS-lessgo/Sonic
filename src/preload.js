// preload.js
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  selectMusicFolder: () => ipcRenderer.invoke("select-music-folder"),
  scanFolder: (folder) => ipcRenderer.invoke("scan-folder", folder),
  getLibrary: () => ipcRenderer.invoke("get-library"),
  onLibraryUpdated: (cb) => {
    ipcRenderer.on("library-updated", (_e, data) => cb(data))
  },
})
