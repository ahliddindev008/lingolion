const OnboardingView = (() => {
  const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const LANGUAGES = I18N.getLanguages().map((language) => language.label);

  function render(container, { onComplete, showToast }) {
    const state = {
      step: 1,
      first_name: "",
      last_name: "",
      age: "",
      region: "",
      source_language: "",
      target_language: "",
      current_level: "",
      learning_goal: "",
      daily_time_minutes: 15,
      interface_language: I18N.getLang(),
    };

    function progressHtml() {
      let html = '<div class="step-progress">';
      for (let i = 1; i <= 4; i++) {
        html += `<span class="${i <= state.step ? "done" : ""}"></span>`;
      }
      return html + "</div>";
    }

    function stepPersonal() {
      return `
        <div class="field"><label data-i18n="auth.first_name"></label>
          <input id="ob_first_name" value="${state.first_name}" required /></div>
        <div class="field"><label data-i18n="auth.last_name"></label>
          <input id="ob_last_name" value="${state.last_name}" required /></div>
        <div class="field"><label data-i18n="onboarding.age"></label>
          <input id="ob_age" type="number" min="3" max="120" value="${state.age}" required /></div>
        <div class="field"><label data-i18n="onboarding.region"></label>
          <input id="ob_region" value="${state.region}" required /></div>
      `;
    }

    function langChipGrid(fieldName, selected) {
      return `<div class="chip-grid" data-field="${fieldName}">` +
        LANGUAGES.map(
          (lang) => `<div class="chip ${selected === lang ? "selected" : ""}" data-value="${lang}">${lang}</div>`
        ).join("") + `</div>
        <div class="field"><input type="text" id="${fieldName}_custom" placeholder="..." value="${LANGUAGES.includes(selected) ? "" : selected}" /></div>`;
    }

    function stepLanguages() {
      return `
        <label data-i18n="onboarding.source_language"></label>
        ${langChipGrid("source_language", state.source_language)}
        <label data-i18n="onboarding.target_language"></label>
        ${langChipGrid("target_language", state.target_language)}
      `;
    }

    function stepLevel() {
      return `
        <label data-i18n="onboarding.level"></label>
        <div class="chip-grid" data-field="current_level">
          ${LEVELS.map((lvl) => `<div class="chip ${state.current_level === lvl ? "selected" : ""}" data-value="${lvl}">${lvl}</div>`).join("")}
        </div>
        <div class="field"><label data-i18n="onboarding.goal"></label>
          <textarea id="ob_goal" data-i18n-placeholder="onboarding.goal_placeholder">${state.learning_goal}</textarea></div>
        <div class="field"><label data-i18n="onboarding.daily_time"></label>
          <input id="ob_time" type="number" min="5" max="480" value="${state.daily_time_minutes}" /></div>
      `;
    }

    function stepInterface() {
      return `
        <label data-i18n="onboarding.interface_language"></label>
        <div class="chip-grid" data-field="interface_language">
          ${I18N.getLanguages().map(({ code, label }) => `<div class="chip ${state.interface_language === code ? "selected" : ""}" data-value="${code}">${label}</div>`).join("")}
        </div>
      `;
    }

    function template() {
      const steps = { 1: stepPersonal, 2: stepLanguages, 3: stepLevel, 4: stepInterface };
      const isLast = state.step === 4;
      return `
        <div class="onboarding-screen">
          <h2 data-i18n="onboarding.title"></h2>
          ${progressHtml()}
          <form id="obForm">
            ${steps[state.step]()}
            <div class="error-msg" id="obError"></div>
            <button type="submit" class="btn btn-primary" data-i18n="onboarding.${isLast ? "finish" : "continue"}"></button>
          </form>
        </div>
      `;
    }

    function bindChips() {
      container.querySelectorAll(".chip-grid").forEach((grid) => {
        const field = grid.dataset.field;
        grid.querySelectorAll(".chip").forEach((chip) => {
          chip.addEventListener("click", () => {
            state[field] = chip.dataset.value;
            grid.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
            chip.classList.add("selected");
            const customInput = document.getElementById(`${field}_custom`);
            if (customInput) customInput.value = "";
          });
        });
      });
    }

    function collectStep() {
      if (state.step === 1) {
        state.first_name = document.getElementById("ob_first_name").value.trim();
        state.last_name = document.getElementById("ob_last_name").value.trim();
        state.age = parseInt(document.getElementById("ob_age").value, 10);
        state.region = document.getElementById("ob_region").value.trim();
        if (!state.first_name || !state.last_name || !state.region || !state.age) return "Please complete all fields";
      } else if (state.step === 2) {
        const srcCustom = document.getElementById("source_language_custom")?.value.trim();
        const tgtCustom = document.getElementById("target_language_custom")?.value.trim();
        if (srcCustom) state.source_language = srcCustom;
        if (tgtCustom) state.target_language = tgtCustom;
        if (!state.source_language || !state.target_language) return "Please select both languages";
        if (state.source_language.trim().toLowerCase() === state.target_language.trim().toLowerCase()) {
          return I18N.t("common.same_languages");
        }
      } else if (state.step === 3) {
        state.learning_goal = document.getElementById("ob_goal").value.trim();
        state.daily_time_minutes = parseInt(document.getElementById("ob_time").value, 10) || 15;
        if (!state.current_level || !state.learning_goal) return "Please complete all fields";
      } else if (state.step === 4) {
        if (!state.interface_language) return "Please select an interface language";
      }
      return null;
    }

    async function submitFinal() {
      await API.post("/onboarding/complete", {
        first_name: state.first_name,
        last_name: state.last_name,
        age: state.age,
        region: state.region,
        source_language: state.source_language,
        target_language: state.target_language,
        current_level: state.current_level,
        learning_goal: state.learning_goal,
        daily_time_minutes: state.daily_time_minutes,
        interface_language: state.interface_language,
      });
    }

    function attach() {
      container.innerHTML = template();
      I18N.applyToDom(container);
      bindChips();

      document.getElementById("obForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById("obError");
        const error = collectStep();
        if (error) {
          errorEl.textContent = error;
          return;
        }
        errorEl.textContent = "";

        if (state.step < 4) {
          state.step += 1;
          attach();
          return;
        }

        try {
          await submitFinal();
          await onComplete();
        } catch (err) {
          errorEl.textContent = err.message || I18N.t("auth.error_generic");
        }
      });
    }

    attach();
    return Promise.resolve();
  }

  return { render };
})();
