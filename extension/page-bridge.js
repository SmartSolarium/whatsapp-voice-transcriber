(() => {
  if (window.__wvtBridgeInstalled) return;
  window.__wvtBridgeInstalled = true;

  const originalCreateObjectURL = URL.createObjectURL.bind(URL);
  const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);

  URL.createObjectURL = function createObjectURL(object) {
    const url = originalCreateObjectURL(object);
    if (object instanceof Blob && /^audio\//i.test(object.type || "")) {
      window.postMessage({
        source: "wvt-page-bridge",
        type: "AUDIO_BLOB_CREATED",
        url,
        mimeType: object.type,
        size: object.size
      }, location.origin);
    }
    return url;
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.source !== "wvt-content" || event.data?.type !== "DOWNLOAD_AUDIO") return;
    downloadAudio(event.data.requestId, event.data.messageId);
  });

  async function downloadAudio(requestId, shortMessageId) {
    try {
      const modules = await waitForWhatsAppModules();
      const message = resolveMessage(modules.collections.Msg, shortMessageId);
      if (!message) throw new Error(`Messaggio ${shortMessageId} non trovato nel datastore WhatsApp`);
      if (!message.mediaData) throw new Error("Il messaggio non contiene dati audio");
      if (message.mediaData.mediaStage === "REUPLOADING") {
        throw new Error("Il vocale è temporaneamente in fase di ripristino");
      }

      await message.downloadMedia({
        downloadEvenIfExpensive: true,
        rmrReason: 1,
        isUserInitiated: true
      });

      const mediaStage = String(message.mediaData.mediaStage || "");
      if (mediaStage.includes("ERROR") || mediaStage === "FETCHING") {
        throw new Error(`Download WhatsApp non riuscito (${mediaStage || "stato sconosciuto"})`);
      }

      const filehash = message.mediaObject?.filehash || message.mediaData?.filehash;
      const cached = filehash ? modules.blobCache.get(filehash) : null;
      const blob = cached || message.mediaObject?.mediaBlob?.forceToBlob?.() ||
        message.mediaData?.mediaBlob?.forceToBlob?.();
      if (!(blob instanceof Blob) || !blob.size) {
        throw new Error("WhatsApp ha scaricato il vocale ma non lo ha lasciato in cache");
      }

      const url = originalCreateObjectURL(blob);
      window.postMessage({
        source: "wvt-page-bridge",
        type: "AUDIO_BLOB_READY",
        requestId,
        url,
        mimeType: blob.type || message.mimetype || "audio/ogg",
        size: blob.size
      }, location.origin);
      setTimeout(() => originalRevokeObjectURL(url), 60_000);
    } catch (error) {
      console.warn("[WVT bridge] Download automatico fallito", error);
      window.postMessage({
        source: "wvt-page-bridge",
        type: "AUDIO_DOWNLOAD_ERROR",
        requestId,
        error: readableError(error)
      }, location.origin);
    }
  }

  async function waitForWhatsAppModules() {
    const deadline = Date.now() + 60_000;
    let lastError = null;
    while (Date.now() < deadline) {
      try {
        if (typeof window.require !== "function") throw new Error("window.require non disponibile");
        const collections = window.require("WAWebCollections");
        const cacheModule = window.require("WAWebMediaInMemoryBlobCache");
        const blobCache = cacheModule?.InMemoryMediaBlobCache;
        if (collections?.Msg && blobCache?.get) return { collections, blobCache };
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Moduli WhatsApp non pronti: ${readableError(lastError)}`);
  }

  function resolveMessage(collection, shortMessageId) {
    const shortId = String(shortMessageId || "").replace(/^conv-msg-/, "");
    if (!shortId) return null;

    const direct = collection.get?.(shortId);
    if (direct) return direct;

    const models = Array.isArray(collection.models)
      ? collection.models
      : typeof collection.getModelsArray === "function"
        ? collection.getModelsArray()
        : [];
    return models.find((item) => {
      const id = item?.id;
      return id?.id === shortId ||
        id?._serialized === shortId ||
        String(id?._serialized || id || "").endsWith(`_${shortId}`);
    }) || null;
  }

  function readableError(error) {
    return error?.message || error?.code || String(error);
  }

  console.info("[WVT bridge] Integrazione WhatsApp mirata attiva");
})();
