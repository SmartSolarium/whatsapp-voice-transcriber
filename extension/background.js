const DEFAULT_SETTINGS = {
  enabled: true,
  provider: "local",
  serverUrl: "http://127.0.0.1:8765",
  language: "it",
  openaiModel: "gpt-4o-mini-transcribe"
};

const DEFAULT_LOCAL_SETTINGS = {
  openaiApiKey: ""
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set(current);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "TRANSCRIBE_AUDIO") {
    transcribeAudio(message)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: readableError(error) }));
    return true;
  }

  if (message?.type === "CHECK_SERVER") {
    checkServer(message.serverUrl)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: readableError(error) }));
    return true;
  }
});

async function transcribeAudio({ base64, mimeType, fileName, language }) {
  const bytes = base64ToBytes(base64);
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  if (settings.provider === "openai") {
    return transcribeWithOpenAI({
      bytes,
      mimeType,
      fileName,
      language,
      model: settings.openaiModel
    });
  }

  return transcribeWithLocalWhisper({
    bytes,
    mimeType,
    fileName,
    language,
    serverUrl: settings.serverUrl
  });
}

async function transcribeWithLocalWhisper({ bytes, mimeType, fileName, language, serverUrl }) {
  const form = new FormData();
  form.append("audio", new Blob([bytes], { type: mimeType || "audio/ogg" }), fileName || "voice-note.ogg");
  if (language && language !== "auto") form.append("language", language);

  const response = await fetch(`${normaliseServerUrl(serverUrl)}/transcribe`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(10 * 60 * 1000)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Servizio locale: HTTP ${response.status}${detail ? ` — ${detail}` : ""}`);
  }

  const result = await response.json();
  return { ...result, provider: "local" };
}

async function transcribeWithOpenAI({ bytes, mimeType, fileName, language, model }) {
  const { openaiApiKey } = await chrome.storage.local.get(DEFAULT_LOCAL_SETTINGS);
  if (!openaiApiKey) {
    throw new Error("Chiave OpenAI mancante. Inseriscila nel popup dell'estensione.");
  }

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType || "audio/ogg" }), fileName || "voice-note.ogg");
  form.append("model", model || DEFAULT_SETTINGS.openaiModel);
  form.append("response_format", "json");
  if (language && language !== "auto") form.append("language", language);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: form,
    signal: AbortSignal.timeout(10 * 60 * 1000)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI: HTTP ${response.status}${detail ? ` — ${detail}` : ""}`);
  }

  const result = await response.json();
  return {
    text: result.text || "",
    language: language && language !== "auto" ? language : result.language,
    provider: "openai",
    raw: result
  };
}

async function checkServer(serverUrl) {
  const response = await fetch(`${normaliseServerUrl(serverUrl)}/health`, {
    signal: AbortSignal.timeout(3000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function normaliseServerUrl(value) {
  return String(value || DEFAULT_SETTINGS.serverUrl).replace(/\/+$/, "");
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function readableError(error) {
  if (error?.name === "TimeoutError") return "La trascrizione ha superato il tempo massimo.";
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Servizio Whisper locale non raggiungibile. Avvia server/start-background.ps1.";
  }
  return error?.message || String(error);
}
