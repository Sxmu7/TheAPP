// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1shmrqKKiXJhTeBLlLAVcB8KcJgD1fvc",
  authDomain: "the-app-6912e.firebaseapp.com",
  databaseURL: "https://the-app-6912e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "the-app-6912e",
  storageBucket: "the-app-6912e.firebasestorage.app",
  messagingSenderId: "537113841062",
  appId: "1:537113841062:web:725d0628d9ab47ae665367",
  measurementId: "G-4KCJF8EE1E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
