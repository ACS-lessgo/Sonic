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
      </div>
    </div>

    <!-- MASONRY VIEW -->
    <div v-else-if="viewMode === 'masonry'" class="masonry">
      <div
        v-for="t in tracks"
        :key="t.id"
        class="masonry-card"
        @click="$emit('play', t)"
      >
        <img :src="t.albumArt || placeholder" />
        <div class="overlay">
          <div class="title">{{ t.title }}</div>
          <div class="artist">{{ t.artist }}</div>
        </div>
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
  color: #1db954;
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
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.2s;
}
.list-item:hover {
  background: #333;
  transform: translateX(4px);
}
.list-cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}
.list-meta .title {
  font-weight: 600;
}
.list-meta .artist {
  font-size: 12px;
  color: #bbb;
}

/* --- MASONRY VIEW --- */
.masonry {
  column-count: 3;
  column-gap: 12px;
}
.masonry-card {
  break-inside: avoid;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.masonry-card img {
  width: 100%;
  display: block;
  border-radius: 12px;
}
.masonry-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
}
.masonry-card .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(33, 33, 33, 0.9),
    rgba(33, 33, 33, 0)
  );
  color: #fff;
  padding: 8px;
  font-size: 13px;
}
.masonry-card .overlay .title {
  font-weight: 600;
}
.masonry-card .overlay .artist {
  font-size: 12px;
  color: #ccc;
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
