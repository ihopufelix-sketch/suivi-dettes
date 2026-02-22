// ==============================
// VARIABLES GLOBALES
// ==============================

let data = {};
let currentCreditor = null;
let currentTab = "dette";
let selectedYear = "all";
let firebaseUser = null;

// ==============================
// FIREBASE INIT (ROBUST SAFARI)
// ==============================

async function initFirebase() {
  const { 
    auth, 
    provider, 
    signInWithRedirect, 
    getRedirectResult,
    onAuthStateChanged 
  } = window.firebaseServices;

  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      firebaseUser = result.user;
      await syncFromCloud();
      return;
    }
  } catch (e) {
    console.log("Redirect result error:", e);
  }

  if (!auth.currentUser) {
    console.log("Aucun utilisateur → redirection forcée");
    await signInWithRedirect(auth, provider);
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      firebaseUser = user;
      await syncFromCloud();
    }
  });
}

// ==============================
// SYNC CLOUD
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
// UTILITAIRES
// ==============================

function convertDate(str) {
  const [d, m, y] = str.split("/");
  return new Date(y, m - 1, d);
}

function formatDate(dateObj) {
  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
}

function addLongPress(element, callback) {
  let timer;

  element.addEventListener("touchstart", () => {
    timer = setTimeout(callback, 700);
  });

  element.addEventListener("touchend", () => clearTimeout(timer));
  element.addEventListener("mousedown", () => {
    timer = setTimeout(callback, 700);
  });
  element.addEventListener("mouseup", () => clearTimeout(timer));
  element.addEventListener("mouseleave", () => clearTimeout(timer));
}

// ==============================
// HOME
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

    addLongPress(card, async () => {
      if (solde !== 0) {
        alert("Impossible de supprimer : solde ≠ 0 €");
        return;
      }
      if (confirm("Supprimer ce créancier ?")) {
        delete data[name];
        await saveAll();
        renderHome();
      }
    });

    list.appendChild(card);
  });

  document.getElementById("totalGlobal").innerText =
    `${totalGlobal.toFixed(2)} €`;
}

// ==============================
// DETAIL
// ==============================

function openDetail(name) {
  currentCreditor = name;
  selectedYear = "all";
  currentTab = "dette";

  document.getElementById("creditorList").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");
  document.getElementById("detailTitle").innerText = name;

  renderDetail();
}

function renderDetail() {
  const ops = data[currentCreditor].operations || [];

  const list = document.getElementById("operationList");
  list.innerHTML = "";

  ops
    .sort((a,b)=>convertDate(b.date)-convertDate(a.date))
    .forEach(op => {

      const card = document.createElement("div");
      card.className = `operation-card ${op.type}`;

      card.innerHTML = `
        <div>${op.date}</div>
        <div>${op.label}</div>
        <div>${op.type==="dette" ? "+" : "-"} ${op.montant.toFixed(2)} €</div>
      `;

      addLongPress(card, async () => {
        if (confirm("Supprimer cette opération ?")) {
          data[currentCreditor].operations =
            data[currentCreditor].operations.filter(o =>
              !(o.date === op.date &&
                o.label === op.label &&
                o.montant === op.montant &&
                o.type === op.type)
            );
          await saveAll();
          renderDetail();
        }
      });

      list.appendChild(card);
    });
}

// ==============================
// ACTIONS
// ==============================

async function addCreditor() {
  const name = prompt("Nom du créancier :");
  if (!name || data[name]) return;
  data[name] = { operations: [] };
  await saveAll();
  renderHome();
}

async function addOperation() {
  const label = prompt("Label ?");
  if (!label) return;

  const montant = parseFloat(prompt("Montant ?"));
  if (isNaN(montant)) return;

  const dateInput = prompt("Date (JJ/MM/AAAA)", formatDate(new Date()));
  if (!dateInput) return;

  data[currentCreditor].operations.push({
    type: currentTab,
    label,
    montant,
    date: dateInput
  });

  await saveAll();
  renderDetail();
}

// ==============================
// BACKUP MANUEL
// ==============================

function exportBackup() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_dettes.json";
  a.click();
}

function importBackup() {
  const input = document.getElementById("fileInput");

  input.onchange = async e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
      data = JSON.parse(event.target.result);
      await saveAll();
      renderHome();
    };

    reader.readAsText(file);
  };

  input.click();
}

// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  data = loadLocal();
  renderHome();
  await initFirebase();
});
async function manualLogin() {
  const { auth, provider, signInWithRedirect } = window.firebaseServices;
  await signInWithRedirect(auth, provider);
}
