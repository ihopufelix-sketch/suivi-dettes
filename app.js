/* ==============================
   BASE DE DONNÉES OFFICIELLE
============================== */

const STORAGE_KEY = "SUIVI_DETTES_DATA_V1";

/* 🔥 TON BACKUP EXPO INTÉGRÉ ICI */
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
      { "type": "remboursement", "label": "REMB LAU", "montant": 50, "date": "31/10/2022" }
      /* ⚠️ volontairement raccourci ici pour message — 
         MAIS dans ton fichier final tu colles TOUT ton JSON complet */
    ]
  },

  "Alex": { "operations": [] },
  "Anne-Sophie": { "operations": [] }
};

/* ==============================
   CHARGEMENT
============================== */

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ==============================
   UTILITAIRES
============================== */

function parseDate(d) {
  const [day, month, year] = d.split("/");
  return new Date(year, month - 1, day);
}

function formatMoney(n) {
  return n.toFixed(2) + " €";
}

/* ==============================
   APPLICATION
============================== */

let data = loadData();
let selectedCreditor = null;
let selectedYear = "all";
let activeTab = "dette";

/* ==============================
   RENDER ACCUEIL
============================== */

function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  let totalGlobal = 0;

  Object.keys(data).forEach(name => {
    const ops = data[name].operations;
    const dettes = ops.filter(o => o.type === "dette")
      .reduce((s, o) => s + o.montant, 0);
    const rembs = ops.filter(o => o.type === "remboursement")
      .reduce((s, o) => s + o.montant, 0);

    const solde = dettes - rembs;
    totalGlobal += solde;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${name}</h3>
      <p>${formatMoney(solde)}</p>
    `;

    card.onclick = () => openDetail(name);
    card.oncontextmenu = (e) => {
      e.preventDefault();
      if (solde !== 0) {
        alert("Solde ≠ 0 €");
        return;
      }
      delete data[name];
      saveData(data);
      renderHome();
    };

    app.appendChild(card);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "total";
  totalDiv.innerHTML = `<h2>Solde Global</h2><p>${formatMoney(totalGlobal)}</p>`;
  app.prepend(totalDiv);
}

/* ==============================
   DÉTAIL
============================== */

function openDetail(name) {
  selectedCreditor = name;
  selectedYear = "all";
  activeTab = "dette";
  renderDetail();
}

function renderDetail() {
  const app = document.getElementById("app");
  const ops = data[selectedCreditor].operations;

  app.innerHTML = `<h2>${selectedCreditor}</h2>`;

  const years = [...new Set(ops.map(o => parseDate(o.date).getFullYear()))]
    .sort((a, b) => b - a);

  const yearFilter = document.createElement("div");
  yearFilter.innerHTML = `<button onclick="setYear('all')">Toutes</button>`;
  years.forEach(y => {
    yearFilter.innerHTML += `<button onclick="setYear(${y})">${y}</button>`;
  });
  app.appendChild(yearFilter);

  const filtered = selectedYear === "all"
    ? ops
    : ops.filter(o => parseDate(o.date).getFullYear() === selectedYear);

  const dettes = filtered.filter(o => o.type === "dette");
  const rembs = filtered.filter(o => o.type === "remboursement");

  const list = activeTab === "dette" ? dettes : rembs;

  list.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  list.forEach((o, index) => {
    const div = document.createElement("div");
    div.className = "operation";
    div.innerHTML = `
      <strong>${o.date}</strong>
      <p>${o.label}</p>
      <p>${formatMoney(o.montant)}</p>
    `;

    div.oncontextmenu = (e) => {
      e.preventDefault();
      data[selectedCreditor].operations.splice(index, 1);
      saveData(data);
      renderDetail();
    };

    app.appendChild(div);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "Retour";
  backBtn.onclick = renderHome;
  app.appendChild(backBtn);
}

function setYear(y) {
  selectedYear = y;
  renderDetail();
}

/* ==============================
   INIT
============================== */

renderHome();
