import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "node:path"
import { parseFile } from "music-metadata"
import started from "electron-squirrel-startup"
import chokidar from "chokidar"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import fs from "fs"
import fsPromises from "fs/promises"
import { existsSync } from "fs"
import { execFile } from "child_process"

const DB_PATH = path.join(app.getPath("userData"), "library.json")
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

console.log(DB_PATH)

let mainWindow
let watcher = null
let library = [] // in-memory library
let db

if (started) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
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

// Initialize the JSON database
async function initDB() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const adapter = new JSONFile(DB_PATH)
  db = new Low(adapter, { tracks: [] }) // default data
  await db.read()
  library = db.data.tracks
}

async function findAudioFiles(
  dir,
  exts = [".mp3", ".flac", ".wav", ".ogg", ".m4a"]
) {
  const results = []
  async function walk(current) {
    const entries = await fsPromises.readdir(current, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(current, e.name)
      if (e.isDirectory()) await walk(full)
      else {
        if (exts.includes(path.extname(e.name).toLowerCase()))
          results.push(full)
      }
    }
  }
  await walk(dir)
  return results
}

function makeId(filePath) {
  return Buffer.from(filePath).toString("base64url") // deterministic id
}

async function extractMetadata(filePath) {
  try {
    const meta = await parseFile(filePath, { duration: true })
    const common = meta.common || {}
    const picture = common.picture?.[0] || null

    let albumArt = null
    if (picture && picture.data && picture.data.length > 0) {
      // ensure Buffer then base64
      const base64 = Buffer.from(picture.data).toString("base64")
      albumArt = `data:${picture.format};base64,${base64}`
    }

    return {
      id: makeId(filePath),
      path: filePath,
      title: common.title || path.basename(filePath),
      artist: common.artist || "Unknown Artist",
      album: common.album || "Unknown Album",
      duration: meta.format.duration
        ? Number(meta.format.duration.toFixed(2))
        : null,
      albumArt,
    }
  } catch (err) {
    console.error("metadata error", filePath, err)
    return {
      id: makeId(filePath),
      path: filePath,
      title: path.basename(filePath),
      artist: "Unknown",
      album: "Unknown",
      duration: null,
      albumArt: null,
      error: err.message,
    }
  }
}

async function scanFolder(folderPath) {
  if (!existsSync(folderPath)) return []
  const files = await findAudioFiles(folderPath)
  const tracks = []
  for (const f of files) {
    const t = await extractMetadata(f)
    tracks.push(t)
  }
  // sort or dedupe by id
  const unique = new Map()
  for (const t of tracks) unique.set(t.id, t)
  library = [...unique.values()].sort((a, b) =>
    (a.title || "").localeCompare(b.title || "")
  )
  db.data.tracks = library
  await db.write()
  return library
}

function startWatcher(folderPath) {
  if (watcher) watcher.close()
  watcher = chokidar.watch(folderPath, { ignoreInitial: true, depth: 6 })
  watcher.on("add", async (p) => {
    const ext = path.extname(p).toLowerCase()
    if (![".mp3", ".flac", ".wav", ".ogg", ".m4a"].includes(ext)) return
    const t = await extractMetadata(p)
    library.push(t)
    db.data.tracks = library
    await db.write()
    mainWindow.webContents.send("library-updated", { type: "add", track: t })
  })
  watcher.on("unlink", (p) => {
    const id = makeId(p)
    library = library.filter((t) => t.id !== id)
    db.data.tracks = library
    db.write()
    mainWindow.webContents.send("library-updated", {
      type: "remove",
      path: p,
      id,
    })
  })
}

// IPC handlers
ipcMain.handle("select-music-folder", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select Music Folder",
    properties: ["openDirectory"],
  })
  if (result.canceled || !result.filePaths.length) return null
  const folder = result.filePaths[0]
  const lib = await scanFolder(folder)
  startWatcher(folder)
  return { folder, lib }
})

ipcMain.handle("scan-folder", async (_, folder) => {
  const lib = await scanFolder(folder)
  startWatcher(folder)
  return lib
})

ipcMain.handle("get-library", async () => {
  return library
})

ipcMain.handle("read-file", async (_, filePath) => {
  const buffer = await fsPromises.readFile(filePath)
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
})

app.whenReady().then(async () => {
  await initDB()
  await createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
