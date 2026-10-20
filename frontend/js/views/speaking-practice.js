const SpeakingPracticeView = (() => {
  const topicKeys = [
    "introductions", "daily_life", "cafe", "directions", "shopping",
    "work_study", "health", "social_plans", "travel", "stories_opinions",
  ];
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  const PASS_SCORE = 80;
  let pairs = [];
  let activePairId = null;
  let activeSession = null;

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  }

  function formatNumber(value) {
    const locale = { tj: "tg", ru: "ru", en: "en" }[I18N.getLang()] || "tg";
    return new Intl.NumberFormat(locale).format(Number(value) || 0);
  }

  function topicTitle(topicId) {
    return I18N.t(`speakingPractice.topic_${topicId}`);
  }

  async function render(container, { showToast }) {
    activeSession = null;
    container.innerHTML = '<div class="spinner"></div>';
    try {
      pairs = await API.get("/course/pairs");
      if (!pairs.length) {
        container.innerHTML = `<div class="empty-state"><div class="emoji">🗣️</div><p data-i18n="course.no_lessons"></p></div>`;
        I18N.applyToDom(container);
        return;
      }
      const savedPairId = Number(localStorage.getItem("lingolion_speaking_pair_id"));
      activePairId = pairs.some((pair) => pair.id === savedPairId)
        ? savedPairId
        : pairs.some((pair) => pair.id === activePairId) ? activePairId : pairs[0].id;
      await renderTrack(container, showToast);
    } catch (error) {
      showLoadError(container, showToast, error);
    }
  }

  function showLoadError(container, showToast, error) {
    container.innerHTML = `
      <section class="speaking-error" role="alert">
        <span aria-hidden="true">!</span>
        <h2 data-i18n="speakingPractice.load_failed"></h2>
        <p>${escapeHtml(error.message || I18N.t("auth.error_generic"))}</p>
        <button class="btn btn-primary" type="button" id="speakingRetry" data-i18n="speakingPractice.retry"></button>
      </section>`;
    I18N.applyToDom(container);
    container.querySelector("#speakingRetry").addEventListener("click", () => render(container, { showToast }));
    showToast(error.message || I18N.t("auth.error_generic"), "error");
  }

  function pairSelectorHtml() {
    return `
      <label class="speaking-pair-picker">
        <span data-i18n="speakingPractice.learning"></span>
        <select id="speakingPairSelect" aria-label="${escapeHtml(I18N.t("speakingPractice.learning"))}">
          ${pairs.map((pair) => `<option value="${pair.id}" ${pair.id === activePairId ? "selected" : ""}>${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</option>`).join("")}
        </select>
      </label>`;
  }

  async function renderTrack(container, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    container.innerHTML = `<div class="speaking-loading"><div class="spinner"></div><span data-i18n="speakingPractice.loading"></span></div>`;
    I18N.applyToDom(container);
    try {
      const progress = await API.get(`/course/pairs/${activePairId}/speaking-practice`);
      renderOverview(container, pair, progress, showToast);
    } catch (error) {
      showLoadError(container, showToast, error);
    }
  }

  function renderOverview(container, pair, progress, showToast) {
    const percent = Math.round((progress.completed_count / progress.unit_count) * 100);
    const groupedLevels = levels.map((level, groupIndex) => {
      const units = progress.units.slice(groupIndex * 10, groupIndex * 10 + 10);
      return { level, units };
    });
    container.innerHTML = `
      <section class="speaking-studio">
        <header class="speaking-hero">
          <div class="speaking-hero-copy">
            <p class="speaking-kicker"><span aria-hidden="true">✦</span> <span data-i18n="speakingPractice.eyebrow"></span></p>
            <h1 data-i18n="speakingPractice.title"></h1>
            <p class="speaking-hero-description" data-i18n="speakingPractice.subtitle"></p>
            ${pairSelectorHtml()}
          </div>
          <div class="speaking-hero-art" aria-hidden="true">
            <span class="speaking-orbit orbit-one"></span><span class="speaking-orbit orbit-two"></span>
            <span class="speaking-bubble bubble-one">Hello!</span><span class="speaking-bubble bubble-two">✓</span>
            <span class="speaking-hero-mic">🎙</span>
          </div>
        </header>
        <section class="speaking-progress-panel">
          <div class="speaking-progress-copy">
            <div><p data-i18n="speakingPractice.your_progress"></p><strong>${formatNumber(progress.completed_count)} <span data-i18n="speakingPractice.of_50"></span></strong></div>
            <span class="speaking-progress-percent">${percent}%</span>
          </div>
          <div class="speaking-progress-track" role="progressbar" aria-valuenow="${progress.completed_count}" aria-valuemin="0" aria-valuemax="50" aria-label="${escapeHtml(I18N.t("speakingPractice.your_progress"))}"><span style="width:${percent}%"></span></div>
          <div class="speaking-progress-foot"><span data-i18n="speakingPractice.sequential_hint"></span><span>${formatNumber(PASS_SCORE)}% <span data-i18n="speakingPractice.pass_score"></span></span></div>
        </section>
        <div class="speaking-level-list">
          ${groupedLevels.map(({ level, units }) => {
            const completed = units.filter((unit) => unit.status === "completed").length;
            const isOpen = units.some((unit) => unit.status === "available");
            return `
              <section class="speaking-level-section ${isOpen ? "is-current" : completed === 10 ? "is-complete" : "is-locked"}">
                <header class="speaking-level-heading">
                  <span class="speaking-level-badge">${level}</span>
                  <div><h2 data-i18n="speakingPractice.level_${level}"></h2><p>${formatNumber(completed)} <span data-i18n="speakingPractice.of_10"></span></p></div>
                  <span class="speaking-level-mark" aria-hidden="true">${completed === 10 ? "✓" : isOpen ? "●" : "🔒"}</span>
                </header>
                <div class="speaking-lesson-grid">
                  ${units.map((unit) => renderUnitCard(unit)).join("")}
                </div>
              </section>`;
          }).join("")}
        </div>
      </section>`;
    I18N.applyToDom(container);

    container.querySelector("#speakingPairSelect").addEventListener("change", async (event) => {
      activePairId = Number(event.currentTarget.value);
      localStorage.setItem("lingolion_speaking_pair_id", String(activePairId));
      await renderTrack(container, showToast);
    });
    container.querySelectorAll("[data-speaking-unit]").forEach((button) => {
      button.addEventListener("click", () => openUnit(container, Number(button.dataset.speakingUnit), progress, showToast));
    });
  }

  function renderUnitCard(unit) {
    const statusKey = unit.status === "completed"
      ? "speakingPractice.completed"
      : unit.status === "available" ? "speakingPractice.start" : "speakingPractice.locked";
    const mark = unit.status === "completed" ? "✓" : unit.status === "available" ? "→" : "🔒";
    return `
      <button class="speaking-lesson-card ${unit.status}" type="button" data-speaking-unit="${unit.unit_number}" ${unit.status === "locked" ? "disabled" : ""} aria-label="${escapeHtml(I18N.t("speakingPractice.lesson_accessible", { number: unit.unit_number, topic: topicTitle(unit.topic_id), status: I18N.t(statusKey) }))}">
        <span class="speaking-lesson-top"><span>${escapeHtml(I18N.t("speakingPractice.lesson_number", { number: unit.unit_number }))}</span><span class="speaking-lesson-mark" aria-hidden="true">${mark}</span></span>
        <strong>${escapeHtml(topicTitle(unit.topic_id))}</strong>
        <span class="speaking-lesson-bottom">${unit.status === "completed" ? `${escapeHtml(I18N.t("speakingPractice.score"))}: ${formatNumber(unit.score)}%` : `<span data-i18n="${statusKey}"></span>`}</span>
      </button>`;
  }

  async function openUnit(container, unitNumber, progress, showToast) {
    const unit = progress.units[unitNumber - 1];
    if (!unit || unit.status === "locked") return;
    activeSession = null;
    container.innerHTML = `<div class="speaking-loading"><div class="spinner"></div><span data-i18n="speakingPractice.preparing"></span></div>`;
    I18N.applyToDom(container);
    try {
      const lesson = await API.post("/course/speaking-practice/generate", {
        language_pair_id: activePairId,
        unit_number: unitNumber,
      });
      API.cacheLesson(activePairId, lesson);
      if (lesson.content?.speaking_practice_track !== "conversation-v1") {
        throw new Error(I18N.t("speakingPractice.invalid_lesson"));
      }
      startLesson(container, lesson, unit, showToast);
    } catch (error) {
      showToast(error.message || I18N.t("auth.error_generic"), "error");
      await renderTrack(container, showToast);
    }
  }

  function startLesson(container, lesson, unit, showToast) {
    const conversation = (Array.isArray(lesson.content?.conversation) ? lesson.content.conversation : [])
      .filter((turn) => turn && (turn.partner_line || turn.prompt || turn.model_answer))
      .slice(0, 4)
      .map((turn) => ({
        partnerLine: String(turn.partner_line || ""),
        prompt: String(turn.prompt || ""),
        modelAnswer: String(turn.model_answer || ""),
        keywords: Array.isArray(turn.keywords) ? turn.keywords.map(String).filter(Boolean) : [],
      }));
    if (conversation.length !== 4) {
      showToast(I18N.t("speakingPractice.invalid_lesson"), "error");
      renderTrack(container, showToast);
      return;
    }
    activeSession = {
      lesson,
      unit,
      conversation,
      targetLanguage: pairs.find((pair) => pair.id === activePairId)?.target_language || "",
      currentTurn: 0,
      scores: Array(4).fill(0),
      checked: false,
    };
    renderTurn(container, showToast);
  }

  function renderTurn(container, showToast, feedback = null) {
    const session = activeSession;
    if (!session) return;
    const turn = session.conversation[session.currentTurn];
    const current = session.currentTurn + 1;
    const percent = Math.round((session.currentTurn / session.conversation.length) * 100);
    container.innerHTML = `
      <section class="speaking-session">
        <header class="speaking-session-header">
          <button class="speaking-back-btn" type="button" id="speakingBack"><span aria-hidden="true">←</span><span data-i18n="speakingPractice.back"></span></button>
          <span class="speaking-session-language">${escapeHtml(session.targetLanguage)}</span>
        </header>
        <div class="speaking-session-progress">
          <span>${escapeHtml(I18N.t("speakingPractice.lesson_number", { number: session.unit.unit_number }))} · ${escapeHtml(topicTitle(session.unit.topic_id))}</span>
          <strong>${escapeHtml(I18N.t("speakingPractice.turn_progress", { current, total: session.conversation.length }))}</strong>
          <div class="speaking-progress-track"><span style="width:${percent}%"></span></div>
        </div>
        <div class="speaking-dialogue">
          <div class="speaking-partner-avatar" aria-hidden="true">AI</div>
          <article class="speaking-partner-card">
            <span data-i18n="speakingPractice.partner"></span>
            <p>${escapeHtml(turn.partnerLine)}</p>
            <button type="button" class="speaking-listen-btn" id="speakingListen" ${window.speechSynthesis && window.SpeechSynthesisUtterance ? "" : "disabled"}>
              <span aria-hidden="true">🔊</span><span data-i18n="speakingPractice.listen"></span>
            </button>
          </article>
        </div>
        <section class="speaking-response-panel">
          <p class="speaking-cue">${escapeHtml(turn.prompt)}</p>
          <label for="speakingAnswer" data-i18n="speakingPractice.your_reply"></label>
          <div class="speaking-answer-row">
            <textarea id="speakingAnswer" rows="3" maxlength="1000" placeholder="${escapeHtml(I18N.t("speakingPractice.answer_placeholder"))}" ${session.checked ? "disabled" : ""}>${escapeHtml(session.answer || "")}</textarea>
            <button type="button" class="speaking-mic-btn" id="speakingMic" aria-label="${escapeHtml(I18N.t("speakingPractice.speak_answer"))}" title="${escapeHtml(I18N.t("speakingPractice.speak_answer"))}" ${session.checked || !(window.SpeechRecognition || window.webkitSpeechRecognition) ? "disabled" : ""}>🎙</button>
          </div>
          ${feedback ? `
            <div class="speaking-feedback ${feedback.score >= PASS_SCORE ? "is-good" : "needs-practice"}" aria-live="polite">
              <strong>${escapeHtml(I18N.t("speakingPractice.turn_score", { score: feedback.score }))}</strong>
              <p>${escapeHtml(I18N.t("speakingPractice.model_reply"))}: ${escapeHtml(turn.modelAnswer)}</p>
              ${turn.keywords.length ? `<small>${escapeHtml(I18N.t("speakingPractice.key_words"))}: ${turn.keywords.map(escapeHtml).join(" · ")}</small>` : ""}
            </div>` : ""}
          <div class="speaking-session-actions">
            ${session.checked && feedback && feedback.score < PASS_SCORE ? `<button type="button" class="btn btn-outline" id="speakingTryAgain" data-i18n="speakingPractice.try_again"></button>` : ""}
            ${session.checked ? `<button type="button" class="btn btn-primary" id="speakingContinue">${escapeHtml(I18N.t(current === session.conversation.length ? "speakingPractice.finish" : "speakingPractice.next_turn"))}<span aria-hidden="true"> →</span></button>` : `<button type="button" class="btn btn-primary" id="speakingCheck" data-i18n="speakingPractice.check_reply"></button>`}
          </div>
        </section>
      </section>`;
    I18N.applyToDom(container);
    container.querySelector("#speakingBack").addEventListener("click", () => {
      activeSession = null;
      renderTrack(container, showToast);
    });
    container.querySelector("#speakingListen").addEventListener("click", () => speak(turn.partnerLine, session.targetLanguage));
    container.querySelector("#speakingMic").addEventListener("click", () => captureSpeech(container, showToast));
    container.querySelector("#speakingCheck")?.addEventListener("click", () => checkTurn(container, showToast));
    container.querySelector("#speakingTryAgain")?.addEventListener("click", () => {
      session.checked = false;
      renderTurn(container, showToast);
      container.querySelector("#speakingAnswer")?.focus();
    });
    container.querySelector("#speakingContinue")?.addEventListener("click", () => {
      if (session.currentTurn + 1 === session.conversation.length) {
        finishLesson(container, showToast);
        return;
      }
      session.currentTurn += 1;
      session.checked = false;
      session.answer = "";
      renderTurn(container, showToast);
    });
    container.querySelector("#speakingAnswer")?.addEventListener("input", (event) => {
      session.answer = event.currentTarget.value;
    });
  }

  function speak(text, language) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SpeechUtils.languageCode(language);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function captureSpeech(container, showToast) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition || !activeSession) return;
    const recognition = new Recognition();
    recognition.lang = SpeechUtils.languageCode(activeSession.targetLanguage);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    const button = container.querySelector("#speakingMic");
    button.disabled = true;
    button.classList.add("recording");
    recognition.onresult = (event) => {
      const answer = event.results[0]?.[0]?.transcript?.trim();
      const field = container.querySelector("#speakingAnswer");
      if (field && answer) {
        field.value = answer;
        activeSession.answer = answer;
      }
    };
    recognition.onerror = () => showToast(I18N.t("speakingPractice.speech_failed"), "error");
    recognition.onend = () => {
      if (!button.isConnected) return;
      button.disabled = false;
      button.classList.remove("recording");
    };
    try {
      recognition.start();
    } catch (error) {
      button.disabled = false;
      button.classList.remove("recording");
      showToast(I18N.t("speakingPractice.speech_failed"), "error");
    }
  }

  function scoreAnswer(answer, keywords) {
    const normalizedAnswer = String(answer || "").normalize("NFC").toLocaleLowerCase();
    const usableKeywords = keywords.map((word) => String(word).trim().toLocaleLowerCase()).filter(Boolean);
    if (!normalizedAnswer.trim()) return 0;
    if (!usableKeywords.length) return 100;
    const matches = usableKeywords.filter((word) => normalizedAnswer.includes(word)).length;
    return Math.round((matches / usableKeywords.length) * 100);
  }

  function checkTurn(container, showToast) {
    const session = activeSession;
    const answer = container.querySelector("#speakingAnswer")?.value.trim() || "";
    if (!answer) {
      showToast(I18N.t("speakingPractice.answer_required"), "error");
      return;
    }
    session.answer = answer;
    const score = scoreAnswer(answer, session.conversation[session.currentTurn].keywords);
    session.scores[session.currentTurn] = Math.max(session.scores[session.currentTurn], score);
    session.checked = true;
    renderTurn(container, showToast, { score: session.scores[session.currentTurn] });
  }

  async function finishLesson(container, showToast) {
    const session = activeSession;
    const score = Math.round(session.scores.reduce((total, item) => total + item, 0) / session.scores.length);
    const finishButton = container.querySelector("#speakingContinue");
    if (finishButton) finishButton.disabled = true;
    try {
      await API.post("/course/lessons/complete", { lesson_id: session.lesson.id, score });
      activeSession = null;
      container.innerHTML = `
        <section class="speaking-result">
          <span class="speaking-result-icon" aria-hidden="true">${score >= PASS_SCORE ? "✓" : "↻"}</span>
          <p class="speaking-kicker" data-i18n="speakingPractice.lesson_complete"></p>
          <h1 data-i18n="${score >= PASS_SCORE ? "speakingPractice.passed_title" : "speakingPractice.retry_title"}"></h1>
          <strong class="speaking-result-score">${formatNumber(score)}%</strong>
          <p data-i18n="${score >= PASS_SCORE ? "speakingPractice.passed_hint" : "speakingPractice.retry_hint"}"></p>
          <button type="button" class="btn btn-primary" id="speakingResultBack" data-i18n="speakingPractice.back_to_track"></button>
        </section>`;
      I18N.applyToDom(container);
      container.querySelector("#speakingResultBack").addEventListener("click", () => renderTrack(container, showToast));
    } catch (error) {
      if (finishButton) finishButton.disabled = false;
      showToast(error.message || I18N.t("auth.error_generic"), "error");
    }
  }

  return { render };
})();
