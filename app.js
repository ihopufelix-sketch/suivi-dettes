// ==============================
// INITIAL DATA (AVEC HISTORIQUE)
// ==============================

const INITIAL_DATA = {
  "Laurine": {
    "operations": [
      { "type": "dette", "label": "APPORT", "montant": 3000, "date": "01/01/2022" },
      { "type": "dette", "label": "ARCHI", "montant": 60, "date": "13/05/2022" },
      { "type": "dette", "label": "DECOUVERT", "montant": 920, "date": "01/01/2022" },
      { "type": "dette", "label": "DECOUVERT", "montant": 805.4, "date": "01/01/2022" },
      { "type": "dette", "label": "COT 2022", "montant": 375, "date": "01/01/2022" },
      { "type": "dette", "label": "FINALISATION PENICHE H2O", "montant": 550, "date": "01/01/2022" },
      { "type": "dette", "label": "FIOUL 558/2", "montant": 279, "date": "01/01/2022" },
      { "type": "dette", "label": "CUVE", "montant": 440, "date": "10/10/2022" },
      { "type": "dette", "label": "FIOUL", "montant": 266, "date": "15/12/2022" },
      { "type": "dette", "label": "FIOUL", "montant": 300, "date": "10/01/2023" },
      { "type": "dette", "label": "FIOUL", "montant": 330, "date": "19/01/2023" },
      { "type": "dette", "label": "THERAPIE", "montant": 300, "date": "19/01/2023" },
      { "type": "dette", "label": "VETO BLACKI", "montant": 114, "date": "20/01/2023" },
      { "type": "dette", "label": "ARCHI", "montant": 2095, "date": "20/01/2023" },
      { "type": "dette", "label": "DECOUVERT", "montant": 1180, "date": "25/05/2023" },
      { "type": "dette", "label": "VACANCES MIMIZAN", "montant": 373.5, "date": "01/08/2023" },
      { "type": "dette", "label": "SKI ALANA", "montant": 200, "date": "09/12/2023" },
      { "type": "dette", "label": "CRECHE SEPT 2023", "montant": 260, "date": "09/12/2023" },
      { "type": "dette", "label": "CRECHE OCT 2023", "montant": 210, "date": "09/12/2023" },
      { "type": "dette", "label": "STERE", "montant": 100, "date": "09/12/2023" },
      { "type": "dette", "label": "CRECHE NOV 2023", "montant": 204, "date": "13/02/2024" },
      { "type": "dette", "label": "CRECHE DEC 2023", "montant": 233, "date": "13/02/2024" },
      { "type": "dette", "label": "VELO ELEC", "montant": 200, "date": "01/05/2024" },
      { "type": "dette", "label": "BILLET D'AVION", "montant": 1700, "date": "20/05/2025" },
      { "type": "dette", "label": "CALE SECHE", "montant": 5188.63, "date": "09/10/2025" },
      { "type": "dette", "label": "FLUIDE CALE SECHE", "montant": -128.36, "date": "09/10/2025" },
      { "type": "dette", "label": "Berkey", "montant": 371, "date": "13/10/2025" },
      { "type": "dette", "label": "Canapé", "montant": 499, "date": "13/10/2025" },

      { "type": "remboursement", "label": "ASSURANCE HAB AUCAMVILLE", "montant": 350, "date": "01/08/2022" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "03/10/2022" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "31/10/2022" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "23/11/2022" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "15/12/2022" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "04/01/2023" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "01/02/2023" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "01/03/2023" },
      { "type": "remboursement", "label": "REMB LAU", "montant": 1180, "date": "25/05/2023" }
    ]
  },

  "Alex": {
    "operations": [
      { "type": "dette", "label": "Dette initiale", "montant": 12500, "date": "01/01/2022" }
    ]
  },

  "Anne-Sophie": {
    "operations": [
      { "type": "dette", "label": "Billet Alana", "montant": 1674, "date": "01/06/2025" }
    ]
  },

  "Famille": { "operations": [] }
};

// ==============================
// INITIALISATION
// ==============================

let data = JSON.parse(localStorage.getItem("SUIVI_DETTES_DATA")) || INITIAL_DATA;
localStorage.setItem("SUIVI_DETTES_DATA", JSON.stringify(data));

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
// HOME
// ==============================

function renderHome() {

  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("creditorList").classList.remove("hidden");

  const list = document.getElementById("creditorList");
  list.innerHTML = "";

  let totalGlobal = 0;

  Object.keys(data).forEach(name => {

    const ops = data[name].operations;

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

    card.oncontextmenu = (e) => {
      e.preventDefault();
      if (solde !== 0) {
        alert("Solde ≠ 0 €");
        return;
      }
      if (confirm("Supprimer créancier ?")) {
        delete data[name];
        saveData();
        renderHome();
      }
    };

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

  document.getElementById("creditorList").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");

  document.getElementById("detailTitle").innerText = name;

  renderDetail();
}

function renderDetail() {

  const ops = data[currentCreditor].operations;

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

      card.oncontextmenu = (e) => {
        e.preventDefault();

        if (confirm("Supprimer opération ?")) {

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
      };

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

  const date = formatDate(new Date());

  data[currentCreditor].operations.push({
    type: currentTab,
    label,
    montant,
    date
  });

  saveData();
  renderDetail();
}

// ==============================

renderHome();
