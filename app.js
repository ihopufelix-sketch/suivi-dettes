// ===============================
// FIREBASE IMPORTS
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===============================
// CONFIG FIREBASE
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyBeLxClxRO87cr-RXPXgIgbX22NK8EUJiE",
  authDomain: "suivi-dettes-36682.firebaseapp.com",
  projectId: "suivi-dettes-36682",
  storageBucket: "suivi-dettes-36682.firebasestorage.app",
  messagingSenderId: "758921362645",
  appId: "1:758921362645:web:12ee45f6061e46b38cf65c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===============================
// LOGIN FUNCTION
// ===============================

async function manualLogin() {
  try {
    const result = await signInWithPopup(auth, provider);
    alert("Connecté : " + result.user.email);
  } catch (error) {
    alert("Erreur Firebase : " + error.message);
    console.error(error);
  }
}

// ===============================
// DOM READY
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", manualLogin);
  }

});

// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Utilisateur non connecté");
  }
});
