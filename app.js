const app = document.getElementById("app");

let data = JSON.parse(localStorage.getItem("dettes-data")) || {};
let currentCreditor = null;
let currentTab = "dette";
let selectedYear = "all";
let darkMode = localStorage.getItem("dark-mode") === "true";

if (darkMode) document.body.classList.add("dark");

/* ===============================
UTILITAIRES
================================ */

function saveData() {
  localStorage.setItem("dettes-data", JSON.stringify(data));
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR");
}

function getYears() {
  const years = new Set();
  Object.values(data).forEach(c => {
    c.operations.forEach(o => {
      years.add(new Date(o.date).getFullYear());
    });
  });
  return Array.from(years).sort((a,b) => b - a);
}

/* ===============================
HOME SCREEN
================================ */

function renderHome() {
  currentCreditor = null;

  let totalGlobal = 0;
  Object.values(data).forEach(c => {
    totalGlobal += getSolde(c.operations);
  });

  app.innerHTML = `
    <div class="header">
      <h1>Suivi Dettes</h1>
    </div>

    <div class="card total">
      Total : ${totalGlobal.toFixed(2)} €
    </div>

    <button class="button" onclick="addCreditor()">Ajouter créancier</button>
    <button class="button" onclick="toggleDark()">Mode sombre</button>

    <div style="margin-top:20px;">
      ${Object.keys(data).map(name => `
        <div class="list-item" onclick="openCreditor('${name}')">
          <h3>${name}</h3>
          <div class="amount">${getSolde(data[name].operations).toFixed(2)} €</div>
        </div>
      `).join("")}
    </div>
  `;
}

function addCreditor() {
  const name = prompt("Nom du créancier ?");
  if (!name) return;
  if (data[name]) return alert("Existe déjà");
  data[name] = { operations: [] };
  saveData();
  renderHome();
}

function openCreditor(name) {
  currentCreditor = name;
  renderDetail();
}

/* ===============================
DETAIL SCREEN
================================ */

function renderDetail() {
  const creditor = data[currentCreditor];
  const solde = getSolde(creditor.operations);
  const years = getYears();

  let filteredOps = creditor.operations;

  if (selectedYear !== "all") {
    filteredOps = filteredOps.filter(o =>
      new Date(o.date).getFullYear() == selectedYear
    );
  }

  const dettes = filteredOps.filter(o => o.type === "dette");
  const remboursements = filteredOps.filter(o => o.type === "remboursement");

  const list = currentTab === "dette" ? dettes : remboursements;

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Retour</div>

    <div class="header">
      <h1>${currentCreditor}</h1>
    </div>

    <div class="card total">
      Solde : ${solde.toFixed(2)} €
    </div>

    <div class="tabs">
      <div class="tab ${currentTab === "dette" ? "active" : ""}" onclick="switchTab('dette')">Dettes</div>
      <div class="tab ${currentTab === "remboursement" ? "active" : ""}" onclick="switchTab('remboursement')">Remb.</div>
    </div>

    <select onchange="changeYear(this.value)">
      <option value="all">Toutes années</option>
      ${years.map(y => `<option value="${y}" ${selectedYear==y?"selected":""}>${y}</option>`).join("")}
    </select>

    <button class="button" onclick="addOperation()">Ajouter opération</button>

    <div style="margin-top:20px;">
      ${list.map((o, i) => `
        <div class="list-item" onclick="deleteOperation(${i})">
          <div>${formatDate(o.date)}</div>
          <div>${o.label}</div>
          <div class="amount">${o.type==="dette" ? "+" : "-"} ${o.montant.toFixed(2)} €</div>
        </div>
      `).join("")}
    </div>
  `;
}

function switchTab(tab) {
  currentTab = tab;
  renderDetail();
}

function changeYear(year) {
  selectedYear = year;
  renderDetail();
}

function addOperation() {
  const label = prompt("Label ?");
  if (!label) return;

  const montant = parseFloat(prompt("Montant ?"));
  if (isNaN(montant)) return;

  data[currentCreditor].operations.push({
    type: currentTab,
    label,
    montant,
    date: new Date().toISOString()
  });

  saveData();
  renderDetail();
}

function deleteOperation(index) {
  if (!confirm("Supprimer ?")) return;
  data[currentCreditor].operations.splice(index, 1);
  saveData();
  renderDetail();
}

/* ===============================
CALCUL SOLDE
================================ */

function getSolde(ops) {
  const dette = ops.filter(o => o.type==="dette").reduce((s,o)=>s+o.montant,0);
  const remb = ops.filter(o => o.type==="remboursement").reduce((s,o)=>s+o.montant,0);
  return dette - remb;
}

/* ===============================
MODE SOMBRE
================================ */

function toggleDark() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark");
  localStorage.setItem("dark-mode", darkMode);
}

/* ===============================
INIT
================================ */

renderHome();
