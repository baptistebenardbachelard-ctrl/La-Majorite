const { createClient } = require("@supabase/supabase-js");

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.");
  }

  return createClient(url, key, {
    auth: { persistSession: false }
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
  const text = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return JSON.parse(text);
}

async function getQuestions(supabase) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, choice_a, choice_b")
    .order("id", { ascending: true });

  if (error) throw error;

  return json(200, {
    questions: data.map((question) => ({
      id: question.id,
      question: question.question,
      choiceA: question.choice_a,
      choiceB: question.choice_b
    }))
  });
}

async function getLeaderboard(supabase, event) {
  const mode = event.queryStringParameters?.mode === "today" ? "today" : "global";
  const view = mode === "today" ? "leaderboard_today" : "leaderboard_global";

  const { data, error } = await supabase
    .from(view)
    .select("pseudo, games_played, total_score, total_correct, total_questions, success_rate, average_score, best_game_percent, last_played_at")
    .limit(50);

  if (error) throw error;

  return json(200, {
    entries: data.map((entry) => ({
      pseudo: entry.pseudo,
      gamesPlayed: entry.games_played,
      totalScore: entry.total_score,
      totalCorrect: entry.total_correct,
      totalQuestions: entry.total_questions,
      successRate: Number(entry.success_rate),
      averageScore: Number(entry.average_score),
      bestGamePercent: Number(entry.best_game_percent),
      lastPlayedAt: entry.last_played_at
    }))
  });
}

async function postVote(supabase, event) {
  const body = await readBody(event);
  const { data, error } = await supabase.rpc("submit_vote", {
    p_game_id: String(body.gameId || ""),
    p_question_id: String(body.questionId || ""),
    p_choice: String(body.choice || "")
  });

  if (error) {
    const duplicate = error.message.includes("deja ete votee");
    return json(duplicate ? 409 : 400, { error: error.message });
  }

  return json(200, data);
}

async function postScore(supabase, event) {
  const body = await readBody(event);
  const { data, error } = await supabase.rpc("save_game_score", {
    p_game_id: String(body.gameId || ""),
    p_pseudo: String(body.pseudo || ""),
    p_title: String(body.title || "")
  });

  if (error) {
    const duplicate = error.message.includes("deja enregistre");
    return json(duplicate ? 409 : 400, { error: error.message });
  }

  return json(201, data);
}

exports.handler = async (event) => {
  try {
    const supabase = getSupabase();
    const path = routePath(event);

    if (event.httpMethod === "GET" && path === "/questions") {
      return getQuestions(supabase);
    }

    if (event.httpMethod === "GET" && path === "/leaderboard") {
      return getLeaderboard(supabase, event);
    }

    if (event.httpMethod === "POST" && path === "/vote") {
      return postVote(supabase, event);
    }

    if (event.httpMethod === "POST" && path === "/scores") {
      return postScore(supabase, event);
    }

    return json(404, { error: "Route API introuvable." });
  } catch (error) {
    return json(500, { error: error.message || "Erreur serveur." });
  }
};
