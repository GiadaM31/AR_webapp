import { ref } from 'vue'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.js'

// Stato dichiarato FUORI dalla funzione useAuth: è così che si crea uno
// "store" condiviso con la Composition API senza bisogno di Pinia/Vuex.
// Ogni componente che chiama useAuth() legge/scrive lo stesso ref.
const currentUser = ref(null)
const isReady = ref(false)

// L'ascoltatore va agganciato una sola volta, non ad ogni chiamata di useAuth().
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  isReady.value = true
})

export function useAuth() {
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  }

  async function logout() {
    await signOut(auth)
  }

  return { currentUser, isReady, loginWithGoogle, logout }
}
