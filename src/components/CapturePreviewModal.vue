<script setup>
import { ref } from 'vue'
import LeafFrame from './LeafFrame.vue'
import { useAuth } from '../composables/useAuth.js'
import { useGallery } from '../composables/useGallery.js'

// Componente "presentazionale" per la parte di anteprima/download; per la
// condivisione usa direttamente i composable di auth e galleria, così il
// genitore (ImageTracking.vue) non deve preoccuparsene.
const props = defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'download'])

const { currentUser, loginWithGoogle } = useAuth()
const { isUploading, uploadError, sharePhoto } = useGallery()

const shareState = ref('idle') // 'idle' | 'sharing' | 'done'

async function handleShare() {
  try {
    let user = currentUser.value
    if (!user) {
      user = await loginWithGoogle()
    }
    shareState.value = 'sharing'
    await sharePhoto(props.imageSrc, user)
    shareState.value = 'done'
  } catch (err) {
    // Il messaggio d'errore leggibile è già in uploadError (composable) o
    // in err.message se il login viene annullato dall'utente.
    shareState.value = 'idle'
    console.error('[capture-modal] condivisione non riuscita', err)
  }
}
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

          <p v-if="shareState === 'done'" class="modal-feedback modal-feedback--ok">
            Condivisa nella galleria! 🌿
          </p>
          <p v-else-if="uploadError" class="modal-feedback modal-feedback--error">
            {{ uploadError }}
          </p>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="emit('close')">Chiudi</button>
            <button class="btn btn-secondary" @click="emit('download')">Scarica</button>
            <button
              class="btn btn-primary"
              :disabled="isUploading || shareState === 'sharing' || shareState === 'done'"
              @click="handleShare"
            >
              <span v-if="isUploading || shareState === 'sharing'">Condivido…</span>
              <span v-else-if="shareState === 'done'">Fatto ✓</span>
              <span v-else-if="currentUser">Condividi</span>
              <span v-else>Accedi e condividi</span>
            </button>
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

.modal-feedback {
  margin: 0.75rem 1rem 0;
  font-family: 'Lora', serif;
  font-size: 0.85rem;
  text-align: center;
}

.modal-feedback--ok {
  color: var(--forest);
}

.modal-feedback--error {
  color: var(--berry);
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1.25rem 1rem 1.5rem;
}

.btn {
  flex: 1;
  min-width: 7rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid var(--bark-dark);
  font-family: 'Caveat', cursive;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
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
