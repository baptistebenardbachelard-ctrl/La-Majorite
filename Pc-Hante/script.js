const TOTAL_QUESTIONS = 25;
const SAVED_ROUND_KEY = "majorite_saved_round";
const AVATARS = [
  { id: "avatar-1", name: "Renard", src: "assets/avatars/avatar-1.svg" },
  { id: "avatar-2", name: "Panda", src: "assets/avatars/avatar-2.svg" },
  { id: "avatar-3", name: "Chat", src: "assets/avatars/avatar-3.svg" },
  { id: "avatar-4", name: "Chien", src: "assets/avatars/avatar-4.svg" },
  { id: "avatar-5", name: "Lapin", src: "assets/avatars/avatar-5.svg" },
  { id: "avatar-6", name: "Koala", src: "assets/avatars/avatar-6.svg" },
  { id: "avatar-7", name: "Tigre", src: "assets/avatars/avatar-7.svg" },
  { id: "avatar-8", name: "Ours", src: "assets/avatars/avatar-8.svg" },
  { id: "avatar-9", name: "Pingouin", src: "assets/avatars/avatar-9.svg" },
  { id: "avatar-10", name: "Grenouille", src: "assets/avatars/avatar-10.svg" },
  { id: "avatar-11", name: "Lion", src: "assets/avatars/avatar-11.svg" },
  { id: "avatar-12", name: "Singe", src: "assets/avatars/avatar-12.svg" },
  { id: "avatar-13", name: "Cochon", src: "assets/avatars/avatar-13.svg" },
  { id: "avatar-14", name: "Licorne", src: "assets/avatars/avatar-14.svg" },
  { id: "avatar-15", name: "Dragon", src: "assets/avatars/avatar-15.svg" },
  { id: "avatar-16", name: "Requin", src: "assets/avatars/avatar-16.svg" },
  { id: "avatar-17", name: "Poulpe", src: "assets/avatars/avatar-17.svg" },
  { id: "avatar-18", name: "Abeille", src: "assets/avatars/avatar-18.svg" },
  { id: "avatar-19", name: "Papillon", src: "assets/avatars/avatar-19.svg" },
  { id: "avatar-20", name: "Tortue", src: "assets/avatars/avatar-20.svg" },
  { id: "avatar-21", name: "Astronaute", src: "assets/avatars/avatar-21.svg" },
  { id: "avatar-22", name: "Ninja", src: "assets/avatars/avatar-22.svg" },
  { id: "avatar-23", name: "Pirate", src: "assets/avatars/avatar-23.svg" },
  { id: "avatar-24", name: "Robot", src: "assets/avatars/avatar-24.svg" },
  { id: "avatar-25", name: "Sorciere", src: "assets/avatars/avatar-25.svg" },
  { id: "avatar-26", name: "Mage", src: "assets/avatars/avatar-26.svg" },
  { id: "avatar-27", name: "Chevalier", src: "assets/avatars/avatar-27.svg" },
  { id: "avatar-28", name: "Princesse", src: "assets/avatars/avatar-28.svg" },
  { id: "avatar-29", name: "Roi", src: "assets/avatars/avatar-29.svg" },
  { id: "avatar-30", name: "Detective", src: "assets/avatars/avatar-30.svg" },
  { id: "avatar-31", name: "Skateur", src: "assets/avatars/avatar-31.svg" },
  { id: "avatar-32", name: "Gamer", src: "assets/avatars/avatar-32.svg" },
  { id: "avatar-33", name: "DJ", src: "assets/avatars/avatar-33.svg" },
  { id: "avatar-34", name: "Scientifique", src: "assets/avatars/avatar-34.svg" },
  { id: "avatar-35", name: "Chef", src: "assets/avatars/avatar-35.svg" },
  { id: "avatar-36", name: "Fantome", src: "assets/avatars/avatar-36.svg" },
  { id: "avatar-37", name: "Vampire", src: "assets/avatars/avatar-37.svg" },
  { id: "avatar-38", name: "Alien", src: "assets/avatars/avatar-38.svg" },
  { id: "avatar-39", name: "Zombie", src: "assets/avatars/avatar-39.svg" },
  { id: "avatar-40", name: "Clown", src: "assets/avatars/avatar-40.svg" },
  { id: "avatar-41", name: "Nuage", src: "assets/avatars/avatar-41.svg" },
  { id: "avatar-42", name: "Soleil", src: "assets/avatars/avatar-42.svg" },
  { id: "avatar-43", name: "Lune", src: "assets/avatars/avatar-43.svg" },
  { id: "avatar-44", name: "Flamme", src: "assets/avatars/avatar-44.svg" },
  { id: "avatar-45", name: "Glace", src: "assets/avatars/avatar-45.svg" },
  { id: "avatar-46", name: "Pizza", src: "assets/avatars/avatar-46.svg" },
  { id: "avatar-47", name: "Burger", src: "assets/avatars/avatar-47.svg" },
  { id: "avatar-48", name: "Sushi", src: "assets/avatars/avatar-48.svg" },
  { id: "avatar-49", name: "Cookie", src: "assets/avatars/avatar-49.svg" },
  { id: "avatar-50", name: "Bonbon", src: "assets/avatars/avatar-50.svg" }
];

const ACHIEVEMENTS = [
  { id: "first_game", title: "Premiere partie", text: "Terminer ta premiere partie.", check: (profile) => profile.gamesPlayed >= 1 },
  { id: "ten_games", title: "10 modes", text: "Terminer 10 modes avec le meme pseudo.", check: (profile) => profile.gamesPlayed >= 10 },
  { id: "streak_5", title: "Serie x5", text: "Faire 5 bonnes reponses d'affilee.", check: (profile) => profile.bestStreak >= 5 },
  { id: "streak_10", title: "Serie x10", text: "Faire 10 bonnes reponses d'affilee.", check: (profile) => profile.bestStreak >= 10 },
  { id: "tie_3", title: "Equilibriste", text: "Tomber sur 3 egalites parfaites a 50/50.", check: (profile) => profile.tieVotes >= 3 },
  { id: "perfect_game", title: "Partie parfaite", text: "Finir une partie a 100%.", check: (profile) => profile.bestGamePercent >= 100 },
  { id: "strong_game", title: "Lecteur solide", text: "Faire au moins 80% sur une partie.", check: (profile) => profile.bestGamePercent >= 80 },
  { id: "regular", title: "Tour complet", text: "Terminer les 14 modes disponibles.", check: (profile) => profile.gamesPlayed >= 14 },
  { id: "top_10", title: "Top 10", text: "Entrer dans le top 10 global.", check: (profile) => profile.rank > 0 && profile.rank <= 10 },
  { id: "top_3", title: "Podium", text: "Entrer dans le top 3 global.", check: (profile) => profile.rank > 0 && profile.rank <= 3 },
  { id: "chat_first", title: "Premier message", text: "Envoyer un message dans le chat.", check: (profile) => profile.chatMessages >= 1 },
  { id: "chat_10", title: "Voix du groupe", text: "Envoyer 10 messages dans le chat.", check: (profile) => profile.chatMessages >= 10 },
  { id: "level_5", title: "Niveau 5", text: "Atteindre le niveau 5.", check: (profile) => profile.level >= 5 },
  { id: "level_10", title: "Niveau 10", text: "Atteindre le niveau 10.", check: (profile) => profile.level >= 10 },
  { id: "risk_taker", title: "Prise de risque", text: "Jouer au moins 5 parties avec 70% ou plus au global.", check: (profile) => profile.gamesPlayed >= 5 && profile.successRate >= 70 }
];

const screens = {
  home: document.getElementById("homeScreen"),
  pseudo: document.getElementById("pseudoScreen"),
  mode: document.getElementById("modeScreen"),
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
  feedbackButton: document.getElementById("feedbackButton"),
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
  levelProgress: document.getElementById("levelProgress"),
  pseudoInput: document.getElementById("pseudoInput"),
  pseudoForm: document.getElementById("pseudoForm"),
  pseudoStatus: document.getElementById("pseudoStatus"),
  avatarGrid: document.getElementById("avatarGrid"),
  modeGrid: document.getElementById("modeGrid"),
  modeStatus: document.getElementById("modeStatus"),
  playerProgressCard: document.getElementById("playerProgressCard"),
  refreshModes: document.getElementById("refreshModes"),
  saveStatus: document.getElementById("saveStatus"),
  badgeList: document.getElementById("badgeList"),
  replayButton: document.getElementById("replayButton"),
  showLeaderboardButton: document.getElementById("showLeaderboardButton"),
  shareButton: document.getElementById("shareButton"),
  globalTab: document.getElementById("globalTab"),
  todayTab: document.getElementById("todayTab"),
  streakTab: document.getElementById("streakTab"),
  levelTab: document.getElementById("levelTab"),
  leaderboardList: document.getElementById("leaderboardList"),
  refreshLeaderboard: document.getElementById("refreshLeaderboard"),
  achievementsList: document.getElementById("achievementsList"),
  achievementsStatus: document.getElementById("achievementsStatus"),
  refreshAchievements: document.getElementById("refreshAchievements"),
  homeTopList: document.getElementById("homeTopList"),
  homeProfileCard: document.getElementById("homeProfileCard"),
  soundToggle: document.getElementById("soundToggle"),
  chatPanel: document.getElementById("chatPanel"),
  chatToggle: document.getElementById("chatToggle"),
  onlineCount: document.getElementById("onlineCount"),
  chatBox: document.getElementById("chatBox"),
  chatClose: document.getElementById("chatClose"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatStatus: document.getElementById("chatStatus"),
  profileModal: document.getElementById("profileModal"),
  profileClose: document.getElementById("profileClose"),
  profileContent: document.getElementById("profileContent"),
  feedbackModal: document.getElementById("feedbackModal"),
  feedbackClose: document.getElementById("feedbackClose"),
  feedbackText: document.getElementById("feedbackText"),
  feedbackSend: document.getElementById("feedbackSend"),
  feedbackStatus: document.getElementById("feedbackStatus"),
  toast: document.getElementById("toast")
};

const state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
  tieCount: 0,
  votes: [],
  votedQuestionIds: new Set(),
  gameId: "",
  playerId: localStorage.getItem("majorite_player_id") || "",
  playerPseudo: "",
  playerAvatar: localStorage.getItem("majorite_avatar") || "avatar-1",
  selectedMode: "",
  modes: [],
  playerProfile: null,
  saved: false,
  rank: null,
  leaderboardMode: "global",
  soundEnabled: localStorage.getItem("majorite_sound") !== "off",
  chatLoaded: false
};

const floatingDilemmas = [];
let floatingDilemmasFrame = null;
let floatingDilemmasLastTime = 0;

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

function tieCountKey(pseudo = state.playerPseudo) {
  return `majorite_ties_${String(pseudo || "").toLowerCase()}`;
}

function getLocalTieCount(pseudo = state.playerPseudo) {
  return Number(localStorage.getItem(tieCountKey(pseudo)) || 0);
}

function addLocalTie(pseudo = state.playerPseudo) {
  const nextCount = getLocalTieCount(pseudo) + 1;
  localStorage.setItem(tieCountKey(pseudo), String(nextCount));
  return nextCount;
}

function withLocalStats(profile = {}) {
  const pseudo = profile.pseudo || state.playerPseudo || localStorage.getItem("majorite_pseudo") || "";
  return {
    ...profile,
    tieVotes: Math.max(Number(profile.tieVotes || 0), getLocalTieCount(pseudo))
  };
}

function getSavedRound() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_ROUND_KEY) || "null");
    if (!saved || !saved.gameId || !saved.questions?.length) return null;
    const pseudo = state.playerPseudo || localStorage.getItem("majorite_pseudo") || "";
    if (saved.pseudo && pseudo && saved.pseudo !== pseudo) return null;
    return saved;
  } catch {
    return null;
  }
}

function saveActiveRound() {
  if (!state.gameId || !state.questions.length || state.saved || state.currentIndex >= TOTAL_QUESTIONS) return;
  localStorage.setItem(SAVED_ROUND_KEY, JSON.stringify({
    gameId: state.gameId,
    pseudo: state.playerPseudo,
    playerId: state.playerId,
    avatar: state.playerAvatar,
    selectedMode: state.selectedMode,
    questions: state.questions,
    currentIndex: state.currentIndex,
    score: state.score,
    correct: state.correct,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    tieCount: state.tieCount,
    votes: state.votes,
    votedQuestionIds: [...state.votedQuestionIds],
    savedAt: new Date().toISOString()
  }));
}

function clearSavedRound() {
  localStorage.removeItem(SAVED_ROUND_KEY);
}

function restoreSavedRound() {
  const saved = getSavedRound();
  if (!saved) {
    showToast("Aucune partie a reprendre.");
    return;
  }

  state.gameId = saved.gameId;
  state.playerPseudo = saved.pseudo || state.playerPseudo;
  state.playerId = saved.playerId || state.playerId;
  state.playerAvatar = saved.avatar || state.playerAvatar;
  state.selectedMode = saved.selectedMode;
  state.questions = saved.questions;
  state.currentIndex = Number(saved.currentIndex || 0);
  state.score = Number(saved.score || 0);
  state.correct = Number(saved.correct || 0);
  state.currentStreak = Number(saved.currentStreak || 0);
  state.bestStreak = Number(saved.bestStreak || 0);
  state.tieCount = Number(saved.tieCount || 0);
  state.votes = saved.votes || [];
  state.votedQuestionIds = new Set(saved.votedQuestionIds || []);
  state.saved = false;
  state.rank = null;

  const currentQuestion = state.questions[state.currentIndex];
  if (currentQuestion && state.votedQuestionIds.has(currentQuestion.id) && state.currentIndex < TOTAL_QUESTIONS - 1) {
    state.currentIndex += 1;
    saveActiveRound();
  }

  showScreen("game");
  renderQuestion();
}

function resetGameScroll() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector(".app-shell")?.scrollTo?.({ top: 0, behavior: "smooth" });
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

function setupFloatingDilemmas() {
  const cards = [...document.querySelectorAll(".lobby-dilemma-card")];
  if (!cards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  floatingDilemmas.length = 0;
  const width = window.innerWidth;
  const height = window.innerHeight;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width || 160;
    const cardHeight = rect.height || 76;
    const speed = 0.012 + (index % 3) * 0.004;
    const directionX = index % 2 === 0 ? 1 : -1;
    const directionY = index % 3 === 0 ? 1 : -1;

    floatingDilemmas.push({
      card,
      x: ((index * 211) % Math.max(width - cardWidth, 1)),
      y: 72 + ((index * 137) % Math.max(height - cardHeight - 120, 1)),
      width: cardWidth,
      height: cardHeight,
      vx: speed * directionX,
      vy: (speed * 0.72) * directionY,
      rotation: (index % 2 === 0 ? -1 : 1) * (3 + index),
      drift: index * 0.7
    });
  });

  if (!floatingDilemmasFrame) {
    floatingDilemmasLastTime = performance.now();
    floatingDilemmasFrame = requestAnimationFrame(animateFloatingDilemmas);
  }
}

function animateFloatingDilemmas(time) {
  const delta = Math.min(time - floatingDilemmasLastTime, 40);
  floatingDilemmasLastTime = time;
  const width = window.innerWidth;
  const height = window.innerHeight;

  floatingDilemmas.forEach((item) => {
    item.x += item.vx * delta;
    item.y += item.vy * delta;

    if (item.x <= 0 || item.x + item.width >= width) {
      item.vx *= -1;
      item.x = Math.max(0, Math.min(item.x, width - item.width));
    }

    if (item.y <= 0 || item.y + item.height >= height) {
      item.vy *= -1;
      item.y = Math.max(0, Math.min(item.y, height - item.height));
    }

    const bob = Math.sin((time / 1800) + item.drift) * 4;
    item.card.style.transform = `translate3d(${item.x}px, ${item.y + bob}px, 0) rotate(${item.rotation}deg)`;
  });

  floatingDilemmasFrame = requestAnimationFrame(animateFloatingDilemmas);
}

function avatarFor(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

function avatarHtml(id, className = "avatar-chip") {
  const avatar = avatarFor(id);
  return `
    <span class="${className} avatar-image" aria-hidden="true">
      <img src="${avatar.src}" alt="" loading="lazy" decoding="async">
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

function triggerStreakFeedback(isCorrect, isTie = false) {
  document.body.classList.remove("streak-warm", "streak-hot", "streak-fire", "streak-mania");
  if (!isCorrect || isTie || state.currentStreak < 2) return;

  const level = state.currentStreak >= 10
    ? "streak-mania"
    : state.currentStreak >= 7
      ? "streak-fire"
      : state.currentStreak >= 4
        ? "streak-hot"
        : "streak-warm";
  document.body.classList.add(level);
  window.setTimeout(() => document.body.classList.remove(level), 900);

  const burst = document.createElement("div");
  burst.className = `streak-burst ${level}`;
  burst.textContent = `STREAK x${state.currentStreak}`;
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1050);
}

async function loadHomeTop() {
  if (!ui.homeTopList) return;
  try {
    const data = await api("/api/leaderboard?mode=today");
    const leaders = (data.entries || []).slice(0, 3);
    if (!leaders.length) {
      ui.homeTopList.innerHTML = "<li>Aucun joueur aujourd'hui</li>";
      return;
    }
    ui.homeTopList.innerHTML = leaders.map((leader, index) => `
      <li>
        <span class="top-rank">#${index + 1}</span>
        <button class="top-player" type="button" data-profile="${escapeHtml(leader.pseudo)}">${avatarHtml(leader.avatar, "avatar-mini")} ${escapeHtml(leader.pseudo)}</button>
        <strong>${formatPercent(leader.successRate)}</strong>
      </li>
    `).join("");
  } catch {
    ui.homeTopList.innerHTML = "<li>Top indisponible</li>";
  }
}

async function loadPresence(touchPlayer = false) {
  if (!ui.onlineCount) return;

  const pseudo = state.playerPseudo || localStorage.getItem("majorite_pseudo") || "";
  const shouldTouch = touchPlayer && pseudo;

  try {
    const data = await api("/api/presence", shouldTouch
      ? {
          method: "POST",
          body: JSON.stringify({
            playerId: state.playerId || getPlayerId(),
            pseudo,
            avatar: state.playerAvatar || localStorage.getItem("majorite_avatar") || "avatar-1"
          })
        }
      : undefined);
    ui.onlineCount.textContent = Number(data.online || 0);
  } catch {
    ui.onlineCount.textContent = "--";
  }
}

async function loadHomeProfile() {
  if (!ui.homeProfileCard) return;

  const pseudo = localStorage.getItem("majorite_pseudo") || state.playerPseudo || "";
  const avatar = localStorage.getItem("majorite_avatar") || state.playerAvatar;
  if (!pseudo) {
    ui.homeProfileCard.classList.add("hidden");
    ui.homeProfileCard.innerHTML = "";
    ui.homeProfileCard.removeAttribute("data-profile");
    ui.homeProfileCard.removeAttribute("role");
    ui.homeProfileCard.removeAttribute("tabindex");
    return;
  }

  ui.homeProfileCard.classList.remove("hidden");
  ui.homeProfileCard.dataset.profile = pseudo;
  ui.homeProfileCard.setAttribute("role", "button");
  ui.homeProfileCard.setAttribute("tabindex", "0");
  ui.homeProfileCard.innerHTML = `
    ${avatarHtml(avatar, "avatar-mini")}
    <div>
      <strong>${escapeHtml(pseudo)}</strong>
      <span>Voir mon profil</span>
    </div>
  `;

  try {
    const data = await api(`/api/player?pseudo=${encodeURIComponent(pseudo)}`);
    const profile = data.profile || {};
    ui.homeProfileCard.dataset.profile = profile.pseudo || pseudo;
    ui.homeProfileCard.innerHTML = `
      ${avatarHtml(profile.avatar || avatar, "avatar-mini")}
      <div>
        <strong>${escapeHtml(profile.pseudo || pseudo)} ${levelBadge(profile.level || 1)}</strong>
        <span>${profile.gamesPlayed || 0} partie(s) - ${profile.xp || 0} XP - rang #${profile.rank || "-"}</span>
      </div>
    `;
  } catch {
    // Le profil local suffit si l'API n'est pas disponible.
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
    loadHomeProfile();
    loadPresence(true);
    showModeSelection();
  } catch (error) {
    ui.pseudoStatus.textContent = error.message;
  }
}

async function showModeSelection() {
  if (!state.playerPseudo) {
    askPseudo();
    return;
  }

  ui.modeStatus.textContent = "Chargement des modes...";
  ui.modeGrid.innerHTML = "";
  ui.playerProgressCard.classList.add("hidden");
  showScreen("mode");

  try {
    const [modesData, profileData] = await Promise.all([
      api(`/api/modes?playerId=${encodeURIComponent(getPlayerId())}`),
      api(`/api/player?pseudo=${encodeURIComponent(state.playerPseudo)}`)
    ]);
    state.modes = modesData.modes || [];
    state.playerProfile = profileData.profile || null;
    renderPlayerMenuProgress();
    renderModes();
  } catch (error) {
    ui.modeStatus.textContent = error.message;
  }
}

function renderPlayerMenuProgress() {
  if (!ui.playerProgressCard || !state.playerProfile) return;

  const profile = state.playerProfile;
  const level = Number(profile.level || 1);
  const xp = Number(profile.xp || 0);
  const currentLevelXp = (level - 1) * (level - 1) * 120;
  const nextLevelXp = level * level * 120;
  const progress = levelProgressPercent(profile);
  const remainingXp = Math.max(0, nextLevelXp - xp);

  ui.playerProgressCard.classList.remove("hidden");
  ui.playerProgressCard.innerHTML = `
    ${avatarHtml(profile.avatar || state.playerAvatar, "avatar-chip")}
    <div class="player-progress-content">
      <div class="player-progress-top">
        <strong>${escapeHtml(profile.pseudo || state.playerPseudo)}</strong>
        ${levelBadge(level)}
      </div>
      <div class="level-track" aria-label="Progression XP niveau ${level}">
        <span style="width: ${progress}%"></span>
      </div>
      <p>${xp - currentLevelXp}/${nextLevelXp - currentLevelXp} XP du niveau - encore ${remainingXp} XP pour le niveau ${level + 1}</p>
    </div>
  `;
}

function renderModes() {
  if (!state.modes.length) {
    ui.modeGrid.innerHTML = "<p class=\"empty-state\">Aucun mode disponible pour l'instant.</p>";
    return;
  }

  const available = state.modes.filter((mode) => !mode.locked && mode.totalQuestions >= TOTAL_QUESTIONS).length;
  ui.modeStatus.textContent = available
    ? `${available} mode(s) disponible(s). Termine un mode pour le verrouiller.`
    : "Tu as termine tous les modes disponibles. Bravo, il faudra attendre une nouvelle mise a jour.";

  const savedRound = getSavedRound();
  const resumeCard = savedRound ? `
    <button class="mode-card resume-card" type="button" data-resume-round>
      <span class="mode-kicker">Partie en cours</span>
      <strong>Reprendre la serie</strong>
      <small>Question ${Number(savedRound.currentIndex || 0) + 1}/${TOTAL_QUESTIONS} - ${Number(savedRound.score || 0)} point(s)</small>
    </button>
  ` : "";

  ui.modeGrid.innerHTML = resumeCard + state.modes.map((mode) => {
    const notReady = Number(mode.totalQuestions || 0) < TOTAL_QUESTIONS;
    const locked = mode.locked || notReady;
    return `
      <button class="mode-card ${locked ? "locked" : ""}" type="button" data-mode="${escapeHtml(mode.id)}" ${locked ? "disabled" : ""}>
        <span class="mode-kicker">${mode.completed ? "Termine" : `${mode.totalQuestions || 0} questions`}</span>
        <strong>${escapeHtml(mode.title)}</strong>
        <small>${escapeHtml(notReady ? "Mode incomplet dans la base" : mode.subtitle)}</small>
      </button>
    `;
  }).join("");
}

async function startGame(modeId) {
  if (!state.playerPseudo) {
    askPseudo();
    return;
  }

  const selectedMode = state.modes.find((mode) => mode.id === modeId);
  if (!selectedMode) {
    showModeSelection();
    return;
  }

  if (selectedMode.locked) {
    showToast("Tu as deja termine ce mode.");
    return;
  }

  try {
    const data = await api(`/api/questions?mode=${encodeURIComponent(modeId)}`);
    state.questions = pickRoundQuestions(data.questions);
    if (state.questions.length < TOTAL_QUESTIONS) {
      throw new Error("Pas assez de dilemmes uniques pour lancer une partie.");
    }
    state.selectedMode = data.mode || modeId;
    state.currentIndex = 0;
    state.score = 0;
    state.correct = 0;
    state.currentStreak = 0;
    state.bestStreak = 0;
    state.tieCount = 0;
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
    saveActiveRound();
    renderQuestion();
  } catch (error) {
    showToast(error.message);
  }
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const currentNumber = state.currentIndex + 1;
  const progress = (currentNumber / TOTAL_QUESTIONS) * 100;

  resetGameScroll();
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
  const isTie = !majorityChoice;
  const isCorrect = result.isCorrect;
  const points = result.points;

  state.score += points;
  state.correct += isCorrect ? 1 : 0;
  state.currentStreak = isCorrect ? state.currentStreak + 1 : 0;
  state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
  if (isTie) {
    state.tieCount += 1;
    addLocalTie();
  }
  state.votes.push({ questionId: result.questionId, choice, majorityChoice, points, streak: state.currentStreak, tie: isTie });
  ui.liveScore.textContent = state.score;
  ui.liveStreak.textContent = state.currentStreak;
  document.body.classList.remove("answer-good", "answer-bad");
  document.body.classList.add(isCorrect ? "answer-good" : "answer-bad");
  window.setTimeout(() => document.body.classList.remove("answer-good", "answer-bad"), 420);
  playTone(isCorrect);
  triggerStreakFeedback(isCorrect, isTie);

  revealChoice(ui.choiceA, pctA, result.votesA, majorityChoice === "A", isTie);
  revealChoice(ui.choiceB, pctB, result.votesB, majorityChoice === "B", isTie);

  ui.feedback.textContent = isTie
    ? "Egalite parfaite 50/50 : +1 point pour tout le monde."
    : isCorrect
    ? points === 2
      ? "Majorit\u00e9 trouvee sur une question serree : +2 points."
      : state.currentStreak >= 5
        ? `Majorite trouvee : +1 point. Streak x${state.currentStreak}.`
        : "Majorit\u00e9 trouvee : +1 point."
    : "Minorite choisie : 0 point.";
  ui.feedback.className = `feedback ${isCorrect ? "positive" : "negative"}`;
  ui.nextButton.classList.remove("hidden");
  saveActiveRound();
}

function revealChoice(button, percent, votes, isMajority, isTie = false) {
  button.classList.add("revealed");
  if (isMajority || isTie) button.classList.add("majority");
  if (isTie) button.classList.add("tie");
  button.querySelector(".result-bar").style.width = `${percent}%`;
  button.querySelector(".result-percent").textContent = `${percent}%`;
  button.querySelector(".result-tag").textContent = `${isTie ? "Egalite" : isMajority ? "Majorite" : "Minorite"} - ${votes} vote${votes > 1 ? "s" : ""}`;
}

function nextQuestion() {
  if (state.currentIndex < TOTAL_QUESTIONS - 1) {
    state.currentIndex += 1;
    saveActiveRound();
    renderQuestion();
  } else {
    clearSavedRound();
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
  ui.levelProgress.innerHTML = "<p>Calcul de ton niveau...</p>";
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
      mode: state.selectedMode,
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
    renderLevelProgress(result.playerStats || {});
    renderBadges(result.badges || []);
    ui.saveStatus.textContent = `Score enregistre. Rang global #${result.rank}.`;
    loadHomeTop();
  } catch (error) {
    ui.saveStatus.textContent = error.message;
  }
}

function renderLevelProgress(playerStats) {
  const level = Number(playerStats.level || 1);
  const xp = Number(playerStats.xp || 0);
  const xpGained = Number(playerStats.xpGained || 0);
  const currentLevelXp = Number(playerStats.currentLevelXp || ((level - 1) * (level - 1) * 120));
  const nextLevelXp = Number(playerStats.nextLevelXp || (level * level * 120));
  const percent = Math.max(0, Math.min(100, ((xp - currentLevelXp) / Math.max(nextLevelXp - currentLevelXp, 1)) * 100));

  ui.levelProgress.innerHTML = `
    <div class="level-row">
      <strong>Niveau ${level}</strong>
      <span>+${xpGained} XP</span>
    </div>
    <div class="level-track" aria-hidden="true"><span style="width: ${percent}%"></span></div>
    <p>${xp}/${nextLevelXp} XP vers le niveau ${level + 1}</p>
  `;
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
    const profile = withLocalStats(data.profile);
    ui.achievementsStatus.textContent = `${profile.pseudo} - Rang #${profile.rank || "-"} - ${profile.gamesPlayed} partie(s).`;
    renderAchievementsList(profile, ui.achievementsList);
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
  ui.levelTab.classList.toggle("active", mode === "level");
  ui.globalTab.setAttribute("aria-selected", String(mode === "global"));
  ui.todayTab.setAttribute("aria-selected", String(mode === "today"));
  ui.streakTab.setAttribute("aria-selected", String(mode === "streak"));
  ui.levelTab.setAttribute("aria-selected", String(mode === "level"));
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
    <li class="${state.leaderboardMode === "level" ? "level-leader-row" : ""}">
      <span class="rank">#${index + 1}</span>
      <span>
        <button class="leader-profile-button" type="button" data-profile="${escapeHtml(entry.pseudo)}">
          <span class="leader-name">${avatarHtml(entry.avatar, "avatar-mini")} ${levelBadge(entry.level)} ${escapeHtml(entry.pseudo)}</span>
        </button>
        <span class="leader-meta">${leaderboardMeta(entry)}</span>
        ${state.leaderboardMode === "level" ? levelMiniProgress(entry) : ""}
      </span>
      <span class="leader-score">${leaderboardScore(entry)}</span>
    </li>
  `).join("");
}

function leaderboardMeta(entry) {
  if (state.leaderboardMode === "level") {
    return `${entry.xp || 0} XP - ${entry.gamesPlayed} mode${entry.gamesPlayed > 1 ? "s" : ""} termine${entry.gamesPlayed > 1 ? "s" : ""} - ${formatPercent(entry.successRate || 0)} reussite`;
  }

  return `${entry.gamesPlayed} partie${entry.gamesPlayed > 1 ? "s" : ""} - ${entry.totalCorrect}/${entry.totalQuestions} bonnes reponses - Streak x${entry.bestStreak || 0} - ${formatDate(entry.lastPlayedAt)}`;
}

function leaderboardScore(entry) {
  if (state.leaderboardMode === "streak") {
    return `x${entry.bestStreak || 0}`;
  }

  if (state.leaderboardMode === "level") {
    return `Niv. ${entry.level || 1}`;
  }

  return formatPercent(entry.successRate);
}

function levelMiniProgress(entry) {
  const level = Number(entry.level || 1);
  const xp = Number(entry.xp || 0);
  const currentLevelXp = (level - 1) * (level - 1) * 120;
  const nextLevelXp = level * level * 120;
  const percent = Math.max(0, Math.min(100, ((xp - currentLevelXp) / Math.max(nextLevelXp - currentLevelXp, 1)) * 100));
  return `
    <span class="leader-level-track" aria-label="Progression niveau ${level}">
      <span style="width: ${percent}%"></span>
    </span>
  `;
}

function formatPercent(value) {
  const rounded = Number(value);
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

function levelProgressPercent(profile) {
  const level = Number(profile.level || 1);
  const xp = Number(profile.xp || 0);
  const currentLevelXp = (level - 1) * (level - 1) * 120;
  const nextLevelXp = level * level * 120;
  const progress = ((xp - currentLevelXp) / Math.max(nextLevelXp - currentLevelXp, 1)) * 100;
  return Math.max(0, Math.min(100, progress));
}

function levelBadge(level) {
  return `<span class="level-badge">Niv. ${Number(level || 1)}</span>`;
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
        <button class="chat-name" type="button" data-profile="${escapeHtml(message.pseudo)}">${levelBadge(message.player_level)} ${escapeHtml(message.pseudo)}</button>
        <time>${formatTime(message.created_at)}</time>
        <p>${escapeHtml(message.message)}</p>
        <button class="report-button" type="button" data-report="${escapeHtml(message.id)}">Signaler</button>
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

async function reportChatMessage(id) {
  if (!confirm("Signaler ce message a l'admin ?")) return;

  try {
    await api("/api/chat/report", {
      method: "POST",
      body: JSON.stringify({ id, reason: "Signale depuis le chat" })
    });
    showToast("Message signale.");
  } catch (error) {
    showToast(error.message);
  }
}

async function openPlayerProfile(pseudo) {
  ui.profileModal.classList.remove("hidden");
  ui.profileContent.innerHTML = "<p class=\"empty-state\">Chargement du profil...</p>";

  try {
    const data = await api(`/api/player?pseudo=${encodeURIComponent(pseudo)}`);
    const profile = withLocalStats(data.profile);
    ui.profileContent.innerHTML = `
      <header class="profile-header">
        ${avatarHtml(profile.avatar, "avatar-chip")}
        <div>
          <h2>${escapeHtml(profile.pseudo)}</h2>
          <p>${levelBadge(profile.level)} Rang global #${profile.rank || "-"} - Rang niveau #${profile.levelRank || "-"}</p>
        </div>
      </header>
      <div class="profile-stats">
        <article><strong>${profile.gamesPlayed || 0}</strong><span>parties</span></article>
        <article><strong>${profile.level || 1}</strong><span>niveau</span></article>
        <article><strong>${formatPercent(profile.successRate || 0)}</strong><span>reussite</span></article>
        <article><strong>x${profile.bestStreak || 0}</strong><span>streak</span></article>
        <article><strong>${profile.tieVotes || 0}</strong><span>50/50</span></article>
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

function openFeedbackModal() {
  ui.feedbackModal.classList.remove("hidden");
  ui.feedbackStatus.textContent = "";
  window.setTimeout(() => ui.feedbackText.focus(), 80);
}

async function sendFeedback() {
  const message = ui.feedbackText.value.trim();
  if (!message) {
    ui.feedbackStatus.textContent = "Ecris ton avis avant de l'envoyer.";
    return;
  }

  try {
    ui.feedbackStatus.textContent = "Envoi de ton avis...";
    await api("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        playerId: state.playerId || getPlayerId(),
        pseudo: state.playerPseudo || localStorage.getItem("majorite_pseudo") || "",
        avatar: state.playerAvatar,
        message
      })
    });
    ui.feedbackText.value = "";
    ui.feedbackStatus.textContent = "Merci ! Ton avis a ete envoye.";
    showToast("Avis envoye.");
  } catch (error) {
    ui.feedbackStatus.textContent = error.message;
  }
}

ui.playButton.addEventListener("click", askPseudo);
ui.leaderboardButton.addEventListener("click", () => loadLeaderboard("global"));
ui.achievementsButton.addEventListener("click", loadAchievements);
ui.howToButton.addEventListener("click", () => showScreen("howTo"));
ui.feedbackButton.addEventListener("click", openFeedbackModal);
ui.nextButton.addEventListener("click", nextQuestion);
ui.pseudoForm.addEventListener("submit", submitPseudo);
ui.replayButton.addEventListener("click", showModeSelection);
ui.showLeaderboardButton.addEventListener("click", () => loadLeaderboard("global"));
ui.shareButton.addEventListener("click", shareScore);
ui.globalTab.addEventListener("click", () => loadLeaderboard("global"));
ui.todayTab.addEventListener("click", () => loadLeaderboard("today"));
ui.streakTab.addEventListener("click", () => loadLeaderboard("streak"));
ui.levelTab.addEventListener("click", () => loadLeaderboard("level"));
ui.refreshLeaderboard.addEventListener("click", () => loadLeaderboard(state.leaderboardMode));
ui.refreshAchievements.addEventListener("click", loadAchievements);
ui.refreshModes.addEventListener("click", showModeSelection);
ui.soundToggle.addEventListener("click", () => setSoundEnabled(!state.soundEnabled));
ui.homeTopList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile]");
  if (!button) return;
  openPlayerProfile(button.dataset.profile);
});
ui.leaderboardList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile]");
  if (!button) return;
  openPlayerProfile(button.dataset.profile);
});
ui.avatarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-avatar]");
  if (!button) return;
  state.playerAvatar = button.dataset.avatar;
  localStorage.setItem("majorite_avatar", state.playerAvatar);
  renderAvatarPicker();
});
ui.modeGrid.addEventListener("click", (event) => {
  const resumeButton = event.target.closest("[data-resume-round]");
  if (resumeButton) {
    restoreSavedRound();
    return;
  }

  const button = event.target.closest("[data-mode]");
  if (!button || button.disabled) return;
  startGame(button.dataset.mode);
});
ui.chatToggle.addEventListener("click", () => {
  ui.chatBox.classList.toggle("hidden");
  if (!ui.chatBox.classList.contains("hidden")) loadChat();
});
ui.chatClose.addEventListener("click", () => ui.chatBox.classList.add("hidden"));
ui.chatForm.addEventListener("submit", sendChatMessage);
ui.chatMessages.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-report]");
  if (reportButton) {
    reportChatMessage(reportButton.dataset.report);
    return;
  }

  const button = event.target.closest("[data-profile]");
  if (!button) return;
  openPlayerProfile(button.dataset.profile);
});
ui.homeProfileCard.addEventListener("click", () => {
  const pseudo = ui.homeProfileCard.dataset.profile;
  if (pseudo) openPlayerProfile(pseudo);
});
ui.homeProfileCard.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  const pseudo = ui.homeProfileCard.dataset.profile;
  if (pseudo) openPlayerProfile(pseudo);
});
ui.profileClose.addEventListener("click", () => ui.profileModal.classList.add("hidden"));
ui.profileModal.addEventListener("click", (event) => {
  if (event.target === ui.profileModal) ui.profileModal.classList.add("hidden");
});
ui.feedbackClose.addEventListener("click", () => ui.feedbackModal.classList.add("hidden"));
ui.feedbackSend.addEventListener("click", sendFeedback);
ui.feedbackModal.addEventListener("click", (event) => {
  if (event.target === ui.feedbackModal) ui.feedbackModal.classList.add("hidden");
});

document.querySelectorAll("[data-nav='home']").forEach((button) => {
  button.addEventListener("click", () => showScreen("home"));
});

document.querySelectorAll("[data-nav='play']").forEach((button) => {
  button.addEventListener("click", askPseudo);
});

setSoundEnabled(state.soundEnabled);
loadHomeTop();
loadHomeProfile();
loadPresence(true);
if (!localStorage.getItem("majorite_pseudo")) {
  window.setTimeout(askPseudo, 350);
}
window.setInterval(() => {
  if (!ui.chatBox.classList.contains("hidden")) loadChat();
}, 12000);
window.setInterval(() => loadPresence(true), 45000);
