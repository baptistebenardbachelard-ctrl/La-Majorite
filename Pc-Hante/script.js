const TOTAL_QUESTIONS = 25;

const screens = {
  home: document.getElementById("homeScreen"),
  pseudo: document.getElementById("pseudoScreen"),
  game: document.getElementById("gameScreen"),
  end: document.getElementById("endScreen"),
  leaderboard: document.getElementById("leaderboardScreen"),
  howTo: document.getElementById("howToScreen")
};

const ui = {
  playButton: document.getElementById("playButton"),
  leaderboardButton: document.getElementById("leaderboardButton"),
  howToButton: document.getElementById("howToButton"),
  questionCounter: document.getElementById("questionCounter"),
  progressBar: document.getElementById("progressBar"),
  liveScore: document.getElementById("liveScore"),
  questionText: document.getElementById("questionText"),
  choiceA: document.getElementById("choiceA"),
  choiceB: document.getElementById("choiceB"),
  feedback: document.getElementById("feedback"),
  nextButton: document.getElementById("nextButton"),
  syncPercent: document.getElementById("syncPercent"),
  finalScore: document.getElementById("finalScore"),
  finalCorrect: document.getElementById("finalCorrect"),
  finalRank: document.getElementById("finalRank"),
  finalTitle: document.getElementById("finalTitle"),
  pseudoInput: document.getElementById("pseudoInput"),
  pseudoForm: document.getElementById("pseudoForm"),
  pseudoStatus: document.getElementById("pseudoStatus"),
  saveStatus: document.getElementById("saveStatus"),
  replayButton: document.getElementById("replayButton"),
  showLeaderboardButton: document.getElementById("showLeaderboardButton"),
  shareButton: document.getElementById("shareButton"),
  globalTab: document.getElementById("globalTab"),
  todayTab: document.getElementById("todayTab"),
  leaderboardList: document.getElementById("leaderboardList"),
  refreshLeaderboard: document.getElementById("refreshLeaderboard"),
  toast: document.getElementById("toast")
};

const state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  correct: 0,
  votes: [],
  votedQuestionIds: new Set(),
  gameId: "",
  playerPseudo: "",
  saved: false,
  rank: null,
  leaderboardMode: "global"
};

function createGameId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Une erreur est survenue.");
  }
  return data;
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => ui.toast.classList.remove("visible"), 2600);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeChoice(choice) {
  return choice.trim().toLowerCase();
}

function pickRoundQuestions(questions) {
  const picked = [];
  const usedChoices = new Set();

  for (const question of shuffle(questions)) {
    const choiceA = normalizeChoice(question.choiceA);
    const choiceB = normalizeChoice(question.choiceB);
    if (usedChoices.has(choiceA) || usedChoices.has(choiceB)) continue;

    picked.push(question);
    usedChoices.add(choiceA);
    usedChoices.add(choiceB);

    if (picked.length === TOTAL_QUESTIONS) return picked;
  }

  return picked;
}

function getTitle(score, correct) {
  if (correct === 25) return "Cerveau collectif";
  if (correct >= 21) return "Maitre de la majorit\u00e9";
  if (correct >= 16) return "Lecteur d'ambiance";
  if (correct >= 11) return "Humain imprevisible";
  if (correct >= 6) return "Esprit rebelle";
  return "Alien social";
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(new Date(isoDate));
}

function askPseudo() {
  ui.pseudoInput.value = localStorage.getItem("majorite_pseudo") || state.playerPseudo || "";
  ui.pseudoStatus.textContent = "Ton score sera ajoute automatiquement au classement a la fin.";
  showScreen("pseudo");
  window.setTimeout(() => ui.pseudoInput.focus(), 80);
}

function submitPseudo(event) {
  event.preventDefault();
  const pseudo = ui.pseudoInput.value.trim().slice(0, 18);
  if (!pseudo) {
    ui.pseudoStatus.textContent = "Entre un pseudo pour commencer.";
    return;
  }

  state.playerPseudo = pseudo;
  localStorage.setItem("majorite_pseudo", pseudo);
  startGame();
}

async function startGame() {
  if (!state.playerPseudo) {
    askPseudo();
    return;
  }

  try {
    const data = await api("/api/questions");
    state.questions = pickRoundQuestions(data.questions);
    if (state.questions.length < TOTAL_QUESTIONS) {
      throw new Error("Pas assez de dilemmes uniques pour lancer une partie.");
    }
    state.currentIndex = 0;
    state.score = 0;
    state.correct = 0;
    state.votes = [];
    state.votedQuestionIds = new Set();
    state.gameId = createGameId();
    state.saved = false;
    state.rank = null;
    ui.liveScore.textContent = "0";
    ui.finalRank.textContent = "#-";
    ui.saveStatus.textContent = "";
    showScreen("game");
    renderQuestion();
  } catch (error) {
    showToast(error.message);
  }
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const currentNumber = state.currentIndex + 1;
  const progress = (currentNumber / TOTAL_QUESTIONS) * 100;

  ui.questionCounter.textContent = `Question ${currentNumber}/${TOTAL_QUESTIONS}`;
  ui.progressBar.style.width = `${progress}%`;
  ui.liveScore.textContent = state.score;
  ui.questionText.textContent = question.question;
  ui.feedback.textContent = "Choisis ce que la majorit\u00e9 va choisir.";
  ui.feedback.className = "feedback";
  ui.nextButton.classList.add("hidden");

  setupChoice(ui.choiceA, "A", question.choiceA);
  setupChoice(ui.choiceB, "B", question.choiceB);
}

function setupChoice(button, choice, text) {
  button.disabled = false;
  button.className = `choice-button choice-${choice.toLowerCase()}`;
  button.querySelector(".choice-text").textContent = text;
  button.querySelector(".result-percent").textContent = "";
  button.querySelector(".result-tag").textContent = "";
  button.querySelector(".result-bar").style.width = "0%";
  button.onclick = () => vote(choice);
}

async function vote(choice) {
  const question = state.questions[state.currentIndex];
  if (state.votedQuestionIds.has(question.id)) {
    showToast("Tu as deja vote sur cette question.");
    return;
  }

  ui.choiceA.disabled = true;
  ui.choiceB.disabled = true;
  const selectedButton = choice === "A" ? ui.choiceA : ui.choiceB;
  selectedButton.classList.add("selected");

  try {
    const result = await api("/api/vote", {
      method: "POST",
      body: JSON.stringify({ gameId: state.gameId, questionId: question.id, choice })
    });
    state.votedQuestionIds.add(question.id);
    applyVoteResult(result, choice);
  } catch (error) {
    ui.choiceA.disabled = false;
    ui.choiceB.disabled = false;
    selectedButton.classList.remove("selected");
    showToast(error.message);
  }
}

function applyVoteResult(result, choice) {
  const pctA = result.percentages.A;
  const pctB = result.percentages.B;
  const majorityChoice = result.majorityChoice;
  const isCorrect = result.isCorrect;
  const points = result.points;

  state.score += points;
  state.correct += isCorrect ? 1 : 0;
  state.votes.push({ questionId: result.questionId, choice, majorityChoice, points });
  ui.liveScore.textContent = state.score;

  revealChoice(ui.choiceA, pctA, majorityChoice === "A");
  revealChoice(ui.choiceB, pctB, majorityChoice === "B");

  ui.feedback.textContent = isCorrect
    ? points === 2
      ? "Majorit\u00e9 trouvee sur une question serree : +2 points."
      : "Majorit\u00e9 trouvee : +1 point."
    : "Minorite choisie : 0 point.";
  ui.feedback.className = `feedback ${isCorrect ? "positive" : "negative"}`;
  ui.nextButton.classList.remove("hidden");
}

function revealChoice(button, percent, isMajority) {
  button.classList.add("revealed");
  if (isMajority) button.classList.add("majority");
  button.querySelector(".result-bar").style.width = `${percent}%`;
  button.querySelector(".result-percent").textContent = `${percent}%`;
  button.querySelector(".result-tag").textContent = isMajority ? "Majorit\u00e9" : "Minorit\u00e9";
}

function nextQuestion() {
  if (state.currentIndex < TOTAL_QUESTIONS - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    renderEndScreen();
  }
}

async function renderEndScreen() {
  const sync = Math.round((state.correct / TOTAL_QUESTIONS) * 100);
  const title = getTitle(state.score, state.correct);
  ui.syncPercent.textContent = `${sync} %`;
  ui.finalScore.textContent = state.score;
  ui.finalCorrect.textContent = `${state.correct}/${TOTAL_QUESTIONS}`;
  ui.finalTitle.textContent = title;
  ui.finalRank.textContent = state.rank ? `#${state.rank}` : "#-";
  ui.saveStatus.textContent = "Enregistrement du score...";
  showScreen("end");
  saveScore();
}

async function saveScore() {
  if (state.saved) {
    return;
  }

  const pseudo = state.playerPseudo.trim().slice(0, 18);
  if (!pseudo) {
    ui.saveStatus.textContent = "Pseudo manquant. Rejoue en entrant un pseudo avant la partie.";
    return;
  }

  try {
    ui.saveStatus.textContent = "Enregistrement...";
    const payload = {
      gameId: state.gameId,
      pseudo,
      score: state.score,
      correct: state.correct,
      total: TOTAL_QUESTIONS,
      title: getTitle(state.score, state.correct)
    };
    const result = await api("/api/scores", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.saved = true;
    state.rank = result.rank;
    localStorage.setItem("majorite_pseudo", pseudo);
    ui.finalRank.textContent = `#${result.rank}`;
    ui.saveStatus.textContent = `Score enregistre. Rang global #${result.rank}.`;
  } catch (error) {
    ui.saveStatus.textContent = error.message;
  }
}

async function loadLeaderboard(mode = state.leaderboardMode) {
  state.leaderboardMode = mode;
  ui.globalTab.classList.toggle("active", mode === "global");
  ui.todayTab.classList.toggle("active", mode === "today");
  ui.globalTab.setAttribute("aria-selected", String(mode === "global"));
  ui.todayTab.setAttribute("aria-selected", String(mode === "today"));
  ui.leaderboardList.innerHTML = "<p class=\"empty-state\">Chargement...</p>";
  showScreen("leaderboard");

  try {
    const data = await api(`/api/leaderboard?mode=${mode}`);
    renderLeaderboard(data.entries);
  } catch (error) {
    ui.leaderboardList.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

function renderLeaderboard(entries) {
  if (!entries.length) {
    ui.leaderboardList.innerHTML = "<p class=\"empty-state\">Aucun score pour l'instant. Lance la premiere partie.</p>";
    return;
  }

  ui.leaderboardList.innerHTML = entries.map((entry, index) => `
    <li>
      <span class="rank">#${index + 1}</span>
      <span>
        <span class="leader-name">${escapeHtml(entry.pseudo)}</span>
        <span class="leader-meta">${entry.gamesPlayed} partie${entry.gamesPlayed > 1 ? "s" : ""} · ${entry.totalCorrect}/${entry.totalQuestions} bonnes reponses · ${formatDate(entry.lastPlayedAt)}</span>
      </span>
      <span class="leader-score">${formatPercent(entry.successRate)}</span>
    </li>
  `).join("");
}

function formatPercent(value) {
  const rounded = Number(value);
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function shareScore() {
  const text = `La Majorit\u00e9: ${state.score} points, ${state.correct}/${TOTAL_QUESTIONS}, ${getTitle(state.score, state.correct)}.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "La Majorit\u00e9", text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Score copie dans le presse-papiers.");
    }
  } catch {
    showToast("Partage annule.");
  }
}

ui.playButton.addEventListener("click", askPseudo);
ui.leaderboardButton.addEventListener("click", () => loadLeaderboard("global"));
ui.howToButton.addEventListener("click", () => showScreen("howTo"));
ui.nextButton.addEventListener("click", nextQuestion);
ui.pseudoForm.addEventListener("submit", submitPseudo);
ui.replayButton.addEventListener("click", askPseudo);
ui.showLeaderboardButton.addEventListener("click", () => loadLeaderboard("global"));
ui.shareButton.addEventListener("click", shareScore);
ui.globalTab.addEventListener("click", () => loadLeaderboard("global"));
ui.todayTab.addEventListener("click", () => loadLeaderboard("today"));
ui.refreshLeaderboard.addEventListener("click", () => loadLeaderboard(state.leaderboardMode));

document.querySelectorAll("[data-nav='home']").forEach((button) => {
  button.addEventListener("click", () => showScreen("home"));
});

document.querySelectorAll("[data-nav='play']").forEach((button) => {
  button.addEventListener("click", askPseudo);
});
