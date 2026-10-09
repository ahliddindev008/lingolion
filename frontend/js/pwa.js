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

  installButton.addEventListener("click", async () => {
    updateInstallLabel();
    if (!installPrompt) {
      App.showToast(I18N.t(isIos ? "pwa.install_ios" : "pwa.install_unavailable"));
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;
    if (choice.outcome === "accepted") installButton.classList.add("hidden");
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.classList.add("hidden");
  });
})();