<template>
  <div class="app">
    <h1>Sonic Metadata</h1>
    <button @click="openAndReadFiles">Select Music Files</button>

    <div v-for="(file, i) in metadata" :key="i" class="song">
      <p>
        <b>{{ file.title }}</b> — {{ file.artist }} ({{ file.album }})
      </p>
      <p>
        <small>{{ file.duration }}s</small>
      </p>

      <!-- ✅ Display album art if it exists -->
      <img
        v-if="file.albumArt"
        :src="file.albumArt"
        alt="Album Art"
        style="
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
        "
      />
      <hr />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const metadata = ref([])

const openAndReadFiles = async () => {
  const result = await window.electronAPI.selectMusicFiles()
  console.log("Result", result)
  metadata.value = result
}
</script>
