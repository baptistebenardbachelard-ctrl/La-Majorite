const allowedOrigin = process.env.SITE_ORIGIN || "https://lamajorite.netlify.app";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": allowedOrigin,
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, X-Admin-Token",
  "x-content-type-options": "nosniff"
};
const API_VERSION = "supabase-fetch-v3-admin";

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

async function getQuestions() {
  const data = await supabaseFetch("/questions?select=id,question,choice_a,choice_b&order=id.asc");

  return json(200, {
    questions: data.map((question) => ({
      id: question.id,
      question: question.question,
      choiceA: question.choice_a,
      choiceB: question.choice_b
    }))
  });
}

async function getLeaderboard(event) {
  const requestedMode = event.queryStringParameters?.mode;
  const mode = ["today", "streak"].includes(requestedMode) ? requestedMode : "global";
  const view = mode === "today"
    ? "leaderboard_today"
    : mode === "streak"
      ? "leaderboard_streak"
      : "leaderboard_global";
  const data = await supabaseFetch(
    `/${view}?select=pseudo,avatar,games_played,total_score,total_correct,total_questions,success_rate,average_score,best_game_percent,best_streak,last_played_at&limit=50`
  );

  return json(200, {
    entries: data.map((entry) => ({
      pseudo: entry.pseudo,
      avatar: entry.avatar,
      gamesPlayed: entry.games_played,
      totalScore: entry.total_score,
      totalCorrect: entry.total_correct,
      totalQuestions: entry.total_questions,
      successRate: Number(entry.success_rate),
      averageScore: Number(entry.average_score),
      bestGamePercent: Number(entry.best_game_percent),
      bestStreak: Number(entry.best_streak || 0),
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
  return postRpc("save_game_score", {
    p_game_id: String(body.gameId || ""),
    p_pseudo: String(body.pseudo || ""),
    p_title: String(body.title || ""),
    p_avatar: String(body.avatar || "avatar-1"),
    p_best_streak: Number(body.bestStreak || 0),
    p_player_id: String(body.playerId || "")
  }, 201);
}

async function registerPlayer(event) {
  const body = await readBody(event);
  const data = await supabaseRpc("register_player", {
    p_player_id: String(body.playerId || ""),
    p_pseudo: String(body.pseudo || ""),
    p_avatar: String(body.avatar || "avatar-1")
  });
  return json(200, data);
}

async function getChat(event) {
  const limit = Math.min(Number(event.queryStringParameters?.limit || 40), 80);
  const data = await supabaseFetch(
    `/chat_messages?select=id,pseudo,avatar,message,created_at&order=created_at.desc&limit=${limit}`
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

  const blocked = await supabaseFetch(
    `/blocked_pseudos?select=pseudo_key&pseudo_key=eq.${encodeURIComponent(pseudo.toLowerCase())}&limit=1`
  );
  if (blocked.length) {
    return json(403, { error: "Ce pseudo est bloque." });
  }

  const data = await supabaseFetch("/chat_messages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ player_id: playerId || null, pseudo, avatar, message })
  });

  return json(201, { message: data[0] });
}

async function getPlayerProfile(event) {
  const pseudo = String(event.queryStringParameters?.pseudo || "").trim().slice(0, 18);
  const pseudoKey = pseudo.toLowerCase();
  if (!pseudo) {
    return json(400, { error: "Pseudo manquant." });
  }

  const [profileRows, rankedRows, chatRows] = await Promise.all([
    supabaseFetch(
      `/leaderboard_global?select=pseudo_key,pseudo,avatar,games_played,total_score,total_correct,total_questions,success_rate,average_score,best_game_percent,best_streak,last_played_at&pseudo_key=eq.${encodeURIComponent(pseudoKey)}&limit=1`
    ),
    supabaseFetch("/leaderboard_global?select=pseudo_key&limit=1000"),
    supabaseFetch(`/chat_messages?select=id&pseudo_key=eq.${encodeURIComponent(pseudoKey)}`)
  ]);

  const row = profileRows[0];
  const rank = rankedRows.findIndex((entry) => entry.pseudo_key === pseudoKey) + 1;

  if (!row) {
    return json(200, {
      profile: {
        pseudo,
        avatar: "avatar-1",
        rank: 0,
        gamesPlayed: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        successRate: 0,
        averageScore: 0,
        bestGamePercent: 0,
        bestStreak: 0,
        chatMessages: chatRows.length,
        lastPlayedAt: null
      }
    });
  }

  return json(200, {
    profile: {
      pseudo: row.pseudo,
      avatar: row.avatar,
      rank,
      gamesPlayed: row.games_played,
      totalScore: row.total_score,
      totalCorrect: row.total_correct,
      totalQuestions: row.total_questions,
      successRate: Number(row.success_rate),
      averageScore: Number(row.average_score),
      bestGamePercent: Number(row.best_game_percent),
      bestStreak: Number(row.best_streak || 0),
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
    `/scores?select=id,game_id,pseudo,avatar,score,correct,total,success_rate,best_streak,title,created_at&order=created_at.desc&limit=${limit}`
  );
  return json(200, { scores: data });
}

async function adminStats(event) {
  requireAdmin(event);
  const [players, scores, votes, questions, chat, blocked] = await Promise.all([
    supabaseFetch("/players?select=id,pseudo", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/scores?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/votes?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/questions?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/chat_messages?select=id", { headers: { Prefer: "count=exact" } }),
    supabaseFetch("/blocked_pseudos?select=pseudo_key,pseudo,reason,created_at&order=created_at.desc")
  ]);
  return json(200, {
    players: players.length,
    games: scores.length,
    answeredQuestions: votes.length,
    questions: questions.length,
    chatMessages: chat.length,
    blocked
  });
}

async function adminQuestions(event) {
  requireAdmin(event);
  const search = String(event.queryStringParameters?.search || "").trim();
  const limit = Math.min(Number(event.queryStringParameters?.limit || 40), 100);
  const filter = search ? `&question=ilike.*${encodeURIComponent(search)}*` : "";
  const data = await supabaseFetch(
    `/questions?select=id,question,choice_a,choice_b,votes_a,votes_b,seed_votes_a,seed_votes_b&order=id.asc&limit=${limit}${filter}`
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

  if (!id || !question || !choiceA || !choiceB) {
    return json(400, { error: "Question ou choix manquant." });
  }

  const data = await supabaseFetch(`/questions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
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
      return getQuestions();
    }

    if (event.httpMethod === "GET" && path === "/leaderboard") {
      return getLeaderboard(event);
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

    if (event.httpMethod === "GET" && path === "/chat") {
      return getChat(event);
    }

    if (event.httpMethod === "POST" && path === "/chat") {
      return postChat(event);
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

    return json(404, { error: "Route API introuvable.", path });
  } catch (error) {
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    return json(statusCode, {
      error: error.message || String(error),
      statusCode
    });
  }
};
