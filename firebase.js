import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection, addDoc, onSnapshot, query, orderBy, where,
  updateDoc, deleteDoc, doc, increment, serverTimestamp,
  getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged,
  signInWithRedirect, getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db  = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ hd: "du.ac.in" });

// ─── Expose everything app.js needs via window.__firebase ─────────
window.__firebase = {
  db,
  auth,
  googleProvider,

  // Firestore
  collection: (...a) => collection(...a),
  addDoc:     (...a) => addDoc(...a),
  onSnapshot: (...a) => onSnapshot(...a),
  query:      (...a) => query(...a),
  orderBy:    (...a) => orderBy(...a),
  where:      (...a) => where(...a),
  updateDoc:  (...a) => updateDoc(...a),
  deleteDoc:  (...a) => deleteDoc(...a),
  doc:        (...a) => doc(...a),
  increment:  (...a) => increment(...a),
  serverTimestamp: () => serverTimestamp(),
  getDoc:     (...a) => getDoc(...a),
  setDoc:     (...a) => setDoc(...a),

  // Auth
  signInWithPopup:    (...a) => signInWithPopup(...a),
  signOut:            (...a) => signOut(...a),
  onAuthStateChanged: (...a) => onAuthStateChanged(...a),
  signInWithRedirect: (...a) => signInWithRedirect(...a),
  getRedirectResult:  (...a) => getRedirectResult(...a),
};
