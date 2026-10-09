const ProfileView = (() => {
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  async function render(container, { user, showToast }) {
    const [profile, pairs, achievements, notifications, dashboard] = await Promise.all([
      API.get("/profile/me"),
      API.get("/profile/language-pairs"),
      API.get("/profile/achievements").catch(() => []),
      API.get("/profile/notifications").then((items) => items.filter((item) => item.kind !== "message")).catch(() => []),
      API.get("/profile/dashboard").catch(() => null),
    ]);

    const initials = `${profile.first_name[0] || ""}${profile.last_name[0] || ""}`.toUpperCase();
    const weeklyProgress = dashboard?.weekly_progress || 0;
    const activePairs = pairs.filter((pair) => pair.is_active);

    container.innerHTML = `
      <section class="profile-hub">
        <header class="profile-hero">
          <div class="profile-identity"><div class="profile-avatar">${initials}</div><div><p data-i18n="profile.learning_profile"></p><h1>${escapeHtml(profile.first_name)} ${escapeHtml(profile.last_name)}</h1></div></div>
          <button class="btn btn-outline profile-edit-btn" id="editProfileBtn" type="button" data-i18n="profile.edit"></button>
          <div class="profile-meta"><span>${escapeHtml(profile.region || I18N.t("profile.no_region"))}</span><span>${profile.age ? `${profile.age} ${I18N.t("profile.years")}` : ""}</span><span>${escapeHtml(profile.interface_language.toUpperCase())}</span></div>
        </header>
        <section class="profile-scoreboard">
          <div><strong>${Number(profile.xp || 0).toLocaleString()}</strong><span data-i18n="profile.xp"></span></div><div><strong>🔥 ${profile.streak_days || 0}</strong><span data-i18n="profile.streak"></span></div><div><strong>${Number(profile.coins || 0).toLocaleString()}</strong><span data-i18n="profile.coins"></span></div><div><strong>${dashboard?.lessons_completed || 0}</strong><span data-i18n="profile.lessons_completed"></span></div>
        </section>
        <section class="profile-weekly"><div><div><p data-i18n="profile.weekly_goal"></p><h2 data-i18n="profile.weekly_progress"></h2></div><strong>${weeklyProgress}%</strong></div><div class="profile-progress-track"><i style="width:${weeklyProgress}%"></i></div><p>${dashboard?.weekly_summary?.active_days || 0} <span data-i18n="profile.active_days"></span> · ${dashboard?.weekly_summary?.games_played || 0} <span data-i18n="profile.games_played"></span></p></section>
        <section class="profile-section"><div class="profile-section-heading"><div><p data-i18n="profile.learning_languages"></p><h2 data-i18n="profile.language_pairs"></h2></div><button class="icon-btn" id="manageSettingsBtn" type="button" aria-label="${escapeHtml(I18N.t("profile.manage_settings"))}" title="${escapeHtml(I18N.t("profile.manage_settings"))}">⚙</button></div><div class="profile-course-grid">${(activePairs.length ? activePairs : pairs).map((pair) => `<article class="profile-course-card"><div><span>${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</span><strong>${escapeHtml(pair.current_level)}</strong></div><p>${escapeHtml(pair.learning_goal || I18N.t("profile.learning_course"))}</p><footer><span>${Number(pair.xp || 0).toLocaleString()} XP</span><span>🔥 ${pair.streak_days || 0}</span></footer></article>`).join("") || `<p class="profile-empty" data-i18n="profile.no_courses"></p>`}</div></section>
        <section class="profile-section"><div class="profile-section-heading"><div><p data-i18n="profile.progress"></p><h2 data-i18n="profile.achievements"></h2></div><span>${achievements.length}</span></div>${achievements.length ? `<div class="profile-achievements">${achievements.slice(0, 6).map((achievement) => `<article><span>★</span><strong>${escapeHtml(achievement.title)}</strong></article>`).join("")}</div>` : `<p class="profile-empty" data-i18n="profile.no_achievements"></p>`}</section>
        <section class="profile-section profile-notifications"><div class="profile-section-heading"><div><p data-i18n="profile.account_updates"></p><h2 data-i18n="profile.notifications"></h2></div><span>${notifications.filter((item) => !item.is_read).length}</span></div>${notifications.length ? notifications.slice(0, 3).map((notification) => `<article class="profile-notification ${notification.is_read ? "is-read" : "is-unread"}"><div><strong>${escapeHtml(notification.title)}</strong><p>${escapeHtml(notification.message)}</p></div>${!notification.is_read ? `<button class="btn btn-outline btn-small" data-notification-id="${notification.id}" data-i18n="profile.mark_read"></button>` : ""}</article>`).join("") : `<p class="profile-empty" data-i18n="profile.no_notifications"></p>`}</section>
      </section>`;
    I18N.applyToDom(container);

    container.querySelectorAll("[data-notification-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const notificationId = Number(button.dataset.notificationId);
        try {
          await API.post(`/profile/notifications/${notificationId}/read`);
          await render(container, { user, showToast });
          if (App && App.refreshNotificationBadge) {
            App.refreshNotificationBadge();
          }
          showToast(I18N.t("profile.notification_read"));
        } catch (e) {
          showToast(e.message || I18N.t("auth.error_generic"), "error");
        }
      });
    });

    document.getElementById("editProfileBtn").addEventListener("click", () => App.openSettings());
    document.getElementById("manageSettingsBtn").addEventListener("click", () => App.openSettings());
  }

  return { render };
})();
