import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  selectMusicFiles: () => ipcRenderer.invoke("select-music-files"),
})
