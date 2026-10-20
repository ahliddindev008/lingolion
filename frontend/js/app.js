const App = (() => {
  let currentUser = null;
  const mainView = document.getElementById("mainView");
  const bottomNav = document.getElementById("bottomNav");
  const toastEl = document.getElementById("toast");
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationBadge = document.getElementById("notificationBadge");
  const communicationBadge = document.getElementById("communicationBadge");
  let toastTimer = null;
  let notificationPollTimer = null;
  let settingsPanelTitleKey = null;

  function showToast(message, type = "") {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`.trim();
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 3200);
  }

  function setNavVisible(visible) {
    bottomNav.classList.toggle("hidden", !visible);
    if (!visible) {
      const btn = document.getElementById("backToTopBtn");
      if (btn) {
        btn.classList.remove("visible");
        btn.setAttribute("aria-hidden", "true");
        btn.tabIndex = -1;
      }
    }
  }

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  }

  function updateNotificationBadge() {
    if (!notificationBadge) return;
    if (!currentUser) {
      notificationBadge.classList.add("hidden");
      notificationBadge.textContent = "0";
      communicationBadge.classList.add("hidden");
      communicationBadge.textContent = "0";
      return;
    }

    API.get("/profile/notifications")
      .then((items) => {
        const unread = (items || []).filter((item) => !item.is_read);
        notificationBadge.textContent = String(unread.length);
        notificationBadge.classList.toggle("hidden", unread.length === 0);
        const unreadMessages = unread.filter((item) => item.kind === "message").length;
        communicationBadge.textContent = String(unreadMessages);
        communicationBadge.classList.toggle("hidden", unreadMessages === 0);
      })
      .catch(() => {
        notificationBadge.textContent = "0";
        notificationBadge.classList.add("hidden");
        communicationBadge.textContent = "0";
        communicationBadge.classList.add("hidden");
      });
  }

  async function renderSettings() {
    if (!currentUser) return;
    const profileForm = document.getElementById("settingsProfileForm");
    const courseSelect = document.getElementById("activeCourseSelect");
    const courseList = document.getElementById("settingsCourseList");
    try {
      const [profile, pairs] = await Promise.all([API.get("/profile/me"), API.get("/course/pairs")]);
      profileForm.elements.first_name.value = profile.first_name || "";
      profileForm.elements.last_name.value = profile.last_name || "";
      profileForm.elements.age.value = profile.age ?? "";
      profileForm.elements.region.value = profile.region || "";
      document.getElementById("langSwitcher").value = profile.interface_language || I18N.getLang();
      courseSelect.innerHTML = pairs.map((pair) => `
        <option value="${pair.id}">${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</option>`).join("");
      const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
      const activePair = pairs.find((pair) => pair.id === savedPairId) || pairs[0];
      if (activePair) {
        courseSelect.value = String(activePair.id);
        localStorage.setItem("lingolion_active_pair_id", String(activePair.id));
      }
      courseSelect.disabled = !pairs.length;
      courseList.innerHTML = pairs.length ? pairs.map((pair) => `
        <div class="settings-course-row" data-pair-id="${pair.id}">
          <div class="settings-course-name"><strong>${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</strong><span>${escapeHtml(pair.learning_goal || "")}</span></div>
          <label><span data-i18n="settings.level"></span>
            <select data-pair-level="${pair.id}">${["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => `<option ${level === pair.current_level ? "selected" : ""}>${level}</option>`).join("")}</select>
          </label>
          <button class="btn btn-outline btn-small" type="button" data-save-pair="${pair.id}" data-i18n="common.save"></button>
        </div>`).join("") : `<p class="lesson-meta" data-i18n="settings.no_courses"></p>`;
      await renderDeviceSessions();
      I18N.applyToDom(document.getElementById("settingsModal"));
    } catch (error) {
      showToast(error.message || I18N.t("auth.error_generic"), "error");
    }
  }

  async function renderDeviceSessions() {
    const list = document.getElementById("deviceSessionsList");
    let sessions = await API.get("/auth/sessions");
    if (!sessions.some((session) => session.is_current)) {
      if (!await API.refreshSession()) {
        throw new Error(I18N.t("settings.sessions_unavailable"));
      }
      sessions = await API.get("/auth/sessions");
    }
    list.innerHTML = sessions.length ? sessions.map((session) => `
      <article class="device-session-card">
        <div>
          <strong>${escapeHtml(session.device_name)}</strong>
          <span>${escapeHtml(I18N.t(session.is_current ? "settings.current_device" : "settings.last_active", {
            date: new Date(session.last_used_at).toLocaleString(I18N.getLang()),
          }))}</span>
        </div>
        <button class="btn ${session.is_current ? "btn-outline" : "btn-danger"} btn-small" type="button"
          data-revoke-session="${session.id}" data-current-session="${session.is_current}" data-i18n="${session.is_current ? "settings.logout_device" : "settings.revoke_device"}"></button>
      </article>`).join("") : `<p class="lesson-meta" data-i18n="settings.no_device_sessions"></p>`;
    I18N.applyToDom(list);
  }

  function setActiveNav(view) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
  }

  async function navigate(view) {
    setActiveNav(view);
    mainView.innerHTML = '<div class="spinner"></div>';
    if (view === "profile") {
      updateNotificationBadge();
    }
    const views = {
      "lesson-generator": LessonGeneratorView,
      course: CourseView,
      speaking: SpeakingPracticeView,
      communication: CommunicationView,
      rating: RatingView,
      games: GamesView,
      profile: ProfileView,
      admin: AdminView,
    };
    try {
      await views[view].render(mainView, { user: currentUser, showToast });
    } catch (e) {
      showToast(e.message, "error");
    }
    I18N.applyToDom(mainView);
    window.scrollTo(0, 0);
    mainView.scrollTop = 0;
    updateBackToTopVisibility();
  }

  async function showAuth(mode = "login") {
    setNavVisible(false);
    await AuthView.render(mainView, { mode, onSuccess: bootstrapAfterAuth });
    I18N.applyToDom(mainView);
  }

  async function showOnboarding() {
    setNavVisible(false);
    await OnboardingView.render(mainView, {
      onComplete: async () => {
        await bootstrapAfterAuth();
      },
      showToast,
    });
    I18N.applyToDom(mainView);
  }

  async function bootstrapAfterAuth() {
    try {
      currentUser = await API.get("/auth/me");
    } catch (e) {
      API.clearToken();
      currentUser = null;
      return showAuth("login");
    }

    await I18N.load(currentUser.interface_language || "tj");
    I18N.applyToDom(document);
    document.getElementById("langSwitcher").value = I18N.getLang();
    updateNotificationBadge();

    if (!currentUser.onboarding_completed) {
      return showOnboarding();
    }

    const adminNavButton = document.getElementById("adminNavButton");
    adminNavButton.classList.add("hidden");
    try {
      const adminStatus = await API.get("/admin/status");
      adminNavButton.classList.toggle("hidden", !adminStatus.is_admin);
    } catch (error) {
      adminNavButton.classList.add("hidden");
    }

    setNavVisible(true);
    navigate("lesson-generator");
  }

  function openSettings() {
    if (!currentUser) return;
    document.getElementById("settingsModal").classList.remove("hidden");
    showSettingsMenu();
    renderSettings();
  }

  function showSettingsPanel(panelId, titleKey) {
    document.getElementById("settingsMenu").classList.add("hidden");
    document.getElementById("settingsActions").classList.add("hidden");
    ["settingsProfilePanel", "settingsLanguagePanel", "settingsCoursePanel", "settingsDeviceSessionsPanel"].forEach((id) => {
      document.getElementById(id).classList.toggle("hidden", id !== panelId);
    });
    settingsPanelTitleKey = titleKey;
    const title = document.getElementById("settingsTitle");
    title.removeAttribute("data-i18n");
    title.textContent = I18N.t(titleKey);
    document.getElementById("settingsBackBtn").classList.remove("hidden");
  }

  function showSettingsMenu() {
    document.getElementById("settingsMenu").classList.remove("hidden");
    document.getElementById("settingsActions").classList.remove("hidden");
    ["settingsProfilePanel", "settingsLanguagePanel", "settingsCoursePanel", "settingsDeviceSessionsPanel"].forEach((id) => {
      document.getElementById(id).classList.add("hidden");
    });
    settingsPanelTitleKey = null;
    const title = document.getElementById("settingsTitle");
    title.setAttribute("data-i18n", "profile.settings");
    title.textContent = I18N.t("profile.settings");
    document.getElementById("settingsBackBtn").classList.add("hidden");
  }

  function updateBackToTopVisibility() {
    const btn = document.getElementById("backToTopBtn");
    if (!btn) return;
    const navHidden = bottomNav.classList.contains("hidden");
    const shouldShow = !navHidden && mainView.scrollTop > 220;
    btn.classList.toggle("visible", shouldShow);
    btn.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    btn.tabIndex = shouldShow ? 0 : -1;
  }

  // Global "back to top" affordance available on every scrollable view.
  // Works with a floating button (all devices) plus an edge-swipe gesture
  // (touch devices): swiping inward from the left or right screen edge jumps
  // to the top of the current view.
  function setupBackToTop() {
    const btn = document.getElementById("backToTopBtn");
    if (!btn) return;

    const scrollToTop = () => {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      mainView.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      btn.blur();
    };

    btn.addEventListener("click", scrollToTop);
    mainView.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    window.addEventListener("resize", updateBackToTopVisibility);

    const EDGE = 48;      // px from the screen edge that starts the gesture
    const DISTANCE = 70;  // minimum inward travel to trigger
    let startX = 0;
    let startY = 0;
    let fromEdge = false;

    const isEdgeStart = (x) => x <= EDGE || x >= window.innerWidth - EDGE;

    document.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) {
          fromEdge = false;
          return;
        }
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        fromEdge = isEdgeStart(startX);
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (event) => {
        if (!fromEdge || event.touches.length !== 1) return;
        const touch = event.touches[0];
        const dx = touch.clientX - startX;
        const dy = Math.abs(touch.clientY - startY);
        const inward = startX <= EDGE ? dx : -dx;
        if (inward >= DISTANCE && dy < Math.abs(dx)) {
          fromEdge = false;
          if (mainView.scrollTop > 220) {
            if (navigator.vibrate) navigator.vibrate(10);
            scrollToTop();
          }
        }
      },
      { passive: true }
    );

    updateBackToTopVisibility();
  }

  function initShell() {
    setupBackToTop();

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.view));
    });

    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    settingsBtn.addEventListener("click", openSettings);
    settingsModal.querySelector(".close-modal").addEventListener("click", () => settingsModal.classList.add("hidden"));
    document.getElementById("settingsBackBtn").addEventListener("click", showSettingsMenu);
    document.getElementById("openLanguageSettings").addEventListener("click", () => showSettingsPanel("settingsLanguagePanel", "settings.change_language"));
    document.getElementById("openProfileSettings").addEventListener("click", () => showSettingsPanel("settingsProfilePanel", "settings.edit_profile"));
    document.getElementById("openCourseSettings").addEventListener("click", () => showSettingsPanel("settingsCoursePanel", "settings.change_course"));
    document.getElementById("openDeviceSessions").addEventListener("click", async () => {
      showSettingsPanel("settingsDeviceSessionsPanel", "settings.device_sessions");
      try {
        await renderDeviceSessions();
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });
    settingsModal.addEventListener("click", (event) => {
      if (event.target === settingsModal) settingsModal.classList.add("hidden");
    });

    document.getElementById("settingsProfileForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      try {
        currentUser = await API.put("/profile/me", {
          first_name: String(formData.get("first_name")).trim(),
          last_name: String(formData.get("last_name")).trim(),
          age: formData.get("age") ? Number(formData.get("age")) : null,
          region: String(formData.get("region")).trim() || null,
        });
        await I18N.load(currentUser.interface_language);
        I18N.applyToDom(document);
        await renderSettings();
        const activeView = document.querySelector(".nav-item.active")?.dataset.view;
        if (activeView === "profile") await navigate(activeView);
        showToast(I18N.t("settings.saved"), "success");
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });

    document.getElementById("langSwitcher").addEventListener("change", async (event) => {
      const lang = event.target.value;
      try {
        currentUser = await API.put("/profile/me", { interface_language: lang });
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
        return;
      }
      await I18N.load(lang);
      I18N.applyToDom(document);
      document.getElementById("settingsTitle").textContent = I18N.t(settingsPanelTitleKey || "profile.settings");
      const activeView = document.querySelector(".nav-item.active")?.dataset.view;
      if (activeView) await navigate(activeView);
      showToast(I18N.t("settings.saved"), "success");
    });

    document.getElementById("activeCourseSelect").addEventListener("change", async (event) => {
      if (!event.target.value) return;
      localStorage.setItem("lingolion_active_pair_id", event.target.value);
      const activeView = document.querySelector(".nav-item.active")?.dataset.view;
      if (activeView === "course" || activeView === "speaking" || activeView === "games" || activeView === "communication") await navigate(activeView);
    });

    document.getElementById("settingsCourseList").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-save-pair]");
      if (!button) return;
      const pairId = Number(button.dataset.savePair);
      const level = document.querySelector(`[data-pair-level="${pairId}"]`).value;
      button.disabled = true;
      try {
        await API.patch(`/course/pairs/${pairId}`, { current_level: level });
        await renderSettings();
        const activeView = document.querySelector(".nav-item.active")?.dataset.view;
        if (activeView === "course" || activeView === "speaking" || activeView === "games") await navigate(activeView);
        showToast(I18N.t("settings.level_saved"), "success");
      } catch (error) {
        button.disabled = false;
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });

    document.getElementById("deviceSessionsList").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-revoke-session]");
      if (!button) return;
      const currentSession = button.dataset.currentSession === "true";
      const confirmText = I18N.t(currentSession ? "settings.logout_device_confirm" : "settings.revoke_device_confirm");
      if (!window.confirm(confirmText)) return;
      button.disabled = true;
      try {
        await API.delete(`/auth/sessions/${Number(button.dataset.revokeSession)}`);
        if (currentSession) {
          CommunicationView.teardown();
          API.clearToken();
          currentUser = null;
          settingsModal.classList.add("hidden");
          setNavVisible(false);
          showAuth("login");
        } else {
          await renderDeviceSessions();
          showToast(I18N.t("settings.device_revoked"), "success");
        }
      } catch (error) {
        button.disabled = false;
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });

    document.getElementById("newCourseForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const sourceLanguage = String(formData.get("source_language")).trim();
      const targetLanguage = String(formData.get("target_language")).trim();
      if (sourceLanguage && targetLanguage && sourceLanguage.toLowerCase() === targetLanguage.toLowerCase()) {
        showToast(I18N.t("common.same_languages"), "error");
        return;
      }
      try {
        const pair = await API.post("/course/pairs", {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          learning_goal: String(formData.get("learning_goal")).trim(),
          current_level: formData.get("current_level"),
          daily_time_minutes: Number(formData.get("daily_time_minutes")),
        });
        localStorage.setItem("lingolion_active_pair_id", String(pair.id));
        form.reset();
        await renderSettings();
        showToast(I18N.t("settings.course_added"), "success");
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });

    document.getElementById("shareAppBtn").addEventListener("click", async () => {
      const shareData = { title: document.title, text: I18N.t("settings.share_text"), url: location.origin };
      try {
        if (navigator.share) await navigator.share(shareData);
        else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareData.url);
          showToast(I18N.t("settings.link_copied"), "success");
        } else {
          showToast(I18N.t("settings.share_unavailable"), "error");
        }
      } catch (error) {
        if (error.name !== "AbortError") showToast(I18N.t("settings.share_unavailable"), "error");
      }
    });

    async function logOut() {
      CommunicationView.teardown();
      const refreshToken = localStorage.getItem("lingolion_refresh");
      if (refreshToken) {
        try {
          await API.post("/auth/logout", { refresh_token: refreshToken }, { auth: false });
        } catch (error) {
          showToast(error.message || I18N.t("auth.error_generic"), "error");
        }
      }
      API.clearToken();
      currentUser = null;
      updateNotificationBadge();
      settingsModal.classList.add("hidden");
      setNavVisible(false);
      showAuth("login");
    }
    document.getElementById("logoutBtn").addEventListener("click", logOut);

    document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
      if (!window.confirm(I18N.t("settings.delete_confirm"))) return;
      const password = window.prompt(I18N.t("settings.delete_password_prompt"));
      if (password === null) return;
      try {
        await API.delete("/profile/me", { password });
        CommunicationView.teardown();
        API.clearToken();
        currentUser = null;
        updateNotificationBadge();
        settingsModal.classList.add("hidden");
        setNavVisible(false);
        showAuth("login");
        showToast(I18N.t("settings.account_deleted"), "success");
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });

    notificationBtn.addEventListener("click", () => {
      navigate(Number(communicationBadge.textContent) > 0 ? "communication" : "profile");
    });

    if (!notificationPollTimer) notificationPollTimer = window.setInterval(updateNotificationBadge, 30000);
  }

  async function start() {
    const languageSelector = document.getElementById("langSwitcher");
    languageSelector.innerHTML = I18N.getLanguages()
      .map(({ code, label }) => `<option value="${code}">${label}</option>`)
      .join("");
    await I18N.load(localStorage.getItem("lingolion_lang") || "tj");
    I18N.applyToDom(document);
    initShell();
    API.setAuthExpiredHandler(() => {
      currentUser = null;
      setNavVisible(false);
      showAuth("login");
    });

    if (API.getToken()) {
      await bootstrapAfterAuth();
    } else {
      await showAuth("login");
    }
  }

  return { start, navigate, showToast, openSettings, getUser: () => currentUser, refreshNotificationBadge: updateNotificationBadge };
})();

document.addEventListener("DOMContentLoaded", App.start);
