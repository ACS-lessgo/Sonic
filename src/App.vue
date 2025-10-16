<!-- App.vue -->
<template>
  <div id="app">
    <header>
      <input v-model="folderPath" placeholder="Paste path or click select" />
      <button @click="chooseFolder">Select Folder</button>
      <button v-if="folderPath" @click="rescan">Rescan</button>
    </header>

    <main>
      <MusicGrid :tracks="tracks" @play="playTrack" />
    </main>

    <Player
      v-if="current"
      :track="current"
      :queue="tracks"
      @next="playNext"
      @prev="playPrev"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import MusicGrid from "./components/MusicGrid.vue"
import Player from "./components/Player.vue"

const folderPath = ref("")
const tracks = ref([])
const current = ref(null)

async function chooseFolder() {
  const res = await window.electronAPI.selectMusicFolder()
  if (!res) return
  folderPath.value = res.folder
  tracks.value = res.lib
}

async function rescan() {
  if (!folderPath.value) return
  tracks.value = await window.electronAPI.scanFolder(folderPath.value)
}

function playTrack(track) {
  current.value = track
}

function playNext() {
  if (!current.value) return
  const idx = tracks.value.findIndex((t) => t.id === current.value.id)
  const next = tracks.value[(idx + 1) % tracks.value.length]
  current.value = next
}

function playPrev() {
  if (!current.value) return
  const idx = tracks.value.findIndex((t) => t.id === current.value.id)
  const prev =
    tracks.value[(idx - 1 + tracks.value.length) % tracks.value.length]
  current.value = prev
}

onMounted(async () => {
  const lib = await window.electronAPI.getLibrary()
  tracks.value = lib || []
  window.electronAPI.onLibraryUpdated((data) => {
    if (data.type === "add") tracks.value.push(data.track)
    if (data.type === "remove")
      tracks.value = tracks.value.filter((t) => t.id !== data.id)
  })
})
</script>

<style></style>
