const labels = {
  altura: "Altura em cm",
  peso: "Peso em kg",
  torax: "Torax/busto em cm",
  cintura: "Cintura em cm",
  quadril: "Quadril em cm",
  idade: "Idade",
  tamanho_usual: "Tamanho que costuma usar",
  preferencia_caimento: "Preferencia de caimento"
};

let currentGuide = null;

const form = document.querySelector("#fitForm");
const result = document.querySelector("#result");

function fieldFor(question, guide) {
  if (question === "preferencia_caimento") {
    return `
      <label>
        ${labels[question]}
        <select name="${question}">
          ${guide.fitOptions.map((option) => `<option value="${option}" ${option === "normal" ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (question === "tamanho_usual") {
    return `
      <label>
        ${labels[question]}
        <input name="${question}" placeholder="Ex.: M, G, 40" />
      </label>
    `;
  }

  return `
    <label>
      ${labels[question]}
      <input name="${question}" type="number" min="1" step="1" inputmode="numeric" />
    </label>
  `;
}

function renderGuide(guide) {
  currentGuide = guide;
  document.querySelector("#guideTitle").textContent = guide.name;
  document.querySelector("#questionCount").textContent = `${guide.questions.length} perguntas`;
  form.innerHTML = guide.questions.map((question) => fieldFor(question, guide)).join("");
  result.hidden = true;
}

function renderGuides(guides) {
  document.querySelector("#metricGuides").textContent = String(guides.length);
  document.querySelector("#guideGrid").innerHTML = guides
    .map(
      (guide) => `
        <article class="guide-card">
          <div>
            <strong>${guide.name}</strong>
            <span>${guide.category}</span>
          </div>
          <p>${guide.questions.map((question) => labels[question] || question).join(", ")}</p>
          <small>${guide.measurements.length} tamanhos cadastrados</small>
        </article>
      `
    )
    .join("");
}

async function loadGuides() {
  const response = await fetch("/api/guides");
  const data = await response.json();
  renderGuides(data.guides || []);
}

async function loadStats() {
  const response = await fetch("/api/guides/stats");
  const data = await response.json();
  document.querySelector("#metricRecommendations").textContent = String(data.stats?.recommendations || 0);
}

async function loadConnection() {
  const response = await fetch("/auth/status");
  const data = await response.json();
  const card = document.querySelector("#connectionCard");
  const text = document.querySelector("#connectionText");

  card.classList.toggle("connected", Boolean(data.connected));
  document.querySelector("#metricMode").textContent = data.connected ? "Conectado" : "Demo";
  text.textContent = data.connected ? `Loja ${data.storeId}` : "Conecte para buscar produtos reais";
}

async function loadGuide() {
  const product = {
    name: document.querySelector("#productName").value,
    category: document.querySelector("#category").value
  };

  const response = await fetch("/api/guides/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product })
  });
  const data = await response.json();
  renderGuide(data.guide);
}

async function recommend() {
  if (!currentGuide) return;

  const product = {
    name: document.querySelector("#productName").value,
    category: document.querySelector("#category").value
  };
  const answers = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(`/api/guides/${currentGuide.id}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product, answers })
  });
  const data = await response.json();
  const recommendation = data.recommendation;

  result.hidden = false;
  result.innerHTML = `
    <div class="result-top">
      <span class="badge">Confianca ${recommendation.confidence}%</span>
      ${recommendation.alternativeSize ? `<span class="badge subtle">Alternativa ${recommendation.alternativeSize}</span>` : ""}
    </div>
    <h3>Tamanho recomendado: ${recommendation.size}</h3>
    <p>${recommendation.message}</p>
  `;
  loadStats();
}

document.querySelector("#loadGuide").addEventListener("click", loadGuide);
document.querySelector("#recommend").addEventListener("click", recommend);
document.querySelector("#refreshGuides").addEventListener("click", loadGuides);
document.querySelector("#reset").addEventListener("click", () => {
  form.reset();
  result.hidden = true;
});

Promise.all([loadConnection(), loadGuides(), loadStats(), loadGuide()]).catch((error) => {
  console.error(error);
});
