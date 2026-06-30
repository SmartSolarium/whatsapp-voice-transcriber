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

const enabled = document.querySelector("#enabled");
const provider = document.querySelector("#provider");
const serverUrl = document.querySelector("#serverUrl");
const language = document.querySelector("#language");
const localSettings = document.querySelector("#localSettings");
const openaiSettings = document.querySelector("#openaiSettings");
const openaiApiKey = document.querySelector("#openaiApiKey");
const openaiModel = document.querySelector("#openaiModel");
const status = document.querySelector("#status");

init();

async function init() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const local = await chrome.storage.local.get(DEFAULT_LOCAL_SETTINGS);
  enabled.checked = settings.enabled;
  provider.value = settings.provider;
  serverUrl.value = settings.serverUrl;
  language.value = settings.language;
  openaiModel.value = settings.openaiModel;
  openaiApiKey.value = local.openaiApiKey;
  syncVisibility();
}

enabled.addEventListener("change", save);
language.addEventListener("change", save);
serverUrl.addEventListener("change", save);
openaiModel.addEventListener("change", save);
openaiApiKey.addEventListener("change", save);
provider.addEventListener("change", async () => {
  syncVisibility();
  await save();
});

document.querySelector("#check").addEventListener("click", async () => {
  await save();

  if (provider.value === "openai") {
    if (openaiApiKey.value.trim()) {
      showStatus("OpenAI configurato. La verifica reale avviene al prossimo vocale.", "ok");
    } else {
      showStatus("Inserisci una OpenAI API key.", "error");
    }
    return;
  }

  showStatus("Controllo…", "");
  const reply = await chrome.runtime.sendMessage({ type: "CHECK_SERVER", serverUrl: serverUrl.value });
  if (reply?.ok) showStatus(`Collegato · modello ${reply.result.model}`, "ok");
  else showStatus(reply?.error || "Servizio non raggiungibile", "error");
});

async function save() {
  await chrome.storage.sync.set({
    enabled: enabled.checked,
    provider: provider.value,
    serverUrl: serverUrl.value.trim().replace(/\/+$/, ""),
    language: language.value,
    openaiModel: openaiModel.value.trim() || DEFAULT_SETTINGS.openaiModel
  });
  await chrome.storage.local.set({
    openaiApiKey: openaiApiKey.value.trim()
  });
}

function syncVisibility() {
  const isOpenAI = provider.value === "openai";
  localSettings.hidden = isOpenAI;
  openaiSettings.hidden = !isOpenAI;
}

function showStatus(text, type) {
  status.textContent = text;
  status.className = type;
}
