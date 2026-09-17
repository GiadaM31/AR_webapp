import { ref } from 'vue'

// TODO: incolla qui l'ID del tuo Google Sheet (dal Passo 4: la parte tra
// /d/ e /edit nell'URL del foglio) e, se la tua scheda non si chiama
// "Foglio1", correggi anche SHEET_NAME.
const SHEET_ID = '1OPkAucLCn3HcQEZEY_WYAYFdA5VRjlILFME94U8OrUs'
const SHEET_NAME = 'Foglio1'

// Usiamo l'endpoint "gviz" di Google: è pensato apposta per essere letto da
// pagine esterne (serve i grafici/gadget incorporabili di Google Sheets),
// quindi a differenza del link "Pubblica sul web" classico non dà problemi
// di CORS quando lo richiami con fetch() dal browser.
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`

/** Split di una riga CSV rispettando i campi tra virgolette. */
function splitCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result.map((value) => value.trim())
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    const row = {}
    headers.forEach((header, i) => {
      row[header] = values[i] ?? ''
    })
    return row
  })
}

export function useCardsData() {
  const cards = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  async function fetchCards() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(CSV_URL)
      if (!response.ok) {
        throw new Error(`Richiesta al foglio Google fallita (${response.status})`)
      }
      const text = await response.text()
      const rows = parseCsv(text)

      cards.value = rows
        .map((row) => {
          const targetIndex = Number(row.targetIndex)
          return {
            targetIndex,
            name: row.nome,
            videoId: `video${targetIndex}`,
            videoSrc: `/videos/${row.video}`,
            image: `/cards/${row.immagine}`,
            // Dimensioni del piano video in AR: se i tuoi video non sono
            // 16:9, valuta di aggiungere una colonna "aspect" al foglio.
            width: 1,
            height: 0.5625,
          }
        })
        .sort((a, b) => a.targetIndex - b.targetIndex)
    } catch (err) {
      console.error('[cards-data] impossibile leggere il Google Sheet', err)
      error.value =
        'Impossibile caricare i contenuti dal foglio Google. Controlla la connessione o i permessi di condivisione del foglio.'
    } finally {
      isLoading.value = false
    }
  }

  return { cards, isLoading, error, fetchCards }
}
