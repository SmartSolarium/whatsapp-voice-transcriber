# Installazione per colleghe / Office installation

Questa guida serve per installare la versione attuale in ufficio.

This guide installs the current office version.

## Requisiti / Requirements

- Windows 10/11
- Google Chrome
- WhatsApp Web access
- Python 3.10 or newer
- Internet connection for the first setup

## Installazione rapida / Quick install

1. Da GitHub, clicca **Code** -> **Download ZIP**.

   From GitHub, click **Code** -> **Download ZIP**.

2. Estrai lo ZIP in una cartella stabile, ad esempio:

   Extract the ZIP into a stable folder, for example:

   ```text
   C:\WhatsappVoiceTranscriber
   ```

3. Apri PowerShell dentro quella cartella.

   Open PowerShell inside that folder.

4. Esegui:

   Run:

   ```powershell
   .\server\install.ps1
   .\server\start-background.ps1
   .\server\status.ps1
   ```

5. Controlla che appaia:

   Check that you see:

   ```text
   OK - Servizio Whisper raggiungibile
   ```

6. Apri Chrome e vai su:

   Open Chrome and go to:

   ```text
   chrome://extensions
   ```

7. Attiva **Modalità sviluppatore**.

   Enable **Developer mode**.

8. Clicca **Carica estensione non pacchettizzata**.

   Click **Load unpacked**.

9. Seleziona la cartella:

   Select the folder:

   ```text
   extension
   ```

10. Apri o ricarica:

   Open or reload:

   ```text
   https://web.whatsapp.com
   ```

11. Apri una chat con vocali visibili. La trascrizione dovrebbe comparire sotto il vocale.

    Open a chat with visible voice notes. The transcription should appear under the voice note.

## Uso quotidiano / Daily use

Se la trascrizione non parte, apri PowerShell nella cartella del programma ed esegui:

If transcription does not start, open PowerShell in the program folder and run:

```powershell
.\server\start-background.ps1
```

Se Chrome mostra un errore sotto il vocale, clicca il box errore per ritentare.

If Chrome shows an error under the voice note, click the error box to retry.

## Modalità OpenAI API / OpenAI API mode

Nel popup dell'estensione puoi scegliere **OpenAI API** invece di **Whisper locale**.

In the extension popup you can choose **OpenAI API** instead of **Whisper locale**.

Con OpenAI:

With OpenAI:

- non serve il servizio Python locale;
- the local Python service is not needed;
- l'audio dei vocali viene inviato all'API OpenAI;
- voice note audio is sent to the OpenAI API;
- serve una OpenAI API key inserita nel popup.
- an OpenAI API key must be entered in the popup.

Per dati sensibili o uso interno, il motore locale è più privato.

For sensitive data or internal office use, the local engine is more private.

## Note importanti / Important notes

- WhatsApp Web non espone una API ufficiale per i vocali.
- WhatsApp Web does not expose an official voice-message API.
- Questa integrazione usa moduli interni di WhatsApp Web e può rompersi con aggiornamenti del sito.
- This integration uses internal WhatsApp Web modules and may break when WhatsApp updates the site.
- In modalità sviluppatore Chrome può mostrare avvisi sulle estensioni non pacchettizzate.
- In developer mode Chrome may show warnings about unpacked extensions.
