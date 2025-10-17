<template>
  <div>
    <!-- GRID VIEW -->
    <div v-if="viewMode === 'grid'" class="grid">
      <div
        v-for="t in tracks"
        :key="t.id"
        class="card"
        @click="$emit('play', t)"
      >
        <div class="cover">
          <img :src="t.albumArt || placeholder" alt="cover" />
          <div class="hover-play">▶</div>
        </div>
        <div class="meta">
          <div class="title">{{ t.title }}</div>
          <div class="artist">{{ t.artist }}</div>
        </div>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-else-if="viewMode === 'list'" class="list">
      <div
        v-for="t in tracks"
        :key="t.id"
        class="list-item"
        @click="$emit('play', t)"
      >
        <img :src="t.albumArt || placeholder" class="list-cover" />
        <div class="list-meta">
          <div class="title">{{ t.title }}</div>
          <div class="artist">{{ t.artist }}</div>
        </div>
        <button class="more-btn" @click.stop="openMenu(t)">⋮</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tracks: { type: Array, default: () => [] },
  viewMode: { type: String, default: "grid" },
})

const placeholder =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect fill='#333' width='100%' height='100%'/><text x='50%' y='50%' fill='#fff' font-size='20' text-anchor='middle' alignment-baseline='middle'>No Art</text></svg>`
  )

function openMenu(track) {
  console.log("Options for:", track.title)
  // TODO: open a custom menu
}
</script>

<style scoped>
/* --- GRID VIEW --- */
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.card {
  position: relative;
  cursor: pointer;
  background: #2a2a2a;
  color: #fff;
  padding: 8px;
  border-radius: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.cover {
  position: relative;
}
.cover img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
}

/* Hover play button */
.hover-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: rgb(226, 219, 219);
  opacity: 0;
  transition:
    opacity 0.2s,
    transform 0.2s;
  pointer-events: none;
}
.card:hover .hover-play {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
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
.artist {
  color: #bbb;
  font-size: 12px;
}

/* --- LIST VIEW --- */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e1e1e;
  color: #fff;
  padding: 10px;
  transition: background 0.2s ease;
  border-bottom: #bdb5b5d5 1px solid;
}

.list-item:hover {
  background: #2a2a2a;
}

.list-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 10px;
}

.list-meta {
  flex: 1;
  overflow: hidden;
}

.title {
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.artist {
  font-size: 13px;
  color: #aaa;
}

.more-btn {
  background: transparent;
  border: none;
  color: #bbb;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  right: 0;
}

.more-btn:hover {
  background: #333;
  color: #fff;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .masonry {
    column-count: 2;
  }
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  .masonry {
    column-count: 1;
  }
}
</style>
