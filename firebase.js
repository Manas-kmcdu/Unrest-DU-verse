import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDBJ0hHjVyEnwg7mV7ECeG163K7fs1fsiE",
    authDomain: "du-verse-e75db.firebaseapp.com",
    databaseURL: "https://du-verse-e75db-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "du-verse-e75db",
    storageBucket: "du-verse-e75db.firebasestorage.app",
    messagingSenderId: "84735746102",
    appId: "1:84735746102:web:6fe5353a0586db71323897"
  };



const app = initializeApp(firebaseConfig);

window.db = getFirestore(app);
