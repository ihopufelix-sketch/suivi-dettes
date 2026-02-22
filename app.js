let data = {};
let firebaseUser = null;

// ==============================
// ATTENTE FIREBASE
// ==============================

function waitForFirebase() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.firebaseServices) {
        clearInterval(interval);
        resolve(window.firebaseServices);
      }
    }, 50);
  });
}

// ==============================
// INIT FIREBASE
// ==============================

async function initFirebase() {

  const services = await waitForFirebase();
  const { auth, onAuthStateChanged } = services;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      firebaseUser = user;
      console.log("Connecté :", user.email);
      await syncFromCloud();
    } else {
      console.log("Non connecté");
    }
  });
}

// ==============================
// LOGIN POPUP (iOS SAFE)
// ==============================

async function manualLogin() {

  const services = await waitForFirebase();
  const { auth, provider, signInWithPopup } = services;

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.log("Erreur login :", error);
  }
}

// ==============================
// CLOUD SYNC
// ==============================

async function syncFromCloud() {

  const services = await waitForFirebase();
  const { db, doc, getDoc } = services;

  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    data = snap.data().data || {};
    saveLocal();
  } else {
    await syncToCloud();
  }

  renderHome();
}

async function syncToCloud() {

  if (!firebaseUser) return;

  const services = await waitForFirebase();
  const { db, doc, setDoc } = services;

  await setDoc(doc(db, "users", firebaseUser.uid), {
    data: data
  });
}

// ==============================
// LOCAL STORAGE
// ==============================

function saveLocal() {
  localStorage.setItem("SUIVI_DETTES_DATA", JSON.stringify(data));
}

function loadLocal() {
  const saved = localStorage.getItem("SUIVI_DETTES_DATA");
  return saved ? JSON.parse(saved) : {};
}

// ==============================
// RENDER HOME
// ==============================

function renderHome() {

  const list = document.getElementById("creditorList");
  if (!list) return;

  list.innerHTML = "";

  let total = 0;

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
    card.className = "creditor-card";
    card.innerHTML = `
      <h3>${name}</h3>
      <div>${solde.toFixed(2)} €</div>
    `;

    list.appendChild(card);
  });

  const totalDiv = document.getElementById("totalGlobal");
  if (totalDiv) {
    totalDiv.innerText = total.toFixed(2) + " €";
  }
}

// ==============================
// INIT APP
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  data = loadLocal();
  renderHome();
  await initFirebase();
});
