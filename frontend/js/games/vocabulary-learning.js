const VocabularyLearningGame = (() => {
  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
  }

  function render(gameArea, content, options) {
    const {
      pairId,
      showToast,
      speakGameText,
      submitScore,
      sourceLanguageCode,
      targetLanguageCode,
    } = options;

    // "Back to topics" row, rebuilt on every screen so the learner can leave a
    // running session at any point.
    const backRowHtml = () =>
      `<div class="activity-back-row"><button class="btn btn-outline topic-back" id="vocabularyBackBtn" type="button"><span aria-hidden="true">←</span><span data-i18n="games.back_to_games"></span></button></div>`;

    function bindBack() {
      document.getElementById("vocabularyBackBtn")?.addEventListener("click", () => {
        options.onBack?.();
      });
    }

    const items = content.pairs || [];
    let firstPassIndex = 0;
    let reviewIndex = 0;
    let phase = "learn";
    const reviewQueue = [];
    const knownWords = new Set();
    const reviewedAgainWords = new Set();

    function showSummary() {
      const score = Math.round((knownWords.size / items.length) * 100);
      gameArea.innerHTML = `
        ${backRowHtml()}
        <div class="card vocabulary-learning-summary">
          <div class="vocabulary-learning-summary-icon" aria-hidden="true">${score === 100 ? "🏆" : "📚"}</div>
          <p class="lesson-meta" data-i18n="games.learning_complete"></p>
          <h2>${score}%</h2>
          <p id="vocabularyWordsLearned"></p>
          <p class="lesson-meta" id="vocabularyWordsToReview"></p>
          <button class="btn btn-primary" id="restartVocabularyLearning" type="button" data-i18n="games.review_words"></button>
        </div>`;
      I18N.applyToDom(gameArea);
      bindBack();
      document.getElementById("vocabularyWordsLearned").textContent =
        I18N.t("games.words_learned", { count: knownWords.size, total: items.length });
      document.getElementById("vocabularyWordsToReview").textContent =
        I18N.t("games.words_to_review", { count: reviewedAgainWords.size });
      submitScore("vocabulary_learning", score, pairId);
      document.getElementById("restartVocabularyLearning").addEventListener("click", () => {
        firstPassIndex = 0;
        reviewIndex = 0;
        phase = "learn";
        reviewQueue.length = 0;
        knownWords.clear();
        reviewedAgainWords.clear();
        showCard();
      });
    }

    function showCard() {
      if (phase === "learn" && firstPassIndex >= items.length) {
        if (!reviewQueue.length) {
          showSummary();
          return;
        }
        phase = "review";
        reviewIndex = 0;
      }
      if (phase === "review" && reviewIndex >= reviewQueue.length) {
        showSummary();
        return;
      }

      const isReview = phase === "review";
      const index = isReview ? reviewIndex : firstPassIndex;
      const item = isReview ? reviewQueue[index] : items[index];
      const completed = isReview ? items.length + index : index;
      const totalCards = items.length + reviewQueue.length;
      const progress = isReview
        ? 50 + Math.round(((reviewIndex + 1) / reviewQueue.length) * 50)
        : Math.round(((firstPassIndex + 1) / items.length) * 50);
      gameArea.innerHTML = `
        ${backRowHtml()}
        <div class="vocabulary-learning-progress" role="progressbar" aria-label="${escapeHtml(I18N.t("games.learning_progress"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <span style="width:${progress}%"></span>
        </div>
        <div class="card game-round vocabulary-learning-card">
          <div class="vocabulary-learning-card-meta">
            <span>${escapeHtml(I18N.t(isReview ? "games.review_round" : "games.learn_round"))}</span>
            <span>${completed + 1}/${totalCards}</span>
          </div>
          <h2 class="vocabulary-learning-word" ${targetLanguageCode ? `lang="${escapeHtml(targetLanguageCode)}"` : ""}>${escapeHtml(item.word)}</h2>
          <button class="icon-btn vocabulary-pronunciation" id="playVocabularyWord" type="button" aria-label="${escapeHtml(I18N.t("games.play_word"))}" title="${escapeHtml(I18N.t("games.play_word"))}">🔊</button>
          <button class="btn btn-outline" id="revealVocabularyTranslation" type="button" data-i18n="games.reveal_word"></button>
          <p class="vocabulary-learning-translation hidden" id="vocabularyTranslation" ${sourceLanguageCode ? `lang="${escapeHtml(sourceLanguageCode)}"` : ""}>${escapeHtml(item.translation)}</p>
          <p class="vocabulary-learning-hint" data-i18n="games.vocabulary_hint"></p>
          <div class="vocabulary-learning-actions hidden" id="vocabularyLearningActions">
            <button class="btn btn-secondary" type="button" data-known="false" data-i18n="games.practice_word_again"></button>
            <button class="btn btn-primary" type="button" data-known="true" data-i18n="games.know_word"></button>
          </div>
        </div>`;
      I18N.applyToDom(gameArea);
      bindBack();
      document.getElementById("playVocabularyWord").addEventListener("click", () => {
        if (!speakGameText(item.word)) showToast(I18N.t("games.audio_unavailable"), "error");
      });
      document.getElementById("revealVocabularyTranslation").addEventListener("click", (event) => {
        document.getElementById("vocabularyTranslation").classList.remove("hidden");
        document.getElementById("vocabularyLearningActions").classList.remove("hidden");
        event.currentTarget.disabled = true;
      });
      gameArea.querySelectorAll("[data-known]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.known === "true") {
            knownWords.add(item.word);
            reviewedAgainWords.delete(item.word);
          } else if (isReview) {
            reviewedAgainWords.add(item.word);
          } else {
            reviewQueue.push(item);
          }
          if (isReview) reviewIndex++;
          else firstPassIndex++;
          showCard();
        });
      });
    }

    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showCard();
  }

  return { render };
})();
