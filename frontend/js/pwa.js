(() => {
  const installButton = document.getElementById("installAppBtn");
  let installPrompt = null;
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function updateInstallLabel() {
    const label = I18N.t("pwa.install");
    installButton.setAttribute("aria-label", label);
    installButton.setAttribute("title", label);
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Lingolion offline support could not start", error);
      });
    });
  }

  if (!installButton) return;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isStandalone()) installButton.classList.remove("hidden");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (!isStandalone()) installButton.classList.remove("hidden");
    updateInstallLabel();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.classList.add("hidden");
  });

  // Academic fallback dialog: shown whenever the browser cannot (or will not)
  // offer the native install prompt, so the button always gives feedback and
  // tells the learner exactly how to install on their platform.
  function showInstallHelp() {
    let overlay = document.getElementById("installHelpModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "modal hidden";
      overlay.id = "installHelpModal";
      overlay.innerHTML = `
        <div class="modal-content install-help-content" role="dialog" aria-modal="true" aria-labelledby="installHelpTitle">
          <div class="modal-header">
            <h3 id="installHelpTitle"></h3>
            <button type="button" class="icon-btn install-help-close" data-i18n-aria-label="common.close">×</button>
          </div>
          <div class="install-help-body">
            <div class="install-help-icon" aria-hidden="true">📲</div>
            <p class="install-help-message" id="installHelpMessage"></p>
          </div>
          <div class="space-form-actions">
            <button type="button" class="btn install-help-ok"></button>
          </div>
        </div>`;
      document.getElementById("app").appendChild(overlay);
      const close = () => overlay.classList.add("hidden");
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
      });
      overlay.querySelectorAll(".install-help-close, .install-help-ok").forEach((button) => {
        button.addEventListener("click", close);
      });
    }
    I18N.applyToDom(overlay);
    overlay.querySelector("#installHelpTitle").textContent = I18N.t("pwa.install");
    overlay.querySelector("#installHelpMessage").textContent = I18N.t(
      isIos ? "pwa.install_ios" : "pwa.install_unavailable"
    );
    overlay.querySelector(".install-help-ok").textContent = I18N.t("common.close");
    overlay.classList.remove("hidden");
  }

  installButton.addEventListener("click", async () => {
    updateInstallLabel();
    if (!installPrompt) {
      showInstallHelp();
      return;
    }
    try {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      installPrompt = null;
      if (choice && choice.outcome === "accepted") installButton.classList.add("hidden");
    } catch (error) {
      // The deferred prompt was rejected or expired — fall back to guidance.
      installPrompt = null;
      showInstallHelp();
    }
  });
})();