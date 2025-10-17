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

        <div class="volume-control">
          <label
            for="volume"
            @click="volume = volume > 0 ? 0 : 0.6"
            style="cursor: pointer"
          >
            {{ volume > 0 ? "🎧" : "🔇" }}
          </label>
          <input
            id="volume"
            type="range"
            v-model="volume"
            min="0"
            max="1"
            step="0.01"
          />
          <span>{{ Math.round(volume * 100) }}%</span>
        </div>
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
import { ref, watch, computed, onMounted } from "vue"
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
const volume = ref(0.6) // default vol is 60

onMounted(() => {
  if (audio.value) {
    audio.value.volume = volume.value
  }
})

watch(volume, (v) => {
  if (audio.value) {
    audio.value.volume = v
  }
})

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

.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 150px;
}

.volume-control label {
  cursor: pointer;
  font-size: 18px;
  user-select: none;
}

.volume-control input[type="range"] {
  width: 80px;
  cursor: pointer;
}

.volume-control span {
  font-size: 12px;
  color: #ccc;
  min-width: 32px;
  text-align: right;
}

.volume-control button {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition:
    transform 0.2s,
    color 0.2s;
}

.volume-control button:hover {
  transform: scale(1.2);
}
</style>
