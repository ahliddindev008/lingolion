const RatingView = (() => {
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function leaderRowHtml(entry, idx) {
    return `
      <div class="leader-row">
        <span class="leader-rank">${idx + 1}</span>
        <span class="leader-name">${escapeHtml(entry.first_name)} ${escapeHtml(entry.last_name)}</span>
        <span class="leader-xp">${entry.xp} XP</span>
      </div>`;
  }

  async function render(container, { user }) {
    const pairs = await API.get("/course/pairs");
    const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
    // Learners only ever see the rating of their own learning language —
    // other language pairs are never offered on this screen.
    const activePair = pairs.find((p) => p.id === savedPairId) || pairs[0] || null;
    const query = activePair ? `?pair_id=${activePair.id}` : "";

    const [leaderboard, myRating] = await Promise.all([
      API.get(`/rating/leaderboard${query}`),
      API.get(`/rating/me${query}`),
    ]);

    container.innerHTML = `
      <div class="view-header-row">
        <h1 data-i18n="rating.title"></h1>
        <button class="search-toggle-btn" id="searchToggleBtn">🔍</button>
      </div>
      <div class="search-bar hidden" id="searchBar">
        <input type="text" id="searchInput" data-i18n-placeholder="rating.search_placeholder" />
      </div>
      <div class="card">
        <div class="leader-row">
          <span class="leader-rank">🏅</span>
          <span class="leader-name">${escapeHtml(myRating.first_name)} ${escapeHtml(myRating.last_name)}</span>
          <span class="leader-xp">${myRating.xp} XP</span>
        </div>
        <p class="lesson-meta">🔥 ${myRating.streak_days} ${I18N.t("rating.streak")} · ⭐ ${myRating.reputation_score}</p>
        ${activePair ? `<p class="rating-pair-context"><span data-i18n="rating.language_pair"></span>: ${escapeHtml(activePair.source_language)} → ${escapeHtml(activePair.target_language)}</p>` : ""}
      </div>
      <div class="card" id="leaderboardList">
        ${leaderboard.map(leaderRowHtml).join("")}
      </div>
    `;
    I18N.applyToDom(container);

    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const searchBar = document.getElementById("searchBar");
    const searchInput = document.getElementById("searchInput");
    const listEl = document.getElementById("leaderboardList");

    searchToggleBtn.addEventListener("click", () => {
      searchBar.classList.toggle("hidden");
      if (!searchBar.classList.contains("hidden")) searchInput.focus();
    });

    searchInput.addEventListener("input", () => {
      const queryText = searchInput.value.trim().toLowerCase();
      const filtered = leaderboard.filter((entry) =>
        `${entry.first_name} ${entry.last_name}`.toLowerCase().includes(queryText)
      );
      listEl.innerHTML = filtered.length
        ? filtered.map(leaderRowHtml).join("")
        : `<p class="search-no-results" data-i18n="common.no_results"></p>`;
      I18N.applyToDom(listEl);
    });
  }

  return { render };
})();
