# WhatsApp Web Voice Transcriber

Chrome extension that automatically transcribes visible WhatsApp Web voice messages inline, without pressing Play.

Estensione Chrome che trascrive automaticamente i vocali visibili su WhatsApp Web, direttamente sotto il messaggio, senza premere Play.

## Current status / Stato attuale

- Works on WhatsApp Web with the currently tested layout.
- Local Whisper backend works on Windows with CPU mode.
- Optional OpenAI API fallback is available from the extension popup.
- The WhatsApp integration uses internal WhatsApp Web modules, so it may require maintenance if WhatsApp changes its web app.

---

- Funziona su WhatsApp Web con la struttura attualmente testata.
- Il backend locale Whisper funziona su Windows in modalità CPU.
- È disponibile un fallback opzionale OpenAI API dal popup dell'estensione.
- L'integrazione usa moduli interni di WhatsApp Web, quindi può richiedere manutenzione se WhatsApp aggiorna il sito.

## Features / Funzioni

- Automatic detection of visible voice notes.
- Audio retrieval without clicking Play.
- Inline transcription under the voice message.
- Local transcript cache.
- Local `faster-whisper` transcription service.
- Optional OpenAI transcription provider.

---

- Rilevamento automatico dei vocali visibili.
- Recupero audio senza premere Play.
- Trascrizione inline sotto il vocale.
- Cache locale delle trascrizioni.
- Servizio locale di trascrizione con `faster-whisper`.
- Provider opzionale OpenAI.

## Quick install for office users / Installazione rapida per l'ufficio

See [INSTALLA_COLLEGHE.md](INSTALLA_COLLEGHE.md).

Vedi [INSTALLA_COLLEGHE.md](INSTALLA_COLLEGHE.md).

## Local Whisper setup / Setup Whisper locale

Requirements:

- Windows 10/11
- Google Chrome
- Python 3.10+
- Internet connection for the first model download

From the project folder:

```powershell
.\server\install.ps1
.\server\start-background.ps1
.\server\status.ps1
```

`status.ps1` should print:

```text
OK - Servizio Whisper raggiungibile
```

The local service runs at:

```text
http://127.0.0.1:8765
```

---

Requisiti:

- Windows 10/11
- Google Chrome
- Python 3.10+
- Connessione Internet per il primo download del modello

Dalla cartella del progetto:

```powershell
.\server\install.ps1
.\server\start-background.ps1
.\server\status.ps1
```

`status.ps1` deve mostrare:

```text
OK - Servizio Whisper raggiungibile
```

Il servizio locale gira su:

```text
http://127.0.0.1:8765
```

## Chrome extension install / Installazione estensione Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder.
5. Open or reload `https://web.whatsapp.com`.

---

1. Apri `chrome://extensions`.
2. Attiva **Modalità sviluppatore**.
3. Clicca **Carica estensione non pacchettizzata**.
4. Seleziona la cartella `extension`.
5. Apri o ricarica `https://web.whatsapp.com`.

## OpenAI API mode / Modalità OpenAI API

From the extension popup:

1. Set **Motore trascrizione** to **OpenAI API**.
2. Paste your OpenAI API key.
3. Keep `gpt-4o-mini-transcribe` or choose another compatible transcription model.

In this mode, audio is sent to OpenAI for transcription.

---

Dal popup dell'estensione:

1. Imposta **Motore trascrizione** su **OpenAI API**.
2. Incolla la tua OpenAI API key.
3. Lascia `gpt-4o-mini-transcribe` o scegli un altro modello compatibile.

In questa modalità, l'audio viene inviato a OpenAI per la trascrizione.

## Packaging / Creazione pacchetti

```powershell
.\package-release.ps1
```

This creates:

- `release\whatsapp-voice-transcriber-*-office.zip`
- `release\whatsapp-voice-transcriber-*-extension-only.zip`

---

Questo crea:

- `release\whatsapp-voice-transcriber-*-office.zip`
- `release\whatsapp-voice-transcriber-*-extension-only.zip`

## Diagnostics / Diagnostica

- Extension popup: click **Verifica**.
- PowerShell: run `.\server\status.ps1`.
- WhatsApp Web console: filter logs by `[WVT]`.
- If an error appears under a voice note, click the error box to retry.

---

- Popup estensione: clicca **Verifica**.
- PowerShell: esegui `.\server\status.ps1`.
- Console di WhatsApp Web: filtra i log con `[WVT]`.
- Se compare un errore sotto un vocale, clicca il box errore per ritentare.

## Privacy / Privacy

See [PRIVACY.md](PRIVACY.md).

Vedi [PRIVACY.md](PRIVACY.md).

## Important note / Nota importante

WhatsApp Web does not provide an official public API for voice messages. This extension relies on internal WhatsApp Web modules and may break when WhatsApp changes its web app.

WhatsApp Web non offre una API pubblica ufficiale per i vocali. Questa estensione usa moduli interni di WhatsApp Web e può rompersi quando WhatsApp aggiorna il sito.
