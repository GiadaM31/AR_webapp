import { ref, watch } from 'vue'

const STORAGE_KEY = 'understory-discoveries'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch (err) {
    console.warn('[discoveries] localStorage non leggibile, riparto da zero', err)
    return new Set()
  }
}

// Stato dichiarato FUORI dalla funzione useDiscoveries: è così che si crea
// uno "store" condiviso con la Composition API (senza Pinia/Vuex). Ogni
// componente che chiama useDiscoveries() legge/scrive lo stesso ref, quindi
// il badge sul pulsante e il contenuto del diario restano sempre sincronizzati.
const discovered = ref(loadFromStorage())

// watch persiste automaticamente su localStorage ogni volta che l'insieme
// delle carte scoperte cambia (nessuna chiamata esplicita di salvataggio
// sparsa nel resto del codice).
watch(
  discovered,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...value]))
    } catch (err) {
      console.warn('[discoveries] impossibile salvare su localStorage', err)
    }
  },
  { deep: true },
)

export function useDiscoveries() {
  /**
   * Segna una carta come scoperta.
   * @param {number} targetIndex
   * @returns {boolean} true se è una scoperta NUOVA (utile per mostrare un toast)
   */
  function markDiscovered(targetIndex) {
    if (discovered.value.has(targetIndex)) return false
    // Creiamo un nuovo Set invece di mutare quello esistente: riassegnando
    // discovered.value, Vue rileva il cambiamento e aggiorna la UI ovunque
    // sia usato questo composable.
    const next = new Set(discovered.value)
    next.add(targetIndex)
    discovered.value = next
    return true
  }

  function isDiscovered(targetIndex) {
    return discovered.value.has(targetIndex)
  }

  function resetDiscoveries() {
    discovered.value = new Set()
  }

  return { discovered, markDiscovered, isDiscovered, resetDiscoveries }
}
