<script setup>
import LeafFrame from './LeafFrame.vue'

// Componente "presentazionale" puro: non conosce MindAR né la logica di
// cattura, riceve solo l'immagine via props ed emette eventi verso il
// genitore. Buon esempio di comunicazione props-down / events-up.
defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'download'])
</script>

<template>
  <!-- Teleport: la modale esce dal DOM di <a-scene> e viene montata
       direttamente su <body>, evitando problemi di stacking/overlay con il
       canvas WebGL sottostante. -->
  <Teleport to="body">
    <Transition name="fade" appear>
      <div class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-card">
          <LeafFrame :opacity="0.85" />
          <p class="modal-eyebrow">The UnderStory</p>
          <img :src="imageSrc" alt="Foto catturata dall'esperienza AR" class="modal-image" />
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="emit('close')">Chiudi</button>
            <button class="btn btn-primary" @click="emit('download')">Scarica</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
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

.modal-card {
  position: relative;
  width: 100%;
  max-width: 26rem;
  background: var(--cream);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 3px solid var(--bark-dark);
  box-shadow:
    0 0 0 6px rgba(166, 96, 62, 0.35),
    0 12px 30px rgba(0, 0, 0, 0.5);
  padding-top: 1.5rem;
}

.modal-eyebrow {
  margin: 0 0 0.75rem;
  text-align: center;
  font-family: 'Caveat', cursive;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--forest);
}

.modal-image {
  width: calc(100% - 2rem);
  margin: 0 1rem;
  border-radius: 0.25rem;
  display: block;
  border: 2px solid var(--bark-dark);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1rem 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  border: 2px solid var(--bark-dark);
  font-family: 'Caveat', cursive;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(180deg, #b97a50 0%, var(--bark) 45%, #8c4e33 100%);
  color: var(--cream);
  box-shadow: 0 3px 0 var(--bark-dark);
}

.btn-secondary {
  background: transparent;
  color: var(--bark-dark);
}

/* Transition classes per l'apparizione della modale */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
