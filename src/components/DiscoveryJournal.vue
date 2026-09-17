<script setup>
import LeafFrame from './LeafFrame.vue'
import WoodSign from './WoodSign.vue'
import { useDiscoveries } from '../composables/useDiscoveries.js'

// Riceve solo i metadati delle carte (indice, nome, immagine) dal genitore;
// lo stato di "scoperta" arriva invece dal composable condiviso, non da una
// prop — due modi diversi di far arrivare dati a un componente, utile da
// mostrare a lezione.
defineProps({
  cards: {
    type: Array,
    required: true,
  },
})

defineEmits(['close'])

const { isDiscovered, resetDiscoveries } = useDiscoveries()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade" appear>
      <div class="journal-backdrop" @click.self="$emit('close')">
        <div class="journal-card">
          <LeafFrame :opacity="0.85" />

          <div class="journal-header">
            <WoodSign>Il Diario del Sottobosco</WoodSign>
            <button class="close-btn" @click="$emit('close')" aria-label="Chiudi diario">✕</button>
          </div>

          <ul class="journal-grid">
            <li v-for="card in cards" :key="card.targetIndex" class="journal-entry">
              <div class="entry-image-wrap">
                <img
                  :src="card.image"
                  :alt="isDiscovered(card.targetIndex) ? card.name : 'Carta non ancora scoperta'"
                  class="entry-image"
                  :class="{ 'entry-image--locked': !isDiscovered(card.targetIndex) }"
                />
                <span v-if="!isDiscovered(card.targetIndex)" class="entry-lock">?</span>
              </div>
              <p class="entry-name">
                {{ isDiscovered(card.targetIndex) ? card.name : '??? — non ancora scoperta' }}
              </p>
            </li>
          </ul>

          <button class="reset-link" @click="resetDiscoveries">Ricomincia da capo</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.journal-backdrop {
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

.journal-card {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 30rem;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--cream);
  border-radius: 0.5rem;
  border: 3px solid var(--bark-dark);
  box-shadow:
    0 0 0 6px rgba(166, 96, 62, 0.35),
    0 12px 30px rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
}

@media (max-width: 640px) {
  .journal-backdrop {
    padding: 0.75rem;
  }

  .journal-card {
    max-width: 100%;
    padding: 1rem;
  }

  .journal-header {
    gap: 0.75rem;
  }

  .close-btn {
    font-size: 1.1rem;
  }
}

.journal-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  color: var(--bark-dark);
  cursor: pointer;
  line-height: 1;
}

.journal-grid {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 1.25rem;
}

.journal-entry {
  text-align: center;
}

.entry-image-wrap {
  position: relative;
  border: 2px solid var(--bark-dark);
  border-radius: 0.35rem;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background: #000;
}

.entry-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.5s ease;
}

.entry-image--locked {
  filter: grayscale(1) brightness(0.3) blur(3px);
}

.entry-lock {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Caveat', cursive;
  font-size: 2.5rem;
  color: var(--cream);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.entry-name {
  margin: 0.5rem 0 0;
  font-family: 'Caveat', cursive;
  font-size: 1.05rem;
  color: var(--bark-dark);
  line-height: 1.2;
}

.reset-link {
  position: relative;
  z-index: 1;
  display: block;
  margin: 1.5rem auto 0;
  background: none;
  border: none;
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: var(--forest);
  text-decoration: underline;
  cursor: pointer;
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
