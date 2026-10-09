const AdminView = (() => {
  let search = "";
  let status = "all";
  let language = "all";
  let sort = "joined";
  let page = 1;
  let pageSize = 20;
  let currentAdminId = null;
  let requestId = 0;

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  }

  function formatDate(value) {
    if (!value) return "-";
    const locales = { tj: "tg", ru: "ru", en: "en" };
    return new Date(value).toLocaleDateString(locales[I18N.getLang()] || "tg", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatNumber(value) {
    const locales = { tj: "tg", ru: "ru", en: "en" };
    return new Intl.NumberFormat(locales[I18N.getLang()] || "tg").format(Number(value) || 0);
  }

  function getInitials(firstName, lastName) {
    return `${String(firstName || "").trim().charAt(0)}${String(lastName || "").trim().charAt(0)}`.toLocaleUpperCase() || "•";
  }

  async function render(container, { showToast, user } = {}) {
    if (user) currentAdminId = user.id;
    const activeRequestId = ++requestId;
    container.innerHTML = `<div class="admin-loading"><div class="spinner"></div><span>${escapeHtml(I18N.t("admin.loading"))}</span></div>`;
    try {
      const params = new URLSearchParams({ search, status, language, sort, page: String(page), page_size: String(pageSize) });
      const [overview, result] = await Promise.all([
        API.get("/admin/overview"),
        API.get(`/admin/users?${params}`),
      ]);
      if (activeRequestId !== requestId) return;
      renderDashboard(container, overview, result, showToast);
    } catch (error) {
      if (activeRequestId !== requestId) return;
      container.innerHTML = `
        <section class="admin-error-state" role="alert">
          <span class="admin-error-icon" aria-hidden="true">!</span>
          <h2 data-i18n="admin.load_failed"></h2>
          <p>${escapeHtml(error.message || I18N.t("auth.error_generic"))}</p>
          <button class="btn btn-primary" id="adminRetryButton" type="button" data-i18n="admin.retry"></button>
        </section>`;
      I18N.applyToDom(container);
      document.getElementById("adminRetryButton").addEventListener("click", () => render(container, { showToast }));
      showToast(error.message || I18N.t("auth.error_generic"), "error");
    }
  }

  function renderDashboard(container, overview, result, showToast) {
    const pageCount = result.page_count || Math.max(1, Math.ceil(result.total / pageSize));
    page = Math.min(Math.max(result.page || page, 1), pageCount);
    const availableLanguages = overview.available_languages || [];
    const languageOptions = availableLanguages
      .map((name) => `<option value="${escapeHtml(name)}" ${language === name ? "selected" : ""}>${escapeHtml(name)}</option>`)
      .join("");
    container.innerHTML = `
      <section class="admin-dashboard">
        <header class="view-header-row admin-heading">
          <div class="admin-heading-copy"><p class="admin-eyebrow"><span class="admin-eyebrow-mark" aria-hidden="true">✦</span> Lingolion · <span data-i18n="admin.eyebrow"></span></p><h1 data-i18n="admin.title"></h1><p class="admin-intro" data-i18n="admin.subtitle"></p></div>
          <button class="btn btn-outline admin-refresh" id="adminRefreshButton" type="button"><span aria-hidden="true">↻</span><span data-i18n="admin.refresh"></span></button>
        </header>
        <div class="admin-stats-grid">
          <article class="admin-stat admin-stat-primary"><span class="admin-stat-icon" aria-hidden="true">♙</span><span data-i18n="admin.total_users"></span><strong>${formatNumber(overview.total_users)}</strong><small data-i18n="admin.all_accounts"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">●</span><span data-i18n="admin.active_users"></span><strong>${formatNumber(overview.active_users)}</strong><small data-i18n="admin.active_now"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">○</span><span data-i18n="admin.inactive_users"></span><strong>${formatNumber(overview.inactive_users)}</strong><small data-i18n="admin.all_accounts"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">◷</span><span data-i18n="admin.new_users_30d"></span><strong>${formatNumber(overview.new_users_30d)}</strong><small data-i18n="admin.last_30_days"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">✓</span><span data-i18n="admin.onboarded_users"></span><strong>${formatNumber(overview.onboarded_users)}</strong><small>${formatNumber(overview.pending_onboarding || 0)} <span data-i18n="admin.pending_setup"></span></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">✦</span><span data-i18n="admin.total_xp"></span><strong>${formatNumber(overview.total_xp)}</strong><small data-i18n="admin.community_total"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">▤</span><span data-i18n="admin.completed_lessons"></span><strong>${formatNumber(overview.completed_lessons)}</strong><small data-i18n="admin.all_time"></small></article>
          <article class="admin-stat"><span class="admin-stat-icon" aria-hidden="true">◎</span><span data-i18n="admin.games_played"></span><strong>${formatNumber(overview.games_played)}</strong><small data-i18n="admin.all_time"></small></article>
        </div>
        <section class="admin-users-section admin-panel">
          <div class="admin-section-heading"><div><p class="admin-section-kicker" data-i18n="admin.directory"></p><h2 data-i18n="admin.users"></h2></div><span class="admin-result-count">${formatNumber(result.total)} <span data-i18n="admin.results"></span></span></div>
          <form class="admin-search" id="adminSearchForm" role="search">
            <label class="admin-search-field"><span aria-hidden="true">⌕</span><input id="adminSearchInput" type="search" maxlength="100" value="${escapeHtml(search)}" placeholder="${escapeHtml(I18N.t("admin.search_placeholder"))}" aria-label="${escapeHtml(I18N.t("admin.search_placeholder"))}" /></label>
            ${search ? `<button class="btn btn-outline admin-clear-search" id="adminClearSearch" type="button" data-i18n="admin.clear"></button>` : ""}
            <button class="btn btn-primary" type="submit" data-i18n="admin.search"></button>
          </form>
          <div class="admin-filters">
            <label><span data-i18n="admin.filter_status"></span><select id="adminStatusFilter"><option value="all" ${status === "all" ? "selected" : ""} data-i18n="admin.all_statuses"></option><option value="active" ${status === "active" ? "selected" : ""} data-i18n="admin.active"></option><option value="inactive" ${status === "inactive" ? "selected" : ""} data-i18n="admin.inactive"></option></select></label>
            <label><span data-i18n="admin.filter_language"></span><select id="adminLanguageFilter"><option value="all" ${language === "all" ? "selected" : ""} data-i18n="admin.all_languages"></option>${languageOptions}</select></label>
            <label><span data-i18n="admin.sort_by"></span><select id="adminSort"><option value="joined" ${sort === "joined" ? "selected" : ""} data-i18n="admin.sort_joined"></option><option value="xp" ${sort === "xp" ? "selected" : ""} data-i18n="admin.sort_xp"></option><option value="coins" ${sort === "coins" ? "selected" : ""} data-i18n="admin.sort_coins"></option><option value="name" ${sort === "name" ? "selected" : ""} data-i18n="admin.sort_name"></option></select></label>
            <label><span data-i18n="admin.page_size"></span><select id="adminPageSize"><option value="20" ${pageSize === 20 ? "selected" : ""}>20</option><option value="50" ${pageSize === 50 ? "selected" : ""}>50</option><option value="100" ${pageSize === 100 ? "selected" : ""}>100</option></select></label>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-users-table">
              <thead><tr>
                <th scope="col" data-i18n="admin.user"></th><th scope="col" data-i18n="admin.status"></th>
                <th scope="col" data-i18n="admin.xp"></th><th scope="col" data-i18n="admin.coins"></th><th scope="col" data-i18n="admin.joined"></th><th scope="col" data-i18n="admin.action"></th>
              </tr></thead>
              <tbody>
                ${result.items.length ? result.items.map((user) => `
                  <tr>
                    <td><div class="admin-user-cell"><span class="admin-user-avatar" aria-hidden="true">${escapeHtml(getInitials(user.first_name, user.last_name))}</span><span><strong>${escapeHtml(`${user.first_name} ${user.last_name}`.trim() || user.email)}</strong><span class="admin-user-email">${escapeHtml(user.email)}</span></span></div></td>
                    <td><span class="admin-status ${user.is_active ? "is-active" : "is-inactive"}" data-i18n="admin.${user.is_active ? "active" : "inactive"}"></span></td>
                    <td class="admin-number-cell">${formatNumber(user.xp)}</td>
                    <td class="admin-number-cell">${formatNumber(user.coins)}</td>
                    <td>${escapeHtml(formatDate(user.created_at))}</td>
                    <td><div class="admin-user-actions">
                      <button class="btn btn-secondary btn-small" type="button" data-detail-user-id="${user.id}" data-i18n="admin.details"></button>
                      <button class="btn btn-outline btn-small" type="button" data-user-id="${user.id}" data-next-active="${!user.is_active}" data-i18n="admin.${user.is_active ? "deactivate" : "activate"}" ${(user.id === currentAdminId || (user.is_admin && user.is_active)) ? `disabled title="${escapeHtml(I18N.t("admin.protected_user"))}"` : ""}></button>
                      <button class="btn btn-danger btn-small" type="button" data-delete-user-id="${user.id}" data-i18n="admin.delete_user" ${(user.id === currentAdminId || user.is_admin) ? `disabled title="${escapeHtml(I18N.t("admin.protected_user"))}"` : ""}></button>
                    </div></td>
                  </tr>`).join("") : `<tr><td class="admin-empty-row" colspan="6"><span class="admin-empty-icon" aria-hidden="true">⌕</span><strong data-i18n="admin.no_users"></strong><span data-i18n="admin.no_users_hint"></span></td></tr>`}
              </tbody>
            </table>
          </div>
          <footer class="admin-pagination">
            <button class="icon-btn" id="adminPreviousPage" type="button" aria-label="${escapeHtml(I18N.t("admin.previous"))}" title="${escapeHtml(I18N.t("admin.previous"))}" ${page <= 1 ? "disabled" : ""}>←</button>
            <span>${escapeHtml(I18N.t("admin.page_of", { page, pages: pageCount }))}</span>
            <button class="icon-btn" id="adminNextPage" type="button" aria-label="${escapeHtml(I18N.t("admin.next"))}" title="${escapeHtml(I18N.t("admin.next"))}" ${page >= pageCount ? "disabled" : ""}>→</button>
          </footer>
        </section>
      </section>`;
    I18N.applyToDom(container);

    document.getElementById("adminRefreshButton").addEventListener("click", () => render(container, { showToast }));
    document.getElementById("adminClearSearch")?.addEventListener("click", () => {
      search = "";
      page = 1;
      render(container, { showToast });
    });
    document.getElementById("adminSearchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      search = document.getElementById("adminSearchInput").value.trim();
      page = 1;
      render(container, { showToast });
    });
    ["adminStatusFilter", "adminLanguageFilter", "adminSort", "adminPageSize"].forEach((id) => {
      document.getElementById(id).addEventListener("change", () => {
        status = document.getElementById("adminStatusFilter").value;
        language = document.getElementById("adminLanguageFilter").value;
        sort = document.getElementById("adminSort").value;
        pageSize = Number(document.getElementById("adminPageSize").value);
        page = 1;
        render(container, { showToast });
      });
    });
    document.getElementById("adminPreviousPage").addEventListener("click", () => {
      if (page > 1) {
        page--;
        render(container, { showToast });
      }
    });
    document.getElementById("adminNextPage").addEventListener("click", () => {
      if (page < pageCount) {
        page++;
        render(container, { showToast });
      }
    });
    container.querySelectorAll("[data-user-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.disabled) return;
        button.disabled = true;
        const isActive = button.dataset.nextActive === "true";
        try {
          await API.patch(`/admin/users/${button.dataset.userId}/status`, { is_active: isActive });
          showToast(I18N.t(isActive ? "admin.user_activated" : "admin.user_deactivated"), "success");
          await render(container, { showToast });
        } catch (error) {
          button.disabled = false;
          showToast(error.message || I18N.t("auth.error_generic"), "error");
        }
      });
    });
    container.querySelectorAll("[data-delete-user-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.disabled) return;
        if (!window.confirm(I18N.t("admin.delete_confirm"))) return;
        button.disabled = true;
        try {
          await API.delete(`/admin/users/${button.dataset.deleteUserId}`);
          showToast(I18N.t("admin.user_deleted"), "success");
          await render(container, { showToast });
        } catch (error) {
          button.disabled = false;
          showToast(error.message || I18N.t("auth.error_generic"), "error");
        }
      });
    });
    container.querySelectorAll("[data-detail-user-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const user = await API.get(`/admin/users/${button.dataset.detailUserId}`);
          openUserDetails(container, user, showToast);
        } catch (error) {
          showToast(error.message || I18N.t("auth.error_generic"), "error");
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function openUserDetails(container, user, showToast) {
    const existing = container.querySelector(".admin-user-modal");
    if (existing) existing.remove();
    const pairs = user.language_pairs.length
      ? user.language_pairs.map((pair) => `<li>${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)} · ${escapeHtml(pair.current_level)}</li>`).join("")
      : `<li>${escapeHtml(I18N.t("admin.no_language_pairs"))}</li>`;
    const canEditRewards = user.id !== currentAdminId && !user.is_admin;
    const modal = document.createElement("div");
    modal.className = "modal admin-user-modal";
    modal.innerHTML = `
      <div class="modal-content admin-user-modal-content" role="dialog" aria-modal="true" aria-label="${escapeHtml(I18N.t("admin.details"))}">
        <header class="modal-header"><h2>${escapeHtml(`${user.first_name} ${user.last_name}`)}</h2><button class="icon-btn" type="button" data-close-user-modal aria-label="${escapeHtml(I18N.t("common.close"))}">×</button></header>
        <p class="admin-user-detail-email">${escapeHtml(user.email)}</p>
        <dl class="admin-user-details"><div><dt data-i18n="admin.region"></dt><dd>${escapeHtml(user.region || "-")}</dd></div><div><dt data-i18n="admin.age"></dt><dd>${user.age ?? "-"}</dd></div><div><dt data-i18n="admin.streak"></dt><dd>${formatNumber(user.streak_days)}</dd></div><div><dt data-i18n="admin.games_played"></dt><dd>${formatNumber(user.games_played)}</dd></div><div><dt data-i18n="admin.lessons_created"></dt><dd>${formatNumber(user.lessons_created)}</dd></div><div><dt data-i18n="admin.reputation"></dt><dd>${formatNumber(user.reputation_score)}</dd></div></dl>
        <h3 data-i18n="admin.language_pairs"></h3><ul class="admin-language-pairs">${pairs}</ul>
        ${canEditRewards ? `
          <form class="admin-rewards-form" id="adminRewardsForm">
            <h3 data-i18n="admin.edit_rewards"></h3>
            <label><span data-i18n="admin.xp"></span><input name="xp" type="number" min="0" max="1000000" value="${Number(user.xp) || 0}" required /></label>
            <label><span data-i18n="admin.coins"></span><input name="coins" type="number" min="0" max="1000000" value="${Number(user.coins) || 0}" required /></label>
            <button class="btn btn-primary" type="submit" data-i18n="admin.save_rewards"></button>
          </form>` : `<p class="admin-protected-note" data-i18n="admin.protected_rewards"></p>`}
      </div>`;
    container.appendChild(modal);
    I18N.applyToDom(modal);
    modal.querySelector("[data-close-user-modal]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") modal.remove();
    });
    const rewardsForm = modal.querySelector("#adminRewardsForm");
    rewardsForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = event.currentTarget.querySelector("button[type=submit]");
      submit.disabled = true;
      try {
        const formData = new FormData(event.currentTarget);
        await API.patch(`/admin/users/${user.id}/rewards`, { xp: Number(formData.get("xp")), coins: Number(formData.get("coins")) });
        showToast(I18N.t("admin.rewards_saved"), "success");
        modal.remove();
        await render(container, { showToast });
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      } finally {
        submit.disabled = false;
      }
    });
  }

  return { render };
})();