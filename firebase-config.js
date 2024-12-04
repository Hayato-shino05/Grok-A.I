// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // Import Firebase Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj7Sh_QI2VqcA6r4b0y7a8osfSAb9D-JE",
  authDomain: "grok-e766c.firebaseapp.com",
  databaseURL: "https://grok-e766c-default-rtdb.firebaseio.com",
  projectId: "grok-e766c",
  storageBucket: "grok-e766c.firebasestorage.app",
  messagingSenderId: "105358740907",
  appId: "1:105358740907:web:2718510e6d81db014196ee",
  measurementId: "G-XSW21MG4LS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database
const db = getDatabase(app);
