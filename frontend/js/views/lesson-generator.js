const LessonGeneratorView = (() => {
  let pairs = [];
  let lessons = [];
  let activePairId = null;

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  }

  function activePair() {
    return pairs.find((pair) => pair.id === activePairId);
  }

  async function loadLessons() {
    let allLessons;
    try {
      allLessons = await API.get(`/course/pairs/${activePairId}/lessons`);
      API.cacheLessons(activePairId, allLessons);
    } catch (error) {
      allLessons = API.getCachedLessons(activePairId);
    }
    lessons = allLessons.filter((lesson) => lesson.content?.custom_topic === true);
  }

  function renderShell(container) {
    const pair = activePair();
    container.innerHTML = `
      <div class="view-header-row">
        <h1 data-i18n="lesson_generator.title"></h1>
      </div>
      <p class="lesson-meta" data-i18n="lesson_generator.subtitle"></p>
      <form id="lessonGeneratorForm" class="card">
        ${pairs.length > 1 ? `
          <label class="field-label" for="lessonLanguagePair" data-i18n="lesson_generator.language_pair"></label>
          <select id="lessonLanguagePair" name="language_pair_id">
            ${pairs.map((item) => `
              <option value="${item.id}" ${item.id === activePairId ? "selected" : ""}>
                ${escapeHtml(item.source_language)} → ${escapeHtml(item.target_language)} (${escapeHtml(item.current_level)})
              </option>`).join("")}
          </select>` : `
          <p class="lesson-meta">${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)} · ${escapeHtml(pair.current_level)}</p>`}
        <label class="field-label" for="lessonTopic" data-i18n="lesson_generator.topic_label"></label>
        <textarea id="lessonTopic" name="topic" maxlength="255" rows="3"
          placeholder="${escapeHtml(I18N.t("lesson_generator.topic_placeholder"))}" required></textarea>
        <button id="generateLessonButton" class="btn btn-primary" type="submit" data-i18n="lesson_generator.generate"></button>
      </form>
      <section id="generatedLesson"></section>
      <section id="customLessonHistory" class="card">
        <h3 data-i18n="lesson_generator.history"></h3>
        ${lessons.length ? lessons.map((lesson) => `
          <button class="btn btn-outline lesson-history-item" type="button" data-lesson-id="${lesson.id}">
            ${escapeHtml(lesson.title)}
            <span class="lesson-meta">${escapeHtml(lesson.topic || "")} · ${escapeHtml(lesson.level)}</span>
          </button>`).join("") : `
          <p class="lesson-meta" data-i18n="lesson_generator.history_empty"></p>`}
      </section>`;
    I18N.applyToDom(container);

    const pairSelector = document.getElementById("lessonLanguagePair");
    if (pairSelector) {
      pairSelector.addEventListener("change", async (event) => {
        activePairId = Number(event.currentTarget.value);
        localStorage.setItem("lingolion_active_pair_id", String(activePairId));
        try {
          await loadLessons();
          renderShell(container);
        } catch (error) {
          showLoadError(container, error);
        }
      });
    }

    document.getElementById("lessonGeneratorForm").addEventListener("submit", (event) => {
      event.preventDefault();
      generate(container, event.currentTarget);
    });
    container.querySelectorAll("[data-lesson-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const lesson = lessons.find((item) => item.id === Number(button.dataset.lessonId));
        if (lesson) renderLesson(container, lesson);
      });
    });
  }

  function showLoadError(container, error) {
    container.innerHTML = `
      <div class="card error-card">
        <p>${escapeHtml(error.message || I18N.t("auth.error_generic"))}</p>
      </div>`;
  }

  async function generate(container, form) {
    const topic = String(new FormData(form).get("topic") || "").trim();
    if (!topic) return;
    const button = document.getElementById("generateLessonButton");
    button.disabled = true;
    button.textContent = I18N.t("lesson_generator.generating");
    document.getElementById("generatedLesson").innerHTML = '<div class="spinner"></div>';
    try {
      const lesson = await API.post("/course/lessons/generate-custom", {
        language_pair_id: activePairId,
        topic,
      });
      API.cacheLesson(activePairId, lesson);
      lessons = [lesson, ...lessons.filter((item) => item.id !== lesson.id)];
      renderShell(container);
      renderLesson(container, lesson);
    } catch (error) {
      button.disabled = false;
      button.textContent = I18N.t("lesson_generator.generate");
      document.getElementById("generatedLesson").innerHTML = `
        <div class="card error-card"><p>${escapeHtml(error.message || I18N.t("auth.error_generic"))}</p></div>`;
    }
  }

  function renderLesson(container, lesson) {
    const content = lesson.content || {};
    const exercises = Array.isArray(content.exercises) ? content.exercises : [];
    const output = document.getElementById("generatedLesson");
    output.innerHTML = `
      <article class="card generated-lesson">
        <span class="badge level">${escapeHtml(lesson.level)}</span>
        <h2>${escapeHtml(lesson.title)}</h2>
        <p class="lesson-meta">${escapeHtml(lesson.topic || "")}</p>
        ${content.grammar_explanation ? `
          <section>
            <h3 data-i18n="course.grammar"></h3>
            <p>${escapeHtml(content.grammar_explanation)}</p>
          </section>` : ""}
        ${Array.isArray(content.vocabulary) && content.vocabulary.length ? `
          <section>
            <h3 data-i18n="course.vocabulary"></h3>
            ${content.vocabulary.map((item) => `
              <div class="vocab-item">
                <strong>${escapeHtml(item.word)}</strong>
                <span>${escapeHtml(item.translation)}</span>
              </div>
              ${item.example ? `<p class="lesson-meta">${escapeHtml(item.example)}</p>` : ""}`).join("")}
          </section>` : ""}
        ${Array.isArray(content.examples) && content.examples.length ? `
          <section>
            <h3 data-i18n="course.examples"></h3>
            <ul>${content.examples.map((example) => `<li>${escapeHtml(example)}</li>`).join("")}</ul>
          </section>` : ""}
        ${exercises.length ? `
          <section>
            <h3 data-i18n="course.exercises"></h3>
            ${exercises.map((exercise, exerciseIndex) => `
              <div class="exercise-block" data-exercise-block="${exerciseIndex}">
                <p><strong>${exerciseIndex + 1}.</strong> ${escapeHtml(exercise.question)}</p>
                ${(exercise.options || []).map((option, optionIndex) => `
                  <button type="button" class="option-btn" data-exercise-index="${exerciseIndex}" data-option-index="${optionIndex}">
                    ${escapeHtml(option)}
                  </button>`).join("")}
                <p class="lesson-meta" data-exercise-feedback="${exerciseIndex}" aria-live="polite"></p>
              </div>`).join("")}
          </section>` : ""}
      </article>`;
    I18N.applyToDom(output);

    output.querySelectorAll("[data-exercise-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const exerciseIndex = Number(button.dataset.exerciseIndex);
        const exercise = exercises[exerciseIndex];
        const buttons = output.querySelectorAll(`[data-exercise-index="${exerciseIndex}"]`);
        const selected = (exercise.options || [])[Number(button.dataset.optionIndex)];
        const isCorrect = selected === exercise.correct_answer;
        buttons.forEach((optionButton) => {
          optionButton.disabled = true;
          const option = (exercise.options || [])[Number(optionButton.dataset.optionIndex)];
          if (option === exercise.correct_answer) optionButton.classList.add("correct");
          else if (optionButton === button) optionButton.classList.add("incorrect");
        });
        const feedback = output.querySelector(`[data-exercise-feedback="${exerciseIndex}"]`);
        feedback.textContent = `${I18N.t(isCorrect ? "lesson_generator.correct" : "lesson_generator.incorrect")}${exercise.explanation ? ` ${exercise.explanation}` : ""}`;
      });
    });
  }

  async function render(container) {
    pairs = await API.get("/course/pairs");
    const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
    activePairId = pairs.some((pair) => pair.id === savedPairId) ? savedPairId : pairs[0]?.id ?? null;
    if (!pairs.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📚</div>
          <p data-i18n="lesson_generator.no_language_pair"></p>
        </div>`;
      I18N.applyToDom(container);
      return;
    }
    localStorage.setItem("lingolion_active_pair_id", String(activePairId));
    await loadLessons();
    renderShell(container);
  }

  return { render };
})();
