let data = {};
let currentCreditor = null;
let currentTab = "dette";
let selectedYear = "all";
let firebaseUser = null;

// ==============================
// FIREBASE INIT PROPRE
// ==============================

async function initFirebase() {

  const {
    auth,
    onAuthStateChanged,
    getRedirectResult
  } = window.firebaseServices;

  try {
    await getRedirectResult(auth);
  } catch (error) {
    console.log("Redirect error:", error);
  }

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

async function manualLogin() {
  const { auth, provider, signInWithRedirect } = window.firebaseServices;
  await signInWithRedirect(auth, provider);
}

// ==============================
// CLOUD SYNC
// ==============================

async function syncFromCloud() {
  const { db, doc, getDoc } = window.firebaseServices;

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

  const { db, doc, setDoc } = window.firebaseServices;

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

async function saveAll() {
  saveLocal();
  await syncToCloud();
}

// ==============================
// RENDER HOME
// ==============================

function renderHome() {
  const list = document.getElementById("creditorList");
  list.innerHTML = "";

  let totalGlobal = 0;

  Object.keys(data).forEach(name => {

    const ops = data[name].operations || [];

    const dette = ops.filter(o => o.type === "dette")
      .reduce((s, o) => s + o.montant, 0);

    const remb = ops.filter(o => o.type === "remboursement")
      .reduce((s, o) => s + o.montant, 0);

    const solde = dette - remb;
    totalGlobal += solde;

    const card = document.createElement("div");
    card.className = "creditor-card";

    card.innerHTML = `
      <h3>${name}</h3>
      <div class="amount">${solde.toFixed(2)} €</div>
    `;

    card.onclick = () => openDetail(name);
    list.appendChild(card);
  });

  document.getElementById("totalGlobal").innerText =
    `${totalGlobal.toFixed(2)} €`;
}

// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  data = loadLocal();
  renderHome();
  await initFirebase();
});
