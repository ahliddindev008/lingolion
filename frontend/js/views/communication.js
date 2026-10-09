const CommunicationView = (() => {
  let ws = null;
  let pairs = [];
  let chatListData = null;
  let listScrollTop = 0;
  let lastDateLabel = null;
  let endVoiceCall = null;
  let voiceRecorder = null;
  let voiceStream = null;
  let voiceRecordingTimeout = null;
  let voiceRecorderButton = null;
  let voiceRecordingCancelled = false;
  let activeSpeechRecognition = null;
  const attachmentUrls = new Set();
  const inlineImageTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
  const inlineAudioTypes = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"]);

  function stopVoiceRecording(cancelled = true) {
    if (!voiceRecorder) return;
    voiceRecordingCancelled = cancelled;
    clearTimeout(voiceRecordingTimeout);
    voiceRecordingTimeout = null;
    if (voiceRecorder.state !== "inactive") voiceRecorder.stop();
  }

  function clearAttachmentUrls() {
    attachmentUrls.forEach((url) => URL.revokeObjectURL(url));
    attachmentUrls.clear();
  }

  function parseAttachment(content) {
    if (!content.startsWith("attachment:")) return null;
    const [id, contentType, filename] = content.slice("attachment:".length).split("|", 3);
    if (!/^[a-f0-9]{32}$/.test(id || "") || !filename) return null;
    return { id, contentType, filename };
  }

  function attachmentPath(room, id) {
    return `/communication/rooms/${encodeURIComponent(room)}/attachments/${encodeURIComponent(id)}`;
  }

  function attachmentCollectionPath(room) {
    return `/communication/rooms/${encodeURIComponent(room)}/attachments`;
  }

  function messageCollectionPath(room) {
    return `/communication/rooms/${encodeURIComponent(room)}/messages`;
  }

  function deleteMessagePath(room, messageId) {
    return `${messageCollectionPath(room)}/${encodeURIComponent(messageId)}`;
  }

  async function clearConversation(messagesEl, room, showToast) {
    if (!window.confirm(I18N.t("communication.clear_confirm"))) return;
    try {
      await API.delete(messageCollectionPath(room));
      messagesEl.replaceChildren();
      lastDateLabel = null;
      const preview = chatListData?.previews.find((item) => item.room === room);
      if (preview) preview.last = null;
      App.refreshNotificationBadge();
      showToast(I18N.t("communication.conversation_cleared"));
    } catch (error) {
      showToast(error.message || I18N.t("auth.error_generic"), "error");
    }
  }

  function setupAttachmentPicker(button, input, messagesEl, room, userId, showToast) {
    button.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      for (const file of input.files || []) {
        if (file.size > 10 * 1024 * 1024) {
          showToast(I18N.t("communication.file_too_large"), "error");
          continue;
        }
        try {
          const message = await API.upload(attachmentCollectionPath(room), file);
          appendMessage(messagesEl, message, userId, room, "", showToast);
          scrollToBottom(messagesEl);
        } catch (error) {
          showToast(I18N.t("communication.upload_failed"), "error");
        }
      }
      input.value = "";
    });
  }

  function setVoiceButton(button, recording) {
    button.classList.toggle("recording", recording);
    button.textContent = recording ? "■" : "🎙";
    button.setAttribute(
      "aria-label",
      I18N.t(recording ? "communication.stop_recording" : "communication.record_voice")
    );
    button.title = I18N.t(recording ? "communication.stop_recording" : "communication.record_voice");
  }

  function setupVoiceMessageRecorder(button, messagesEl, room, userId, showToast) {
    button.addEventListener("click", async () => {
      if (voiceRecorder) {
        if (voiceRecorderButton === button) stopVoiceRecording(false);
        return;
      }
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        showToast(I18N.t("communication.voice_message_unavailable"), "error");
        return;
      }

      try {
        voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const preferredType = ["audio/webm;codecs=opus", "audio/mp4"].find(
          (type) => MediaRecorder.isTypeSupported?.(type)
        );
        const recorder = preferredType
          ? new MediaRecorder(voiceStream, { mimeType: preferredType })
          : new MediaRecorder(voiceStream);
        const chunks = [];
        voiceRecorder = recorder;
        voiceRecorderButton = button;
        voiceRecordingCancelled = false;
        setVoiceButton(button, true);
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size) chunks.push(event.data);
        });
        recorder.addEventListener("stop", async () => {
          const cancelled = voiceRecordingCancelled;
          const activeButton = voiceRecorderButton;
          voiceRecorder = null;
          voiceRecorderButton = null;
          clearTimeout(voiceRecordingTimeout);
          voiceRecordingTimeout = null;
          voiceStream?.getTracks().forEach((track) => track.stop());
          voiceStream = null;
          setVoiceButton(activeButton || button, false);
          voiceRecordingCancelled = false;
          if (cancelled || !chunks.length || !messagesEl.isConnected) return;

          const mimeType = (recorder.mimeType || "audio/webm").split(";")[0].toLowerCase();
          const extension = mimeType === "audio/mp4" ? "m4a" : mimeType === "audio/ogg" ? "ogg" : "webm";
          const file = new File([new Blob(chunks, { type: mimeType })], `voice-message.${extension}`, { type: mimeType });
          if (file.size > 10 * 1024 * 1024) {
            showToast(I18N.t("communication.voice_message_too_large"), "error");
            return;
          }

          button.disabled = true;
          try {
            const message = await API.upload(attachmentCollectionPath(room), file);
            if (!messagesEl.isConnected) return;
            appendMessage(messagesEl, message, userId, room, "", showToast);
            scrollToBottom(messagesEl);
          } catch (error) {
            showToast(I18N.t("communication.voice_message_failed"), "error");
          } finally {
            button.disabled = false;
          }
        }, { once: true });
        recorder.addEventListener("error", () => {
          stopVoiceRecording(true);
          showToast(I18N.t("communication.voice_message_failed"), "error");
        }, { once: true });
        recorder.start();
        voiceRecordingTimeout = window.setTimeout(() => {
          if (voiceRecorder !== recorder) return;
          showToast(I18N.t("communication.voice_message_limit"));
          stopVoiceRecording(false);
        }, 60000);
      } catch (error) {
        voiceStream?.getTracks().forEach((track) => track.stop());
        voiceStream = null;
        voiceRecorder = null;
        voiceRecorderButton = null;
        setVoiceButton(button, false);
        showToast(I18N.t("communication.microphone_permission"), "error");
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function initials(firstName, lastName = "") {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toLocaleUpperCase();
  }

  function applyChatLabels(container) {
    container.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", I18N.t(element.dataset.i18nAriaLabel));
    });
  }

  function dateLabel(iso) {
    const d = new Date(iso || Date.now());
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return I18N.t("communication.today") || "Имрӯз";
    if (sameDay(d, yesterday)) return I18N.t("communication.yesterday") || "Дирӯз";
    return d.toLocaleDateString();
  }

  function speakText(text, language) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SpeechUtils.languageCode(language);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function teardown() {
    stopVoiceRecording();
    activeSpeechRecognition?.abort();
    activeSpeechRecognition = null;
    window.speechSynthesis?.cancel();
    if (endVoiceCall) {
      endVoiceCall(true);
      endVoiceCall = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    chatListData = null;
  }

  async function render(container, ctx) {
    teardown();
    pairs = await API.get("/course/pairs");
    if (!pairs.length) {
      container.innerHTML = `<div class="empty-state"><div class="emoji">💬</div><p data-i18n="course.no_lessons"></p></div>`;
      return;
    }
    await renderChatList(container, ctx);
  }

  async function renderChatList(container, ctx) {
    const { user } = ctx;
    let messageNotifications = [];
    try {
      messageNotifications = (await API.get("/profile/notifications"))
        .filter((notification) => notification.kind === "message" && !notification.is_read);
    } catch (error) {
      /* Chat notifications are optional if the notifications endpoint is unavailable. */
    }

    if (!chatListData) {
      const previews = await Promise.all(
        pairs.map(async (pair) => {
          const room = `ai_tutor_${user.id}_${pair.id}`;
          let history = [];
          try {
            history = await API.get(`/communication/rooms/${room}/messages?limit=1`);
          } catch (e) {
            /* no history yet */
          }
          return { pair, room, last: history[history.length - 1] || null };
        })
      );

      let partners = [];
      try {
        partners = await API.get("/communication/partners");
      } catch (e) {
        /* non-fatal */
      }
      chatListData = { previews, partners };
    }
    const { previews, partners } = chatListData;

    clearAttachmentUrls();
    container.innerHTML = `
      <div class="view-header-row communication-heading">
        <h1 data-i18n="communication.title"></h1>
        <span class="communication-heading-mark" aria-hidden="true">✦</span>
      </div>
      <p class="communication-subtitle" data-i18n="communication.subtitle"></p>
      ${messageNotifications.length ? `
        <section class="communication-notifications" aria-live="polite">
          <h2 data-i18n="communication.new_messages"></h2>
          ${messageNotifications.map((notification) => `
            <article class="communication-notification" data-notification-row="${notification.id}">
              <div><strong>${escapeHtml(notification.title)}</strong><p>${escapeHtml(notification.message)}</p></div>
              <button class="btn btn-outline btn-small" type="button" data-read-message="${notification.id}" data-i18n="communication.mark_read"></button>
            </article>`).join("")}
        </section>` : ""}
      <label class="search-bar communication-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" id="chatSearchInput" data-i18n-placeholder="communication.search_placeholder" data-i18n-aria-label="communication.search_placeholder" />
      </label>
      <div class="communication-sections" id="communicationSections">
      <section class="communication-section">
        <div class="wa-list-header"><h2 data-i18n="communication.ai_practice"></h2></div>
        <div class="wa-chat-list">
        ${previews
          .map(
            ({ pair, last }) => `
          <div class="wa-list-item" role="button" tabindex="0" data-pair-id="${pair.id}" data-search-text="${escapeHtml(`${pair.source_language} ${pair.target_language}`.toLowerCase())}">
            <div class="wa-avatar ai-avatar"><span>AI</span></div>
            <div class="wa-list-body">
              <div class="wa-list-top">
                <span class="wa-list-name">${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</span>
                <span class="wa-list-time">${last ? formatTime(last.created_at) : ""}</span>
              </div>
              <div class="wa-list-preview">${last ? escapeHtml(last.content).slice(0, 48) : I18N.t("communication.ai_tutor")}</div>
            </div>
            <span class="wa-list-arrow" aria-hidden="true">›</span>
          </div>`
          )
          .join("")}
        </div>
      </section>
      ${
        partners.length
          ? `
      <section class="communication-section">
        <div class="wa-list-header"><h2 data-i18n="communication.partners"></h2></div>
        <div class="wa-chat-list">
        ${partners
          .map(
            (p) => `
          <div class="wa-list-item" role="button" tabindex="0" data-partner-user-id="${p.user_id}" data-search-text="${escapeHtml(`${p.first_name} ${p.last_name} ${p.source_language} ${p.target_language}`.toLowerCase())}">
            <div class="wa-avatar partner-avatar"><span>${escapeHtml(initials(p.first_name, p.last_name))}</span></div>
            <div class="wa-list-body">
              <div class="wa-list-top">
                <span class="wa-list-name">${escapeHtml(p.first_name)} ${escapeHtml(p.last_name)}</span>
                <span class="wa-list-time">${escapeHtml(p.current_level)}</span>
              </div>
              <div class="wa-list-preview">${escapeHtml(p.source_language)} → ${escapeHtml(p.target_language)}</div>
            </div>
            <span class="wa-list-arrow" aria-hidden="true">›</span>
          </div>`
          )
          .join("")}
        </div>
      </section>`
          : ""
      }
      </div>
      <p class="communication-no-results hidden" id="chatSearchEmpty" data-i18n="communication.search_empty"></p>
    `;
    I18N.applyToDom(container);

    container.querySelectorAll("[data-read-message]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await API.post(`/profile/notifications/${button.dataset.readMessage}/read`);
          container.querySelector(`[data-notification-row="${button.dataset.readMessage}"]`)?.remove();
          if (!container.querySelector(".communication-notification")) container.querySelector(".communication-notifications")?.remove();
          App.refreshNotificationBadge();
        } catch (error) {
          button.disabled = false;
          ctx.showToast(error.message || I18N.t("auth.error_generic"), "error");
        }
      });
    });

    const chatSearchInput = document.getElementById("chatSearchInput");
    const searchEmpty = document.getElementById("chatSearchEmpty");

    chatSearchInput.addEventListener("input", () => {
      const query = chatSearchInput.value.trim().toLowerCase();
      let visibleItems = 0;
      container.querySelectorAll(".communication-section").forEach((section) => {
        let sectionVisible = false;
        section.querySelectorAll(".wa-list-item").forEach((item) => {
        const matches = (item.dataset.searchText || "").includes(query);
        item.classList.toggle("hidden", !matches);
          if (matches) {
            visibleItems += 1;
            sectionVisible = true;
          }
        });
        section.classList.toggle("hidden", !sectionVisible);
      });
      searchEmpty.classList.toggle("hidden", visibleItems > 0);
    });

    function activateOnKeyboard(item, activate) {
      item.addEventListener("click", activate);
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    }

    container.querySelectorAll(".wa-list-item[data-pair-id]").forEach((item) => {
      activateOnKeyboard(item, () => {
        const pair = pairs.find((p) => p.id === parseInt(item.dataset.pairId, 10));
        listScrollTop = container.scrollTop;
        renderChatDetail(container, ctx, pair);
      });
    });

    container.querySelectorAll(".wa-list-item[data-partner-user-id]").forEach((item) => {
      activateOnKeyboard(item, () => {
        const partner = partners.find((p) => p.user_id === parseInt(item.dataset.partnerUserId, 10));
        listScrollTop = container.scrollTop;
        renderPartnerChatDetail(container, ctx, partner);
      });
    });
  }

  function returnToChatList(container, ctx) {
    stopVoiceRecording();
    activeSpeechRecognition?.abort();
    activeSpeechRecognition = null;
    window.speechSynthesis?.cancel();
    if (endVoiceCall) {
      endVoiceCall(true);
      endVoiceCall = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    renderChatList(container, ctx).then(() => {
      container.scrollTop = listScrollTop;
    });
  }

  async function renderChatDetail(container, ctx, pair) {
    const { user, showToast } = ctx;
    const room = `ai_tutor_${user.id}_${pair.id}`;
    lastDateLabel = null;

    container.innerHTML = `
      <div class="wa-chat-screen">
        <div class="wa-header">
          <button class="wa-back-btn" id="waBackBtn" data-i18n-aria-label="communication.back">←</button>
          <div class="wa-avatar ai-avatar small"><span>AI</span></div>
          <div class="wa-header-info">
            <div class="wa-header-name" data-i18n="communication.ai_tutor"></div>
            <div class="wa-header-status" id="headerStatus">${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}</div>
          </div>
          <button class="wa-menu-btn" id="waMenuBtn" type="button" data-i18n-aria-label="communication.clear_conversation">•••</button>
        </div>
        <div class="ai-practice-tools">
          <label for="practiceScenario" data-i18n="communication.practice_mode"></label>
          <select id="practiceScenario" class="ai-practice-select">
            <option value="free_talk" data-i18n="communication.scenario_free_talk"></option>
            <option value="introductions" data-i18n="communication.scenario_introductions"></option>
            <option value="cafe" data-i18n="communication.scenario_cafe"></option>
            <option value="travel" data-i18n="communication.scenario_travel"></option>
            <option value="work" data-i18n="communication.scenario_work"></option>
          </select>
        </div>
        <div class="wa-chat-bg" id="chatMessages"></div>
        <div class="wa-input-row">
          <button class="wa-attach-btn" id="attachImageBtn" data-i18n-aria-label="communication.attach_image">▧</button>
          <input type="file" id="imageInput" class="hidden" accept="image/*" multiple />
          <button class="wa-attach-btn" id="attachBtn" data-i18n-aria-label="communication.attach">📎</button>
          <input type="file" id="attachmentInput" class="hidden" multiple />
          <textarea id="chatInput" rows="1" data-i18n-placeholder="communication.type_message" maxlength="2000"></textarea>
          <button class="wa-voice-message-btn ai-speech-input-btn" id="speechInputBtn" type="button" data-i18n-aria-label="communication.speak_message" title="Speak your message">🎤</button>
          <button class="wa-voice-message-btn" id="recordVoiceBtn" type="button" data-i18n-aria-label="communication.record_voice" title="Record voice message">🎙</button>
          <button class="wa-send-btn" id="sendBtn" data-i18n-aria-label="communication.send" disabled>↑</button>
        </div>
      </div>
    `;
    I18N.applyToDom(container);
    applyChatLabels(container);

    const headerStatusEl = document.getElementById("headerStatus");
    const idleStatus = `${escapeHtml(pair.source_language)} → ${escapeHtml(pair.target_language)}`;

    document.getElementById("waBackBtn").addEventListener("click", () => {
      returnToChatList(container, ctx);
    });
    document.getElementById("waMenuBtn").addEventListener("click", () => {
      clearConversation(messagesEl, room, showToast);
    });
    const messagesEl = document.getElementById("chatMessages");
    setupAttachmentPicker(document.getElementById("attachImageBtn"), document.getElementById("imageInput"), messagesEl, room, user.id, showToast);
    setupAttachmentPicker(document.getElementById("attachBtn"), document.getElementById("attachmentInput"), messagesEl, room, user.id, showToast);
    setupVoiceMessageRecorder(document.getElementById("recordVoiceBtn"), messagesEl, room, user.id, showToast);

    let history = [];
    try {
      history = await API.get(`/communication/rooms/${room}/messages`);
    } catch (e) {
      /* room may not have history yet */
    }
    if (!messagesEl.isConnected) return;
    history.forEach((m) => appendMessage(messagesEl, m, user.id, room, pair.target_language, showToast));
    scrollToBottom(messagesEl);

    connectWs();

    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const practiceScenario = document.getElementById("practiceScenario");

    let updateComposer = () => {};

    function send() {
      const text = input.value.trim();
      if (!text) return;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          content: text,
          language_pair_id: pair.id,
          practice_scenario: practiceScenario.value,
        }));
        input.value = "";
        updateComposer();
        showTypingIndicator(messagesEl);
        headerStatusEl.textContent = I18N.t("communication.typing") || "тайп мекунад...";
      } else {
        showToast(I18N.t("auth.error_generic"), "error");
      }
    }

    updateComposer = setupChatComposer(input, sendBtn, send);
    setupSpeechInput(document.getElementById("speechInputBtn"), input, pair.target_language, updateComposer, showToast);

    function connectWs() {
      const token = API.getToken();
      ws = new WebSocket(`${WS_BASE}/communication/ws/${room}?token=${encodeURIComponent(token)}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "message_deleted") {
          messagesEl.querySelector(`[data-message-id="${data.message_id}"]`)?.remove();
          lastDateLabel = null;
          const preview = chatListData?.previews.find((item) => item.room === room);
          if (preview?.last?.id === data.message_id) preview.last = null;
          App.refreshNotificationBadge();
          return;
        }
        removeTypingIndicator(messagesEl);
        headerStatusEl.textContent = idleStatus;
        if (data.type === "call_signal") return;
        appendMessage(messagesEl, data, user.id, room, pair.target_language, showToast);
        const preview = chatListData?.previews.find((item) => item.room === room);
        if (preview) preview.last = data;
        scrollToBottom(messagesEl);
      };
      ws.onerror = () => showToast(I18N.t("auth.error_generic"), "error");
    }

    function setupSpeechInput(button, input, targetLanguage, updateComposer, showToast) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        button.disabled = true;
        button.title = I18N.t("communication.speech_input_unavailable");
        return;
      }
      const recognition = new Recognition();
      recognition.lang = SpeechUtils.languageCode(targetLanguage);
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => {
        button.classList.add("recording");
        button.title = I18N.t("communication.stop_speaking");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        if (!transcript) return;
        input.value = `${input.value.trim()}${input.value.trim() ? " " : ""}${transcript}`;
        updateComposer();
        input.focus();
      };
      recognition.onerror = (event) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          showToast(I18N.t("communication.speech_input_failed"), "error");
        }
      };
      recognition.onend = () => {
        button.classList.remove("recording");
        button.title = I18N.t("communication.speak_message");
        if (activeSpeechRecognition === recognition) activeSpeechRecognition = null;
      };
      button.title = I18N.t("communication.speak_message");
      button.addEventListener("click", () => {
        if (activeSpeechRecognition) {
          activeSpeechRecognition.stop();
          return;
        }
        try {
          activeSpeechRecognition = recognition;
          recognition.start();
        } catch (error) {
          activeSpeechRecognition = null;
          showToast(I18N.t("communication.speech_input_failed"), "error");
        }
      });
    }

  }

  function setupChatComposer(input, sendButton, send) {
    const update = () => {
      const maxHeight = 136;
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, maxHeight)}px`;
      input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
      sendButton.disabled = !input.value.trim();
    };

    input.addEventListener("input", update);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        send();
      }
    });
    sendButton.addEventListener("click", send);
    update();
    return update;
  }

  function setupVoiceCall({ userId, showToast, panel, status, callButton, acceptButton, declineButton, muteButton, endButton, remoteAudio }) {
    let peerConnection = null;
    let localStream = null;
    let activeCallId = null;
    let incomingOffer = null;
    let pendingCandidates = [];
    const earlyCandidates = new Map();
    let callTimeout = null;
    let muted = false;

    function sendSignal(action, payload = {}) {
      if (!ws || ws.readyState !== WebSocket.OPEN || !activeCallId) return false;
      ws.send(JSON.stringify({ type: "call_signal", action, call_id: activeCallId, ...payload }));
      return true;
    }

    function showPanel(statusKey, incoming = false) {
      panel.classList.remove("hidden");
      status.textContent = I18N.t(statusKey);
      acceptButton.classList.toggle("hidden", !incoming);
      declineButton.classList.toggle("hidden", !incoming);
      muteButton.classList.toggle("hidden", incoming || !peerConnection);
      endButton.classList.toggle("hidden", incoming || !peerConnection);
      callButton.disabled = true;
    }

    function finishCall(notifyPeer = false) {
      if (notifyPeer) sendSignal("end");
      clearTimeout(callTimeout);
      callTimeout = null;
      peerConnection?.close();
      peerConnection = null;
      localStream?.getTracks().forEach((track) => track.stop());
      localStream = null;
      activeCallId = null;
      incomingOffer = null;
      pendingCandidates = [];
      earlyCandidates.clear();
      muted = false;
      muteButton.textContent = I18N.t("communication.mute");
      remoteAudio.srcObject = null;
      panel.classList.add("hidden");
      callButton.disabled = false;
      if (endVoiceCall === finishCall) endVoiceCall = null;
    }

    async function flushCandidates() {
      const candidates = pendingCandidates;
      pendingCandidates = [];
      for (const candidate of candidates) await peerConnection.addIceCandidate(candidate);
    }

    async function openPeerConnection() {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
        throw new Error("voice-unavailable");
      }
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      localStream.getAudioTracks().forEach((track) => peerConnection.addTrack(track, localStream));
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) sendSignal("ice", { candidate: event.candidate.toJSON() });
      };
      peerConnection.ontrack = (event) => {
        remoteAudio.play().catch(() => {});
      };
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection?.connectionState === "connected") {
          clearTimeout(callTimeout);
          callTimeout = null;
          status.textContent = I18N.t("communication.call_active");
        } else if (peerConnection?.connectionState === "failed") {
          showToast(I18N.t("communication.call_failed"), "error");
          finishCall();
        }
      };
      showPanel("communication.call_connecting");
      muteButton.classList.remove("hidden");
      endButton.classList.remove("hidden");
    }

    async function startCall() {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        showToast(I18N.t("auth.error_generic"), "error");
        return;
      }
      activeCallId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      showPanel("communication.calling");
      callTimeout = setTimeout(() => {
        finishCall();
        showToast(I18N.t("communication.call_timeout"));
      }, 45000);
      try {
        await openPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        status.textContent = I18N.t("communication.calling");
        sendSignal("offer", { description: peerConnection.localDescription.toJSON() });
      } catch (error) {
        finishCall();
        showToast(I18N.t(error.message === "voice-unavailable" ? "communication.voice_unavailable" : "communication.call_failed"), "error");
      }
    }

    async function acceptCall() {
      try {
        await openPeerConnection();
        await peerConnection.setRemoteDescription(incomingOffer);
        await flushCandidates();
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendSignal("answer", { description: peerConnection.localDescription.toJSON() });
        showPanel("communication.call_connecting");
        callTimeout = setTimeout(() => {
          finishCall(true);
          showToast(I18N.t("communication.call_timeout"));
        }, 45000);
      } catch (error) {
        finishCall();
        showToast(I18N.t("communication.call_failed"), "error");
      }
    }

    async function handleSignal(message) {
      if (message.sender_id === userId) return;
      if (message.action === "offer") {
        if (activeCallId) return;
        activeCallId = message.call_id;
        incomingOffer = message.description;
        pendingCandidates = (earlyCandidates.get(message.call_id) || []).map((candidate) => new RTCIceCandidate(candidate));
        earlyCandidates.delete(message.call_id);
        callTimeout = setTimeout(() => {
          sendSignal("reject");
          finishCall();
          showToast(I18N.t("communication.call_timeout"));
        }, 45000);
        showPanel("communication.incoming_call", true);
        return;
      }
      if (message.action === "ice" && !activeCallId) {
        const candidates = earlyCandidates.get(message.call_id) || [];
        if (earlyCandidates.size < 10 && candidates.length < 64) {
          candidates.push(message.candidate);
          earlyCandidates.set(message.call_id, candidates);
        }
        return;
      }
      if (message.call_id !== activeCallId) return;

      try {
        if (message.action === "answer" && peerConnection) {
          await peerConnection.setRemoteDescription(message.description);
          await flushCandidates();
          showPanel("communication.call_connecting");
        } else if (message.action === "ice") {
          const candidate = new RTCIceCandidate(message.candidate);
          if (peerConnection?.remoteDescription) await peerConnection.addIceCandidate(candidate);
          else pendingCandidates.push(candidate);
        } else if (message.action === "end" || message.action === "reject") {
          finishCall();
          showToast(I18N.t(message.action === "reject" ? "communication.call_declined" : "communication.call_ended"));
        }
      } catch (error) {
        finishCall();
        showToast(I18N.t("communication.call_failed"), "error");
      }
    }

    callButton.addEventListener("click", startCall);
    acceptButton.addEventListener("click", acceptCall);
    declineButton.addEventListener("click", () => {
      sendSignal("reject");
      finishCall();
    });
    muteButton.addEventListener("click", () => {
      muted = !muted;
      localStream?.getAudioTracks().forEach((track) => { track.enabled = !muted; });
      muteButton.textContent = I18N.t(muted ? "communication.unmute" : "communication.mute");
    });
    endButton.addEventListener("click", () => finishCall(true));

    return { handleSignal, finishCall };
  }

  async function renderPartnerChatDetail(container, ctx, partner) {
    const { user, showToast } = ctx;
    const room = partner.room;
    lastDateLabel = null;

    container.innerHTML = `
      <div class="wa-chat-screen">
        <div class="wa-header">
          <button class="wa-back-btn" id="waBackBtn" data-i18n-aria-label="communication.back">←</button>
          <div class="wa-avatar partner-avatar small"><span>${escapeHtml(initials(partner.first_name, partner.last_name))}</span></div>
          <div class="wa-header-info">
            <div class="wa-header-name">${escapeHtml(partner.first_name)} ${escapeHtml(partner.last_name)}</div>
            <div class="wa-header-status">${escapeHtml(partner.source_language)} → ${escapeHtml(partner.target_language)}</div>
          </div>
          <button class="wa-menu-btn" id="waMenuBtn" type="button" data-i18n-aria-label="communication.clear_conversation">•••</button>
          <button class="wa-call-btn" id="voiceCallBtn" data-i18n-aria-label="communication.voice_call">☎</button>
        </div>
        <div class="voice-call-panel hidden" id="voiceCallPanel" aria-live="polite">
          <span id="voiceCallStatus"></span>
          <div class="voice-call-actions">
            <button type="button" id="acceptCallBtn" class="call-accept-btn hidden" data-i18n="communication.accept_call"></button>
            <button type="button" id="declineCallBtn" class="call-end-btn hidden" data-i18n="communication.decline_call"></button>
            <button type="button" id="muteCallBtn" class="hidden" data-i18n="communication.mute"></button>
            <button type="button" id="endCallBtn" class="call-end-btn hidden" data-i18n="communication.end_call"></button>
          </div>
        </div>
        <audio id="remoteCallAudio" autoplay></audio>
        <div class="wa-chat-bg" id="chatMessages"></div>
        <div class="wa-input-row">
          <button class="wa-attach-btn" id="attachImageBtn" data-i18n-aria-label="communication.attach_image">▧</button>
          <input type="file" id="imageInput" class="hidden" accept="image/*" multiple />
          <button class="wa-attach-btn" id="attachBtn" data-i18n-aria-label="communication.attach">📎</button>
          <input type="file" id="attachmentInput" class="hidden" multiple />
          <textarea id="chatInput" rows="1" data-i18n-placeholder="communication.type_message" maxlength="2000"></textarea>
          <button class="wa-voice-message-btn" id="recordVoiceBtn" type="button" data-i18n-aria-label="communication.record_voice" title="Record voice message">🎙</button>
          <button class="wa-send-btn" id="sendBtn" data-i18n-aria-label="communication.send" disabled>↑</button>
        </div>
      </div>
    `;
    I18N.applyToDom(container);
    applyChatLabels(container);

    document.getElementById("waBackBtn").addEventListener("click", () => {
      returnToChatList(container, ctx);
    });

    const messagesEl = document.getElementById("chatMessages");
    document.getElementById("waMenuBtn").addEventListener("click", () => {
      clearConversation(messagesEl, room, showToast);
    });

    let history = [];
    try {
      history = await API.get(`/communication/rooms/${room}/messages`);
    } catch (e) {
      /* no history yet */
    }
    if (!messagesEl.isConnected) return;
    history.forEach((m) => appendMessage(messagesEl, m, user.id, room, "", showToast));
    scrollToBottom(messagesEl);

    setupAttachmentPicker(document.getElementById("attachImageBtn"), document.getElementById("imageInput"), messagesEl, room, user.id, showToast);
    setupAttachmentPicker(document.getElementById("attachBtn"), document.getElementById("attachmentInput"), messagesEl, room, user.id, showToast);
    setupVoiceMessageRecorder(document.getElementById("recordVoiceBtn"), messagesEl, room, user.id, showToast);
    const voiceCall = setupVoiceCall({
      room,
      userId: user.id,
      showToast,
      panel: document.getElementById("voiceCallPanel"),
      status: document.getElementById("voiceCallStatus"),
      callButton: document.getElementById("voiceCallBtn"),
      acceptButton: document.getElementById("acceptCallBtn"),
      declineButton: document.getElementById("declineCallBtn"),
      muteButton: document.getElementById("muteCallBtn"),
      endButton: document.getElementById("endCallBtn"),
      remoteAudio: document.getElementById("remoteCallAudio"),
    });
    endVoiceCall = voiceCall.finishCall;

    const token = API.getToken();
    ws = new WebSocket(`${WS_BASE}/communication/ws/${room}?token=${encodeURIComponent(token)}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message_deleted") {
        messagesEl.querySelector(`[data-message-id="${data.message_id}"]`)?.remove();
        lastDateLabel = null;
        App.refreshNotificationBadge();
        return;
      }
      if (data.type === "call_signal") {
        voiceCall.handleSignal(data);
        return;
      }
      appendMessage(messagesEl, data, user.id, room, "", showToast);
      if (data.sender_id && data.sender_id !== user.id) {
        App.refreshNotificationBadge();
        showToast(I18N.t("communication.message_from", { name: partner.first_name }));
      }
      scrollToBottom(messagesEl);
    };
    ws.onerror = () => showToast(I18N.t("auth.error_generic"), "error");
    ws.onclose = () => voiceCall.finishCall();

    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");

    let updateComposer = () => {};

    function send() {
      const text = input.value.trim();
      if (!text) return;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ content: text }));
        input.value = "";
        updateComposer();
      } else {
        showToast(I18N.t("auth.error_generic"), "error");
      }
    }

    updateComposer = setupChatComposer(input, sendBtn, send);
  }

  function maybeInsertDateSeparator(container, iso) {
    const label = dateLabel(iso);
    if (label !== lastDateLabel) {
      const sep = document.createElement("div");
      sep.className = "wa-date-sep";
      sep.innerHTML = `<span>${escapeHtml(label)}</span>`;
      container.appendChild(sep);
      lastDateLabel = label;
    }
  }

  function appendMessage(container, msg, currentUserId, room, targetLanguage = "", showToast = () => {}) {
    if (msg.id && container.querySelector(`[data-message-id="${msg.id}"]`)) return;
    maybeInsertDateSeparator(container, msg.created_at);

    const isMine = !msg.is_ai && msg.sender_id === currentUserId;
    const cls = msg.is_ai ? "ai" : isMine ? "mine" : "theirs";
    const div = document.createElement("div");
    div.className = `msg ${cls}`;
    if (msg.id) div.dataset.messageId = msg.id;
    const attachment = parseAttachment(msg.content || "");
    const isImage = attachment && inlineImageTypes.has(attachment.contentType);
    const isAudio = attachment && inlineAudioTypes.has(attachment.contentType);
    let html = attachment
      ? `<div class="chat-attachment ${isAudio ? "voice-message" : ""}">${isImage ? `<img class="attachment-preview" alt="${escapeHtml(attachment.filename)}" />` : isAudio ? `<audio class="voice-message-player" controls preload="metadata" aria-label="${I18N.t("communication.voice_message")}"></audio>` : `<span class="attachment-file-icon">FILE</span>`}<div class="attachment-details"><strong>${escapeHtml(attachment.filename)}</strong><span>${escapeHtml(attachment.contentType || "")}</span></div><button type="button" class="attachment-download" data-i18n="communication.download"></button></div>`
      : escapeHtml(msg.content);
    if (msg.is_ai && msg.corrected_text) {
      html += `<div class="correction"><strong>${I18N.t("communication.correction")}:</strong> ${escapeHtml(msg.corrected_text)}<br>${escapeHtml(msg.correction_notes || "")}</div>`;
    }
    if (msg.is_ai && !attachment) {
      const canSpeak = window.speechSynthesis && window.SpeechSynthesisUtterance;
      html += `<button type="button" class="msg-speak-btn" aria-label="${escapeHtml(I18N.t("communication.play_reply"))}" title="${escapeHtml(I18N.t(canSpeak ? "communication.play_reply" : "communication.speech_output_unavailable"))}" ${canSpeak ? "" : "disabled"}>🔊</button>`;
    }
    if (isMine && msg.id) {
      html += `<button type="button" class="msg-delete-btn" data-delete-message="${msg.id}" aria-label="${escapeHtml(I18N.t("communication.cancel_message"))}" title="${escapeHtml(I18N.t("communication.cancel_message"))}">×</button>`;
    }
    html += `<span class="msg-time">${formatTime(msg.created_at)}${isMine ? ' <span class="msg-ticks">✓✓</span>' : ""}</span>`;
    div.innerHTML = html;
    container.appendChild(div);
    div.querySelector("[data-delete-message]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (!window.confirm(I18N.t("communication.cancel_message_confirm"))) return;
      button.disabled = true;
      try {
        await API.delete(deleteMessagePath(room, msg.id));
        div.remove();
        lastDateLabel = null;
      } catch (error) {
        button.disabled = false;
        showToast(error.message || I18N.t("auth.error_generic"), "error");
      }
    });
    div.querySelector(".msg-speak-btn")?.addEventListener("click", () => speakText(msg.content, targetLanguage));

    if (attachment) {
      const path = attachmentPath(room, attachment.id);
      const image = div.querySelector(".attachment-preview");
      const audio = div.querySelector(".voice-message-player");
      if (image || audio) {
        API.download(path)
          .then((blob) => {
            if (!div.isConnected) return;
            const url = URL.createObjectURL(blob);
            attachmentUrls.add(url);
            if (image) image.src = url;
            if (audio) audio.src = url;
          })
          .catch(() => {
            if (image) image.remove();
            if (audio) audio.remove();
          });
      }
      div.querySelector(".attachment-download").addEventListener("click", async () => {
        try {
          const url = URL.createObjectURL(await API.download(path));
          attachmentUrls.add(url);
          const link = document.createElement("a");
          link.href = url;
          link.download = attachment.filename;
          link.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
            attachmentUrls.delete(url);
          }, 1000);
        } catch (error) {
          console.error("Attachment download failed", error);
        }
      });
      I18N.applyToDom(div);
    }
  }

  function showTypingIndicator(container) {
    const div = document.createElement("div");
    div.className = "msg ai wa-typing-bubble";
    div.id = "typingIndicator";
    div.innerHTML = `<span class="wa-typing-dot"></span><span class="wa-typing-dot"></span><span class="wa-typing-dot"></span>`;
    container.appendChild(div);
    scrollToBottom(container);
  }

  function removeTypingIndicator(container) {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
  }

  return { render, teardown };
})();
