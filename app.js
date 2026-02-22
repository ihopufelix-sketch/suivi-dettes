// ============================================
// FIREBASE IMPORTS
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
// 🔥 REMPLACE PAR TA VRAIE CONFIG FIREBASE
// (Firebase Console → Paramètres → SDK Web)
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
// LOGIN
// ============================================

async function manualLogin() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Erreur login :", error);
    alert(error.message);
  }
}


// ============================================
// GESTION RETOUR REDIRECTION
// ============================================

async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      console.log("Connecté :", result.user.email);
      alert("Connexion réussie ✅");
    }

  } catch (error) {
    console.error("Erreur redirect :", error);
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
// RENDER SIMPLE (POUR NE RIEN CASSER)
// ============================================

function renderHome() {

  const saved = localStorage.getItem("SUIVI_DETTES_DATA");
  let data = saved ? JSON.parse(saved) : {};

  let total = 0;
  const list = document.getElementById("creditorList");
  list.innerHTML = "";

  Object.keys(data).forEach(name => {

    const ops = data[name].operations || [];

    const dette = ops
      .filter(o => o.type === "dette")
      .reduce((s, o) => s + o.montant, 0);

    const remb = ops
      .filter(o => o.type === "remboursement")
      .reduce((s, o) => s + o.montant, 0);

    const solde = dette - remb;
    total += solde;

    const card = document.createElement("div");
    card.innerHTML = `<h3>${name}</h3><div>${solde.toFixed(2)} €</div>`;
    list.appendChild(card);
  });

  document.getElementById("totalGlobal").innerText =
    total.toFixed(2) + " €";
}


// ============================================
// INIT GLOBAL
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

  renderHome();

  document.getElementById("loginBtn")
    .addEventListener("click", manualLogin);

  await handleRedirect();
});
