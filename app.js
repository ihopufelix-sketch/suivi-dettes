// ===============================
// SUIVI DETTES - VERSION COMPLETE
// ===============================

const app = document.getElementById("app");

let currentCreditorId = null;
let viewMode = "debts";

function getData() {
  return JSON.parse(localStorage.getItem("suiviDettes")) || [];
}

function saveData(data) {
  localStorage.setItem("suiviDettes", JSON.stringify(data));
}

function generateId() {
  return Date.now().toString();
}

// ===============================
// MAIN SCREEN
// ===============================

function renderHome() {
  currentCreditorId = null;
  const data = getData();

  let total = 0;
  data.forEach(c => {
    const debts = c.operations.filter(o => o.type === "debt")
      .reduce((sum, o) => sum + o.amount, 0);
    const payments = c.operations.filter(o => o.type === "payment")
      .reduce((sum, o) => sum + o.amount, 0);
    total += (debts - payments);
  });

  app.innerHTML = `
    <h1>Suivi Dettes</h1>

    <div class="card total">
      <strong>Total : ${total.toFixed(2)} €</strong>
    </div>

    <button onclick="addCreditor()">Ajouter créancier</button>

    ${data.map(c => {
      const debts = c.operations.filter(o => o.type === "debt")
        .reduce((sum, o) => sum + o.amount, 0);
      const payments = c.operations.filter(o => o.type === "payment")
        .reduce((sum, o) => sum + o.amount, 0);
      const balance = debts - payments;

      return `
        <div class="card" onclick="openCreditor('${c.id}')">
          <h3>${c.name}</h3>
          <p>Solde : ${balance.toFixed(2)} €</p>
        </div>
      `;
    }).join("")}
  `;
}

function addCreditor() {
  const name = prompt("Nom du créancier ?");
  if (!name) return;

  const data = getData();
  data.push({
    id: generateId(),
    name: name,
    operations: []
  });

  saveData(data);
  renderHome();
}

// ===============================
// DETAIL SCREEN
// ===============================

function openCreditor(id) {
  currentCreditorId = id;
  renderCreditor();
}

function renderCreditor() {
  const data = getData();
  const creditor = data.find(c => c.id === currentCreditorId);

  const debts = creditor.operations.filter(o => o.type === "debt");
  const payments = creditor.operations.filter(o => o.type === "payment");

  const totalDebts = debts.reduce((sum, o) => sum + o.amount, 0);
  const totalPayments = payments.reduce((sum, o) => sum + o.amount, 0);
  const balance = totalDebts - totalPayments;

  const filtered = viewMode === "debts" ? debts : payments;

  app.innerHTML = `
    <button onclick="renderHome()">⬅ Retour</button>
    <h2>${creditor.name}</h2>

    <div class="card total">
      <p>Total dettes : ${totalDebts.toFixed(2)} €</p>
      <p>Total remboursements : ${totalPayments.toFixed(2)} €</p>
      <strong>Solde restant : ${balance.toFixed(2)} €</strong>
    </div>

    <div>
      <button onclick="switchView('debts')">Dettes</button>
      <button onclick="switchView('payment')">Remboursements</button>
    </div>

    <button onclick="addOperation()">Ajouter opération</button>

    ${filtered.map(o => `
      <div class="card">
        <p>${o.date}</p>
        <p>${o.label}</p>
        <strong>${o.amount.toFixed(2)} €</strong>
        <button onclick="deleteOperation('${o.id}')">Supprimer</button>
      </div>
    `).join("")}
  `;
}

function switchView(mode) {
  viewMode = mode === "payment" ? "payment" : "debts";
  renderCreditor();
}

function addOperation() {
  const type = confirm("OK = Dette / Annuler = Remboursement")
    ? "debt"
    : "payment";

  const label = prompt("Description ?");
  if (!label) return;

  const amount = parseFloat(prompt("Montant ?"));
  if (isNaN(amount)) return;

  const data = getData();
  const creditor = data.find(c => c.id === currentCreditorId);

  creditor.operations.push({
    id: generateId(),
    type: type,
    label: label,
    amount: amount,
    date: new Date().toLocaleDateString()
  });

  saveData(data);
  renderCreditor();
}

function deleteOperation(opId) {
  const data = getData();
  const creditor = data.find(c => c.id === currentCreditorId);

  creditor.operations = creditor.operations.filter(o => o.id !== opId);

  saveData(data);
  renderCreditor();
}

// ===============================
// INIT
// ===============================

renderHome();
