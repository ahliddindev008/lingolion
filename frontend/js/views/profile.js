const ProfileView = (() => {
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  async function render(container, { user, showToast }) {
    const [profile, pairs, achievements, notifications, dashboard, shopCatalog] = await Promise.all([
      API.get("/profile/me"),
      API.get("/profile/language-pairs"),
      API.get("/profile/achievements").catch(() => []),
      API.get("/profile/notifications").then((items) => items.filter((item) => item.kind !== "message")).catch(() => []),
      API.get("/profile/dashboard").catch(() => null),
      API.get("/shop/catalog").catch(() => null),
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
        ${renderShopSection(shopCatalog, profile.coins || 0)}
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
    if (shopCatalog) bindShop(container, { showToast }, shopCatalog);
  }

  // ---------- Shop ----------

  const SHOP_CATEGORIES = ["sticker", "shield", "gift", "lion_outfit"];

  function renderShopSection(shopCatalog, coins) {
    if (!shopCatalog) return "";
    return `
      <section class="profile-section profile-shop" id="profileShop" data-coins="${coins}">
        <div class="profile-section-heading">
          <div><p data-i18n="profile.shop_intro"></p><h2 data-i18n="profile.shop_title"></h2></div>
          <span class="shop-coins-badge">🪙 <b id="shopCoinsValue">${Number(coins).toLocaleString()}</b></span>
        </div>
        <div class="shop-lion-preview">
          <div class="shop-lion-emoji" id="shopLionPreview">🦁</div>
          <p data-i18n="profile.shop_lion_hint"></p>
        </div>
        <div class="shop-tabs" role="tablist">
          ${SHOP_CATEGORIES.map((category, index) => `<button class="shop-tab${index === 0 ? " active" : ""}" type="button" role="tab" data-shop-tab="${category}" data-i18n="profile.shop_tab_${category}"></button>`).join("")}
        </div>
        <div class="shop-grid" id="shopGrid">
          ${renderShopCards(shopCatalog, "sticker")}
        </div>
      </section>`;
  }

  function renderShopCards(items, category) {
    return items.filter((item) => item.category === category).map((item) => `
      <article class="shop-card" data-shop-item="${item.code}">
        <div class="shop-card-emoji" aria-hidden="true">${item.emoji}</div>
        <strong data-i18n="profile.shop_items.${item.code}"></strong>
        <span class="shop-card-price">🪙 ${item.price}</span>
        <div class="shop-card-actions">${renderShopItemButton(item)}</div>
      </article>`).join("");
  }

  function renderShopItemButton(item) {
    if (item.category === "lion_outfit") {
      return item.owned
        ? `<button class="btn btn-small ${item.is_equipped ? "btn-primary" : "btn-outline"}" type="button" data-shop-equip="${item.code}" data-i18n="profile.shop_${item.is_equipped ? "unequip" : "equip"}"></button>`
        : `<button class="btn btn-small btn-primary" type="button" data-shop-buy="${item.code}" data-i18n="profile.shop_buy"></button>`;
    }
    if (item.category === "gift") {
      return `<button class="btn btn-small btn-primary" type="button" data-shop-gift="${item.code}" data-i18n="profile.shop_send"></button>`;
    }
    return `<button class="btn btn-small btn-primary" type="button" data-shop-buy="${item.code}" data-i18n="profile.shop_buy"></button>`;
  }

  async function bindShop(container, { showToast }, initialCatalog) {
    const shopSection = container.querySelector("#profileShop");
    if (!shopSection) return;
    const grid = shopSection.querySelector("#shopGrid");

    // Reuse the catalog already fetched for the initial render; re-fetch only
    // if it was somehow missing.
    let catalog = initialCatalog;
    if (!catalog) {
      try {
        catalog = await API.get("/shop/catalog");
      } catch (e) {
        return;
      }
    }
    shopSection._catalog = catalog;

    const updateCoins = (value) => {
      const badge = shopSection.querySelector("#shopCoinsValue");
      if (badge) badge.textContent = Number(value).toLocaleString();
      shopSection.dataset.coins = String(value);
    };

    const updateLionPreview = () => {
      const preview = shopSection.querySelector("#shopLionPreview");
      if (!preview || !catalog) return;
      const equipped = catalog.filter((item) => item.category === "lion_outfit" && item.is_equipped);
      preview.textContent = equipped.length ? `🦁${equipped.map((item) => item.emoji).join("")}` : "🦁";
    };

    const activeTab = () => shopSection.querySelector(".shop-tab.active")?.dataset.shopTab || "sticker";

    const refreshGrid = () => {
      grid.innerHTML = renderShopCards(catalog, activeTab());
      I18N.applyToDom(grid);
      bindGridButtons();
      updateLionPreview();
    };

    const showError = (e) =>
      showToast(e.message === "Not enough coins" ? I18N.t("profile.shop_not_enough") : e.message || I18N.t("auth.error_generic"), "error");

    const syncCoins = async () => {
      const inventory = await API.get("/shop/inventory").catch(() => null);
      if (inventory) updateCoins(inventory.coins);
    };

    const handleBuy = async (code) => {
      try {
        const updated = await API.post("/shop/buy", { item_code: code });
        const index = catalog.findIndex((item) => item.code === code);
        if (index >= 0) catalog[index] = updated;
        await syncCoins();
        refreshGrid();
        showToast(I18N.t("profile.shop_bought"));
      } catch (e) {
        showError(e);
      }
    };

    const handleEquip = async (code) => {
      try {
        await API.post("/shop/equip", { item_code: code });
        // Re-fetch so previously equipped outfits are refreshed too.
        catalog = await API.get("/shop/catalog").catch(() => catalog);
        refreshGrid();
        showToast(I18N.t("profile.shop_equipped"));
      } catch (e) {
        showError(e);
      }
    };

    const handleGift = async (code) => {
      let partners = [];
      try {
        partners = await API.get("/communication/partners");
      } catch (e) {
        partners = [];
      }
      if (!partners.length) {
        showToast(I18N.t("profile.shop_no_friends"), "error");
        return;
      }
      const recipientId = await new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "activity-overlay";
        overlay.innerHTML = `
          <section class="activity-window gift-picker-window" role="dialog" aria-modal="true">
            <header class="activity-window-header"><h2 data-i18n="profile.shop_pick_friend"></h2><button class="icon-btn" type="button" data-gift-cancel>×</button></header>
            <div class="activity-window-body gift-picker-list">
              ${partners.map((p) => `<button class="gift-friend-option" type="button" data-friend-id="${p.user_id}">${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</button>`).join("")}
            </div>
          </section>`;
        document.body.appendChild(overlay);
        I18N.applyToDom(overlay);
        const close = (value) => { overlay.remove(); resolve(value); };
        overlay.querySelectorAll("[data-friend-id]").forEach((btn) => {
          btn.addEventListener("click", () => close(Number(btn.dataset.friendId)));
        });
        overlay.querySelector("[data-gift-cancel]").addEventListener("click", () => close(null));
        overlay.addEventListener("click", (event) => { if (event.target === overlay) close(null); });
      });
      if (!recipientId) return;
      try {
        await API.post("/shop/gift", { item_code: code, recipient_id: recipientId });
        await syncCoins();
        showToast(I18N.t("profile.shop_gift_sent"));
      } catch (e) {
        showError(e);
      }
    };

    const bindGridButtons = () => {
      grid.querySelectorAll("[data-shop-buy]").forEach((btn) => btn.addEventListener("click", () => handleBuy(btn.dataset.shopBuy)));
      grid.querySelectorAll("[data-shop-equip]").forEach((btn) => btn.addEventListener("click", () => handleEquip(btn.dataset.shopEquip)));
      grid.querySelectorAll("[data-shop-gift]").forEach((btn) => btn.addEventListener("click", () => handleGift(btn.dataset.shopGift)));
    };

    shopSection.querySelectorAll("[data-shop-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        shopSection.querySelectorAll(".shop-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        refreshGrid();
      });
    });

    bindGridButtons();
    updateLionPreview();
  }

  return { render };
})();
