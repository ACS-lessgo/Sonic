<!-- components/MusicGrid.vue -->
<template>
  <div class="grid">
    <div
      v-for="t in tracks"
      :key="t.id"
      class="card"
      @dblclick="$emit('play', t)"
    >
      <div class="cover">
        <img :src="t.albumArt || placeholder" alt="cover" />
      </div>
      <div class="meta">
        <div class="title">{{ t.title }}</div>
        <div class="artist">{{ t.artist }}</div>
        <div class="album">{{ t.album }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
const props = defineProps({ tracks: { type: Array, default: () => [] } })
const placeholder =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect fill='#333' width='100%' height='100%'/><text x='50%' y='50%' fill='#fff' font-size='20' text-anchor='middle' alignment-baseline='middle'>No Art</text></svg>`
  )
</script>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  padding: 12px;
}
.card {
  cursor: pointer;
  background: #111;
  color: #fff;
  padding: 8px;
  border-radius: 8px;
}
.cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
}
.meta {
  margin-top: 6px;
  font-size: 13px;
}
.title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist,
.album {
  color: #bbb;
  font-size: 12px;
}
</style>
