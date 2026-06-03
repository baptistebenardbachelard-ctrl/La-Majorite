const loginForm = document.getElementById("adminLogin");
const tokenInput = document.getElementById("adminToken");
const adminContent = document.getElementById("adminContent");
const adminStatus = document.getElementById("adminStatus");
const scoresList = document.getElementById("scoresList");
const refreshScores = document.getElementById("refreshScores");
const resetScores = document.getElementById("resetScores");
const resetAll = document.getElementById("resetAll");
const adminStats = document.getElementById("adminStats");
const blockForm = document.getElementById("blockForm");
const blockPseudo = document.getElementById("blockPseudo");
const blockReason = document.getElementById("blockReason");
const blockedList = document.getElementById("blockedList");
const questionSearchForm = document.getElementById("questionSearchForm");
const questionSearch = document.getElementById("questionSearch");
const questionsList = document.getElementById("questionsList");

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
  if (!date) return "Date inconnue";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsedDate);
}

function renderScores(scores) {
  if (!scores.length) {
    scoresList.innerHTML = "<p class=\"empty-state\">Aucun score en base.</p>";
    return;
  }

  scoresList.innerHTML = scores.map((score) => `
    <article class="admin-score">
      <div>
        <strong>${escapeHtml(score.pseudo || "Sans pseudo")} - ${score.success_rate ?? 0}% - Streak x${score.best_streak ?? 0}</strong>
        <span>${score.score ?? 0} pts - ${score.correct ?? 0}/${score.total ?? 0} - ${formatDate(score.created_at)}</span>
        <span>game_id: ${escapeHtml(score.game_id || "inconnu")}</span>
      </div>
      <button class="delete-button" type="button" data-id="${score.id}">Supprimer</button>
    </article>
  `).join("");
}

function renderStats(stats) {
  adminStats.innerHTML = `
    <article><strong>${stats.players ?? 0}</strong><span>joueurs</span></article>
    <article><strong>${stats.games ?? 0}</strong><span>parties</span></article>
    <article><strong>${stats.answeredQuestions ?? 0}</strong><span>reponses</span></article>
    <article><strong>${stats.questions ?? 0}</strong><span>questions</span></article>
    <article><strong>${stats.chatMessages ?? 0}</strong><span>messages chat</span></article>
  `;

  const blocked = stats.blocked || [];
  blockedList.innerHTML = blocked.length
    ? blocked.map((entry) => `
      <article class="blocked-row">
        <span><strong>${escapeHtml(entry.pseudo)}</strong>${entry.reason ? ` - ${escapeHtml(entry.reason)}` : ""}</span>
        <button class="delete-button" type="button" data-unblock="${escapeHtml(entry.pseudo_key)}">Debloquer</button>
      </article>
    `).join("")
    : "<p class=\"empty-state\">Aucun pseudo bloque.</p>";
}

function renderQuestions(questions) {
  if (!questions.length) {
    questionsList.innerHTML = "<p class=\"empty-state\">Aucune question trouvee.</p>";
    return;
  }

  questionsList.innerHTML = questions.map((question) => `
    <article class="admin-question" data-question-id="${escapeHtml(question.id)}">
      <div class="question-meta">
        <strong>${escapeHtml(question.id)}</strong>
        <span>${question.votes_a}/${question.votes_b} votes</span>
      </div>
      <label>Question</label>
      <textarea data-field="question">${escapeHtml(question.question)}</textarea>
      <label>Choix A</label>
      <input data-field="choiceA" value="${escapeHtml(question.choice_a)}">
      <label>Choix B</label>
      <input data-field="choiceB" value="${escapeHtml(question.choice_b)}">
      <div class="admin-actions small-actions">
        <button class="secondary-button" type="button" data-save-question>Enregistrer</button>
        <button class="ghost-button danger-action" type="button" data-reset-question>Reset question</button>
      </div>
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
  const [scoresData, statsData, questionsData] = await Promise.all([
    adminApi("/api/admin/scores"),
    adminApi("/api/admin/stats"),
    adminApi(`/api/admin/questions?search=${encodeURIComponent(questionSearch.value.trim())}`)
  ]);
  renderStats(statsData);
  renderQuestions(questionsData.questions);
  const data = scoresData;
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

blockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await adminApi("/api/admin/block-pseudo", {
      method: "POST",
      body: JSON.stringify({
        pseudo: blockPseudo.value,
        reason: blockReason.value
      })
    });
    blockPseudo.value = "";
    blockReason.value = "";
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});

blockedList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-unblock]");
  if (!button) return;

  try {
    await adminApi("/api/admin/unblock-pseudo", {
      method: "POST",
      body: JSON.stringify({ pseudo: button.dataset.unblock })
    });
    await loadScores();
  } catch (error) {
    setStatus(error.message);
  }
});

questionSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadScores().catch((error) => setStatus(error.message));
});

questionsList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-question-id]");
  if (!card) return;
  const id = card.dataset.questionId;

  if (event.target.closest("[data-reset-question]")) {
    if (!confirm("Reset les votes de cette question ?")) return;
    try {
      await adminApi("/api/admin/reset-question", {
        method: "POST",
        body: JSON.stringify({ id })
      });
      await loadScores();
    } catch (error) {
      setStatus(error.message);
    }
    return;
  }

  if (event.target.closest("[data-save-question]")) {
    const value = (field) => card.querySelector(`[data-field="${field}"]`).value.trim();
    try {
      await adminApi("/api/admin/update-question", {
        method: "POST",
        body: JSON.stringify({
          id,
          question: value("question"),
          choiceA: value("choiceA"),
          choiceB: value("choiceB")
        })
      });
      await loadScores();
    } catch (error) {
      setStatus(error.message);
    }
  }
});
