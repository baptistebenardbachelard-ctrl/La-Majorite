const allowedOrigin = process.env.SITE_ORIGIN || "https://lamajorite.netlify.app";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": allowedOrigin,
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, X-Admin-Token",
  "x-content-type-options": "nosniff"
};
const API_VERSION = "supabase-fetch-v5-levels";
const GAME_MODES = [
  { id: "food", title: "Nourriture", subtitle: "Plats, snacks et plaisirs coupables" },
  { id: "movies", title: "Films cultes", subtitle: "Les classiques que tout le monde connait" },
  { id: "series", title: "Series", subtitle: "Binge-watch et gros debats" },
  { id: "games", title: "Jeux video", subtitle: "Manettes, PC et rivalites eternelles" },
  { id: "music", title: "Musique", subtitle: "Artistes, styles et habitudes d'ecoute" },
  { id: "social", title: "Reseaux sociaux", subtitle: "TikTok, Insta, YouTube et compagnie" },
  { id: "love", title: "Amour", subtitle: "Relations, dates et choix impossibles" },
  { id: "school_work", title: "Ecole / travail", subtitle: "Vie pro, cours et galeres du quotidien" },
  { id: "daily", title: "Vie quotidienne", subtitle: "Petits choix, grands debats" },
  { id: "powers", title: "Super-pouvoirs", subtitle: "Pouvoirs impossibles a departager" },
  { id: "money", title: "Argent / luxe", subtitle: "Reves riches et contreparties" },
  { id: "impossible", title: "Impossible", subtitle: "Dilemmes moraux et choix tendus" },
  { id: "awkward", title: "Genant", subtitle: "La honte, mais en version jeu" },
  { id: "internet", title: "Generation Internet", subtitle: "Culture web et habitudes connectees" }
];
const FORBIDDEN_WORDS = [
  "con",
  "connard",
  "connasse",
  "salope",
  "pute",
  "pd",
  "fdp",
  "encule",
  "enculé",
  "tg",
  "ta gueule",
  "batard",
  "bâtard"
];

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function supabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  if (!url || !key) {
    throw new Error("Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.");
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    throw new Error("SUPABASE_URL doit ressembler a https://xxxx.supabase.co");
  }

  return { url, key };
}

async function supabaseFetch(path, options = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.hint || text || `Erreur Supabase ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function supabaseRpc(functionName, payload = {}) {
  return supabaseFetch(`/rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function routePath(event) {
  const raw = event.path || "";
  return raw
    .replace(/^\/api/, "")
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/\/$/, "") || "/";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function hasForbiddenWord(value) {
  const normalized = ` ${normalizeText(value).replace(/\s+/g, " ")} `;
  return FORBIDDEN_WORDS.some((word) => {
    const normalizedWord = normalizeText(word).trim();
    return normalized.includes(` ${normalizedWord} `);
  });
}

async function readBody(event) {
  if (!event.body) return {};
  try {
    const text = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Corps de requete invalide: ${error.message}`);
  }
}

async function getModes(event) {
  const playerId = String(event.queryStringParameters?.playerId || "").trim();
  let completed = [];

  if (playerId) {
    try {
      const rows = await supabaseFetch(
        `/scores?select=mode&player_id=eq.${encodeURIComponent(playerId)}`
      );
      completed = rows.map((row) => row.mode);
    } catch {
      completed = [];
    }
  }

  const counts = await supabaseFetch("/questions?select=category");
  const countByMode = counts.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] || 0) + 1;
    return acc;
  }, {});

  return json(200, {
    modes: GAME_MODES.map((mode) => ({
      ...mode,
      totalQuestions: countByMode[mode.id] || 0,
      completed: completed.includes(mode.id),
      locked: completed.includes(mode.id)
    }))
  });
}

async function getQuestions(event) {
  const requestedMode = String(event.queryStringParameters?.mode || "").trim();
  const mode = GAME_MODES.some((entry) => entry.id === requestedMode)
    ? requestedMode
    : GAME_MODES[0].id;
  const data = await supabaseFetch(
    `/questions?select=id,category,question,choice_a,choice_b&category=eq.${encodeURIComponent(mode)}&order=id.asc`
  );

  return json(200, {
    mode,
    questions: data.map((question) => ({
      id: question.id,
      mode: question.category,
      question: question.question,
      choiceA: question.choice_a,
      choiceB: question.choice_b
    }))
  });
}

async function getLeaderboard(event) {
  const requestedMode = event.queryStringParameters?.mode;
  const mode = ["today", "streak", "level"].includes(requestedMode) ? requestedMode : "global";
  const view = mode === "today"
    ? "leaderboard_today"
    : mode === "streak"
      ? "leaderboard_streak"
      : mode === "level"
        ? "leaderboard_level"
        : "leaderboard_global";
  const data = await supabaseFetch(
    `/${view}?select=pseudo,avatar,level,xp,games_played,total_score,total_correct,total_questions,success_rate,average_score,best_game_percent,best_streak,tie_votes,last_played_at&limit=50`
  );

  return json(200, {
    entries: data.map((entry) => ({
      pseudo: entry.pseudo,
      avatar: entry.avatar,
      level: Number(entry.level || 1),
      xp: Number(entry.xp || 0),
      gamesPlayed: entry.games_played,
      totalScore: entry.total_score,
      totalCorrect: entry.total_correct,
      totalQuestions: entry.total_questions,
      successRate: Number(entry.success_rate),
      averageScore: Number(entry.average_score),
      bestGamePercent: Number(entry.best_game_percent),
      bestStreak: Number(entry.best_streak || 0),
      tieVotes: Number(entry.tie_votes || 0),
      lastPlayedAt: entry.last_played_at
    }))
  });
}

async function postRpc(functionName, payload, successCode = 200) {
  const data = await supabaseRpc(functionName, payload);
  return json(successCode, data);
}

async function postVote(event) {
  const body = await readBody(event);
  return postRpc("submit_vote", {
    p_game_id: String(body.gameId || ""),
    p_question_id: String(body.questionId || ""),
    p_choice: String(body.choice || "")
  });
}

async function postScore(event) {
  const body = await readBody(event);
  if (hasForbiddenWord(body.pseudo)) {
    return json(400, { error: "Ce pseudo contient un mot interdit." });
  }
  return postRpc("save_game_score", {
    p_game_id: String(body.gameId || ""),
    p_pseudo: String(body.pseudo || ""),
    p_title: String(body.title || ""),
    p_avatar: String(body.avatar || "avatar-1"),
    p_best_streak: Number(body.bestStreak || 0),
    p_player_id: String(body.playerId || ""),
    p_mode: String(body.mode || "general")
  }, 201);
}

async function registerPlayer(event) {
  const body = await readBody(event);
  if (hasForbiddenWord(body.pseudo)) {
    return json(400, { error: "Ce pseudo contient un mot interdit." });
  }
  const data = await supabaseRpc("register_player", {
    p_player_id: String(body.playerId || ""),
    p_pseudo: String(body.pseudo || ""),
    p_avatar: String(body.avatar || "avatar-1")
  });
  return json(200, data);
}

async function getPresence(event) {
  if (event.httpMethod === "POST") {
    const body = await readBody(event);
    const pseudo = String(body.pseudo || "").trim().slice(0, 18);
    if (pseudo && !hasForbiddenWord(pseudo)) {
      await supabaseRpc("register_player", {
        p_player_id: String(body.playerId || ""),
        p_pseudo: pseudo,
        p_avatar: String(body.avatar || "avatar-1")
      });
    }
  }

  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const data = await supabaseFetch(
    `/players?select=id&last_seen_at=gte.${encodeURIComponent(since)}&limit=1000`
  );

  return json(200, { online: data.length });
}

async function getChat(event) {
  const limit = Math.min(Number(event.queryStringParameters?.limit || 40), 80);
  const data = await supabaseFetch(
    `/chat_messages?select=id,pseudo,avatar,player_level,message,created_at&order=created_at.desc&limit=${limit}`
  );
  return json(200, { messages: data.reverse() });
}

async function postChat(event) {
  const body = await readBody(event);
  const pseudo = String(body.pseudo || "").trim().slice(0, 18);
  const avatar = String(body.avatar || "avatar-1").trim().slice(0, 24);
  const playerId = String(body.playerId || "").trim();
  const message = String(body.message || "").trim().slice(0, 240);

  if (!pseudo || !message) {
    return json(400, { error: "Pseudo ou message manquant." });
  }

  if (hasForbiddenWord(pseudo)) {
    return json(400, { error: "Ce pseudo contient un mot interdit." });
  }

  if (hasForbiddenWord(message)) {
    return json(400, { error: "Message bloque : ce mot est interdit dans le chat." });
  }

  const blocked = await supabaseFetch(
    `/blocked_pseudos?select=pseudo_key&pseudo_key=eq.${encodeURIComponent(pseudo.toLowerCase())}&limit=1`
  );
  if (blocked.length) {
    return json(403, { error: "Ce pseudo est bloque." });
  }

  const pseudoKey = pseudo.toLowerCase();
  const lastMessagesPath = playerId
    ? `/chat_messages?select=created_at&player_id=eq.${encodeURIComponent(playerId)}&order=created_at.desc&limit=1`
    : `/chat_messages?select=created_at&pseudo_key=eq.${encodeURIComponent(pseudoKey)}&order=created_at.desc&limit=1`;
  const lastMessages = await supabaseFetch(lastMessagesPath);
  const lastMessage = lastMessages[0];
  if (lastMessage && Date.now() - new Date(lastMessage.created_at).getTime() < 1000) {
    return json(429, { error: "Doucement : attends 1 seconde entre deux messages." });
  }

  const playerRows = playerId
    ? await supabaseFetch(`/players?select=level&id=eq.${encodeURIComponent(playerId)}&limit=1`)
    : await supabaseFetch(`/players?select=level&pseudo_key=eq.${encodeURIComponent(pseudoKey)}&limit=1`);
  const playerLevel = Number(playerRows[0]?.level || 1);

  const data = await supabaseFetch("/chat_messages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ player_id: playerId || null, pseudo, avatar, player_level: playerLevel, message })
  });

  return json(201, { message: data[0] });
}

async function reportChatMessage(event) {
  const body = await readBody(event);
  const id = String(body.id || "");
  const reason = String(body.reason || "Signale par un joueur").trim().slice(0, 160);
  if (!id) return json(400, { error: "Message introuvable." });

  const data = await supabaseFetch(`/chat_messages?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      reported: true,
      report_reason: reason,
      reported_at: new Date().toISOString()
    })
  });

  return json(200, { message: data[0] });
}

async function postFeedback(event) {
  const body = await readBody(event);
  const playerId = String(body.playerId || "").trim();
  const pseudo = String(body.pseudo || "").trim().slice(0, 18);
  const avatar = String(body.avatar || "avatar-1").trim().slice(0, 24);
  const message = String(body.message || "").trim().slice(0, 1200);

  if (message.length < 3) {
    return json(400, { error: "Avis trop court." });
  }

  if (hasForbiddenWord(pseudo)) {
    return json(400, { error: "Ce pseudo contient un mot interdit." });
  }

  if (hasForbiddenWord(message)) {
    return json(400, { error: "Avis bloque : ce mot est interdit." });
  }

  const data = await supabaseFetch("/feedback_messages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      player_id: playerId || null,
      pseudo: pseudo || null,
      avatar,
      message
    })
  });

  return json(201, { feedback: data[0] });
}

async function getPlayerProfile(event) {
  const pseudo = String(event.queryStringParameters?.pseudo || "").trim().slice(0, 18);
  const pseudoKey = pseudo.toLowerCase();
  if (!pseudo) {
    return json(400, { error: "Pseudo manquant." });
  }

  const [profileRows, rankedRows, rankedLevelRows, chatRows] = await Promise.all([
    supabaseFetch(
      `/leaderboard_global?select=pseudo_key,pseudo,avatar,level,xp,games_played,total_score,total_correct,total_questions,success_rate,average_score,best_game_percent,best_streak,tie_votes,last_played_at&pseudo_key=eq.${encodeURIComponent(pseudoKey)}&limit=1`
    ),
    supabaseFetch("/leaderboard_global?select=pseudo_key&limit=1000"),
    supabaseFetch("/leaderboard_level?select=pseudo_key&limit=1000"),
    supabaseFetch(`/chat_messages?select=id&pseudo_key=eq.${encodeURIComponent(pseudoKey)}`)
  ]);

  const row = profileRows[0];
  const rank = rankedRows.findIndex((entry) => entry.pseudo_key === pseudoKey) + 1;
  const levelRank = rankedLevelRows.findIndex((entry) => entry.pseudo_key === pseudoKey) + 1;

  if (!row) {
    return json(200, {
      profile: {
        pseudo,
        avatar: "avatar-1",
        level: 1,
        xp: 0,
        rank: 0,
        levelRank: 0,
        gamesPlayed: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        successRate: 0,
        averageScore: 0,
        bestGamePercent: 0,
        bestStreak: 0,
        tieVotes: 0,
        chatMessages: chatRows.length,
        lastPlayedAt: null
      }
    });
  }

  return json(200, {
    profile: {
      pseudo: row.pseudo,
      avatar: row.avatar,
      level: Number(row.level || 1),
      xp: Number(row.xp || 0),
      rank,
      levelRank,
      gamesPlayed: row.games_played,
      totalScore: row.total_score,
      totalCorrect: row.total_correct,
      totalQuestions: row.total_questions,
      successRate: Number(row.success_rate),
      averageScore: Number(row.average_score),
      bestGamePercent: Number(row.best_game_percent),
      bestStreak: Number(row.best_streak || 0),
      tieVotes: Number(row.tie_votes || 0),
      chatMessages: chatRows.length,
      lastPlayedAt: row.last_played_at
    }
  });
}

function requireAdmin(event) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];

  if (!expected || expected.length < 24) {
    const error = new Error("ADMIN_TOKEN manquant ou trop court dans Netlify.");
    error.statusCode = 503;
    throw error;
  }

  if (!provided || provided !== expected) {
    const error = new Error("Acces admin refuse.");
    error.statusCode = 401;
    throw error;
  }
}

async function adminScores(event) {
  requireAdmin(event);
  const limit = Math.min(Number(event.queryStringParameters?.limit || 100), 250);
  const data = await supabaseFetch(
    `/scores?select=id,game_id,mode,pseudo,avatar,score,correct,total,success_rate,best_streak,title,created_at&order=created_at.desc&limit=${limit}`
  );
  return json(200, { scores: data });
}

async function adminStats(event) {
  requireAdmin(event);
  const [players, scores, votes, questions, chat, reports, feedback, blocked] = await Promise.all([
    supabaseFetch("/players?select=id,pseudo", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/scores?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/votes?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/questions?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/chat_messages?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/chat_messages?select=id&reported=eq.true", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/feedback_messages?select=id&status=eq.new", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/blocked_pseudos?select=pseudo_key,pseudo,reason,created_at&order=created_at.desc")
  ]);
  return json(200, {
    players: players.length,
    games: scores.length,
    answeredQuestions: votes.length,
    questions: questions.length,
    chatMessages: chat.length,
    reports: reports.length,
    feedback: feedback.length,
    blocked
  });
}

async function getDevblog() {
  const data = await supabaseFetch(
    "/devblog_posts?select=id,title,content,created_at,updated_at&published=eq.true&order=created_at.desc&limit=20"
  );
  return json(200, { posts: data });
}

async function adminReports(event) {
  requireAdmin(event);
  const data = await supabaseFetch(
    "/chat_messages?select=id,pseudo,avatar,player_level,message,report_reason,reported_at,created_at&reported=eq.true&order=reported_at.desc&limit=100"
  );
  return json(200, { reports: data });
}

async function adminFeedback(event) {
  requireAdmin(event);
  const data = await supabaseFetch(
    "/feedback_messages?select=id,player_id,pseudo,avatar,message,status,created_at,handled_at&order=created_at.desc&limit=100"
  );
  return json(200, { feedback: data });
}

async function adminMarkFeedback(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  const done = Boolean(body.done);
  if (!id) return json(400, { error: "Avis introuvable." });

  const data = await supabaseFetch(`/feedback_messages?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      status: done ? "done" : "new",
      handled_at: done ? new Date().toISOString() : null
    })
  });

  return json(200, { feedback: data[0] });
}

async function adminDeleteFeedback(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "Avis introuvable." });
  await supabaseFetch(`/feedback_messages?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  return json(200, { ok: true });
}

async function adminDeleteMessage(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "Message introuvable." });
  await supabaseFetch(`/chat_messages?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  return json(200, { ok: true });
}

async function adminClearReport(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "Message introuvable." });
  await supabaseFetch(`/chat_messages?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ reported: false, report_reason: null, reported_at: null })
  });
  return json(200, { ok: true });
}

async function adminSaveDevblog(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  const title = String(body.title || "").trim().slice(0, 100);
  const content = String(body.content || "").trim().slice(0, 3000);

  if (!title || !content) {
    return json(400, { error: "Titre ou contenu manquant." });
  }

  if (id) {
    const data = await supabaseFetch(`/devblog_posts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ title, content, published: true, updated_at: new Date().toISOString() })
    });
    return json(200, { post: data[0] });
  }

  const data = await supabaseFetch("/devblog_posts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ title, content, published: true })
  });
  return json(201, { post: data[0] });
}

async function adminDeleteDevblog(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "Article introuvable." });
  await supabaseFetch(`/devblog_posts?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  return json(200, { ok: true });
}

async function adminQuestions(event) {
  requireAdmin(event);
  const search = String(event.queryStringParameters?.search || "").trim();
  const mode = String(event.queryStringParameters?.mode || "").trim();
  const limit = Math.min(Number(event.queryStringParameters?.limit || 40), 100);
  const filters = [];
  if (mode) filters.push(`category=eq.${encodeURIComponent(mode)}`);
  if (search) filters.push(`question=ilike.*${encodeURIComponent(search)}*`);
  const filter = filters.length ? `&${filters.join("&")}` : "";
  const data = await supabaseFetch(
    `/questions?select=id,category,question,choice_a,choice_b,votes_a,votes_b,seed_votes_a,seed_votes_b&order=id.asc&limit=${limit}${filter}`
  );
  return json(200, { questions: data });
}

async function adminDeleteScore(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "ID de score manquant." });

  await supabaseFetch(`/scores?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  return json(200, { ok: true });
}

async function adminResetScores(event) {
  requireAdmin(event);
  await supabaseRpc("admin_reset_scores");
  return json(200, { ok: true });
}

async function adminResetAll(event) {
  requireAdmin(event);
  await supabaseRpc("admin_reset_all");
  return json(200, { ok: true });
}

async function adminResetQuestion(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  if (!id) return json(400, { error: "ID de question manquant." });
  const data = await supabaseRpc("admin_reset_question", { p_question_id: id });
  return json(200, data);
}

async function adminUpdateQuestion(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const id = String(body.id || "");
  const question = String(body.question || "").trim();
  const choiceA = String(body.choiceA || "").trim();
  const choiceB = String(body.choiceB || "").trim();
  const category = String(body.category || "").trim();

  if (!id || !question || !choiceA || !choiceB) {
    return json(400, { error: "Question ou choix manquant." });
  }

  const data = await supabaseFetch(`/questions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...(category ? { category: category.slice(0, 40) } : {}),
      question: question.slice(0, 220),
      choice_a: choiceA.slice(0, 160),
      choice_b: choiceB.slice(0, 160)
    })
  });

  return json(200, { question: data[0] });
}

async function adminBlockPseudo(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const pseudo = String(body.pseudo || "").trim().slice(0, 18);
  const reason = String(body.reason || "").trim().slice(0, 120);
  if (!pseudo) return json(400, { error: "Pseudo manquant." });

  const data = await supabaseFetch("/blocked_pseudos", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      pseudo,
      pseudo_key: pseudo.toLowerCase(),
      reason
    })
  });

  return json(201, { blocked: data[0] });
}

async function adminUnblockPseudo(event) {
  requireAdmin(event);
  const body = await readBody(event);
  const pseudo = String(body.pseudo || "").trim().toLowerCase();
  if (!pseudo) return json(400, { error: "Pseudo manquant." });
  await supabaseFetch(`/blocked_pseudos?pseudo_key=eq.${encodeURIComponent(pseudo)}`, {
    method: "DELETE"
  });
  return json(200, { ok: true });
}

exports.handler = async (event) => {
  try {
    const path = routePath(event);

    if (event.httpMethod === "OPTIONS") {
      return json(204, {});
    }

    if (event.httpMethod === "GET" && path === "/version") {
      return json(200, { ok: true, version: API_VERSION });
    }

    if (event.httpMethod === "GET" && path === "/health") {
      return json(200, { status: "ok", version: API_VERSION });
    }

    if (event.httpMethod === "GET" && path === "/questions") {
      return getQuestions(event);
    }

    if (event.httpMethod === "GET" && path === "/modes") {
      return getModes(event);
    }

    if (event.httpMethod === "GET" && path === "/leaderboard") {
      return getLeaderboard(event);
    }

    if (event.httpMethod === "GET" && path === "/devblog") {
      return getDevblog();
    }

    if (event.httpMethod === "POST" && path === "/vote") {
      return postVote(event);
    }

    if (event.httpMethod === "POST" && path === "/scores") {
      return postScore(event);
    }

    if (event.httpMethod === "POST" && path === "/player/register") {
      return registerPlayer(event);
    }

    if (event.httpMethod === "GET" && path === "/player") {
      return getPlayerProfile(event);
    }

    if ((event.httpMethod === "GET" || event.httpMethod === "POST") && path === "/presence") {
      return getPresence(event);
    }

    if (event.httpMethod === "GET" && path === "/chat") {
      return getChat(event);
    }

    if (event.httpMethod === "POST" && path === "/chat") {
      return postChat(event);
    }

    if (event.httpMethod === "POST" && path === "/chat/report") {
      return reportChatMessage(event);
    }

    if (event.httpMethod === "POST" && path === "/feedback") {
      return postFeedback(event);
    }

    if (event.httpMethod === "GET" && path === "/admin/scores") {
      return adminScores(event);
    }

    if (event.httpMethod === "GET" && path === "/admin/stats") {
      return adminStats(event);
    }

    if (event.httpMethod === "GET" && path === "/admin/questions") {
      return adminQuestions(event);
    }

    if (event.httpMethod === "GET" && path === "/admin/reports") {
      return adminReports(event);
    }

    if (event.httpMethod === "GET" && path === "/admin/feedback") {
      return adminFeedback(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/delete-score") {
      return adminDeleteScore(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/reset-scores") {
      return adminResetScores(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/reset-all") {
      return adminResetAll(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/reset-question") {
      return adminResetQuestion(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/update-question") {
      return adminUpdateQuestion(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/block-pseudo") {
      return adminBlockPseudo(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/unblock-pseudo") {
      return adminUnblockPseudo(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/delete-message") {
      return adminDeleteMessage(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/clear-report") {
      return adminClearReport(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/mark-feedback") {
      return adminMarkFeedback(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/delete-feedback") {
      return adminDeleteFeedback(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/devblog") {
      return adminSaveDevblog(event);
    }

    if (event.httpMethod === "POST" && path === "/admin/delete-devblog") {
      return adminDeleteDevblog(event);
    }

    return json(404, { error: "Route API introuvable.", path });
  } catch (error) {
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    return json(statusCode, {
      error: error.message || String(error),
      statusCode
    });
  }
};
