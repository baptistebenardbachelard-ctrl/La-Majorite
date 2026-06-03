const TOTAL_QUESTIONS = 25;
const AVATARS = [
  { id: "avatar-1", label: "M", color: "linear-gradient(135deg, #ff2f68, #ffcf4a)" },
  { id: "avatar-2", label: "A", color: "linear-gradient(135deg, #12d7f2, #8b5cff)" },
  { id: "avatar-3", label: "B", color: "linear-gradient(135deg, #c5ff45, #12d7f2)" },
  { id: "avatar-4", label: "X", color: "linear-gradient(135deg, #ff8a3d, #ff2f68)" },
  { id: "avatar-5", label: "?", color: "linear-gradient(135deg, #ffffff, #8b5cff)" },
  { id: "avatar-6", label: "#", color: "linear-gradient(135deg, #ffcf4a, #12d7f2)" }
];

const BADGES = {
  first_game: { title: "Premiere partie", text: "Tu as rejoint La Majorite." },
  ten_games: { title: "10 parties", text: "Tu commences a lire la foule." },
  streak_5: { title: "Serie x5", text: "5 bonnes reponses d'affilee." }
};

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
  liveStreak: document.getElementById("liveStreak"),
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
  avatarGrid: document.getElementById("avatarGrid"),
  saveStatus: document.getElementById("saveStatus"),
  badgeList: document.getElementById("badgeList"),
  replayButton: document.getElementById("replayButton"),
  showLeaderboardButton: document.getElementById("showLeaderboardButton"),
  shareButton: document.getElementById("shareButton"),
  globalTab: document.getElementById("globalTab"),
  todayTab: document.getElementById("todayTab"),
  streakTab: document.getElementById("streakTab"),
  leaderboardList: document.getElementById("leaderboardList"),
  refreshLeaderboard: document.getElementById("refreshLeaderboard"),
  homeTopName: document.getElementById("homeTopName"),
  homeTopScore: document.getElementById("homeTopScore"),
  soundToggle: document.getElementById("soundToggle"),
  chatPanel: document.getElementById("chatPanel"),
  chatToggle: document.getElementById("chatToggle"),
  chatBox: document.getElementById("chatBox"),
  chatClose: document.getElementById("chatClose"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatStatus: document.getElementById("chatStatus"),
  toast: document.getElementById("toast")
};

const state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
  votes: [],
  votedQuestionIds: new Set(),
  gameId: "",
  playerPseudo: "",
  playerAvatar: localStorage.getItem("majorite_avatar") || "avatar-1",
  saved: false,
  rank: null,
  leaderboardMode: "global",
  soundEnabled: localStorage.getItem("majorite_sound") !== "off",
  chatLoaded: false
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

function avatarFor(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

function avatarHtml(id, className = "avatar-chip") {
  const avatar = avatarFor(id);
  return `<span class="${className}" style="--avatar-bg: ${avatar.color}">${escapeHtml(avatar.label)}</span>`;
}

function renderAvatarPicker() {
  ui.avatarGrid.innerHTML = AVATARS.map((avatar) => `
    <button class="avatar-option ${state.playerAvatar === avatar.id ? "active" : ""}" type="button" data-avatar="${avatar.id}" aria-label="Avatar ${avatar.label}">
      ${avatarHtml(avatar.id)}
    </button>
  `).join("");
}

function setSoundEnabled(enabled) {
  state.soundEnabled = enabled;
  localStorage.setItem("majorite_sound", enabled ? "on" : "off");
  ui.soundToggle.textContent = enabled ? "Son: on" : "Son: off";
  ui.soundToggle.setAttribute("aria-pressed", String(enabled));
}

function playTone(success) {
  if (!state.soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audio = new AudioCtx();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = success ? 740 : 180;
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
  } catch {
    // Audio is optional.
  }
}

async function loadHomeTop() {
  if (!ui.homeTopName || !ui.homeTopScore) return;
  try {
    const data = await api("/api/leaderboard?mode=today");
    const leader = data.entries[0];
    if (!leader) {
      ui.homeTopName.textContent = "Aucun joueur";
      ui.homeTopScore.textContent = "--";
      return;
    }
    ui.homeTopName.innerHTML = `${avatarHtml(leader.avatar, "avatar-mini")} ${escapeHtml(leader.pseudo)}`;
    ui.homeTopScore.textContent = formatPercent(leader.successRate);
  } catch {
    ui.homeTopName.textContent = "Top indisponible";
    ui.homeTopScore.textContent = "--";
  }
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
  if (!isoDate) return "Date inconnue";
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(parsedDate);
}

function askPseudo() {
  ui.pseudoInput.value = localStorage.getItem("majorite_pseudo") || state.playerPseudo || "";
  ui.pseudoStatus.textContent = "Ton score sera ajoute automatiquement au classement a la fin.";
  renderAvatarPicker();
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
  localStorage.setItem("majorite_avatar", state.playerAvatar);
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
    state.currentStreak = 0;
    state.bestStreak = 0;
    state.votes = [];
    state.votedQuestionIds = new Set();
    state.gameId = createGameId();
    state.saved = false;
    state.rank = null;
    ui.liveScore.textContent = "0";
    ui.liveStreak.textContent = "0";
    ui.finalRank.textContent = "#-";
    ui.badgeList.innerHTML = "";
    ui.saveStatus.textContent = "";
    document.body.classList.remove("answer-good", "answer-bad");
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
  ui.liveStreak.textContent = state.currentStreak;
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
  state.currentStreak = isCorrect ? state.currentStreak + 1 : 0;
  state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
  state.votes.push({ questionId: result.questionId, choice, majorityChoice, points, streak: state.currentStreak });
  ui.liveScore.textContent = state.score;
  ui.liveStreak.textContent = state.currentStreak;
  document.body.classList.remove("answer-good", "answer-bad");
  document.body.classList.add(isCorrect ? "answer-good" : "answer-bad");
  window.setTimeout(() => document.body.classList.remove("answer-good", "answer-bad"), 420);
  playTone(isCorrect);

  revealChoice(ui.choiceA, pctA, majorityChoice === "A");
  revealChoice(ui.choiceB, pctB, majorityChoice === "B");

  ui.feedback.textContent = isCorrect
    ? points === 2
      ? "Majorit\u00e9 trouvee sur une question serree : +2 points."
      : state.currentStreak >= 5
        ? `Majorite trouvee : +1 point. Streak x${state.currentStreak}.`
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
  ui.badgeList.innerHTML = `
    <span class="badge-preview">Meilleur streak: x${state.bestStreak}</span>
  `;
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
      avatar: state.playerAvatar,
      score: state.score,
      correct: state.correct,
      total: TOTAL_QUESTIONS,
      bestStreak: state.bestStreak,
      title: getTitle(state.score, state.correct)
    };
    const result = await api("/api/scores", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.saved = true;
    state.rank = result.rank;
    localStorage.setItem("majorite_pseudo", pseudo);
    localStorage.setItem("majorite_avatar", state.playerAvatar);
    ui.finalRank.textContent = `#${result.rank}`;
    renderBadges(result.badges || []);
    ui.saveStatus.textContent = `Score enregistre. Rang global #${result.rank}.`;
    loadHomeTop();
  } catch (error) {
    ui.saveStatus.textContent = error.message;
  }
}

function renderBadges(badges) {
  const unlocked = badges
    .map((badge) => BADGES[badge])
    .filter(Boolean);

  if (!unlocked.length) {
    ui.badgeList.innerHTML = `<span class="badge-preview">Meilleur streak: x${state.bestStreak}</span>`;
    return;
  }

  ui.badgeList.innerHTML = unlocked.map((badge) => `
    <span class="badge-item">
      <strong>${escapeHtml(badge.title)}</strong>
      <small>${escapeHtml(badge.text)}</small>
    </span>
  `).join("");
}

async function loadLeaderboard(mode = state.leaderboardMode) {
  state.leaderboardMode = mode;
  ui.globalTab.classList.toggle("active", mode === "global");
  ui.todayTab.classList.toggle("active", mode === "today");
  ui.streakTab.classList.toggle("active", mode === "streak");
  ui.globalTab.setAttribute("aria-selected", String(mode === "global"));
  ui.todayTab.setAttribute("aria-selected", String(mode === "today"));
  ui.streakTab.setAttribute("aria-selected", String(mode === "streak"));
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
        <span class="leader-name">${avatarHtml(entry.avatar, "avatar-mini")} ${escapeHtml(entry.pseudo)}</span>
        <span class="leader-meta">${entry.gamesPlayed} partie${entry.gamesPlayed > 1 ? "s" : ""} - ${entry.totalCorrect}/${entry.totalQuestions} bonnes reponses - Streak x${entry.bestStreak || 0} - ${formatDate(entry.lastPlayedAt)}</span>
      </span>
      <span class="leader-score">${state.leaderboardMode === "streak" ? `x${entry.bestStreak || 0}` : formatPercent(entry.successRate)}</span>
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

async function loadChat() {
  if (!state.chatLoaded) {
    ui.chatMessages.innerHTML = "<p class=\"empty-state\">Chargement...</p>";
  }

  try {
    const data = await api("/api/chat");
    state.chatLoaded = true;
    renderChat(data.messages || []);
  } catch (error) {
    ui.chatStatus.textContent = error.message;
  }
}

function renderChat(messages) {
  if (!messages.length) {
    ui.chatMessages.innerHTML = "<p class=\"empty-state\">Aucun message.</p>";
    return;
  }

  ui.chatMessages.innerHTML = messages.map((message) => `
    <article class="chat-message">
      ${avatarHtml(message.avatar, "avatar-mini")}
      <div>
        <strong>${escapeHtml(message.pseudo)}</strong>
        <p>${escapeHtml(message.message)}</p>
      </div>
    </article>
  `).join("");
  ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
}

async function sendChatMessage(event) {
  event.preventDefault();
  const message = ui.chatInput.value.trim();
  if (!message) return;

  if (!state.playerPseudo) {
    showToast("Entre un pseudo avant d'ecrire dans le chat.");
    askPseudo();
    return;
  }

  try {
    ui.chatStatus.textContent = "Envoi...";
    await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        pseudo: state.playerPseudo,
        avatar: state.playerAvatar,
        message
      })
    });
    ui.chatInput.value = "";
    ui.chatStatus.textContent = "";
    await loadChat();
  } catch (error) {
    ui.chatStatus.textContent = error.message;
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
ui.streakTab.addEventListener("click", () => loadLeaderboard("streak"));
ui.refreshLeaderboard.addEventListener("click", () => loadLeaderboard(state.leaderboardMode));
ui.soundToggle.addEventListener("click", () => setSoundEnabled(!state.soundEnabled));
ui.avatarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-avatar]");
  if (!button) return;
  state.playerAvatar = button.dataset.avatar;
  localStorage.setItem("majorite_avatar", state.playerAvatar);
  renderAvatarPicker();
});
ui.chatToggle.addEventListener("click", () => {
  ui.chatBox.classList.toggle("hidden");
  if (!ui.chatBox.classList.contains("hidden")) loadChat();
});
ui.chatClose.addEventListener("click", () => ui.chatBox.classList.add("hidden"));
ui.chatForm.addEventListener("submit", sendChatMessage);

document.querySelectorAll("[data-nav='home']").forEach((button) => {
  button.addEventListener("click", () => showScreen("home"));
});

document.querySelectorAll("[data-nav='play']").forEach((button) => {
  button.addEventListener("click", askPseudo);
});

setSoundEnabled(state.soundEnabled);
loadHomeTop();
window.setInterval(() => {
  if (!ui.chatBox.classList.contains("hidden")) loadChat();
}, 12000);
