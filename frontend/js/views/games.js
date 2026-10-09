const GamesView = (() => {
  let pairs = [];
  let activePairId = Number(localStorage.getItem("lingolion_active_pair_id")) || null;
  let activityReturnFocus = null;
  let activityKeyHandlerBound = false;
  let speechRecorder = null;
  let speechTimeout = null;
  let speechCancelled = false;
  let activeGameTopicId = null;

  const translatorLanguages = [
    { code: "tg", label: "Тоҷикӣ" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "it", label: "Italiano" },
    { code: "tr", label: "Türkçe" },
    { code: "ar", label: "العربية" },
    { code: "fa", label: "فارسی" },
    { code: "zh-CN", label: "中文" },
    { code: "ja", label: "日本語" },
  ];

  const speechLanguageCodes = {
    tg: "tg-TJ", ru: "ru-RU", en: "en-US", de: "de-DE", fr: "fr-FR",
    es: "es-ES", it: "it-IT", tr: "tr-TR", ar: "ar-SA", fa: "fa-IR",
    "zh-CN": "zh-CN", ja: "ja-JP",
  };

  const languageCodes = {
    "тоҷикӣ": "tg", tajik: "tg", таджикский: "tg",
    "русский": "ru", russian: "ru",
    english: "en", "английский": "en",
    deutsch: "de", german: "de", "немецкий": "de",
    "олмонӣ": "de", "олмони": "de", "забони олмонӣ": "de",
    "немисӣ": "de", "немиси": "de", "забони немисӣ": "de",
    français: "fr", french: "fr", "французский": "fr",
    español: "es", spanish: "es", "испанский": "es",
    italiano: "it", italian: "it", "итальянский": "it",
    türkçe: "tr", turkish: "tr", "турецкий": "tr",
    العربية: "ar", arabic: "ar", "арабский": "ar",
    فارسی: "fa", persian: "fa", farsi: "fa", "персидский": "fa",
    中文: "zh-CN", chinese: "zh-CN", "китайский": "zh-CN",
    日本語: "ja", japanese: "ja", "японский": "ja",
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  async function render(container, { showToast }) {
    pairs = await API.get("/course/pairs");
    if (!pairs.length) {
      container.innerHTML = `<div class="empty-state"><div class="emoji">🎮</div><p data-i18n="course.no_lessons"></p></div>`;
      return;
    }

    const savedPairId = Number(localStorage.getItem("lingolion_active_pair_id"));
    activePairId = pairs.some((pair) => pair.id === savedPairId)
      ? savedPairId
      : pairs.some((pair) => pair.id === activePairId) ? activePairId : pairs[0].id;
    const games = [
      { type: "vocabulary_learning", icon: "🧠" },
      { type: "vocab_match", icon: "🧩" },
      { type: "translation", icon: "🔤" },
      { type: "speed_challenge", icon: "⚡" },
      { type: "multiple_choice", icon: "🎯" },
      { type: "word_scramble", icon: "🔀" },
      { type: "listening", titleKey: "listening_game", icon: "🎧" },
      { type: "speaking", icon: "🎙" },
      { type: "writing", icon: "✍️" },
      { type: "reading", icon: "📖" },
    ];
    container.innerHTML = `
      <div class="view-header-row games-heading">
        <h1 data-i18n="games.title"></h1>
      </div>
      ${pairs.length > 1 ? `
        <label class="games-pair-label" for="gamesPairSelector" data-i18n="games.language_pair"></label>
        <select class="games-pair-select" id="gamesPairSelector">
          ${pairs.map((pair) => `<option value="${pair.id}" ${pair.id === activePairId ? "selected" : ""}>${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</option>`).join("")}
        </select>` : ""}
      <div class="game-grid">
        ${games.map((game) => `
          <article class="card game-card">
            <div class="game-emoji" aria-hidden="true">${game.icon}</div>
            <h3 data-i18n="games.${game.titleKey || game.type}"></h3>
            <button class="btn btn-secondary play-btn" type="button" data-game="${game.type}" data-i18n="games.play"></button>
          </article>`).join("")}
        <article class="card game-card translator-card">
          <div class="game-emoji" aria-hidden="true">⇄</div>
          <h3 data-i18n="games.translator_title"></h3>
          <button class="btn btn-secondary play-btn" id="translatorToggleBtn" type="button" aria-controls="activityOverlay" data-i18n="games.open_translator"></button>
        </article>
        <article class="card game-card google-translate-card">
          <div class="game-emoji" aria-hidden="true">🌐</div>
          <h3 data-i18n="games.google_translate"></h3>
          <a class="btn btn-secondary play-btn" href="https://translate.google.com/" target="_blank" rel="noopener noreferrer" data-i18n="games.open_google_translate"></a>
        </article>
        <article class="card game-card topic-category-card">
          <div class="game-emoji" aria-hidden="true">📚</div>
          <h3 data-i18n="games.topic_category"></h3>
          <button class="btn btn-secondary" id="openTopicsBtn" type="button" data-i18n="games.open_topics"></button>
        </article>
        <article class="card game-card dialogue-category-card">
          <div class="game-emoji" aria-hidden="true">🗣</div>
          <h3 data-i18n="games.dialogue_category"></h3>
          <button class="btn btn-secondary" id="openDialoguesBtn" type="button" data-i18n="games.open_dialogues"></button>
        </article>
      </div>
      <div class="activity-overlay hidden" id="activityOverlay">
        <section class="activity-window" role="dialog" aria-modal="true" aria-labelledby="activityTitle" tabindex="-1">
          <header class="activity-window-header">
            <h2 id="activityTitle"></h2>
            <button class="icon-btn activity-close" id="closeActivityBtn" type="button" aria-label="Close activity" title="Close">×</button>
          </header>
          <div class="activity-window-body" id="gameArea"></div>
        </section>
      </div>
    `;
    I18N.applyToDom(container);
    if (!activityKeyHandlerBound) {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !document.getElementById("activityOverlay")?.classList.contains("hidden")) {
          closeActivity();
        }
      });
      activityKeyHandlerBound = true;
    }

    document.getElementById("translatorToggleBtn").addEventListener("click", (event) => {
      openTranslator(showToast, event.currentTarget);
    });
    document.getElementById("openTopicsBtn").addEventListener("click", (event) => {
      openTopics(showToast, event.currentTarget);
    });
    document.getElementById("openDialoguesBtn").addEventListener("click", (event) => {
      openDialogues(showToast, event.currentTarget);
    });
    document.getElementById("closeActivityBtn").addEventListener("click", closeActivity);
    document.getElementById("activityOverlay").addEventListener("click", (event) => {
      if (event.target.id === "activityOverlay") closeActivity();
    });

    const pairSelector = document.getElementById("gamesPairSelector");
    if (pairSelector) {
      pairSelector.addEventListener("change", (event) => {
        activePairId = Number(event.target.value);
        localStorage.setItem("lingolion_active_pair_id", String(activePairId));
        const gameArea = document.getElementById("gameArea");
        gameArea.innerHTML = "";
      });
    }

    container.querySelectorAll(".play-btn[data-game]").forEach((btn) => {
      btn.addEventListener("click", () => startGame(container, btn.dataset.game, showToast, btn));
    });
  }

  function openActivity(title, returnFocusTo) {
    const overlay = document.getElementById("activityOverlay");
    if (!overlay) return null;
    activityReturnFocus = returnFocusTo;
    document.getElementById("activityTitle").textContent = title;
    overlay.classList.remove("hidden");
    overlay.querySelector(".activity-window").focus();
    return document.getElementById("gameArea");
  }

  function closeActivity() {
    const overlay = document.getElementById("activityOverlay");
    if (!overlay) return;
    if (speechRecorder) {
      speechCancelled = true;
      window.clearTimeout(speechTimeout);
      speechRecorder.stop();
    }
    overlay.classList.add("hidden");
    document.getElementById("gameArea").innerHTML = "";
    activityReturnFocus?.focus();
    activityReturnFocus = null;
  }

  function renderTranslator(gameArea, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    if (!pair) return;
    const sourceCode = languageCodes[pair.source_language.trim().toLocaleLowerCase()] || "auto";
    const targetCode = languageCodes[pair.target_language.trim().toLocaleLowerCase()] || "en";
    gameArea.innerHTML = `
      <div class="translator-panel-heading">
        <p class="activity-language-pair">${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</p>
        <span class="translator-provider">Google Translate</span>
      </div>
      <div class="translator-language-selects">
        <div class="field">
          <label for="translatorSource" data-i18n="games.source_language"></label>
          <select id="translatorSource">
            <option value="auto" ${sourceCode === "auto" ? "selected" : ""}>${I18N.t("games.detect_language")}</option>
            ${translatorLanguages.map((language) => `<option value="${language.code}" ${sourceCode === language.code ? "selected" : ""}>${language.label}</option>`).join("")}
          </select>
        </div>
        <button class="icon-btn translator-swap" id="swapTranslatorLanguages" type="button" aria-label="${I18N.t("games.swap_languages")}" title="${I18N.t("games.swap_languages")}" ${sourceCode === "auto" ? "disabled" : ""}>⇄</button>
        <div class="field">
          <label for="translatorTarget" data-i18n="games.target_language"></label>
          <select id="translatorTarget">
            ${translatorLanguages.map((language) => `<option value="${language.code}" ${targetCode === language.code ? "selected" : ""}>${language.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <form id="translatorForm">
        <label for="translatorInput" data-i18n="games.text_to_translate"></label>
        <div class="translator-input-wrap">
          <textarea id="translatorInput" maxlength="5000" rows="5" data-i18n-placeholder="games.text_placeholder" required></textarea>
          <button class="icon-btn translator-mic" id="recordSpeechBtn" type="button" aria-label="${I18N.t("games.speak_to_type")}" title="${I18N.t("games.speak_to_type")}">🎙</button>
        </div>
        <p class="speech-status" id="speechStatus" aria-live="polite"></p>
        <div class="translator-form-footer">
          <span class="translator-limit">0/5000</span>
          <button class="btn btn-primary" id="translatorSubmit" type="submit" data-i18n="games.translate"></button>
        </div>
      </form>
      <p class="translator-note" data-i18n="games.service_hint"></p>
      <div class="translator-result hidden" id="translatorResult" aria-live="polite">
        <span class="translator-result-label" data-i18n="games.result"></span>
        <p id="translatorOutput"></p>
        <button class="btn btn-outline translator-speak" id="speakTranslationBtn" type="button">
          <span aria-hidden="true">🔊</span><span data-i18n="games.listen_translation"></span>
        </button>
      </div>`;
    I18N.applyToDom(gameArea);

    const input = document.getElementById("translatorInput");
    const sourceSelector = document.getElementById("translatorSource");
    const targetSelector = document.getElementById("translatorTarget");
    const swapButton = document.getElementById("swapTranslatorLanguages");
    const speechButton = document.getElementById("recordSpeechBtn");
    speechButton.disabled = sourceSelector.value === "auto";
    input.addEventListener("input", () => {
      document.querySelector(".translator-limit").textContent = `${input.value.length}/5000`;
    });
    document.getElementById("translatorForm").addEventListener("submit", (event) => translateText(event, showToast));
    sourceSelector.addEventListener("change", () => {
      speechButton.disabled = sourceSelector.value === "auto";
      swapButton.disabled = sourceSelector.value === "auto";
    });
    swapButton.addEventListener("click", () => {
      if (sourceSelector.value === "auto") return;
      [sourceSelector.value, targetSelector.value] = [targetSelector.value, sourceSelector.value];
      speechButton.disabled = sourceSelector.value === "auto";
      swapButton.disabled = sourceSelector.value === "auto";
    });
    document.getElementById("recordSpeechBtn").addEventListener("click", () => toggleSpeechInput(showToast));
    document.getElementById("speakTranslationBtn").addEventListener("click", speakTranslation);
    input.focus();
  }

  function openTranslator(showToast, returnFocusTo) {
    const gameArea = openActivity(I18N.t("games.translator_title"), returnFocusTo);
    if (gameArea) renderTranslator(gameArea, showToast);
  }

  function openTopics(showToast, returnFocusTo) {
    const gameArea = openActivity(I18N.t("games.topic_category"), returnFocusTo);
    if (gameArea) renderTopicList(gameArea, showToast);
  }

  function practiceLanguageCode(language) {
    const code = languageCodes[String(language || "").trim().toLocaleLowerCase()];
    return code === "tg" ? "tj" : translatorLanguages.some((languageOption) => languageOption.code === code) ? code : null;
  }

  function getPracticeLanguages(pair) {
    return {
      source: practiceLanguageCode(pair?.source_language),
      target: practiceLanguageCode(pair?.target_language),
    };
  }

  function localizedCatalogTitle(title, fallbackLanguage) {
    return title[I18N.getLang()] || title[fallbackLanguage] || title.en;
  }

  function renderUnsupportedPracticeCatalog(gameArea) {
    gameArea.innerHTML = `<p class="empty-state">${escapeHtml(I18N.t("games.practice_catalog_unavailable"))}</p>`;
  }

  function renderTopicList(gameArea, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    const languages = getPracticeLanguages(pair);
    if (!languages.source || !languages.target) {
      renderUnsupportedPracticeCatalog(gameArea);
      return;
    }

    gameArea.innerHTML = `
      <div class="topic-search">
        <label for="topicSearch" data-i18n="games.search_topics"></label>
        <input id="topicSearch" type="search" data-i18n-placeholder="games.search_topics_placeholder" autocomplete="off" />
      </div>
      <div class="topic-list" id="topicList"></div>`;
    I18N.applyToDom(gameArea);

    const topicList = document.getElementById("topicList");
    const search = document.getElementById("topicSearch");
    const displayLanguage = I18N.getLang();
    const renderMatches = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const matches = LocalPracticeCatalog.topics.filter((topic) =>
        `${topic.title[displayLanguage]} ${topic.title[languages.target]} ${topic.phrases.map((phrase) => `${phrase[languages.target]} ${phrase[languages.source]}`).join(" ")}`
          .toLocaleLowerCase()
          .includes(query)
      );
      topicList.innerHTML = matches.length
        ? matches.map((topic) => `
          <button class="topic-result" type="button" data-topic-id="${topic.id}">
              <span class="topic-result-title">${escapeHtml(localizedCatalogTitle(topic.title, languages.target))}</span>
            <span class="topic-result-meta">${topic.phrases.length} ${I18N.t("games.phrases")}</span>
            <span class="topic-result-arrow" aria-hidden="true">›</span>
          </button>`).join("")
        : `<p class="empty-state topic-empty">${I18N.t("common.no_results")}</p>`;

      topicList.querySelectorAll("[data-topic-id]").forEach((button) => {
        button.addEventListener("click", () => {
          const selectedTopic = LocalPracticeCatalog.topics.find((topic) => topic.id === button.dataset.topicId);
          if (selectedTopic) renderTopic(gameArea, selectedTopic, showToast);
        });
      });
    };
    search.addEventListener("input", renderMatches);
    renderMatches();
    search.focus();
  }

  function renderTopic(gameArea, topic, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    const languages = getPracticeLanguages(pair);
    gameArea.innerHTML = `
      <button class="btn btn-outline topic-back" id="backToTopics" type="button">
        <span aria-hidden="true">←</span><span data-i18n="games.all_topics"></span>
      </button>
      <div class="topic-detail-heading">
        <span class="topic-language-tag">${escapeHtml(pair.target_language)}</span>
        <h3>${escapeHtml(localizedCatalogTitle(topic.title, languages.target))}</h3>
      </div>
      <div class="topic-passage-list">
        ${topic.phrases.map((phrase) => `
          <article class="topic-passage-pair">
            <p class="topic-passage">${escapeHtml(phrase[languages.target])}</p>
            ${languages.source !== languages.target ? `<p class="topic-passage-translation">${escapeHtml(phrase[languages.source])}</p>` : ""}
          </article>`).join("")}
      </div>`;
    I18N.applyToDom(gameArea);

    document.getElementById("backToTopics").addEventListener("click", () => renderTopicList(gameArea, showToast));
  }

  function openDialogues(showToast, returnFocusTo) {
    const gameArea = openActivity(I18N.t("games.dialogue_category"), returnFocusTo);
    if (gameArea) renderDialogueList(gameArea, showToast);
  }

  function renderDialogueList(gameArea, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    const languages = getPracticeLanguages(pair);
    if (!languages.source || !languages.target) {
      renderUnsupportedPracticeCatalog(gameArea);
      return;
    }

    gameArea.innerHTML = `
      <div class="topic-search">
        <label for="dialogueSearch" data-i18n="games.search_dialogues"></label>
        <input id="dialogueSearch" type="search" data-i18n-placeholder="games.search_dialogues_placeholder" autocomplete="off" />
      </div>
      <div class="topic-list" id="dialogueList"></div>`;
    I18N.applyToDom(gameArea);

    const dialogueList = document.getElementById("dialogueList");
    const search = document.getElementById("dialogueSearch");
    const displayLanguage = I18N.getLang();
    const renderMatches = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const matches = LocalPracticeCatalog.dialogues.filter((dialogue) =>
        `${dialogue.title[displayLanguage]} ${dialogue.title[languages.target]} ${dialogue.turns.map((turn) => `${turn[languages.target]} ${turn[languages.source]}`).join(" ")}`
          .toLocaleLowerCase()
          .includes(query)
      );
      dialogueList.innerHTML = matches.length
        ? matches.map((dialogue) => `
          <button class="topic-result" type="button" data-dialogue-id="${dialogue.id}">
            <span class="topic-result-title">${escapeHtml(localizedCatalogTitle(dialogue.title, languages.target))}</span>
            <span class="topic-result-meta">${dialogue.turns.length} ${I18N.t("games.dialogue_lines")}</span>
            <span class="topic-result-arrow" aria-hidden="true">›</span>
          </button>`).join("")
        : `<p class="empty-state topic-empty">${I18N.t("common.no_results")}</p>`;

      dialogueList.querySelectorAll("[data-dialogue-id]").forEach((button) => {
        button.addEventListener("click", () => {
          const selectedDialogue = LocalPracticeCatalog.dialogues.find((dialogue) => dialogue.id === button.dataset.dialogueId);
          if (selectedDialogue) renderDialogue(gameArea, selectedDialogue, showToast);
        });
      });
    };
    search.addEventListener("input", renderMatches);
    renderMatches();
    search.focus();
  }

  function renderDialogue(gameArea, dialogue, showToast) {
    const pair = pairs.find((item) => item.id === activePairId);
    const languages = getPracticeLanguages(pair);
    gameArea.innerHTML = `
      <button class="btn btn-outline topic-back" id="backToDialogues" type="button">
        <span aria-hidden="true">←</span><span data-i18n="games.all_dialogues"></span>
      </button>
      <div class="topic-detail-heading">
        <span class="topic-language-tag">${escapeHtml(pair.target_language)}</span>
        <h3>${escapeHtml(localizedCatalogTitle(dialogue.title, languages.target))}</h3>
      </div>
      <div class="dialogue-transcript">
        ${dialogue.turns.map((turn, index) => `
          <div class="dialogue-line ${index % 2 ? "dialogue-line-right" : ""}">
            <span class="dialogue-speaker">${escapeHtml(turn.speaker)}</span>
            <p>${escapeHtml(turn[languages.target])}</p>
            ${languages.source !== languages.target ? `<p class="dialogue-line-translation">${escapeHtml(turn[languages.source])}</p>` : ""}
          </div>`).join("")}
      </div>`;
    I18N.applyToDom(gameArea);

    document.getElementById("backToDialogues").addEventListener("click", () => renderDialogueList(gameArea, showToast));
  }

  async function translateText(event, showToast) {
    event.preventDefault();
    const pair = pairs.find((item) => item.id === activePairId);
    if (!pair) return;

    const text = document.getElementById("translatorInput").value.trim();
    const sourceCode = document.getElementById("translatorSource").value;
    const targetCode = document.getElementById("translatorTarget").value;

    const submitButton = document.getElementById("translatorSubmit");
    const result = document.getElementById("translatorResult");
    submitButton.disabled = true;
    submitButton.textContent = I18N.t("games.translating");
    result.classList.add("hidden");
    try {
      const response = await API.post("/translation/text", {
        text,
        source_language: sourceCode,
        target_language: targetCode,
      });
      document.getElementById("translatorOutput").textContent = response.translated_text;
      result.classList.remove("hidden");
    } catch (error) {
      const message = error.message === "google_translate_unavailable"
        ? I18N.t("games.translate_unavailable")
        : error.message === "google_translate_rate_limited"
          ? I18N.t("games.translate_rate_limited")
        : error.message;
      showToast(message, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = I18N.t("games.translate");
    }
  }

  function encodeWav(audioBuffer) {
    const channels = audioBuffer.numberOfChannels;
    const frameCount = audioBuffer.length;
    const dataSize = frameCount * channels * 2;
    const wav = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wav);
    const writeText = (offset, text) => {
      for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index));
    };

    writeText(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeText(8, "WAVE");
    writeText(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeText(36, "data");
    view.setUint32(40, dataSize, true);

    const channelData = Array.from({ length: channels }, (_, channel) => audioBuffer.getChannelData(channel));
    let offset = 44;
    for (let frame = 0; frame < frameCount; frame++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([wav], { type: "audio/wav" });
  }

  async function toggleSpeechInput(showToast) {
    if (speechRecorder) {
      speechRecorder.stop();
      return;
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !window.AudioContext) {
      showToast(I18N.t("games.microphone_unavailable"), "error");
      return;
    }

    const button = document.getElementById("recordSpeechBtn");
    const status = document.getElementById("speechStatus");
    const language = speechLanguageCodes[document.getElementById("translatorSource").value];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(stream);
      speechRecorder = recorder;
      speechCancelled = false;
      button.classList.add("recording");
      button.setAttribute("aria-label", I18N.t("games.stop_recording"));
      button.title = I18N.t("games.stop_recording");
      status.textContent = I18N.t("games.listening");
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", async () => {
        window.clearTimeout(speechTimeout);
        speechRecorder = null;
        stream.getTracks().forEach((track) => track.stop());
        button.classList.remove("recording");
        button.disabled = true;
        button.setAttribute("aria-label", I18N.t("games.processing_speech"));
        button.title = I18N.t("games.processing_speech");
        status.textContent = I18N.t("games.processing_speech");
        try {
          if (speechCancelled || !document.getElementById("translatorInput")) return;
          const recording = new Blob(chunks, { type: recorder.mimeType });
          const context = new AudioContext();
          const buffer = await context.decodeAudioData(await recording.arrayBuffer());
          const wav = encodeWav(buffer);
          await context.close();
          const file = new File([wav], "speech-input.wav", { type: "audio/wav" });
          const response = await API.upload(`/translation/speech?language=${encodeURIComponent(language || "en-US")}`, file);
          const input = document.getElementById("translatorInput");
          if (!input) return;
          input.value = `${input.value.trim()}${input.value.trim() ? " " : ""}${response.text}`;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          status.textContent = I18N.t("games.speech_recognized");
          input.focus();
        } catch (error) {
          const key = error.message === "speech_not_recognized"
            ? "games.speech_not_recognized"
            : error.message === "speech_recognition_unavailable"
              ? "games.speech_unavailable"
              : error.message === "speech_audio_too_large"
                ? "games.speech_too_long"
                : "games.speech_failed";
          status.textContent = I18N.t(key);
        } finally {
          button.disabled = false;
          button.setAttribute("aria-label", I18N.t("games.speak_to_type"));
          button.title = I18N.t("games.speak_to_type");
          if (!speechCancelled) status.textContent ||= "";
          speechCancelled = false;
        }
      }, { once: true });
      recorder.start();
      speechTimeout = window.setTimeout(() => {
        if (speechRecorder === recorder) recorder.stop();
      }, 15000);
    } catch (error) {
      status.textContent = I18N.t("games.microphone_permission");
    }
  }

  function speakTranslation() {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const text = document.getElementById("translatorOutput").textContent.trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.getElementById("translatorTarget").value;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
    }
    return shuffled;
  }

  async function startGame(container, gameType, showToast, returnFocusTo) {
    const pairId = activePairId;
    const pair = pairs.find((item) => item.id === pairId);
    const languages = getPracticeLanguages(pair);
    const gameArea = openActivity(I18N.t(`games.${gameType}`), returnFocusTo);
    if (!gameArea) return;
    if (!languages.source || !languages.target) {
      showToast(I18N.t("games.practice_catalog_unavailable"), "error");
      gameArea.innerHTML = "";
      return;
    }

    activeGameTopicId = null;
    gameArea.innerHTML = `<p class="empty-state">…</p>`;
    let unlockedTopics;
    try {
      const progress = await API.get(
        `/games/progress?game_type=${encodeURIComponent(gameType)}&language_pair_id=${encodeURIComponent(pairId)}`,
      );
      unlockedTopics = new Set(progress.unlocked_topics);
    } catch (error) {
      gameArea.innerHTML = "";
      showToast(error.message, "error");
      return;
    }

    gameArea.innerHTML = `
      <p class="topic-search-hint" data-i18n="games.choose_game_topic"></p>
      <div class="topic-list game-topic-list">
        ${OfflineGameCatalog.topics.map((topic) => {
          const isLocked = !unlockedTopics.has(topic.id);
          return `
          <button class="topic-result${isLocked ? " is-locked" : ""}" type="button" data-game-topic="${topic.id}"${isLocked ? " disabled" : ""}>
            <span class="topic-result-title">${escapeHtml(localizedCatalogTitle(topic.title, languages.target))}</span>
            <span class="topic-result-meta">${isLocked
              ? escapeHtml(I18N.t("games.unlock_at_score"))
              : `${OfflineGameCatalog.getCount(gameType, topic.id)} ${I18N.t(gameType === "vocabulary_learning" ? "games.game_words" : "games.game_questions")}`}</span>
            <span class="topic-result-arrow" aria-hidden="true">${isLocked ? "🔒" : "›"}</span>
          </button>`;
        }).join("")}
      </div>`;
    I18N.applyToDom(gameArea);
    gameArea.querySelectorAll("[data-game-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        activeGameTopicId = button.dataset.gameTopic;
        const content = OfflineGameCatalog.get(
          gameType,
          languages.source,
          languages.target,
          button.dataset.gameTopic,
        );
        if (!content) {
          showToast(I18N.t("games.practice_catalog_unavailable"), "error");
          return;
        }
        renderGameContent(gameArea, gameType, content, showToast, pairId);
      });
    });
  }

  function renderGameContent(gameArea, gameType, content, showToast, pairId) {
    if (gameType === "vocabulary_learning") {
      const pair = pairs.find((item) => item.id === pairId);
      VocabularyLearningGame.render(gameArea, content, {
        pairId,
        sourceLanguageCode: practiceLanguageCode(pair?.source_language),
        targetLanguageCode: practiceLanguageCode(pair?.target_language),
        showToast,
        speakGameText,
        submitScore: (type, score, gamePairId) => submitScore(type, score, showToast, gamePairId),
      });
    }
    else if (gameType === "vocab_match") renderVocabMatch(gameArea, content, showToast, pairId);
    else if (gameType === "translation") renderTranslation(gameArea, content, showToast, pairId);
    else if (gameType === "multiple_choice") renderMultipleChoice(gameArea, content, showToast, pairId);
    else if (gameType === "word_scramble") renderWordScramble(gameArea, content, showToast, pairId);
    else if (gameType === "listening") renderListening(gameArea, content, showToast, pairId);
    else if (gameType === "speaking") renderSpeaking(gameArea, content, showToast, pairId);
    else if (gameType === "writing") renderWriting(gameArea, content, showToast, pairId);
    else if (gameType === "reading") renderReading(gameArea, content, showToast, pairId);
    else renderSpeedChallenge(gameArea, content, showToast, pairId);
  }

  async function submitScore(gameType, score, showToast, pairId) {
    try {
      const res = await API.post("/games/submit", {
        game_type: gameType,
        score,
        language_pair_id: pairId,
        topic_id: activeGameTopicId,
      });
      showToast(
        `+${res.xp_earned} XP!${res.topic_unlocked ? ` ${I18N.t("games.topic_unlocked")}` : ""}`,
        "success",
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function renderVocabMatch(gameArea, content, showToast, pairId) {
    const pairsData = (content.pairs || []).slice(0, 8);
    if (!pairsData.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    const words = pairsData.map((p, i) => ({ id: i, text: p.word, type: "word" }));
    const translations = pairsData.map((p, i) => ({ id: i, text: p.translation, type: "translation" }));
    const shuffled = shuffle([...words, ...translations]);

    gameArea.innerHTML = `<div class="card"><div class="match-grid">
      ${shuffled.map((item, idx) => `<div class="match-cell" data-id="${item.id}" data-type="${item.type}" data-idx="${idx}">${escapeHtml(item.text)}</div>`).join("")}
    </div></div>`;

    let selected = null;
    let matchedCount = 0;
    gameArea.querySelectorAll(".match-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        if (cell.classList.contains("matched")) return;
        if (!selected) {
          selected = cell;
          cell.classList.add("selected");
          return;
        }
        if (selected === cell) return;

        if (selected.dataset.id === cell.dataset.id && selected.dataset.type !== cell.dataset.type) {
          selected.classList.add("matched");
          cell.classList.add("matched");
          selected.classList.remove("selected");
          matchedCount++;
          selected = null;
          if (matchedCount === pairsData.length) {
            const score = 100;
            submitScore("vocab_match", score, showToast, pairId);
          }
        } else {
          selected.classList.remove("selected");
          selected = null;
        }
      });
    });
  }

  function renderTranslation(gameArea, content, showToast, pairId) {
    const items = content.items || [];
    let idx = 0;
    let correct = 0;

    function showItem() {
      if (idx >= items.length) {
        const score = Math.round((correct / (items.length || 1)) * 100);
        gameArea.innerHTML = `<div class="card"><p data-i18n="games.score"></p><h2>${score}%</h2></div>`;
        I18N.applyToDom(gameArea);
        submitScore("translation", score, showToast, pairId);
        return;
      }
      const item = items[idx];
      gameArea.innerHTML = `
        <div class="card">
          <p>${escapeHtml(item.sentence)}</p>
          <input type="text" id="translationAnswer" />
          <button class="btn btn-primary" id="submitAnswer" style="margin-top:10px;" data-i18n="communication.send"></button>
        </div>`;
      I18N.applyToDom(gameArea);
      document.getElementById("submitAnswer").addEventListener("click", () => {
        const answer = document.getElementById("translationAnswer").value.trim().toLowerCase();
        if (answer && answer === String(item.answer).trim().toLowerCase()) correct++;
        idx++;
        showItem();
      });
    }
    showItem();
  }

  function renderMultipleChoice(gameArea, content, showToast, pairId) {
    const items = content.pairs || [];
    let index = 0;
    let correct = 0;

    function showItem() {
      if (index >= items.length) {
        const score = Math.round((correct / (items.length || 1)) * 100);
        gameArea.innerHTML = `<div class="card"><p data-i18n="games.score"></p><h2>${score}%</h2></div>`;
        I18N.applyToDom(gameArea);
        submitScore("multiple_choice", score, showToast, pairId);
        return;
      }

      const item = items[index];
      const distractors = items.filter((candidate) => candidate !== item).map((candidate) => candidate.translation);
      const options = shuffle([item.translation, ...distractors.slice(0, 3)]);
      gameArea.innerHTML = `
        <div class="card game-round">
          <p class="lesson-meta">${index + 1}/${items.length}</p>
          <h3>${escapeHtml(item.word)}</h3>
          ${options.map((option) => `<button type="button" class="option-btn" data-correct="${option === item.translation}">${escapeHtml(option)}</button>`).join("")}
          <p class="game-feedback" id="gameFeedback" aria-live="polite"></p>
        </div>`;

      gameArea.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          button.disabled = true;
          const isCorrect = button.dataset.correct === "true";
          if (isCorrect) correct++;
          gameArea.querySelectorAll(".option-btn").forEach((option) => {
            option.disabled = true;
            if (option.dataset.correct === "true") option.classList.add("correct");
            else if (option === button) option.classList.add("incorrect");
          });
          const feedback = document.getElementById("gameFeedback");
          feedback.textContent = isCorrect ? "✓" : item.translation;
          feedback.classList.add(isCorrect ? "correct" : "incorrect");
          window.setTimeout(() => {
            index++;
            showItem();
          }, 550);
        });
      });
    }

    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showItem();
  }

  function renderWordScramble(gameArea, content, showToast, pairId) {
    const items = content.pairs || [];
    let index = 0;
    let correct = 0;

    function showItem() {
      if (index >= items.length) {
        const score = Math.round((correct / (items.length || 1)) * 100);
        gameArea.innerHTML = `<div class="card"><p data-i18n="games.score"></p><h2>${score}%</h2></div>`;
        I18N.applyToDom(gameArea);
        submitScore("word_scramble", score, showToast, pairId);
        return;
      }

      const item = items[index];
      const letters = Array.from(String(item.word));
      let scrambled = shuffle(letters);
      if (letters.length > 1 && scrambled.join("") === letters.join("")) {
        scrambled = [...scrambled.slice(1), scrambled[0]];
      }
      gameArea.innerHTML = `
        <div class="card game-round">
          <p class="lesson-meta">${index + 1}/${items.length}</p>
          <p class="scramble-word" aria-label="Scrambled letters">${escapeHtml(scrambled.join(" "))}</p>
          <p class="game-hint">${escapeHtml(item.translation)}</p>
          <form id="scrambleForm">
            <label for="scrambleAnswer" data-i18n="games.word_answer"></label>
            <input id="scrambleAnswer" type="text" autocomplete="off" autocapitalize="off" required />
            <button class="btn btn-primary" type="submit" style="margin-top:12px;" data-i18n="games.check_answer"></button>
            <p class="game-feedback" id="gameFeedback" aria-live="polite"></p>
          </form>
        </div>`;
      I18N.applyToDom(gameArea);

      document.getElementById("scrambleForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const answer = document.getElementById("scrambleAnswer").value.trim().normalize("NFC").toLocaleLowerCase();
        const isCorrect = answer === String(item.word).normalize("NFC").toLocaleLowerCase();
        const feedback = document.getElementById("gameFeedback");
        feedback.textContent = isCorrect ? "✓" : item.word;
        feedback.classList.add(isCorrect ? "correct" : "incorrect");
        if (!isCorrect) return;
        correct++;
        document.getElementById("scrambleAnswer").disabled = true;
        document.querySelector("#scrambleForm button").disabled = true;
        window.setTimeout(() => {
          index++;
          showItem();
        }, 550);
      });
    }

    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showItem();
  }

  function renderSpeedChallenge(gameArea, content, showToast, pairId) {
    const items = content.items || [];
    let idx = 0;
    let correct = 0;

    function showItem() {
      if (idx >= items.length) {
        const score = Math.round((correct / (items.length || 1)) * 100);
        gameArea.innerHTML = `<div class="card"><p data-i18n="games.score"></p><h2>${score}%</h2></div>`;
        I18N.applyToDom(gameArea);
        submitScore("speed_challenge", score, showToast, pairId);
        return;
      }
      const item = items[idx];
      gameArea.innerHTML = `
        <div class="card">
          <p><strong>${idx + 1}/${items.length}</strong> ${escapeHtml(item.question)}</p>
          ${(item.options || []).map((opt) => `<button type="button" class="option-btn">${escapeHtml(opt)}</button>`).join("")}
        </div>`;
      gameArea.querySelectorAll(".option-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.textContent.trim() === String(item.correct_answer).trim()) correct++;
          idx++;
          showItem();
        });
      });
    }
    showItem();
  }

  function gameSpeechLocale() {
    const pair = pairs.find((item) => item.id === activePairId);
    const languageName = pair?.target_language?.trim().toLocaleLowerCase() || "";
    const languageCode = languageCodes[languageName] || "";
    return speechLanguageCodes[languageCode] || "";
  }

  function speakGameText(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = gameSpeechLocale();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function finishNewGame(gameArea, gameType, score, showToast, pairId) {
    gameArea.innerHTML = `<div class="card game-result"><p data-i18n="games.score"></p><h2>${score}%</h2></div>`;
    I18N.applyToDom(gameArea);
    submitScore(gameType, score, showToast, pairId);
  }

  function renderListening(gameArea, content, showToast, pairId) {
    const items = content.items || [];
    let index = 0;
    let correct = 0;

    function showItem() {
      if (index >= items.length) {
        finishNewGame(gameArea, "listening", Math.round((correct / items.length) * 100), showToast, pairId);
        return;
      }
      const item = items[index];
      gameArea.innerHTML = `
        <div class="card game-round listening-round">
          <p class="lesson-meta">${index + 1}/${items.length}</p>
          <button id="playListeningAudio" class="btn btn-outline listening-play" type="button">🔊 <span data-i18n="games.play_audio"></span></button>
          <details class="listening-transcript"><summary data-i18n="games.show_transcript"></summary><p>${escapeHtml(item.sentence)}</p></details>
          <p class="lesson-meta" data-i18n="games.choose_meaning"></p>
          ${(item.options || []).map((option) => `<button type="button" class="option-btn" data-correct="${option === item.correct_answer}">${escapeHtml(option)}</button>`).join("")}
          <p class="game-feedback" id="listeningFeedback" aria-live="polite"></p>
        </div>`;
      I18N.applyToDom(gameArea);
      document.getElementById("playListeningAudio").addEventListener("click", () => {
        if (!speakGameText(item.sentence)) showToast(I18N.t("games.audio_unavailable"), "error");
      });
      gameArea.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const isCorrect = button.dataset.correct === "true";
          if (isCorrect) correct++;
          gameArea.querySelectorAll(".option-btn").forEach((option) => {
            option.disabled = true;
            if (option.dataset.correct === "true") option.classList.add("correct");
            else if (option === button) option.classList.add("incorrect");
          });
          document.getElementById("listeningFeedback").textContent = isCorrect ? "✓" : item.correct_answer;
          window.setTimeout(() => { index++; showItem(); }, 450);
        });
      });
    }
    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showItem();
  }

  function answerKeywordScore(answer, item) {
    const normalizedAnswer = String(answer || "").normalize("NFC").toLocaleLowerCase();
    const keywords = (item.keywords || []).map((word) => String(word).normalize("NFC").toLocaleLowerCase()).filter(Boolean);
    if (!normalizedAnswer || !keywords.length) return 0;
    const matches = keywords.filter((word) => normalizedAnswer.includes(word)).length;
    return Math.round((matches / keywords.length) * 100);
  }

  function renderOpenAnswerGame(gameArea, content, gameType, showToast, pairId) {
    const items = content.items || [];
    const isSpeaking = gameType === "speaking";
    let index = 0;
    let totalScore = 0;

    function showItem() {
      if (index >= items.length) {
        finishNewGame(gameArea, gameType, Math.round(totalScore / items.length), showToast, pairId);
        return;
      }
      const item = items[index];
      gameArea.innerHTML = `
        <div class="card game-round open-answer-round">
          <p class="lesson-meta">${index + 1}/${items.length}</p>
          <p class="open-answer-prompt">${escapeHtml(item.prompt)}</p>
          ${isSpeaking ? `<button id="recordGameAnswer" class="btn btn-outline" type="button">🎙 <span data-i18n="games.record_answer"></span></button>` : ""}
          <form id="openAnswerForm">
            <label for="openGameAnswer" data-i18n="${isSpeaking ? "games.speaking_answer" : "games.writing_answer"}"></label>
            <textarea id="openGameAnswer" rows="3" maxlength="1000" data-i18n-placeholder="games.answer_placeholder" required></textarea>
            <details class="model-answer"><summary data-i18n="games.show_model_answer"></summary><p>${escapeHtml(item.expected_answer || "")}</p></details>
            <button class="btn btn-primary" type="submit" data-i18n="games.check_answer"></button>
          </form>
          <p class="game-feedback" id="openAnswerFeedback" aria-live="polite"></p>
        </div>`;
      I18N.applyToDom(gameArea);
      if (isSpeaking) {
        document.getElementById("recordGameAnswer").addEventListener("click", () => {
          const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!Recognition) {
            showToast(I18N.t("games.speech_input_unavailable"), "error");
            return;
          }
          const recognition = new Recognition();
          recognition.lang = gameSpeechLocale();
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          recognition.onresult = (event) => {
            document.getElementById("openGameAnswer").value = event.results[0][0].transcript;
            showToast(I18N.t("games.speech_captured"), "success");
          };
          recognition.onerror = () => showToast(I18N.t("games.speech_input_unavailable"), "error");
          try {
            recognition.start();
          } catch (error) {
            showToast(I18N.t("games.speech_input_unavailable"), "error");
          }
        });
      }
      document.getElementById("openAnswerForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const answer = document.getElementById("openGameAnswer").value;
        const score = answerKeywordScore(answer, item);
        totalScore += score;
        document.getElementById("openAnswerFeedback").textContent = `${score}%`;
        document.getElementById("openAnswerForm").querySelector("button[type=submit]").disabled = true;
        window.setTimeout(() => { index++; showItem(); }, 650);
      });
    }
    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showItem();
  }

  function renderSpeaking(gameArea, content, showToast, pairId) {
    renderOpenAnswerGame(gameArea, content, "speaking", showToast, pairId);
  }

  function renderWriting(gameArea, content, showToast, pairId) {
    renderOpenAnswerGame(gameArea, content, "writing", showToast, pairId);
  }

  function renderReading(gameArea, content, showToast, pairId) {
    const items = content.items || [];
    let index = 0;
    let correct = 0;

    function showItem() {
      if (index >= items.length) {
        finishNewGame(gameArea, "reading", Math.round((correct / items.length) * 100), showToast, pairId);
        return;
      }
      const item = items[index];
      gameArea.innerHTML = `
        <div class="card game-round reading-round">
          <p class="lesson-meta">${index + 1}/${items.length}</p>
          <p class="reading-passage">${escapeHtml(item.passage)}</p>
          <p class="reading-question">${escapeHtml(item.question)}</p>
          ${(item.options || []).map((option) => `<button type="button" class="option-btn" data-correct="${option === item.correct_answer}">${escapeHtml(option)}</button>`).join("")}
          <p class="game-feedback" id="readingFeedback" aria-live="polite"></p>
        </div>`;
      gameArea.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const isCorrect = button.dataset.correct === "true";
          if (isCorrect) correct++;
          gameArea.querySelectorAll(".option-btn").forEach((option) => {
            option.disabled = true;
            if (option.dataset.correct === "true") option.classList.add("correct");
            else if (option === button) option.classList.add("incorrect");
          });
          document.getElementById("readingFeedback").textContent = isCorrect ? "✓" : item.correct_answer;
          window.setTimeout(() => { index++; showItem(); }, 450);
        });
      });
    }
    if (!items.length) {
      gameArea.innerHTML = `<p class="empty-state">${I18N.t("auth.error_generic")}</p>`;
      return;
    }
    showItem();
  }

  return { render };
})();
