let data = {};
let firebaseUser = null;

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

async function initFirebase() {

  const services = await waitForFirebase();
  const { auth, getRedirectResult, onAuthStateChanged } = services;

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
    }
  });
}

async function manualLogin() {

  const services = await waitForFirebase();
  const { auth, provider, signInWithRedirect } = services;

  await signInWithRedirect(auth, provider);
}

async function syncFromCloud() {

  const services = await waitForFirebase();
  const { db, doc, getDoc } = services;

  const snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    data = snap.data().data || {};
    localStorage.setItem("SUIVI_DETTES_DATA", JSON.stringify(data));
  }

  renderHome();
}

function renderHome() {

  const list = document.getElementById("creditorList");
  list.innerHTML = "";

  const saved = localStorage.getItem("SUIVI_DETTES_DATA");
  if (saved) data = JSON.parse(saved);

  let total = 0;

  Object.keys(data).forEach(name => {
    const ops = data[name].operations || [];
    const dette = ops.filter(o => o.type === "dette")
      .reduce((s, o) => s + o.montant, 0);
    const remb = ops.filter(o => o.type === "remboursement")
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

document.addEventListener("DOMContentLoaded", async () => {
  renderHome();
  await initFirebase();
});
