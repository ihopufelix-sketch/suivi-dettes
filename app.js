let data = JSON.parse(localStorage.getItem("dettes")) || {};

function save() {
  localStorage.setItem("dettes", JSON.stringify(data));
  render();
}

function addCreditor() {
  const name = prompt("Nom du créancier ?");
  if (!name) return;
  if (!data[name]) data[name] = 0;
  save();
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  let total = 0;

  for (let name in data) {
    total += data[name];

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <strong>${name}</strong><br>
      ${data[name].toFixed(2)} €
      <br>
      <button onclick="addDebt('${name}')">+ Ajouter</button>
    `;

    app.appendChild(card);
  }

  const totalDiv = document.createElement("div");
  totalDiv.className = "card";
  totalDiv.innerHTML = `<strong>Total : ${total.toFixed(2)} €</strong>`;
  app.prepend(totalDiv);

  const addBtn = document.createElement("button");
  addBtn.innerText = "Ajouter créancier";
  addBtn.onclick = addCreditor;
  app.appendChild(addBtn);
}

function addDebt(name) {
  const amount = parseFloat(prompt("Montant ?"));
  if (!amount) return;
  data[name] += amount;
  save();
}

render();
