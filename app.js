// ============================================
// FIREBASE IMPORTS (CDN VERSION)
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ============================================
// TA CONFIG EXACTE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBeLxClxRO87cr-RXPXgIgbX22NK8EUJiE",
  authDomain: "suivi-dettes-36682.firebaseapp.com",
  projectId: "suivi-dettes-36682",
  storageBucket: "suivi-dettes-36682.firebasestorage.app",
  messagingSenderId: "758921362645",
  appId: "1:758921362645:web:12ee45f6061e46b38cf65c"
};


// ============================================
// INITIALISATION
// ============================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// ============================================
// LOGIN
// ============================================

async function manualLogin() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    alert(error.message);
  }
}


// ============================================
// REDIRECT RETURN
// ============================================

async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      alert("Connexion réussie ✅");
    }
  } catch (error) {
    console.error(error);
  }
}


// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

  document
    .getElementById("loginBtn")
    .addEventListener("click", manualLogin);

  await handleRedirect();

});
