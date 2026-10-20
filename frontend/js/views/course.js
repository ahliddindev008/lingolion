const CourseView = (() => {
  let pairs = [];
  let activePairId = null;
  const PAIRS_CACHE_KEY = "lingolion_course_pairs";

  function readCache(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* Cached lessons are optional when storage is unavailable. */
    }
  }

  async function render(container, { showToast }) {
    let isOffline = !navigator.onLine;
    try {
      pairs = await API.get("/course/pairs");
      writeCache(PAIRS_CACHE_KEY, pairs);
    } catch (error) {
      pairs = readCache(PAIRS_CACHE_KEY, []);
      isOffline = true;
    }
    const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
    activePairId = pairs.some((pair) => pair.id === savedPairId)
      ? savedPairId
      : pairs.some((pair) => pair.id === activePairId) ? activePairId : pairs[0]?.id ?? null;
    const activePair = pairs.find((pair) => pair.id === activePairId);

    if (!pairs.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📚</div>
          <p data-i18n="${isOffline ? "course.offline_empty" : "course.no_lessons"}"></p>
        </div>`;
      I18N.applyToDom(container);
      return;
    }
    let lessons = [];
    try {
      lessons = await API.get(`/course/pairs/${activePairId}/lessons`);
    } catch (error) {
      lessons = API.getCachedLessons(activePairId);
      isOffline = true;
    }
    lessons = lessons.filter((lesson) => !isUnavailableLesson(lesson));
    API.cacheLessons(activePairId, lessons);
    let curriculum;
    try {
      curriculum = await API.get(`/course/pairs/${activePairId}/curriculum`);
      writeCache(`lingolion_curriculum_${activePairId}`, curriculum);
    } catch (error) {
      curriculum = readCache(`lingolion_curriculum_${activePairId}`, buildOfflineCurriculum(activePair, lessons));
      isOffline = true;
    }
    renderShell(container, lessons, curriculum, showToast, isOffline);
  }

  function rerender(container, showToast) {
    return render(container, { showToast });
  }

  function buildOfflineCurriculum(pair, lessons) {
    const levelLessons = lessons.filter((lesson) => !isUnavailableLesson(lesson) && lesson.content?.offline !== true && lesson.level === pair.current_level && lesson.content?.course_unit);
    const byUnit = new Map(levelLessons.map((lesson) => [lesson.content.course_unit, lesson]));
    const units = Array.from({ length: 50 }, (_, index) => {
      const unitNumber = index + 1;
      const lesson = byUnit.get(unitNumber);
      const passed = Boolean(lesson?.is_completed && (lesson.score || 0) >= 80);
      return {
        unit_number: unitNumber,
        lesson_type: lesson?.content?.lesson_type || ["grammar", "practice", "speaking", "writing", "listening"][index % 5],
        lesson_id: lesson?.id || null,
        title: lesson?.title || null,
        score: lesson?.score ?? null,
        status: passed ? "completed" : "locked",
      };
    });
    const next = units.find((unit) => unit.status !== "completed");
    if (next) next.status = "available";
    return {
      level: pair.current_level,
      unit_count: 50,
      required_score: 80,
      completed_count: units.filter((unit) => unit.status === "completed").length,
      units,
      exam: { status: units.every((unit) => unit.status === "completed") ? "available" : "locked", lesson_id: null },
    };
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function isUnavailableLesson(lesson) {
    return lesson.content?.grammar_explanation === "Lesson content is temporarily unavailable. Please try again shortly.";
  }

  function pairSelectorHtml() {
    if (pairs.length <= 1) return "";
    return `
      <select id="pairSelector" style="margin-bottom:14px;">
        ${pairs.map((p) => `<option value="${p.id}" ${p.id === activePairId ? "selected" : ""}>${p.source_language} → ${p.target_language} (${p.current_level})</option>`).join("")}
      </select>`;
  }

  function renderShell(container, lessons, curriculum, showToast, isOffline) {
    const activePair = pairs.find((p) => p.id === activePairId);
    container.innerHTML = `
      ${isOffline ? `<p class="offline-notice" data-i18n="course.offline_banner"></p>` : ""}
      <div class="card">
        ${pairSelectorHtml()}
        <p><span class="badge level">${activePair.current_level}</span>&nbsp; ${activePair.source_language} → ${activePair.target_language}</p>
        <div class="course-action-grid"><button class="btn btn-outline" id="placementBtn" data-i18n="course.placement" ${isOffline ? "disabled" : ""}></button></div>
        <div class="course-progress-summary">
          <strong>${escapeHtml(I18N.t("course.unit_progress", { completed: curriculum.completed_count, total: curriculum.unit_count }))}</strong>
          <span class="badge level">${escapeHtml(curriculum.required_score)}%</span>
        </div>
        <div class="skill-meter-track"><div class="skill-meter-fill" style="width:${Math.round((curriculum.completed_count / curriculum.unit_count) * 100)}%"></div></div>
      </div>
      ${curriculumHtml(curriculum, isOffline)}
    `;
    I18N.applyToDom(container);

    const selector = document.getElementById("pairSelector");
    if (selector) {
      selector.addEventListener("change", async (e) => {
        activePairId = parseInt(e.target.value, 10);
        localStorage.setItem("lingolion_active_pair_id", String(activePairId));
        await rerender(container, showToast);
      });
    }

    const placementButton = document.getElementById("placementBtn");
    if (placementButton) {
      placementButton.addEventListener("click", () => startPlacementTest(container, showToast));
    }
    container.querySelectorAll("[data-course-unit]").forEach((button) => {
      button.addEventListener("click", () => openCourseUnit(container, Number(button.dataset.courseUnit), curriculum, lessons, showToast));
    });
    const levelExamButton = document.getElementById("startLevelExamBtn");
    if (levelExamButton) {
      levelExamButton.addEventListener("click", () => openLevelExam(container, curriculum, lessons, showToast));
    }
  }

  function curriculumHtml(curriculum, isOffline) {
    const statusLabels = {
      available: I18N.t("course.unit_available"),
      completed: I18N.t("course.unit_completed"),
      locked: I18N.t("course.unit_locked_short"),
    };
    return `
      <section class="card curriculum-card">
        <div class="curriculum-heading"><h3 data-i18n="course.level_curriculum"></h3><span class="badge level">${escapeHtml(curriculum.level)}</span></div>
        <p class="lesson-meta" data-i18n="course.unit_lock_rule"></p>
        <div class="curriculum-unit-grid">
          ${curriculum.units.map((unit) => {
            const disabled = unit.status === "locked" || (isOffline && !unit.lesson_id);
            const typeLabel = I18N.t(`course.type_${unit.lesson_type}`);
            const statusLabel = statusLabels[unit.status];
            return `
              <button class="curriculum-unit ${unit.status}" type="button" data-course-unit="${unit.unit_number}" ${disabled ? "disabled" : ""} aria-label="${escapeHtml(I18N.t("course.unit_accessible", { number: unit.unit_number, type: typeLabel, status: statusLabel }))}">
                <strong>${unit.unit_number}</strong>
                <span>${escapeHtml(typeLabel)}</span>
                <small>${unit.status === "completed" ? `✓ ${unit.score}%` : unit.status === "available" && unit.score !== null ? `${I18N.t("course.retry_unit")} · ${unit.score}%` : escapeHtml(statusLabel)}</small>
              </button>`;
          }).join("")}
        </div>
        <div class="level-exam-row">
          <div><strong data-i18n="course.final_exam"></strong><p class="lesson-meta" data-i18n="course.final_exam_rule"></p></div>
          <button id="startLevelExamBtn" class="btn btn-primary" type="button" data-i18n="${curriculum.exam.status === "passed" ? "course.exam_passed" : curriculum.exam.lesson_id ? "course.exam_retry" : "course.start_exam"}" ${curriculum.exam.status === "locked" || (isOffline && !curriculum.exam.lesson_id) ? "disabled" : ""}></button>
        </div>
      </section>`;
  }

  async function openCourseUnit(container, unitNumber, curriculum, lessons, showToast) {
    const unit = curriculum.units.find((item) => item.unit_number === unitNumber);
    if (!unit || unit.status === "locked") return;
    if (unit.lesson_id) {
      const savedLesson = lessons.find((lesson) => lesson.id === unit.lesson_id);
      if (
        unit.lesson_type === "speaking"
        && savedLesson
        && (!Array.isArray(savedLesson.content?.conversation) || savedLesson.content.conversation.length !== 4)
        && navigator.onLine
      ) {
        container.innerHTML = `<div class="spinner"></div>`;
        try {
          const lesson = await API.post("/course/lessons/generate", {
            language_pair_id: activePairId,
            unit_number: unit.unit_number,
            lesson_type: unit.lesson_type,
          });
          API.cacheLesson(activePairId, lesson);
          const updatedLessons = lessons.filter((item) => item.id !== lesson.id).concat(lesson);
          openLesson(container, lesson.id, updatedLessons, showToast, () => rerender(container, showToast));
        } catch (error) {
          const message = error.message === "speaking_conversation_unavailable"
            ? I18N.t("course.speaking_conversation_unavailable")
            : error.message || I18N.t("auth.error_generic");
          showToast(message, "error");
          await rerender(container, showToast);
        }
        return;
      }
      openLesson(container, unit.lesson_id, lessons, showToast, () => rerender(container, showToast));
      return;
    }
    container.innerHTML = `<div class="spinner"></div>`;
    try {
      const lesson = await API.post("/course/lessons/generate", {
        language_pair_id: activePairId,
        unit_number: unit.unit_number,
        lesson_type: unit.lesson_type,
      });
      API.cacheLesson(activePairId, lesson);
      openLesson(container, lesson.id, [...lessons, lesson], showToast, () => rerender(container, showToast));
    } catch (error) {
      const message = error.message === "lesson_content_unavailable"
        ? I18N.t("course.lesson_unavailable")
        : error.message === "speaking_conversation_unavailable"
          ? I18N.t("course.speaking_conversation_unavailable")
        : error.message || I18N.t("auth.error_generic");
      showToast(message, "error");
      await rerender(container, showToast);
    }
  }

  async function openLevelExam(container, curriculum, lessons, showToast) {
    if (curriculum.exam.status === "locked") return;
    if (curriculum.exam.lesson_id) {
      openLesson(container, curriculum.exam.lesson_id, lessons, showToast, () => rerender(container, showToast));
      return;
    }
    container.innerHTML = `<div class="spinner"></div>`;
    try {
      const exam = await API.post(`/course/pairs/${activePairId}/exam`, {});
      API.cacheLesson(activePairId, exam);
      openLesson(container, exam.id, [...lessons, exam], showToast, () => rerender(container, showToast));
    } catch (error) {
      showToast(error.message || I18N.t("auth.error_generic"), "error");
      await rerender(container, showToast);
    }
  }

  function openLesson(container, lessonId, lessons, showToast, onBack = () => rerender(container, showToast)) {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    const content = lesson.content || {};
    const lessonType = content.lesson_type || "grammar";
    const courseUnit = content.course_unit;
    const vocabulary = content.vocabulary || [];
    const examples = content.examples || [];
    const exercises = content.exercises || [];
    const listeningExercises = content.listening_exercises || [];
    const conversation = (Array.isArray(content.conversation) ? content.conversation : [])
      .filter((turn) => turn && (turn.partner_line || turn.prompt || turn.model_answer))
      .map((turn) => ({
        partnerLine: String(turn.partner_line || ""),
        prompt: String(turn.prompt || ""),
        modelAnswer: String(turn.model_answer || ""),
        keywords: Array.isArray(turn.keywords) ? turn.keywords.map(String).filter(Boolean) : [],
      }));
    if (lessonType === "speaking" && !conversation.length) {
      conversation.push({
        partnerLine: "",
        prompt: String(content.activity_prompt || ""),
        modelAnswer: String(content.model_answer || ""),
        keywords: Array.isArray(content.keywords) ? content.keywords.map(String).filter(Boolean) : [],
      });
    }
    const isPassed = lesson.is_completed && (lesson.score || 0) >= 80;
    const isExam = lessonType === "exam";
    let activityMarkup = "";
    if (lessonType === "speaking") {
      const firstTurn = conversation[0];
      activityMarkup = `
        <section class="card course-activity-card speaking-conversation">
          <div class="conversation-heading">
            <h3 data-i18n="course.speaking_conversation"></h3>
            <span id="conversationProgress" class="badge level"></span>
          </div>
          <div id="speakingTranscript" class="speaking-transcript" aria-live="polite">
            ${firstTurn.partnerLine ? `<article class="conversation-message partner-message">
              <strong data-i18n="course.conversation_partner"></strong>
              <p>${escapeHtml(firstTurn.partnerLine)}</p>
              <button class="icon-btn" type="button" data-speak-line="${escapeHtml(firstTurn.partnerLine)}" aria-label="${escapeHtml(I18N.t("course.listen_partner"))}" title="${escapeHtml(I18N.t("course.listen_partner"))}">🔊</button>
            </article>` : ""}
            <p class="conversation-prompt">${escapeHtml(firstTurn.prompt)}</p>
          </div>
          <label for="courseActivityAnswer" data-i18n="course.activity_answer"></label>
          <textarea id="courseActivityAnswer" rows="4" maxlength="2000" data-i18n-placeholder="course.activity_answer_placeholder"></textarea>
          <button class="btn btn-outline" id="recordCourseAnswer" type="button" data-i18n="course.record_answer"></button>
          <button class="btn btn-secondary" id="checkCourseActivity" type="button" data-i18n="course.check_activity"></button>
          <p id="courseActivityResult" class="lesson-meta" aria-live="polite"></p>
        </section>`;
    } else if (lessonType === "writing") {
      activityMarkup = `
        <section class="card course-activity-card">
          <h3 data-i18n="course.type_writing"></h3>
          <p>${escapeHtml(content.activity_prompt || "")}</p>
          <label for="courseActivityAnswer" data-i18n="course.activity_answer"></label>
          <textarea id="courseActivityAnswer" rows="4" maxlength="2000" data-i18n-placeholder="course.activity_answer_placeholder"></textarea>
          <details class="model-answer"><summary data-i18n="course.show_model_answer"></summary><p>${escapeHtml(content.model_answer || "")}</p></details>
          <button class="btn btn-secondary" id="checkCourseActivity" type="button" data-i18n="course.check_activity"></button>
          <p id="courseActivityResult" class="lesson-meta" aria-live="polite"></p>
        </section>`;
    } else if (lessonType === "listening") {
      activityMarkup = `
        <section class="card course-activity-card">
          <h3 data-i18n="course.type_listening"></h3>
          ${listeningExercises.map((item, index) => `
            <div class="course-listening-item" data-listening-item="${index}">
              <button class="btn btn-outline" type="button" data-listen-index="${index}">🔊 <span data-i18n="course.play_listening"></span></button>
              <p>${escapeHtml(item.question)}</p>
              ${(item.options || []).map((option) => `<button type="button" class="option-btn" data-correct="${option === item.correct_answer}">${escapeHtml(option)}</button>`).join("")}
              <span class="listening-hidden-text hidden">${escapeHtml(item.text)}</span>
            </div>`).join("")}
          <p id="listeningResult" class="lesson-meta" aria-live="polite"></p>
        </section>`;
    }
    const showGrammar = lessonType === "grammar" || (lessonType === "practice" && Boolean(content.grammar_explanation));
    const showExercises = lessonType === "grammar" || lessonType === "practice" || isExam;

    container.innerHTML = `
      <button class="link-btn" id="backBtn">← ${I18N.t("course.back_to_curriculum")}</button>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="lesson-meta">${courseUnit && courseUnit <= 50 ? escapeHtml(I18N.t("course.unit_number", { number: courseUnit, total: 50 })) : isExam ? escapeHtml(I18N.t("course.final_exam")) : ""}</p>
      ${showGrammar ? `<div class="card">
        <h3 data-i18n="course.grammar"></h3>
        <p>${escapeHtml(content.grammar_explanation || "")}</p>
      </div>` : ""}
      ${vocabulary.length ? `<div class="card">
        <h3 data-i18n="course.vocabulary"></h3>
        ${vocabulary.map((v, index) => `
          <div class="vocab-item vocab-practice-row">
            <div><strong>${escapeHtml(v.word)}</strong><span>${escapeHtml(v.translation)}</span></div>
            <div class="vocab-practice-actions">
              <button class="icon-btn" type="button" data-speak-word="${index}" aria-label="${escapeHtml(I18N.t("course.listen_word"))}" title="${escapeHtml(I18N.t("course.listen_word"))}">🔊</button>
              <button class="icon-btn" type="button" data-pronounce-word="${index}" aria-label="${escapeHtml(I18N.t("course.speak_word"))}" title="${escapeHtml(I18N.t("course.speak_word"))}">🎙</button>
            </div>
          </div>`).join("")}
      </div>` : ""}
      ${examples.length ? `<div class="card">
        <h3 data-i18n="course.examples"></h3>
        ${examples.map((ex) => `<p>• ${escapeHtml(ex)}</p>`).join("")}
      </div>` : ""}
      ${activityMarkup}
      ${showExercises ? `<div class="card">
        <h3 data-i18n="course.exercises"></h3>
        <div id="exercisesContainer">
          ${exercises.map((ex, i) => exerciseHtml(ex, i)).join("")}
        </div>
      </div>` : ""}
      ${!isPassed ? `<button class="btn btn-primary" id="completeBtn" data-i18n="${lesson.is_completed ? "course.retry_lesson" : "course.complete_lesson"}"></button>` : `<p class="badge level">${escapeHtml(I18N.t("course.unit_passed_score", { score: lesson.score }))}</p>`}
    `;
    I18N.applyToDom(container);

    container.querySelectorAll("[data-speak-word]").forEach((button) => {
      button.addEventListener("click", () => speakWord(vocabulary[Number(button.dataset.speakWord)].word));
    });
    container.querySelectorAll("[data-pronounce-word]").forEach((button) => {
      button.addEventListener("click", () => practiceWord(vocabulary[Number(button.dataset.pronounceWord)].word, showToast));
    });

    let correctCount = 0;
    let listeningCorrect = 0;
    let listeningAnswered = 0;
    let activityScore = null;
    let conversationTurnIndex = 0;
    const conversationScores = [];

    function updateConversationProgress() {
      const progress = document.getElementById("conversationProgress");
      if (progress) {
        progress.textContent = I18N.t("course.conversation_turn_progress", {
          current: Math.min(conversationTurnIndex + 1, conversation.length),
          total: conversation.length,
        });
      }
    }

    function appendPartnerTurn(turn) {
      const transcript = document.getElementById("speakingTranscript");
      if (turn.partnerLine) {
        transcript.insertAdjacentHTML("beforeend", `
          <article class="conversation-message partner-message">
            <strong>${escapeHtml(I18N.t("course.conversation_partner"))}</strong>
            <p>${escapeHtml(turn.partnerLine)}</p>
            <button class="icon-btn" type="button" data-speak-line="${escapeHtml(turn.partnerLine)}" aria-label="${escapeHtml(I18N.t("course.listen_partner"))}" title="${escapeHtml(I18N.t("course.listen_partner"))}">🔊</button>
          </article>`);
      }
      if (turn.prompt) {
        transcript.insertAdjacentHTML("beforeend", `<p class="conversation-prompt">${escapeHtml(turn.prompt)}</p>`);
      }
    }

    function submitSpeakingTurn() {
      const answerField = document.getElementById("courseActivityAnswer");
      const answer = answerField.value.trim();
      if (!answer) {
        showToast(I18N.t("course.activity_answer_required"), "error");
        return;
      }
      const turn = conversation[conversationTurnIndex];
      const normalizedAnswer = answer.normalize("NFC").toLocaleLowerCase();
      const keywords = turn.keywords.length
        ? turn.keywords
        : (Array.isArray(content.keywords) ? content.keywords.map(String).filter(Boolean) : []);
      const matches = keywords
        .map((keyword) => keyword.normalize("NFC").toLocaleLowerCase())
        .filter((keyword) => normalizedAnswer.includes(keyword)).length;
      const score = keywords.length ? Math.round((matches / keywords.length) * 100) : (answer ? 100 : 0);
      conversationScores.push(score);

      const transcript = document.getElementById("speakingTranscript");
      transcript.insertAdjacentHTML("beforeend", `
        <article class="conversation-message learner-message">
          <strong>${escapeHtml(I18N.t("course.conversation_you"))}</strong>
          <p>${escapeHtml(answer)}</p>
        </article>
        <p class="conversation-feedback">${escapeHtml(I18N.t("course.conversation_turn_feedback", { score }))}</p>
        ${turn.modelAnswer ? `<details class="model-answer">
          <summary>${escapeHtml(I18N.t("course.show_model_answer"))}</summary>
          <p>${escapeHtml(turn.modelAnswer)}</p>
        </details>` : ""}`);
      conversationTurnIndex++;
      answerField.value = "";
      const result = document.getElementById("courseActivityResult");
      if (conversationTurnIndex < conversation.length) {
        appendPartnerTurn(conversation[conversationTurnIndex]);
        updateConversationProgress();
        result.textContent = "";
      } else {
        activityScore = Math.round(conversationScores.reduce((total, value) => total + value, 0) / conversationScores.length);
        result.textContent = I18N.t("course.activity_score", { score: activityScore });
        const submitButton = document.getElementById("checkCourseActivity");
        submitButton.disabled = true;
      }
      transcript.scrollTop = transcript.scrollHeight;
    }

    container.querySelectorAll(".exercise-block").forEach((block, idx) => {
      const correctAnswer = exercises[idx].correct_answer;
      block.querySelectorAll(".option-btn").forEach((optBtn) => {
        optBtn.addEventListener("click", () => {
          if (block.dataset.answered) return;
          block.dataset.answered = "1";
          const isCorrect = optBtn.textContent.trim() === String(correctAnswer).trim();
          optBtn.classList.add(isCorrect ? "correct" : "incorrect");
          if (isCorrect) correctCount++;
        });
      });
    });

    container.querySelectorAll("[data-listen-index]").forEach((button) => {
      const itemIndex = Number(button.dataset.listenIndex);
      button.addEventListener("click", () => speakWord(listeningExercises[itemIndex]?.text || ""));
    });
    container.querySelectorAll("[data-listening-item]").forEach((block) => {
      block.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const isCorrect = button.dataset.correct === "true";
          if (isCorrect) listeningCorrect++;
          listeningAnswered++;
          block.querySelectorAll(".option-btn").forEach((option) => {
            option.disabled = true;
            if (option.dataset.correct === "true") option.classList.add("correct");
            else if (option === button) option.classList.add("incorrect");
          });
          const listeningResult = document.getElementById("listeningResult");
          if (listeningResult) listeningResult.textContent = `${listeningCorrect}/${listeningAnswered}`;
        });
      });
    });

    const checkActivityButton = document.getElementById("checkCourseActivity");
    if (checkActivityButton) {
      checkActivityButton.addEventListener("click", () => {
        if (lessonType === "speaking") {
          submitSpeakingTurn();
          return;
        }
        const answer = document.getElementById("courseActivityAnswer").value.normalize("NFC").toLocaleLowerCase();
        const keywords = (content.keywords || []).map((keyword) => String(keyword).normalize("NFC").toLocaleLowerCase()).filter(Boolean);
        const matches = keywords.filter((keyword) => answer.includes(keyword)).length;
        activityScore = keywords.length ? Math.round((matches / keywords.length) * 100) : answer.trim() ? 100 : 0;
        document.getElementById("courseActivityResult").textContent = I18N.t("course.activity_score", { score: activityScore });
      });
    }
    const recordButton = document.getElementById("recordCourseAnswer");
    if (recordButton) {
      recordButton.addEventListener("click", () => {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) {
          showToast(I18N.t("course.speech_unavailable"), "error");
          return;
        }
        const pair = pairs.find((item) => item.id === activePairId);
        const recognition = new Recognition();
        recognition.lang = SpeechUtils.languageCode(pair?.target_language);
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const answerField = document.getElementById("courseActivityAnswer");
          if (answerField) answerField.value = event.results[0][0].transcript;
        };
        recognition.onerror = () => showToast(I18N.t("course.speech_retry"), "error");
        try { recognition.start(); } catch (error) { showToast(I18N.t("course.speech_unavailable"), "error"); }
      });
    }
    const speakingTranscript = document.getElementById("speakingTranscript");
    if (speakingTranscript) {
      speakingTranscript.addEventListener("click", (event) => {
        const button = event.target.closest("[data-speak-line]");
        if (button) speakWord(button.dataset.speakLine);
      });
      updateConversationProgress();
    }

    document.getElementById("backBtn").addEventListener("click", onBack);

    const completeBtn = document.getElementById("completeBtn");
    if (completeBtn) {
      completeBtn.addEventListener("click", async () => {
        completeBtn.disabled = true;
        let score = 0;
        if (lessonType === "speaking" || lessonType === "writing") {
          if (activityScore === null) {
            showToast(I18N.t("course.check_activity_first"), "error");
            completeBtn.disabled = false;
            return;
          }
          score = activityScore;
        } else if (lessonType === "listening") {
          if (!listeningExercises.length || listeningAnswered < listeningExercises.length) {
            showToast(I18N.t("course.finish_listening_first"), "error");
            completeBtn.disabled = false;
            return;
          }
          score = Math.round((listeningCorrect / listeningExercises.length) * 100);
        } else {
          score = Math.round((correctCount / (exercises.length || 1)) * 100);
        }
        try {
          await API.post("/course/lessons/complete", { lesson_id: lesson.id, score });
          showToast(`+XP! ${score}%`, "success");
          await rerender(container, showToast);
        } catch (err) {
          showToast(err.message, "error");
          completeBtn.disabled = false;
        }
      });
    }
  }

  async function startPlacementTest(container, showToast) {
    container.innerHTML = `<div class="spinner"></div>`;
    try {
      const test = await API.get(`/course/placement-test/${activePairId}`);
      renderPlacementQuestions(container, test.items || [], showToast);
    } catch (error) {
      showToast(error.message || I18N.t("auth.error_generic"), "error");
      await rerender(container, showToast);
    }
  }

  function renderPlacementQuestions(container, items, showToast) {
    if (!items.length) {
      showToast(I18N.t("course.assessment_unavailable"), "error");
      rerender(container, showToast);
      return;
    }
    container.innerHTML = `
      <button class="link-btn" id="assessmentBackBtn">← ${I18N.t("common.close")}</button>
      <h1 data-i18n="course.placement"></h1>
      <p class="lesson-meta" data-i18n="course.assessment_intro"></p>
      <form class="card placement-form" id="placementForm">
        ${items.map((item, index) => `
          <fieldset class="placement-question">
            <legend>${index + 1}. ${escapeHtml(item.question)}</legend>
            <span class="badge level">${escapeHtml(item.level)}</span>
            ${(item.options || []).map((option) => `
              <label class="placement-option">
                <input type="radio" name="question-${index}" value="${escapeHtml(option)}" required />
                <span>${escapeHtml(option)}</span>
              </label>`).join("")}
          </fieldset>`).join("")}
        <button class="btn btn-primary" type="submit" data-i18n="course.assessment_finish"></button>
      </form>`;
    I18N.applyToDom(container);
    document.getElementById("assessmentBackBtn").addEventListener("click", () => rerender(container, showToast));
    document.getElementById("placementForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const correctByLevel = Object.fromEntries(["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => [level, { correct: 0, total: 0 }]));
      let correctCount = 0;
      items.forEach((item, index) => {
        const result = correctByLevel[item.level] || (correctByLevel[item.level] = { correct: 0, total: 0 });
        result.total++;
        if (formData.get(`question-${index}`) === item.correct_answer) {
          result.correct++;
          correctCount++;
        }
      });
      let level = "A1";
      for (const candidate of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
        const result = correctByLevel[candidate];
        if (!result.total || result.correct / result.total < 0.5) break;
        level = candidate;
      }
      const score = Math.round((correctCount / items.length) * 100);
      try {
        await API.post(`/course/placement-test/${activePairId}`, { level, score });
        showToast(I18N.t("course.assessment_result", { level }), "success");
        await rerender(container, showToast);
      } catch (error) {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });
  }

  async function startReview(container, showToast) {
    container.innerHTML = `<div class="spinner"></div>`;
    try {
      const items = await API.get("/course/review");
      renderReviewCard(container, items || [], 0, showToast);
    } catch (error) {
      const items = cachedReviewItems();
      if (items.length) {
        renderReviewCard(container, items, 0, showToast);
      } else {
        showToast(error.message || I18N.t("auth.error_generic"), "error");
        await rerender(container, showToast);
      }
    }
  }

  function cachedReviewItems() {
    const seenWords = new Set();
    return pairs.flatMap((pair) => API.getCachedLessons(pair.id))
      .flatMap((lesson) => (lesson.content?.vocabulary || []).map((vocabulary) => {
        const word = String(vocabulary.word || "").trim();
        const key = word.toLocaleLowerCase();
        if (!word || seenWords.has(key)) return null;
        seenWords.add(key);
        const score = lesson.score || 0;
        return {
          word,
          translation: vocabulary.translation || "",
          example: vocabulary.example || "",
          status: lesson.is_completed && score >= 80 ? "mastered" : lesson.is_completed && score < 60 ? "retry" : "due_today",
        };
      }))
      .filter(Boolean)
      .slice(0, 8);
  }

  function renderReviewCard(container, items, index, showToast) {
    const item = items[index];
    if (!item) {
      container.innerHTML = `
        <button class="link-btn" id="reviewBackBtn">← ${I18N.t("common.close")}</button>
        <div class="empty-state"><p data-i18n="course.review_done"></p></div>`;
      I18N.applyToDom(container);
      document.getElementById("reviewBackBtn").addEventListener("click", () => rerender(container, showToast));
      return;
    }
    container.innerHTML = `
      <button class="link-btn" id="reviewBackBtn">← ${I18N.t("common.close")}</button>
      <section class="card review-card">
        <p class="lesson-meta">${index + 1}/${items.length}</p>
        <h2>${escapeHtml(item.word)}</h2>
        <div class="review-answer hidden" id="reviewAnswer">
          <strong>${escapeHtml(item.translation)}</strong>
          <p>${escapeHtml(item.example)}</p>
        </div>
        <button class="btn btn-outline" id="revealReviewBtn" data-i18n="course.review_show_answer"></button>
        <button class="btn btn-primary hidden" id="nextReviewBtn" data-i18n="${index + 1 < items.length ? "course.review_next" : "course.review_done"}"></button>
      </section>`;
    I18N.applyToDom(container);
    document.getElementById("reviewBackBtn").addEventListener("click", () => rerender(container, showToast));
    document.getElementById("revealReviewBtn").addEventListener("click", () => {
      document.getElementById("reviewAnswer").classList.remove("hidden");
      document.getElementById("nextReviewBtn").classList.remove("hidden");
      document.getElementById("revealReviewBtn").classList.add("hidden");
      speakWord(item.word);
    });
    document.getElementById("nextReviewBtn").addEventListener("click", () => renderReviewCard(container, items, index + 1, showToast));
  }

  async function showCertificate(container, showToast) {
    try {
      const certificate = await API.get(`/course/certificate/${activePairId}`);
      container.innerHTML = `
        <button class="link-btn no-print" id="certificateBackBtn">← ${I18N.t("common.close")}</button>
        <section class="certificate-panel">
          <p class="certificate-brand">LINGOLION</p>
          <h1 data-i18n="course.certificate_title"></h1>
          <p data-i18n="course.certificate_awarded"></p>
          <h2>${escapeHtml(certificate.learner_name)}</h2>
          <p>${escapeHtml(certificate.source_language)} → ${escapeHtml(certificate.target_language)}</p>
          <p>${escapeHtml(I18N.t("course.certificate_level", { level: certificate.level }))}</p>
          <p>${escapeHtml(I18N.t("course.certificate_lessons", { count: certificate.lessons_completed }))}</p>
          <p>${escapeHtml(I18N.t("course.certificate_average", { score: certificate.average_score }))}</p>
          <p>${escapeHtml(I18N.t("course.certificate_issued", { date: certificate.issued_on }))}</p>
          <button class="btn btn-primary no-print" id="printCertificateBtn" data-i18n="course.print_certificate"></button>
        </section>`;
      I18N.applyToDom(container);
      document.getElementById("certificateBackBtn").addEventListener("click", () => rerender(container, showToast));
      document.getElementById("printCertificateBtn").addEventListener("click", () => window.print());
    } catch (error) {
      const message = error.message?.includes("50 lessons") || error.message?.includes("All 50")
        ? I18N.t("course.certificate_requirement")
        : error.message || I18N.t("auth.error_generic");
      showToast(message, "error");
    }
  }

  function speakWord(word) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const pair = pairs.find((item) => item.id === activePairId);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = SpeechUtils.languageCode(pair?.target_language);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function practiceWord(word, showToast) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      showToast(I18N.t("course.speech_unavailable"), "error");
      return;
    }
    const pair = pairs.find((item) => item.id === activePairId);
    const recognition = new Recognition();
    recognition.lang = SpeechUtils.languageCode(pair?.target_language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript.trim().normalize("NFC").toLocaleLowerCase();
      const expected = String(word).trim().normalize("NFC").toLocaleLowerCase();
      const correct = spoken === expected;
      showToast(I18N.t(correct ? "course.speech_success" : "course.speech_retry"), correct ? "success" : "error");
    };
    recognition.onerror = () => showToast(I18N.t("course.speech_retry"), "error");
    recognition.start();
  }

  function exerciseHtml(ex, idx) {
    return `
      <div class="exercise-block">
        <p><strong>${idx + 1}.</strong> ${escapeHtml(ex.question)}</p>
        ${(ex.options || []).map((opt) => `<button type="button" class="option-btn">${escapeHtml(opt)}</button>`).join("")}
      </div>`;
  }

  return { render };
})();
