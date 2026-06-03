const TOTAL_QUESTIONS = 25;
const AVATARS = [
  { id: "avatar-1", name: "Nova", face: "face-nova", color: "linear-gradient(135deg, #ff2f68, #ffcf4a)" },
  { id: "avatar-2", name: "Pixel", face: "face-pixel", color: "linear-gradient(135deg, #12d7f2, #8b5cff)" },
  { id: "avatar-3", name: "Bulle", face: "face-bulle", color: "linear-gradient(135deg, #c5ff45, #12d7f2)" },
  { id: "avatar-4", name: "Flash", face: "face-flash", color: "linear-gradient(135deg, #ff8a3d, #ff2f68)" },
  { id: "avatar-5", name: "Moka", face: "face-moka", color: "linear-gradient(135deg, #ffffff, #8b5cff)" },
  { id: "avatar-6", name: "Comete", face: "face-comete", color: "linear-gradient(135deg, #ffcf4a, #12d7f2)" },
  { id: "avatar-7", name: "Luna", face: "face-luna", color: "linear-gradient(135deg, #8b5cff, #ff2f68)" },
  { id: "avatar-8", name: "Tempo", face: "face-tempo", color: "linear-gradient(135deg, #12d7f2, #c5ff45)" }
];

const ACHIEVEMENTS = [
  { id: "first_game", title: "Premiere partie", text: "Terminer ta premiere partie.", check: (profile) => profile.gamesPlayed >= 1 },
  { id: "ten_games", title: "10 parties", text: "Terminer 10 parties avec le meme pseudo.", check: (profile) => profile.gamesPlayed >= 10 },
  { id: "streak_5", title: "Serie x5", text: "Faire 5 bonnes reponses d'affilee.", check: (profile) => profile.bestStreak >= 5 },
  { id: "streak_10", title: "Serie x10", text: "Faire 10 bonnes reponses d'affilee.", check: (profile) => profile.bestStreak >= 10 },
  { id: "perfect_game", title: "Partie parfaite", text: "Finir une partie a 100%.", check: (profile) => profile.bestGamePercent >= 100 },
  { id: "strong_game", title: "Lecteur solide", text: "Faire au moins 80% sur une partie.", check: (profile) => profile.bestGamePercent >= 80 },
  { id: "regular", title: "Habitue", text: "Jouer 25 parties.", check: (profile) => profile.gamesPlayed >= 25 },
  { id: "top_10", title: "Top 10", text: "Entrer dans le top 10 global.", check: (profile) => profile.rank > 0 && profile.rank <= 10 },
  { id: "top_3", title: "Podium", text: "Entrer dans le top 3 global.", check: (profile) => profile.rank > 0 && profile.rank <= 3 },
  { id: "chat_first", title: "Premier message", text: "Envoyer un message dans le chat.", check: (profile) => profile.chatMessages >= 1 },
  { id: "chat_10", title: "Voix du groupe", text: "Envoyer 10 messages dans le chat.", check: (profile) => profile.chatMessages >= 10 },
  { id: "risk_taker", title: "Prise de risque", text: "Jouer au moins 5 parties avec 70% ou plus au global.", check: (profile) => profile.gamesPlayed >= 5 && profile.successRate >= 70 }
];

const screens = {
  home: document.getElementById("homeScreen"),
  pseudo: document.getElementById("pseudoScreen"),
  game: document.getElementById("gameScreen"),
  end: document.getElementById("endScreen"),
  leaderboard: document.getElementById("leaderboardScreen"),
  achievements: document.getElementById("achievementsScreen"),
  howTo: document.getElementById("howToScreen")
};

const ui = {
  playButton: document.getElementById("playButton"),
  leaderboardButton: document.getElementById("leaderboardButton"),
  achievementsButton: document.getElementById("achievementsButton"),
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
  achievementsList: document.getElementById("achievementsList"),
  achievementsStatus: document.getElementById("achievementsStatus"),
  refreshAchievements: document.getElementById("refreshAchievements"),
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
  profileModal: document.getElementById("profileModal"),
  profileClose: document.getElementById("profileClose"),
  profileContent: document.getElementById("profileContent"),
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
  playerId: localStorage.getItem("majorite_player_id") || "",
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

function getPlayerId() {
  if (!state.playerId) {
    state.playerId = createGameId();
    localStorage.setItem("majorite_player_id", state.playerId);
  }
  return state.playerId;
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
  return `
    <span class="${className} avatar-face ${avatar.face}" style="--avatar-bg: ${avatar.color}" aria-hidden="true">
      <span class="avatar-ear left"></span>
      <span class="avatar-ear right"></span>
      <span class="avatar-hair"></span>
      <span class="avatar-eye left"></span>
      <span class="avatar-eye right"></span>
      <span class="avatar-mouth"></span>
    </span>
  `;
}

function renderAvatarPicker() {
  ui.avatarGrid.innerHTML = AVATARS.map((avatar) => `
    <button class="avatar-option ${state.playerAvatar === avatar.id ? "active" : ""}" type="button" data-avatar="${avatar.id}" aria-label="Avatar ${avatar.name}">
      ${avatarHtml(avatar.id)}
      <span>${escapeHtml(avatar.name)}</span>
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

function formatTime(isoDate) {
  if (!isoDate) return "--:--";
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) return "--:--";

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsedDate);
}

function askPseudo() {
  ui.pseudoInput.value = localStorage.getItem("majorite_pseudo") || state.playerPseudo || "";
  ui.pseudoStatus.textContent = "Ton score sera ajoute automatiquement au classement a la fin.";
  renderAvatarPicker();
  showScreen("pseudo");
  window.setTimeout(() => ui.pseudoInput.focus(), 80);
}

async function submitPseudo(event) {
  event.preventDefault();
  const pseudo = ui.pseudoInput.value.trim().slice(0, 18);
  if (!pseudo) {
    ui.pseudoStatus.textContent = "Entre un pseudo pour commencer.";
    return;
  }

  try {
    ui.pseudoStatus.textContent = "Verification du pseudo...";
    const player = await api("/api/player/register", {
      method: "POST",
      body: JSON.stringify({
        playerId: getPlayerId(),
        pseudo,
        avatar: state.playerAvatar
      })
    });
    state.playerId = player.playerId;
    state.playerPseudo = player.pseudo;
    state.playerAvatar = player.avatar;
    localStorage.setItem("majorite_player_id", state.playerId);
    localStorage.setItem("majorite_pseudo", state.playerPseudo);
    localStorage.setItem("majorite_avatar", state.playerAvatar);
    startGame();
  } catch (error) {
    ui.pseudoStatus.textContent = error.message;
  }
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
      playerId: state.playerId,
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
    .map((badge) => ACHIEVEMENTS.find((achievement) => achievement.id === badge))
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

function achievementsForProfile(profile = {}) {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: Boolean(achievement.check(profile))
  }));
}

function renderAchievementsList(profile, container = ui.achievementsList) {
  const achievements = achievementsForProfile(profile);
  container.innerHTML = achievements.map((achievement) => `
    <article class="achievement-card ${achievement.unlocked ? "unlocked" : "locked"}">
      <span class="achievement-icon">${achievement.unlocked ? "OK" : "--"}</span>
      <div>
        <strong>${escapeHtml(achievement.title)}</strong>
        <p>${escapeHtml(achievement.text)}</p>
      </div>
    </article>
  `).join("");
}

async function loadAchievements() {
  const pseudo = state.playerPseudo || localStorage.getItem("majorite_pseudo") || "";
  if (!pseudo) {
    ui.achievementsStatus.textContent = "Entre un pseudo puis joue une partie pour commencer a debloquer des succes.";
    renderAchievementsList({}, ui.achievementsList);
    showScreen("achievements");
    return;
  }

  ui.achievementsStatus.textContent = "Chargement des succes...";
  showScreen("achievements");

  try {
    const data = await api(`/api/player?pseudo=${encodeURIComponent(pseudo)}`);
    ui.achievementsStatus.textContent = `${data.profile.pseudo} - Rang #${data.profile.rank || "-"} - ${data.profile.gamesPlayed} partie(s).`;
    renderAchievementsList(data.profile, ui.achievementsList);
  } catch (error) {
    ui.achievementsStatus.textContent = error.message;
    renderAchievementsList({}, ui.achievementsList);
  }
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
      <button class="chat-profile-button" type="button" data-profile="${escapeHtml(message.pseudo)}" aria-label="Voir le profil de ${escapeHtml(message.pseudo)}">
        ${avatarHtml(message.avatar, "avatar-mini")}
      </button>
      <div>
        <button class="chat-name" type="button" data-profile="${escapeHtml(message.pseudo)}">${escapeHtml(message.pseudo)}</button>
        <time>${formatTime(message.created_at)}</time>
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
        playerId: state.playerId,
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

async function openPlayerProfile(pseudo) {
  ui.profileModal.classList.remove("hidden");
  ui.profileContent.innerHTML = "<p class=\"empty-state\">Chargement du profil...</p>";

  try {
    const data = await api(`/api/player?pseudo=${encodeURIComponent(pseudo)}`);
    const profile = data.profile;
    ui.profileContent.innerHTML = `
      <header class="profile-header">
        ${avatarHtml(profile.avatar, "avatar-chip")}
        <div>
          <h2>${escapeHtml(profile.pseudo)}</h2>
          <p>Rang global #${profile.rank || "-"}</p>
        </div>
      </header>
      <div class="profile-stats">
        <article><strong>${profile.gamesPlayed || 0}</strong><span>parties</span></article>
        <article><strong>${formatPercent(profile.successRate || 0)}</strong><span>reussite</span></article>
        <article><strong>x${profile.bestStreak || 0}</strong><span>streak</span></article>
        <article><strong>${profile.chatMessages || 0}</strong><span>messages</span></article>
      </div>
      <h3>Succes</h3>
      <div class="achievements-list profile-achievements"></div>
    `;
    renderAchievementsList(profile, ui.profileContent.querySelector(".profile-achievements"));
  } catch (error) {
    ui.profileContent.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

ui.playButton.addEventListener("click", askPseudo);
ui.leaderboardButton.addEventListener("click", () => loadLeaderboard("global"));
ui.achievementsButton.addEventListener("click", loadAchievements);
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
ui.refreshAchievements.addEventListener("click", loadAchievements);
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
ui.chatMessages.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile]");
  if (!button) return;
  openPlayerProfile(button.dataset.profile);
});
ui.profileClose.addEventListener("click", () => ui.profileModal.classList.add("hidden"));
ui.profileModal.addEventListener("click", (event) => {
  if (event.target === ui.profileModal) ui.profileModal.classList.add("hidden");
});

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
