// ===============================
// FIREBASE CONFIG
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 REMPLACE par ta config exacte si besoin
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "suivi-dettes-36682.firebaseapp.com",
  projectId: "suivi-dettes-36682",
  storageBucket: "suivi-dettes-36682.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "XXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===============================
// LOGIN
// ===============================

async function manualLogin() {
  try {
    console.log("Redirection Google déclenchée");
    await signInWithRedirect(auth, provider);
  } catch (error) {
    alert("Erreur login : " + error.message);
    console.error(error);
  }
}

// IMPORTANT POUR onclick
window.manualLogin = manualLogin;

// ===============================
// RETOUR REDIRECTION
// ===============================

async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      console.log("Utilisateur connecté :", result.user);
      alert("Connexion réussie ✅");
    }
  } catch (error) {
    console.error("Erreur redirect:", error);
  }
}

// ===============================
// OBSERVATEUR AUTH
// ===============================

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User actif :", user.email);
  } else {
    console.log("Non connecté");
  }
});

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  await handleRedirect();
});
