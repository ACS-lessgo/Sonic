import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "node:path"
import { parseFile } from "music-metadata"
import started from "electron-squirrel-startup"

if (started) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

ipcMain.handle("select-music-files", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select Music Files",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Audio Files", extensions: ["mp3", "flac", "wav", "ogg", "m4a"] },
    ],
  })

  if (result.canceled) return []

  const files = result.filePaths
  const metadataList = []

  for (const file of files) {
    try {
      const metadata = await parseFile(file)
      const pic = metadata.common.picture?.[0]

      let albumArt = null
      if (pic && pic.data && pic.data.length > 0) {
        const base64 = Buffer.from(pic.data).toString("base64")
        albumArt = `data:${pic.format};base64,${base64}`
      }

      metadataList.push({
        title: metadata.common.title || path.basename(file),
        artist: metadata.common.artist || "Unknown Artist",
        album: metadata.common.album || "Unknown Album",
        duration: metadata.format.duration?.toFixed(2) || "N/A",
        path: file,
        albumArt,
      })
    } catch (err) {
      metadataList.push({ error: err.message, path: file })
    }
  }

  return metadataList
})

app.whenReady().then(() => {
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
