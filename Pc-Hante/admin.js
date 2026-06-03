const loginForm = document.getElementById("adminLogin");
const tokenInput = document.getElementById("adminToken");
const adminContent = document.getElementById("adminContent");
const adminStatus = document.getElementById("adminStatus");
const scoresList = document.getElementById("scoresList");
const refreshScores = document.getElementById("refreshScores");
const resetScores = document.getElementById("resetScores");
const resetAll = document.getElementById("resetAll");

let adminToken = localStorage.getItem("majorite_admin_token") || "";
tokenInput.value = adminToken;

function setStatus(message) {
  adminStatus.textContent = message;
}

async function adminApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Action admin impossible.");
  }
  return data;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function renderScores(scores) {
  if (!scores.length) {
    scoresList.innerHTML = "<p class=\"empty-state\">Aucun score en base.</p>";
    return;
  }

  scoresList.innerHTML = scores.map((score) => `
    <article class="admin-score">
      <div>
        <strong>${escapeHtml(score.pseudo)} - ${score.success_rate}%</strong>
        <span>${score.score} pts - ${score.correct}/${score.total} - ${formatDate(score.created_at)}</span>
        <span>game_id: ${escapeHtml(score.game_id)}</span>
      </div>
      <button class="delete-button" type="button" data-id="${score.id}">Supprimer</button>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadScores() {
  setStatus("Chargement...");
  const data = await adminApi("/api/admin/scores");
  renderScores(data.scores);
  setStatus(`${data.scores.length} score(s) charge(s).`);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminToken = tokenInput.value.trim();
  if (!adminToken) return;
  localStorage.setItem("majorite_admin_token", adminToken);
  adminContent.classList.remove("hidden");
  try {
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});

refreshScores.addEventListener("click", () => {
  loadScores().catch((error) => setStatus(error.message));
});

scoresList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;

  if (!confirm("Supprimer cette partie du classement ?")) return;

  try {
    await adminApi("/api/admin/delete-score", {
      method: "POST",
      body: JSON.stringify({ id: button.dataset.id })
    });
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});

resetScores.addEventListener("click", async () => {
  if (!confirm("Supprimer tous les scores ? Les votes restent conserves.")) return;

  try {
    await adminApi("/api/admin/reset-scores", { method: "POST", body: "{}" });
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});

resetAll.addEventListener("click", async () => {
  if (!confirm("Reset complet ? Tous les scores et votes seront remis a zero.")) return;

  try {
    await adminApi("/api/admin/reset-all", { method: "POST", body: "{}" });
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});
