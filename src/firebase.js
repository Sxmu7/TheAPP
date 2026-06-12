import { initializeApp } from 'firebase/app'
import { getDatabase }   from 'firebase/database'

const firebaseConfig = {
  apiKey:            "AIzaSyD1shmrqKKiXJhTeBLlLAVcB8KcJgD1fvc",
  authDomain:        "the-app-6912e.firebaseapp.com",
  databaseURL:       "https://the-app-6912e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "the-app-6912e",
  storageBucket:     "the-app-6912e.firebasestorage.app",
  messagingSenderId: "537113841062",
  appId:             "1:537113841062:web:725d0628d9ab47ae665367",
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
