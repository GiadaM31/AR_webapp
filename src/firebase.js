import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: sostituisci questo oggetto con quello copiato da
// Project settings > Your apps nella console del TUO progetto Firebase.
// Non è un segreto da nascondere: le chiavi web di Firebase sono pubbliche
// per natura, la sicurezza vera è affidata alle regole di Firestore
// (vedi firestore.rules).
//
// Nota: non usiamo Firebase Storage, perché ormai richiede il piano a
// pagamento Blaze anche solo per essere abilitato. Le foto vengono invece
// salvate (compresse) direttamente dentro i documenti Firestore, che resta
// gratuito sul piano Spark.
const firebaseConfig = {
  apiKey: "AIzaSyB4bKC05yn-fp7DMkLUjIDJdHpmh_1V-xY",
  authDomain: "ar-proj-443bf.firebaseapp.com",
  databaseURL: "https://ar-proj-443bf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ar-proj-443bf",
  storageBucket: "ar-proj-443bf.firebasestorage.app",
  messagingSenderId: "731101692039",
  appId: "1:731101692039:web:788399c3b640066c86f822"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
