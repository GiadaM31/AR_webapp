<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import LeafFrame from './LeafFrame.vue'
import WoodSign from './WoodSign.vue'
import { useGallery } from '../composables/useGallery.js'

defineEmits(['close'])

const { photos, subscribe, unsubscribeGallery } = useGallery()

// L'ascolto in tempo reale parte quando la galleria si apre e si ferma alla
// chiusura: evita di tenere una connessione a Firestore attiva inutilmente.
onMounted(subscribe)
onBeforeUnmount(unsubscribeGallery)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade" appear>
      <div class="gallery-backdrop" @click.self="$emit('close')">
        <div class="gallery-card">
          <LeafFrame :opacity="0.85" />

          <div class="gallery-header">
            <WoodSign>Galleria del sottobosco</WoodSign>
            <button class="close-btn" @click="$emit('close')" aria-label="Chiudi galleria">✕</button>
          </div>

          <p v-if="photos.length === 0" class="gallery-empty">
            Nessuna foto condivisa ancora. Scatta e condividi la prima! 🌿
          </p>

          <div v-else class="gallery-grid">
            <figure v-for="photo in photos" :key="photo.id" class="gallery-item">
              <img :src="photo.url" :alt="`Foto condivisa da ${photo.author}`" loading="lazy" />
              <figcaption>{{ photo.author }}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gallery-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(60, 50, 30, 0.55) 0%, rgba(10, 8, 5, 0.9) 70%),
    var(--ink);
  padding: 1.5rem;
}

.gallery-card {
  position: relative;
  width: 100%;
  max-width: 40rem;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--cream);
  border-radius: 0.5rem;
  border: 3px solid var(--bark-dark);
  box-shadow:
    0 0 0 6px rgba(166, 96, 62, 0.35),
    0 12px 30px rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 6;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  color: var(--bark-dark);
  cursor: pointer;
  line-height: 1;
}

.gallery-empty {
  font-family: 'Lora', serif;
  font-style: italic;
  color: var(--ink);
  opacity: 0.75;
  text-align: center;
  padding: 2rem 1rem;
}

.gallery-grid {
  position: relative;
  z-index: 6;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 1rem;
}

.gallery-item {
  margin: 0;
  background: #fff;
  padding: 0.4rem 0.4rem 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: rotate(-1.5deg);
}

.gallery-item:nth-child(even) {
  transform: rotate(1.5deg);
}

.gallery-item img {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery-item figcaption {
  margin-top: 0.35rem;
  font-family: 'Caveat', cursive;
  font-size: 0.95rem;
  text-align: center;
  color: var(--ink);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
