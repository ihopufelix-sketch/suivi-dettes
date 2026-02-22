// ==============================
// INITIALISATION
// ==============================

let data = JSON.parse(localStorage.getItem("SUIVI_DETTES_DATA")) || {};

let currentCreditor = null;
let currentTab = "dette";
let selectedYear = "all";

// ==============================
// UTILITAIRES
// ==============================

function saveData() {
  localStorage.setItem("SUIVI_DETTES_DATA", JSON.stringify(data));
}

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

// ==============================
// LONG PRESS HANDLER
// ==============================

function addLongPress(element, callback) {
  let timer = null;

  element.addEventListener("touchstart", () => {
    timer = setTimeout(callback, 700);
  });

  element.addEventListener("touchend", () => clearTimeout(timer));
  element.addEventListener("touchcancel", () => clearTimeout(timer));

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

  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("creditorList").classList.remove("hidden");

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

    // 🔥 Suppression créancier par appui long
    addLongPress(card, () => {

      if (solde !== 0) {
        alert("Impossible de supprimer : solde ≠ 0 €");
        return;
      }

      if (confirm("Supprimer ce créancier ?")) {
        delete data[name];
        saveData();
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

  const years = [...new Set(
    ops.map(o => convertDate(o.date).getFullYear())
  )].sort((a, b) => b - a);

  const yearFilter = document.getElementById("yearFilter");
  yearFilter.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.innerText = "Toutes";
  allBtn.className = selectedYear === "all" ? "active" : "";
  allBtn.onclick = () => { selectedYear = "all"; renderDetail(); };
  yearFilter.appendChild(allBtn);

  years.forEach(year => {
    const btn = document.createElement("button");
    btn.innerText = year;
    btn.className = selectedYear === year ? "active" : "";
    btn.onclick = () => { selectedYear = year; renderDetail(); };
    yearFilter.appendChild(btn);
  });

  let filtered = selectedYear === "all"
    ? ops
    : ops.filter(o =>
        convertDate(o.date).getFullYear() === selectedYear
      );

  const dettes = filtered.filter(o => o.type === "dette");
  const rembs = filtered.filter(o => o.type === "remboursement");

  const totalDette = dettes.reduce((s,o)=>s+o.montant,0);
  const totalRemb = rembs.reduce((s,o)=>s+o.montant,0);

  document.getElementById("detailTotals").innerText =
    `Total dettes : ${totalDette.toFixed(2)} € | Solde : ${(totalDette-totalRemb).toFixed(2)} €`;

  document.getElementById("tabDette").classList.toggle("active", currentTab==="dette");
  document.getElementById("tabRemb").classList.toggle("active", currentTab==="remboursement");

  const list = document.getElementById("operationList");
  list.innerHTML = "";

  const displayList = currentTab === "dette" ? dettes : rembs;

  displayList
    .sort((a,b)=>convertDate(b.date)-convertDate(a.date))
    .forEach(op => {

      const card = document.createElement("div");
      card.className = `operation-card ${op.type}`;

      card.innerHTML = `
        <div>${op.date}</div>
        <div>${op.label}</div>
        <div>${op.type==="dette" ? "+" : "-"} ${op.montant.toFixed(2)} €</div>
      `;

      // 🔥 Suppression opération par appui long
      addLongPress(card, () => {

        if (confirm("Supprimer cette opération ?")) {

          data[currentCreditor].operations =
            data[currentCreditor].operations.filter(o =>
              !(o.date === op.date &&
                o.label === op.label &&
                o.montant === op.montant &&
                o.type === op.type)
            );

          saveData();
          renderDetail();
        }

      });

      list.appendChild(card);
    });
}

function setTab(type) {
  currentTab = type;
  renderDetail();
}

function backToHome() {
  currentCreditor = null;
  renderHome();
}

// ==============================
// AJOUT
// ==============================

function addCreditor() {
  const name = prompt("Nom du créancier :");
  if (!name || data[name]) return;
  data[name] = { operations: [] };
  saveData();
  renderHome();
}

function addOperation() {

  const label = prompt("Label ?");
  if (!label) return;

  const montant = parseFloat(prompt("Montant ?"));
  if (isNaN(montant)) return;

  const today = formatDate(new Date());
  let dateInput = prompt("Date (JJ/MM/AAAA)", today);

  if (!dateInput) return;

  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateInput)) {
    alert("Format invalide. Utilise JJ/MM/AAAA");
    return;
  }

  data[currentCreditor].operations.push({
    type: currentTab,
    label,
    montant,
    date: dateInput
  });

  saveData();
  renderDetail();
}

// ==============================
// BACKUP
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

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      data = JSON.parse(event.target.result);
      saveData();
      renderHome();
    };

    reader.readAsText(file);
  };

  input.click();
}

renderHome();
