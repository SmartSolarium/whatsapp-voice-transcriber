(() => {
  const DEFAULT_SETTINGS = { enabled: true, language: "it" };
  const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
  const jobs = new Map();
  const bridgeRequests = new Map();
  const requestedMessageIds = new Set();
  const transcriptMemoryCache = new Map();
  const observedAudio = new WeakSet();
  const observedButtons = new WeakSet();
  let settings = { ...DEFAULT_SETTINGS };
  let scanScheduled = false;
  let pendingVoiceMessage = null;

  const visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio > 0) queueAudio(entry.target);
    }
  }, { root: null, threshold: 0.01 });

  const voiceVisibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio > 0) queueVoiceButton(entry.target);
    }
  }, { root: null, threshold: 0.01 });

  init().catch((error) => console.warn("[WVT] Avvio fallito", error));

  async function init() {
    settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      for (const [key, change] of Object.entries(changes)) settings[key] = change.newValue;
      if (settings.enabled) scheduleScan();
    });

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"]
    });
    window.addEventListener("message", receiveBridgeMessage);
    scan();
    console.info("[WVT] Rilevamento vocali attivo");
  }

  function scheduleScan() {
    if (scanScheduled || !settings.enabled) return;
    scanScheduled = true;
    requestAnimationFrame(() => {
      scanScheduled = false;
      scan();
    });
  }

  function scan() {
    if (!settings.enabled) return;
    document.querySelectorAll("audio").forEach((audio) => {
      if (observedAudio.has(audio)) return;
      observedAudio.add(audio);
      visibilityObserver.observe(audio);
      if (isVisible(audio)) queueAudio(audio);
    });

    document.querySelectorAll('button[aria-label="Riproduci messaggio vocale"]').forEach((button) => {
      if (observedButtons.has(button)) return;
      observedButtons.add(button);
      button.addEventListener("click", () => rememberPlayedVoice(button), { capture: true });
      voiceVisibilityObserver.observe(button);
      if (isVisible(button)) queueVoiceButton(button);
    });
  }

  function queueVoiceButton(button) {
    if (!settings.enabled || !button.isConnected) return;
    const message = findMessageContainer(button);
    const messageId = getMessageId(message);
    if (!message || !messageId || requestedMessageIds.has(messageId)) return;
    if (message.querySelector(":scope .wvt-transcript[data-wvt-owner='1']")) return;

    const requestId = crypto.randomUUID();
    requestedMessageIds.add(messageId);
    bridgeRequests.set(requestId, { button, message, messageId });
    renderBox(message, "loading", "Recupero e trascrizione del vocale…");
    window.postMessage({
      source: "wvt-content",
      type: "DOWNLOAD_AUDIO",
      requestId,
      messageId
    }, location.origin);
  }

  function rememberPlayedVoice(button) {
    const message = findMessageContainer(button);
    if (!message) return;
    pendingVoiceMessage = { message, expiresAt: Date.now() + 15_000 };
    setTimeout(() => {
      if (pendingVoiceMessage?.message === message && pendingVoiceMessage.expiresAt <= Date.now()) {
        pendingVoiceMessage = null;
      }
    }, 15_100);
  }

  function receiveBridgeMessage(event) {
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.source !== "wvt-page-bridge") return;

    if (event.data.type === "AUDIO_BLOB_READY") {
      const request = bridgeRequests.get(event.data.requestId);
      if (!request || !String(event.data.url || "").startsWith("blob:")) return;
      bridgeRequests.delete(event.data.requestId);
      requestedMessageIds.delete(request.messageId);
      queueSource(event.data.url, request.message, event.data.mimeType);
      return;
    }

    if (event.data.type === "AUDIO_DOWNLOAD_ERROR") {
      const request = bridgeRequests.get(event.data.requestId);
      if (!request) return;
      bridgeRequests.delete(event.data.requestId);
      requestedMessageIds.delete(request.messageId);
      renderDownloadError(request, event.data.error);
      return;
    }

    if (event.data.type !== "AUDIO_BLOB_CREATED") return;
    if (!String(event.data.url || "").startsWith("blob:")) return;
    if (!pendingVoiceMessage || pendingVoiceMessage.expiresAt < Date.now()) return;

    const { message } = pendingVoiceMessage;
    pendingVoiceMessage = null;
    queueSource(event.data.url, message, event.data.mimeType);
  }

  function renderDownloadError(request, error) {
    const box = renderBox(request.message, "error", `${error || "Vocale non disponibile"} — clicca per riprovare`);
    box.title = "Clicca per ritentare";
    box.onclick = () => {
      box.remove();
      queueVoiceButton(request.button);
    };
  }

  async function queueAudio(audio) {
    if (!settings.enabled || !audio.isConnected) return;
    const message = findMessageContainer(audio);
    if (!message || message.querySelector(":scope .wvt-transcript[data-wvt-owner='1']")) return;

    const src = await waitForAudioSource(audio);
    if (!src) return;

    const provisionalKey = message.getAttribute("data-id") || src;
    if (jobs.has(provisionalKey)) return;
    const job = processAudio(audio, message).finally(() => jobs.delete(provisionalKey));
    jobs.set(provisionalKey, job);
  }

  async function processAudio(audio, message) {
    return processSource(audio.currentSrc || audio.src, message);
  }

  function queueSource(src, message, hintedMimeType) {
    if (!settings.enabled || !message?.isConnected) return;
    const key = message.getAttribute("data-id") || message.getAttribute("data-testid") || src;
    if (jobs.has(key)) return;
    const job = processSource(src, message, hintedMimeType).finally(() => jobs.delete(key));
    jobs.set(key, job);
  }

  async function processSource(src, message, hintedMimeType) {
    const box = renderBox(message, "loading", "Trascrizione in corso…");
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Audio non disponibile (HTTP ${response.status})`);
      const blob = await response.blob();
      if (!blob.size) throw new Error("Il file audio è vuoto");
      if (blob.size > MAX_AUDIO_BYTES) throw new Error("Il vocale supera il limite di 50 MB");

      const bytes = new Uint8Array(await blob.arrayBuffer());
      const hash = await sha256(bytes);
      box.dataset.audioHash = hash;

      const cacheKey = `transcript:${hash}`;
      const cached = await getCachedTranscript(cacheKey);
      if (cached?.text) {
        renderResult(box, cached);
        return;
      }

      const reply = await chrome.runtime.sendMessage({
        type: "TRANSCRIBE_AUDIO",
        base64: bytesToBase64(bytes),
        mimeType: blob.type || hintedMimeType || "audio/ogg",
        fileName: fileNameForMime(blob.type || hintedMimeType),
        language: settings.language
      });
      if (!reply?.ok) throw new Error(reply?.error || "Trascrizione non riuscita");

      const result = reply.result;
      await setCachedTranscript(cacheKey, result);
      renderResult(box, result);
    } catch (error) {
      console.warn("[WVT] Trascrizione fallita", error);
      box.dataset.state = "error";
      box.textContent = `${error.message || error} — clicca per riprovare`;
      box.title = "Clicca per ritentare";
      box.onclick = () => {
        box.remove();
        queueSource(src, message, hintedMimeType);
      };
    }
  }

  function findMessageContainer(audio) {
    return audio.closest("[data-testid^='conv-msg-']") ||
      audio.closest("[data-id]") ||
      audio.closest("[role='row']") ||
      audio.closest(".message-in, .message-out") ||
      audio.parentElement?.parentElement?.parentElement;
  }

  function getMessageId(message) {
    if (!message) return null;
    return message.getAttribute("data-id") ||
      message.getAttribute("data-testid")?.replace(/^conv-msg-/, "") ||
      null;
  }

  function renderBox(message, state, text) {
    let box = message.querySelector(":scope .wvt-transcript[data-wvt-owner='1']");
    if (!box) {
      box = document.createElement("div");
      box.className = "wvt-transcript";
      box.dataset.wvtOwner = "1";
      const target = message.querySelector(":scope [data-testid='msg-container']") || message;
      target.appendChild(box);
    }
    box.dataset.state = state;
    box.textContent = text;
    return box;
  }

  function renderResult(box, result) {
    box.dataset.state = "done";
    box.textContent = result.text?.trim() || "[Nessun parlato rilevato]";
    if (result.language) {
      const meta = document.createElement("span");
      meta.className = "wvt-transcript__meta";
      const provider = result.provider === "openai" ? "OpenAI" : "locale";
      meta.textContent = `Trascrizione ${provider} · ${result.language}`;
      box.appendChild(meta);
    }
  }

  async function getCachedTranscript(cacheKey) {
    if (transcriptMemoryCache.has(cacheKey)) return transcriptMemoryCache.get(cacheKey);
    const area = getTranscriptStorageArea();
    if (!area?.get) return null;
    try {
      const stored = await area.get(cacheKey);
      const value = stored?.[cacheKey] || null;
      if (value) transcriptMemoryCache.set(cacheKey, value);
      return value;
    } catch (error) {
      console.warn("[WVT] Cache trascrizioni non disponibile", error);
      return null;
    }
  }

  async function setCachedTranscript(cacheKey, value) {
    transcriptMemoryCache.set(cacheKey, value);
    const area = getTranscriptStorageArea();
    if (!area?.set) return;
    try {
      await area.set({ [cacheKey]: value });
    } catch (error) {
      console.warn("[WVT] Cache trascrizioni non scrivibile", error);
    }
  }

  function getTranscriptStorageArea() {
    return chrome?.storage?.local || null;
  }

  async function waitForAudioSource(audio) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const src = audio.currentSrc || audio.src;
      if (src) return src;
      await delay(250);
    }
    return null;
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= innerHeight;
  }

  async function sha256(bytes) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function bytesToBase64(bytes) {
    const chunkSize = 0x8000;
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  function fileNameForMime(mime) {
    if (/webm/i.test(mime || "")) return "voice-note.webm";
    if (/mp4|m4a/i.test(mime || "")) return "voice-note.m4a";
    if (/mpeg|mp3/i.test(mime || "")) return "voice-note.mp3";
    return "voice-note.ogg";
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
