// ============================================
// FIREBASE IMPORTS (MODULE VERSION)
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
// ⚠️ REMPLACE ICI PAR TA VRAIE CONFIG FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "REMPLACE_MOI",
  authDomain: "suivi-dettes-36682.firebaseapp.com",
  projectId: "suivi-dettes-36682",
  storageBucket: "suivi-dettes-36682.appspot.com",
  messagingSenderId: "REMPLACE_MOI",
  appId: "REMPLACE_MOI"
};


// ============================================
// INITIALISATION FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// ============================================
// LOGIN BUTTON
// ============================================

async function manualLogin() {
  try {
    console.log("Déclenchement redirection Google");
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Erreur login:", error);
    alert("Erreur login : " + error.message);
  }
}

window.manualLogin = manualLogin;


// ============================================
// GESTION RETOUR REDIRECTION
// ============================================

async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      console.log("Connexion réussie :", result.user.email);
      alert("Connexion réussie ✅");
    }
  } catch (error) {
    console.error("Erreur redirect:", error);
  }
}


// ============================================
// OBSERVATEUR AUTH
// ============================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utilisateur actif :", user.email);
  } else {
    console.log("Non connecté");
  }
});


// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await handleRedirect();
});
