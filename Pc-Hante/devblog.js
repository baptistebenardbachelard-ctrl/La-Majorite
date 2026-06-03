const postsEl = document.getElementById("devblogPosts");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parsedDate);
}

fetch("/api/devblog")
  .then((response) => response.json())
  .then((data) => {
    const posts = data.posts || [];
    if (!posts.length) {
      postsEl.innerHTML = "<p class=\"empty-state\">Aucune nouveaute publiee pour le moment.</p>";
      return;
    }

    postsEl.innerHTML = posts.map((post) => `
      <article class="devblog-post">
        <time>${formatDate(post.created_at)}</time>
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.content).replaceAll("\\n", "<br>")}</p>
      </article>
    `).join("");
  })
  .catch(() => {
    postsEl.innerHTML = "<p class=\"empty-state\">Impossible de charger le devblog.</p>";
  });
