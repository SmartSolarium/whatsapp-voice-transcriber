# Istruzioni rapide - Trascrizione vocali WhatsApp Web

## 1. Scarica e prepara

1. Scarica lo ZIP ricevuto.
2. Estrai tutto in una cartella semplice, per esempio:

   ```text
   C:\WhatsappVoiceTranscriber
   ```

3. Entra nella cartella estratta.

## 2. Installa il servizio vocale

Fai doppio click su:

```text
INSTALLA.bat
```

Aspetta che finisca. Alla fine deve comparire:

```text
OK - Servizio Whisper raggiungibile
```

Se dice che Python manca, installa Python 3.10 o superiore e rilancia `INSTALLA.bat`.

## 3. Installa l'estensione in Chrome

1. Apri Chrome.
2. Vai su:

   ```text
   chrome://extensions
   ```

3. Attiva **Modalità sviluppatore** in alto a destra.
4. Clicca **Carica estensione non pacchettizzata**.
5. Seleziona la cartella:

   ```text
   extension
   ```

6. Apri o ricarica:

   ```text
   https://web.whatsapp.com
   ```

## 4. Uso quotidiano

Se un giorno la trascrizione non parte, fai doppio click su:

```text
AVVIA_WHISPER.bat
```

Poi ricarica WhatsApp Web.

## Note

- La prima trascrizione può essere lenta perché scarica/carica il modello.
- L'audio resta sul PC quando è selezionato **Whisper locale**.
- Se compare un errore sotto un vocale, cliccalo per ritentare.
