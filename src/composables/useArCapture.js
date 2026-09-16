import { ref } from 'vue'

/**
 * Composable per catturare uno screenshot della scena AR.
 *
 * MindAR disegna il feed della fotocamera come sfondo della scena three.js
 * e il video/overlay 3D sopra, tutto nello stesso <canvas> WebGL: significa
 * che il canvas generato da <a-scene> contiene GIÀ la composizione finale
 * (fotocamera + video sulla carta). Per "fotografarla" basta leggere quel
 * canvas con toDataURL(), senza dover comporre nulla manualmente.
 *
 * @param {import('vue').Ref<HTMLElement | null>} containerRef - ref al contenitore che avvolge <a-scene>
 */
export function useArCapture(containerRef) {
  const capturedImage = ref(null)
  const isModalOpen = ref(false)
  const captureError = ref(null)

  function capture() {
    captureError.value = null
    const canvas = containerRef.value?.querySelector('canvas')

    if (!canvas) {
      captureError.value = 'Scena AR non ancora pronta.'
      return
    }

    try {
      capturedImage.value = canvas.toDataURL('image/png')
      isModalOpen.value = true
    } catch (err) {
      // Si verifica un errore "tainted canvas" se un asset (es. un video)
      // viene caricato da un'origine diversa senza le corrette intestazioni
      // CORS. Con video serviti dalla stessa app (public/videos/...) non
      // dovrebbe succedere.
      console.error('Impossibile catturare lo screenshot:', err)
      captureError.value = 'Impossibile catturare lo screenshot (errore CORS sul canvas).'
    }
  }

  function closeModal() {
    isModalOpen.value = false
  }

  function downloadCapture() {
    if (!capturedImage.value) return
    const link = document.createElement('a')
    link.href = capturedImage.value
    link.download = `ar-capture-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return {
    capturedImage,
    isModalOpen,
    captureError,
    capture,
    closeModal,
    downloadCapture,
  }
}
