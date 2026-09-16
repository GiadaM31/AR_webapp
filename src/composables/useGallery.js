import { ref } from 'vue'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const COLLECTION = 'photos'

// Firestore ha un limite di ~1 MB per documento: ridimensioniamo e
// ricomprimiamo la foto prima di salvarla, così il risultato in Base64
// resta comodamente sotto quel limite (di solito poche decine di KB).
const MAX_DIMENSION = 720
const JPEG_QUALITY = 0.7

/**
 * Ridimensiona e ricomprime una data URL immagine usando un <canvas> offscreen.
 * @param {string} dataUrl - immagine sorgente (es. PNG a piena risoluzione)
 * @returns {Promise<string>} data URL JPEG compressa
 */
function compressImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => reject(new Error('Impossibile leggere l\'immagine da comprimere'))
    img.src = dataUrl
  })
}

export function useGallery() {
  const photos = ref([])
  const isUploading = ref(false)
  const uploadError = ref(null)
  let unsubscribeSnapshot = null

  /**
   * Attiva l'ascolto in tempo reale della galleria: ogni volta che qualcuno
   * carica una nuova foto, `photos` si aggiorna automaticamente per tutti
   * quelli che hanno la galleria aperta (onSnapshot = subscription live).
   */
  function subscribe() {
    if (unsubscribeSnapshot) return
    const photosQuery = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(60))
    unsubscribeSnapshot = onSnapshot(
      photosQuery,
      (snapshot) => {
        photos.value = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      },
      (err) => {
        console.error('[gallery] lettura fallita', err)
      },
    )
  }

  function unsubscribeGallery() {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot()
      unsubscribeSnapshot = null
    }
  }

  /**
   * Comprime la foto e la salva come documento Firestore (campo `url` =
   * data URL Base64). Niente Firebase Storage: evitiamo così il requisito
   * del piano a pagamento Blaze, restando sul piano gratuito Spark.
   * @param {string} dataUrl - immagine in formato data:image/png;base64,...
   * @param {import('firebase/auth').User} user - utente Firebase già autenticato
   */
  async function sharePhoto(dataUrl, user) {
    if (!user) {
      throw new Error('Devi accedere con Google prima di condividere una foto.')
    }

    isUploading.value = true
    uploadError.value = null

    try {
      const compressed = await compressImage(dataUrl)

      // Controllo di sicurezza: se per qualche motivo restasse troppo
      // pesante (es. immagine sorgente molto grande), avvisiamo invece di
      // fallire silenziosamente al salvataggio su Firestore.
      const approxBytes = compressed.length * 0.75
      if (approxBytes > 900_000) {
        throw new Error('Immagine troppo pesante anche dopo la compressione, riprova.')
      }

      await addDoc(collection(db, COLLECTION), {
        url: compressed,
        uid: user.uid,
        author: user.displayName || 'Esploratore anonimo',
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('[gallery] condivisione fallita', err)
      uploadError.value = err.message || 'Caricamento non riuscito. Riprova.'
      throw err
    } finally {
      isUploading.value = false
    }
  }

  return { photos, isUploading, uploadError, subscribe, unsubscribeGallery, sharePhoto }
}
