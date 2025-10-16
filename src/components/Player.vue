<!-- components/Player.vue -->
<template>
  <div class="player">
    <img :src="track.albumArt || placeholder" alt="cover" class="cover" />
    <div class="info">
      <div class="title">{{ track.title }}</div>
      <div class="artist">{{ track.artist }}</div>

      <div class="controls">
        <button @click="prev">⏮</button>
        <button @click="togglePlay">{{ playing ? "⏸" : "▶" }}</button>
        <button @click="next">⏭</button>
        <input
          type="range"
          v-model="pos"
          @change="seek"
          min="0"
          :max="duration"
        />
        <div>{{ format(pos) }} / {{ format(duration) }}</div>
      </div>
    </div>
    <audio
      ref="audio"
      :src="fileUrl"
      @timeupdate="onTime"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"
const props = defineProps({ track: Object, queue: Array })
const emit = defineEmits(["next", "prev"])

const audio = ref(null)
const playing = ref(false)
const pos = ref(0)
const duration = ref(0)
const placeholder =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='#222' width='100%' height='100%'/></svg>`
  )

const fileUrl = computed(() =>
  props.track ? `file://${props.track.path}` : ""
)

watch(
  () => props.track,
  (t) => {
    if (!t) return
    // load and play
    pos.value = 0
    playing.value = false
    setTimeout(() => {
      if (!audio.value) return
      audio.value.load()
      audio.value.onloadedmetadata = () => {
        duration.value =
          audio.value.duration ||
          (props.track.duration ? Number(props.track.duration) : 0)
      }
      audio.value
        .play()
        .then(() => (playing.value = true))
        .catch(() => {})
    }, 50)
  }
)

function togglePlay() {
  if (!audio.value) return
  if (playing.value) {
    audio.value.pause()
    playing.value = false
  } else {
    audio.value.play()
    playing.value = true
  }
}

function onTime() {
  pos.value = audio.value.currentTime
}

function seek() {
  if (!audio.value) return
  audio.value.currentTime = pos.value
}

function next() {
  emit("next")
}
function prev() {
  emit("prev")
}
function onEnded() {
  emit("next")
}

function format(s) {
  if (!s && s !== 0) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0")
  return `${m}:${sec}`
}
</script>

<style scoped>
.player {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: #111;
  color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
.cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.info {
  flex: 1;
}
.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}
input[type="range"] {
  flex: 1;
}
</style>
