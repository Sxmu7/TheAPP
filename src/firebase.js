// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT 3: Füge hier deine Firebase-Konfiguration ein.
// Du findest sie in der Firebase Console unter:
//   Projekteinstellungen → Allgemein → Deine Apps → SDK-Konfiguration
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getDatabase }   from 'firebase/database'

const firebaseConfig = {
  apiKey:            "HIER_DEIN_API_KEY",
  authDomain:        "HIER_DEIN_PROJEKT.firebaseapp.com",
  databaseURL:       "https://HIER_DEIN_PROJEKT-default-rtdb.firebaseio.com",
  projectId:         "HIER_DEIN_PROJEKT",
  storageBucket:     "HIER_DEIN_PROJEKT.appspot.com",
  messagingSenderId: "HIER_DEINE_SENDER_ID",
  appId:             "HIER_DEINE_APP_ID",
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
