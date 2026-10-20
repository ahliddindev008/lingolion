const AuthView = (() => {
  async function render(container, { mode = "login", onSuccess }) {
    const state = {
      mode,
      email: "",
      status: "",
      statusIsError: false,
    };

    function getErrorMessage(error) {
      const messages = {
        "Invalid email or password.": "auth.invalid_credentials",
        "An account already exists for this email.": "auth.account_exists",
        "Password recovery is only available on a previously used device.":
          "auth.recovery_same_device_only",
        "Account not found": "auth.account_not_found",
      };
      return messages[error.message]
        ? I18N.t(messages[error.message])
        : error.message || I18N.t("auth.error_generic");
    }

    function escapedEmail() {
      return state.email.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]);
    }

    function passwordInputs(confirm = false) {
      return `
        <div class="field">
          <label for="authPassword" data-i18n="${state.mode === "login" ? "auth.password" : "auth.new_password"}"></label>
          <input id="authPassword" name="password" type="password" minlength="8" maxlength="72"
            autocomplete="${state.mode === "login" ? "current-password" : "new-password"}" required />
        </div>
        ${confirm ? `
          <div class="field">
            <label for="authPasswordConfirm" data-i18n="auth.confirm_password"></label>
            <input id="authPasswordConfirm" name="password_confirm" type="password" minlength="8" maxlength="72"
              autocomplete="new-password" required />
          </div>` : ""}
      `;
    }

    function identifierInput() {
      return `
        <div class="field">
          <label for="authEmail" data-i18n="auth.email"></label>
          <input id="authEmail" name="email" type="text" autocomplete="username" maxlength="255"
            value="${escapedEmail()}" required />
        </div>
      `;
    }

    function template() {
      const titleKey = state.mode === "login" ? "auth.login"
        : state.mode === "register" ? "auth.register"
          : "auth.reset_password";
      const hintKey = state.mode === "login" ? "auth.password_login_hint"
        : state.mode === "register" ? "auth.signup_hint"
          : "auth.forgot_password_hint";

      let form;
      if (state.mode === "login") {
        form = `
          <form id="authForm" class="auth-method">
            ${identifierInput()}
            ${passwordInputs()}
            <button class="btn btn-primary auth-submit" type="submit" data-i18n="auth.login"></button>
            <div class="auth-code-actions">
              <button class="link-btn" type="button" data-auth-mode="reset-device" data-i18n="auth.forgot_password"></button>
              <button class="link-btn" type="button" data-auth-mode="register" data-i18n="auth.create_account"></button>
            </div>
          </form>`;
      } else {
        const isRegister = state.mode === "register";
        form = `
          <form id="authForm" class="auth-method">
            ${identifierInput()}
            ${passwordInputs(true)}
            <button class="btn btn-primary auth-submit" type="submit"
              data-i18n="${isRegister ? "auth.create_account" : "auth.reset_password"}"></button>
            <button class="link-btn" type="button" data-auth-mode="login" data-i18n="auth.back_to_login"></button>
          </form>`;
      }

      return `
        <div class="auth-screen">
          <div class="auth-logo" aria-hidden="true"><img src="icons/lion.svg" alt="" /></div>
          ${state.mode === "login" ? `
            <h1 class="auth-title auth-welcome-title" data-i18n="auth.welcome_title"></h1>
            <p class="auth-tagline" data-i18n="auth.welcome_subtitle"></p>
            <section class="auth-about">
              <div class="auth-welcome-item">
                <h2 data-i18n="auth.welcome_first_time"></h2>
                <p data-i18n="auth.welcome_first_time_text"></p>
              </div>
              <div class="auth-welcome-item">
                <h2 data-i18n="auth.welcome_member"></h2>
                <p data-i18n="auth.welcome_member_text"></p>
              </div>
            </section>` : `
            <h1 class="auth-title">Lingolion</h1>
            <p class="auth-tagline" data-i18n="tagline"></p>
            <section class="auth-about">
              <h2 data-i18n="about.title"></h2>
              <ul>
                <li><span aria-hidden="true">🎮</span><p data-i18n="about.feature_1"></p></li>
                <li><span aria-hidden="true">🤖</span><p data-i18n="about.feature_2"></p></li>
                <li><span aria-hidden="true">🌍</span><p data-i18n="about.feature_3"></p></li>
              </ul>
            </section>`}
          <section class="auth-form">
            <h2 class="auth-form-title" data-i18n="${titleKey}"></h2>
            <p class="auth-method-hint" data-i18n="${hintKey}"></p>
            ${form}
            <p id="authStatus" class="${state.statusIsError ? "error-msg" : "lesson-meta"}"
              role="${state.statusIsError ? "alert" : "status"}" aria-live="polite"></p>
          </section>
        </div>`;
    }

    function attach() {
      container.innerHTML = template();
      I18N.applyToDom(container);
      container.querySelector("#authStatus").textContent = state.status;

      container.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          const identifier = container.querySelector("#authEmail");
          if (identifier) state.email = identifier.value.trim();
          state.mode = button.dataset.authMode;
          state.status = "";
          state.statusIsError = false;
          attach();
        });
      });

      container.querySelector("#authForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const email = String(data.get("email") || "").trim().toLowerCase();
        const password = String(data.get("password") || "");
        if (new TextEncoder().encode(password).length > 72) {
          state.status = I18N.t("auth.password_too_long");
          state.statusIsError = true;
          attach();
          return;
        }
        if (state.mode !== "login" && password !== data.get("password_confirm")) {
          state.status = I18N.t("auth.password_mismatch");
          state.statusIsError = true;
          attach();
          return;
        }

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        state.status = "";
        state.statusIsError = false;
        try {
          if (state.mode === "register") {
            const tokens = await API.post(
              "/auth/register",
              { email, password },
              { auth: false },
            );
            API.setTokens(tokens);
            await onSuccess();
          } else if (state.mode === "reset-device") {
            const tokens = await API.post(
              "/auth/password/reset-device",
              { email, password },
              { auth: false },
            );
            API.setTokens(tokens);
            await onSuccess();
          } else {
            const tokens = await API.post(
              "/auth/login/password",
              { email, password },
              { auth: false },
            );
            API.setTokens(tokens);
            await onSuccess();
          }
        } catch (error) {
          state.email = email;
          state.status = getErrorMessage(error);
          state.statusIsError = true;
          attach();
        }
      });
    }

    attach();
  }

  return { render };
})();
