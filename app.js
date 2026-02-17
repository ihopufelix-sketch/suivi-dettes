/* ================================
   SUIVI DETTES - VERSION COMPLETE V1
================================ */

let data = JSON.parse(localStorage.getItem("dettesData")) || {};

let currentCreditor = null;
let currentTab = "dette";

/* ================================
   UTILITAIRES
================================ */

function saveData() {
  localStorage.setItem("dettesData", JSON.stringify(data));
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR");
}

function calculateTotals(operations) {
  let totalDette = 0;
  let totalRemb = 0;

  operations.forEach(op => {
    if (op.type === "dette") totalDette += op.amount;
    if (op.type === "remboursement") totalRemb += op.amount;
  });

  return {
    totalDette,
    totalRemb,
    solde: totalDette - totalRemb
  };
}

/* ================================
   ACCUEIL
================================ */

function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  let totalGlobal = 0;

  Object.keys(data).forEach(name => {
    const totals = calculateTotals(data[name]);
    totalGlobal += totals.solde;
  });

  app.innerHTML += `
    <h1>Suivi Dettes</h1>
    <div class="card total-card">
      <strong>Total : ${totalGlobal.toFixed(2)} €</strong>
    </div>
    <div class="button-group">
      <button onclick="addCreditor()">Ajouter créancier</button>
      <button onclick="toggleDarkMode()">Mode sombre</button>
    </div>
  `;

  Object.keys(data).forEach(name => {
    const totals = calculateTotals(data[name]);

    app.innerHTML += `
      <div class="card creditor-card"
        onclick="openCreditor('${name}')"
        oncontextmenu="deleteCreditor(event,'${name}')">
        <h3>${name}</h3>
        <p>Solde : ${totals.solde.toFixed(2)} €</p>
      </div>
    `;
  });
}

/* ================================
   CRÉANCIER
================================ */

function openCreditor(name) {
  currentCreditor = name;
  renderCreditor();
}

function renderCreditor() {
  const app = document.getElementById("app");
  const operations = data[currentCreditor];

  const totals = calculateTotals(operations);

  app.innerHTML = `
    <button onclick="renderHome()">⬅ Retour</button>
    <h2>${currentCreditor}</h2>

    <div class="card">
      <p>Total dettes : ${totals.totalDette.toFixed(2)} €</p>
      <p>Total remboursements : ${totals.totalRemb.toFixed(2)} €</p>
      <p><strong>Solde restant : ${totals.solde.toFixed(2)} €</strong></p>
    </div>

    <div class="tabs">
      <button onclick="setTab('dette')" class="${currentTab === "dette" ? "active" : ""}">Dettes</button>
      <button onclick="setTab('remboursement')" class="${currentTab === "remboursement" ? "active" : ""}">Remboursements</button>
    </div>

    <button onclick="showAddOperation()">Ajouter opération</button>

    <div id="operations"></div>
  `;

  renderOperations();
}

function setTab(tab) {
  currentTab = tab;
  renderCreditor();
}

/* ================================
   OPERATIONS
================================ */

function renderOperations() {
  const container = document.getElementById("operations");
  const operations = data[currentCreditor]
    .filter(op => op.type === currentTab)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = "";

  operations.forEach((op, index) => {
    container.innerHTML += `
      <div class="card operation-card"
        oncontextmenu="deleteOperation(event,${index})">
        <p>${formatDate(op.date)}</p>
        <p>${op.label}</p>
        <p>${op.amount.toFixed(2)} €</p>
      </div>
    `;
  });
}

/* ================================
   AJOUT OPERATION
================================ */

function showAddOperation() {
  const label = prompt("Label ?");
  if (!label) return;

  const amount = parseFloat(prompt("Montant ?"));
  if (isNaN(amount)) return;

  const newOp = {
    type: currentTab,
    label,
    amount,
    date: new Date().toISOString()
  };

  data[currentCreditor].push(newOp);
  saveData();
  renderCreditor();
}

/* ================================
   SUPPRESSIONS
================================ */

function deleteOperation(e, index) {
  e.preventDefault();
  if (confirm("Supprimer cette opération ?")) {
    const filtered = data[currentCreditor].filter(op => op.type === currentTab);
    const opToDelete = filtered[index];
    const realIndex = data[currentCreditor].indexOf(opToDelete);
    data[currentCreditor].splice(realIndex, 1);
    saveData();
    renderCreditor();
  }
}

function deleteCreditor(e, name) {
  e.preventDefault();
  const totals = calculateTotals(data[name]);

  if (totals.solde !== 0) {
    alert("Impossible : solde ≠ 0 €");
    return;
  }

  if (confirm("Supprimer ce créancier ?")) {
    delete data[name];
    saveData();
    renderHome();
  }
}

/* ================================
   AJOUT CRÉANCIER
================================ */

function addCreditor() {
  const name = prompt("Nom du créancier ?");
  if (!name || data[name]) return;

  data[name] = [];
  saveData();
  renderHome();
}

/* ================================
   MODE SOMBRE
================================ */

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

/* ================================
   INITIALISATION
================================ */

renderHome();
