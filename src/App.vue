<template>
  <div id="app">
    <div v-if="noMusicLoaded">
      <header>
        <input v-model="folderPath" placeholder="Paste path or click select" />
        <button @click="chooseFolder">Select Folder</button>
        <button v-if="folderPath" @click="rescan">Rescan</button>
      </header>
    </div>

    <!-- View switcher -->
    <div v-if="!noMusicLoaded" class="view-switcher">
      <button
        @click="viewMode = 'grid'"
        :class="{ active: viewMode === 'grid' }"
      >
        Grid
      </button>
      <button
        @click="viewMode = 'list'"
        :class="{ active: viewMode === 'list' }"
      >
        List
      </button>
      <button
        @click="viewMode = 'masonry'"
        :class="{ active: viewMode === 'masonry' }"
      >
        Masonry
      </button>
    </div>

    <!-- Music library -->
    <main>
      <div v-if="noMusicLoaded" class="empty-state">
        <p>No music loaded. Select a folder to start.</p>
      </div>

      <MusicGrid
        v-else
        :tracks="tracks"
        :view-mode="viewMode"
        @play="playTrack"
      />
    </main>

    <!-- Player -->
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
import { ref, onMounted, computed } from "vue"
import MusicGrid from "./components/MusicGrid.vue"
import Player from "./components/Player.vue"

const folderPath = ref("")
const tracks = ref([])
const current = ref(null)
const viewMode = ref("grid") // grid / list / masonry
const noMusicLoaded = computed(() => tracks.value.length === 0)

// Folder selection
async function chooseFolder() {
  const res = await window.electronAPI.selectMusicFolder()
  if (!res) return
  folderPath.value = res.folder
  tracks.value = res.lib
}

// Rescan folder
async function rescan() {
  if (!folderPath.value) return
  tracks.value = await window.electronAPI.scanFolder(folderPath.value)
}

// Play a track
function playTrack(track) {
  current.value = track
}

// Next / Previous track
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

// Load library on mount
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

<style scoped>
/* App background */
#app {
  background-color: #212121;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
header {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 12px;
  margin: 12px;
  align-items: center;
}

header input {
  flex: 1;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: #2a2a2a;
  color: #fff;
}

header button {
  background: #1db954;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

header button:hover {
  background: #1ed760;
}

/* View switcher */
.view-switcher {
  display: flex;
  gap: 8px;
  margin: 12px;
  position: sticky;
  top: 12px;
}

.view-switcher button {
  background: #333;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-switcher button.active {
  background: #1db954;
  color: #fff;
}

.view-switcher button:hover:not(.active) {
  background: #444;
}

/* Main content */
main {
  flex: 1;
  padding: 12px;
}

/* Empty state */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #aaa;
}
</style>
