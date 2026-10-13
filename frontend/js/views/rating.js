const RatingView = (() => {
  const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const PERIODS = ["all", "today", "week", "month"];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function leaderRowHtml(entry, idx) {
    return `
      <div class="leader-row">
        <span class="leader-rank">${idx + 1}</span>
        <span class="leader-identity">
          <span class="leader-name">${escapeHtml(entry.first_name)} ${escapeHtml(entry.last_name)}</span>
          ${entry.email ? `<span class="leader-email">${escapeHtml(entry.email)}</span>` : ""}
        </span>
        <span class="leader-xp">${entry.xp} XP</span>
      </div>`;
  }

  async function render(container, { user }) {
    const pairs = await API.get("/course/pairs");
    const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
    // Learners only ever see the rating of their own learning language —
    // other language pairs are never offered on this screen.
    const activePair = pairs.find((p) => p.id === savedPairId) || pairs[0] || null;

    const state = { period: "all", level: "", region: "" };
    let leaderboard = [];

    function buildQuery() {
      const params = new URLSearchParams();
      if (activePair) params.set("pair_id", String(activePair.id));
      if (state.period && state.period !== "all") params.set("period", state.period);
      if (state.level) params.set("level", state.level);
      if (state.region) params.set("region", state.region);
      const qs = params.toString();
      return qs ? `?${qs}` : "";
    }

    container.innerHTML = `
      <div class="view-header-row">
        <h1 data-i18n="rating.title"></h1>
        <button class="search-toggle-btn" id="searchToggleBtn">🔍</button>
      </div>
      <div class="search-bar hidden" id="searchBar">
        <input type="text" id="searchInput" data-i18n-placeholder="rating.search_placeholder" />
      </div>
      <div class="rating-filters" id="ratingFilters">
        <div class="rating-period-tabs" role="tablist" aria-label="${escapeHtml(I18N.t("rating.period"))}">
          ${PERIODS.map(
            (period) => `
            <button type="button" class="rating-period-tab${period === state.period ? " selected" : ""}"
                    role="tab" data-period="${period}"
                    aria-selected="${period === state.period}"
                    data-i18n="rating.period_${period}"></button>`
          ).join("")}
        </div>
        <div class="rating-select-row">
          <label class="rating-select">
            <span data-i18n="rating.level"></span>
            <select id="ratingLevelSelect">
              <option value="" data-i18n="rating.all_levels"></option>
              ${LEVELS.map((level) => `<option value="${level}">${level}</option>`).join("")}
            </select>
          </label>
          <label class="rating-select">
            <span data-i18n="rating.region"></span>
            <input type="text" id="ratingRegionInput" data-i18n-placeholder="rating.all_regions" autocomplete="off" />
          </label>
        </div>
      </div>
      <div class="card" id="myRatingCard">
        <div class="leader-row">
          <span class="leader-rank">🏅</span>
          <span class="leader-identity">
            <span class="leader-name" id="myRatingName"></span>
            <span class="leader-email" id="myRatingEmail"></span>
          </span>
          <span class="leader-xp" id="myRatingXp"></span>
        </div>
        <p class="lesson-meta" id="myRatingMeta"></p>
        ${activePair ? `<p class="rating-pair-context"><span data-i18n="rating.language_pair"></span>: ${escapeHtml(activePair.source_language)} → ${escapeHtml(activePair.target_language)}</p>` : ""}
      </div>
      <div class="card" id="leaderboardList"></div>
    `;
    I18N.applyToDom(container);

    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const searchBar = document.getElementById("searchBar");
    const searchInput = document.getElementById("searchInput");
    const listEl = document.getElementById("leaderboardList");
    const levelSelect = document.getElementById("ratingLevelSelect");
    const regionInput = document.getElementById("ratingRegionInput");

    function renderList() {
      const queryText = searchInput.value.trim().toLowerCase();
      // Learners can look each other up both by full name and by email.
      const filtered = leaderboard.filter((entry) =>
        `${entry.first_name} ${entry.last_name} ${entry.email || ""}`.toLowerCase().includes(queryText)
      );
      listEl.innerHTML = filtered.length
        ? filtered.map(leaderRowHtml).join("")
        : `<p class="search-no-results" data-i18n="common.no_results"></p>`;
      I18N.applyToDom(listEl);
    }

    async function loadLeaderboard() {
      const query = buildQuery();
      const [board, myRating] = await Promise.all([
        API.get(`/rating/leaderboard${query}`),
        API.get(`/rating/me${query}`),
      ]);
      leaderboard = board;
      document.getElementById("myRatingName").textContent = `${myRating.first_name} ${myRating.last_name}`;
      document.getElementById("myRatingEmail").textContent = myRating.email || "";
      document.getElementById("myRatingXp").textContent = `${myRating.xp} XP`;
      document.getElementById("myRatingMeta").textContent =
        `🔥 ${myRating.streak_days} ${I18N.t("rating.streak")} · ⭐ ${myRating.reputation_score}`;
      renderList();
    }

    searchToggleBtn.addEventListener("click", () => {
      searchBar.classList.toggle("hidden");
      if (!searchBar.classList.contains("hidden")) searchInput.focus();
    });

    searchInput.addEventListener("input", renderList);

    container.querySelectorAll(".rating-period-tab").forEach((tab) => {
      tab.addEventListener("click", async () => {
        state.period = tab.dataset.period;
        container.querySelectorAll(".rating-period-tab").forEach((t) => {
          const selected = t === tab;
          t.classList.toggle("selected", selected);
          t.setAttribute("aria-selected", String(selected));
        });
        await loadLeaderboard();
      });
    });

    levelSelect.addEventListener("change", async () => {
      state.level = levelSelect.value;
      await loadLeaderboard();
    });

    let regionDebounce;
    regionInput.addEventListener("input", () => {
      clearTimeout(regionDebounce);
      regionDebounce = setTimeout(async () => {
        state.region = regionInput.value.trim();
        await loadLeaderboard();
      }, 300);
    });

    await loadLeaderboard();
  }

  return { render };
})();
