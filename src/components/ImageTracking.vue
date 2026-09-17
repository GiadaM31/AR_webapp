<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import LeafFrame from './LeafFrame.vue'
import WoodSign from './WoodSign.vue'
import DiscoveryJournal from './DiscoveryJournal.vue'
import { useDiscoveries } from '../composables/useDiscoveries.js'
import { useCardsData } from '../composables/useCardsData.js'

// Stato: quale/i target sono attualmente inquadrati (per mostrare un piccolo
// indicatore testuale utile in fase di test/demo).
const activeTargets = ref(new Set())
const sceneEl = ref(null)

// L'audio sui browser mobile è bloccato finché l'utente non interagisce
// almeno una volta con la pagina: mostriamo un overlay "tocca per iniziare"
// e solo dopo il tap sblocchiamo (unmute) i video.
const audioUnlocked = ref(false)

const { markDiscovered } = useDiscoveries()
const isJournalOpen = ref(false)
const toastMessage = ref('')
let toastTimeout = null

function showDiscoveryToast(name) {
  toastMessage.value = `Nuova pagina nel diario: ${name}`
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// I dati delle 3 carte (nome, video, immagine) NON sono più scritti a mano
// qui nel codice: arrivano da un Google Sheet usato come CMS, così puoi
// cambiarli senza toccare il codice né rifare il deploy.
const { cards, isLoading: isLoadingCards, error: cardsError, fetchCards } = useCardsData()

onMounted(fetchCards)

let listeners = []

/**
 * Aggancia i listener targetFound/targetLost alle entità AR. Viene
 * richiamata dopo che sia i dati delle carte (da Google Sheet) sia la scena
 * <a-scene> sono stati montati nel DOM.
 */
function setupTrackingListeners() {
  const scene = sceneEl.value
  if (!scene) return

  const attach = () => {
    cards.value.forEach((card) => {
      const targetEl = scene.querySelector(`#target-${card.targetIndex}`)
      const videoEl = document.getElementById(card.videoId)
      if (!targetEl || !videoEl) return
      videoEl.muted = true // stato iniziale, sbloccato dal tap sull'overlay

      const onFound = () => {
        activeTargets.value.add(card.targetIndex)
        activeTargets.value = new Set(activeTargets.value)
        videoEl.currentTime = 0
        videoEl.muted = !audioUnlocked.value
        videoEl.play().catch(() => {
          videoEl.muted = true
          videoEl.play().catch(() => {})
        })

        const isNewDiscovery = markDiscovered(card.targetIndex)
        if (isNewDiscovery) {
          showDiscoveryToast(card.name)
        }
      }

      const onLost = () => {
        activeTargets.value.delete(card.targetIndex)
        activeTargets.value = new Set(activeTargets.value)
        videoEl.pause()
      }

      targetEl.addEventListener('targetFound', onFound)
      targetEl.addEventListener('targetLost', onLost)
      listeners.push({ targetEl, onFound, onLost })
    })
  }

  if (scene.hasLoaded) {
    attach()
  } else {
    scene.addEventListener('loaded', attach)
  }
}

// <a-scene> viene creata solo DOPO che i dati sono arrivati dal foglio
// (v-if="cards.length" nel template), quindi aspettiamo che sia `cards` sia
// il prossimo giro di rendering (nextTick) siano pronti prima di agganciare
// i listener sulla scena vera e propria.
watch(cards, async (value) => {
  if (value.length === 0) return
  await nextTick()
  setupTrackingListeners()
})

function unlockAudio() {
  audioUnlocked.value = true
  cards.value.forEach((card) => {
    const videoEl = document.getElementById(card.videoId)
    if (!videoEl) return
    videoEl.muted = false
    videoEl.play().then(() => {
      videoEl.pause()
      videoEl.currentTime = 0
    }).catch(() => {
      videoEl.muted = true
    })
  })
}

onBeforeUnmount(() => {
  listeners.forEach(({ targetEl, onFound, onLost }) => {
    targetEl.removeEventListener('targetFound', onFound)
    targetEl.removeEventListener('targetLost', onLost)
  })
  listeners = []
  clearTimeout(toastTimeout)
})
</script>

<template>
  <div class="ar-wrapper">
    <!-- Caricamento dati dal Google Sheet -->
    <div v-if="isLoadingCards" class="status-overlay">
      <WoodSign>Carico le carte dal diario…</WoodSign>
    </div>

    <!-- Errore nel caricamento (foglio non raggiungibile/non condiviso) -->
    <div v-else-if="cardsError" class="status-overlay">
      <p class="status-error">{{ cardsError }}</p>
    </div>

    <template v-else>
      <!--
        imageTargetSrc punta al file .mind compilato dalle 3 immagini delle
        carte (vedi istruzioni per generarlo). Deve stare in /public/targets.mind.
      -->
      <a-scene
        ref="sceneEl"
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiScanning: yes; uiLoading: yes;"
        color-space="sRGB"
        renderer="colorManagement: true; physicallyCorrectLights: true;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: true"
        embedded
      >
        <a-assets>
          <video
            v-for="card in cards"
            :key="card.videoId"
            :id="card.videoId"
            :src="card.videoSrc"
            preload="auto"
            loop
            playsinline
            webkit-playsinline
            crossorigin="anonymous"
          ></video>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false" raycaster="near: 10; far: 10000;"></a-camera>

        <a-entity
          v-for="card in cards"
          :key="card.targetIndex"
          :id="`target-${card.targetIndex}`"
          :mindar-image-target="`targetIndex: ${card.targetIndex}`"
        >
          <a-video
            :src="`#${card.videoId}`"
            :width="card.width"
            :height="card.height"
            position="0 0 0"
            rotation="0 0 0"
          ></a-video>
        </a-entity>
      </a-scene>

      <!-- Overlay obbligatorio: il tap sblocca l'audio dei video per i browser mobile -->
      <div v-if="!audioUnlocked" class="start-overlay" @click="unlockAudio">
        <div class="start-card">
          <LeafFrame :opacity="0.9" />
          <p class="start-eyebrow">The UnderStory</p>
          <p class="start-title">Tocca per entrare nel sottobosco</p>
          <p class="start-subtitle">Attiva fotocamera e audio, poi inquadra una delle 3 carte</p>
        </div>
      </div>

      <!-- Indicatore di debug: rimuovibile, utile durante lo sviluppo -->
      <WoodSign v-else class="status-badge">
        <span v-if="activeTargets.size === 0">Inquadra una carta…</span>
        <span v-else>Carta {{ [...activeTargets].map(i => i + 1).join(', ') }} riconosciuta</span>
      </WoodSign>

      <!-- Pulsante diario delle scoperte -->
      <button v-if="audioUnlocked" class="journal-btn" @click="isJournalOpen = true" aria-label="Apri il diario">
        📖
      </button>

      <!-- Avviso di nuova scoperta -->
      <Transition name="toast">
        <div v-if="toastMessage" class="discovery-toast">
          <WoodSign>{{ toastMessage }}</WoodSign>
        </div>
      </Transition>

      <DiscoveryJournal v-if="isJournalOpen" :cards="cards" @close="isJournalOpen = false" />
    </template>
  </div>
</template>

<style scoped>
.ar-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.ar-wrapper :deep(a-scene) {
  width: 100%;
  height: 100%;
}

.status-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.status-error {
  max-width: 22rem;
  text-align: center;
  font-family: 'Lora', serif;
  color: var(--cream);
  background: var(--berry);
  border: 2px solid var(--bark-dark);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
}

.start-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  cursor: pointer;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(60, 50, 30, 0.55) 0%, rgba(10, 8, 5, 0.9) 70%),
    var(--ink);
}

.start-card {
  position: relative;
  isolation: isolate;
  max-width: 22rem;
  width: 100%;
  padding: 2.75rem 1.75rem 2rem;
  border-radius: 0.5rem;
  background: var(--cream);
  border: 3px solid var(--bark-dark);
  box-shadow:
    0 0 0 6px rgba(166, 96, 62, 0.35),
    0 12px 30px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: var(--ink);
  overflow: hidden;
}

.start-eyebrow,
.start-title,
.start-subtitle {
  position: relative;
  z-index: 1;
}

.start-eyebrow {
  margin: 0 0 0.35rem;
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
  color: var(--forest);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.start-title {
  margin: 0 0 0.6rem;
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: 1.9rem;
  line-height: 1.15;
  color: var(--bark-dark);
}

.start-subtitle {
  margin: 0;
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.45;
}

.journal-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  border: 3px solid var(--bark-dark);
  background: radial-gradient(circle at 35% 30%, #c8834f 0%, var(--bark) 55%, #7a4127 100%);
  font-size: 1.5rem;
  box-shadow:
    0 3px 0 var(--bark-dark),
    0 6px 16px rgba(0, 0, 0, 0.45);
  z-index: 15;
  cursor: pointer;
  touch-action: manipulation;
}

.status-badge {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.discovery-toast {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  pointer-events: none;
}

@media (max-width: 640px) {
  .start-overlay {
    padding: 1rem;
  }

  .start-card {
    max-width: 18rem;
    padding: 2.15rem 1.15rem 1.4rem;
  }

  .start-title {
    font-size: 1.6rem;
  }

  .start-subtitle {
    font-size: 0.8rem;
  }

  .journal-btn {
    width: 3rem;
    height: 3rem;
    right: 1rem;
    bottom: 1rem;
    font-size: 1.3rem;
  }

  .status-badge {
    bottom: 0.9rem;
  }

  .discovery-toast {
    top: 0.75rem;
    max-width: calc(100vw - 1.5rem);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}
</style>
