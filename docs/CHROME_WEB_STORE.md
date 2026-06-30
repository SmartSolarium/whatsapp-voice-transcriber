# Pubblicazione su Chrome Web Store

## Si può pubblicare gratuitamente?

L'estensione può essere pubblicata come gratuita per gli utenti, ma il Chrome Web Store richiede normalmente un account sviluppatore registrato. Google indica una fee di registrazione una tantum per gli sviluppatori.

Riferimento ufficiale: <https://developer.chrome.com/docs/webstore/register>

## Quale versione conviene pubblicare?

Per una installazione davvero semplice serve una versione cloud-only:

- niente servizio Python locale;
- niente `localhost`;
- l'utente inserisce una propria API key OpenAI/Google nel popup, oppure l'estensione chiama un backend nostro;
- installazione diretta dal Chrome Web Store.

La versione locale con Whisper è più privata, ma non è "una sola estensione": richiede un servizio Python installato e avviato sul PC.

## Opzioni prodotto

### 1. Bring your own key

L'utente inserisce la propria API key nel popup.

Pro:

- niente server nostro;
- GitHub e Chrome Web Store più semplici;
- costi a carico dell'utente che inserisce la chiave.

Contro:

- meno comodo per utenti non tecnici;
- ogni utente deve avere o ricevere una chiave API;
- la chiave resta nel profilo Chrome dell'utente.

### 2. Backend nostro

L'estensione invia l'audio a un server nostro, e il server chiama OpenAI/Google.

Pro:

- esperienza molto più semplice per gli utenti;
- nessuna API key nel popup;
- possiamo cambiare provider senza aggiornare l'estensione.

Contro:

- costi API e server a nostro carico;
- serve autenticazione o rate limit;
- serve una privacy policy più seria;
- bisogna gestire dati audio potenzialmente sensibili.

### 3. Whisper locale nel browser

Possibile solo con modelli WebAssembly/WebGPU, ma non è la strada più semplice.

Contro principali:

- pacchetto molto più pesante;
- prestazioni variabili;
- supporto browser/hardware non uniforme;
- rischio review e manutenzione più alto.

## Permessi consigliati per Chrome Web Store

Per una versione cloud-only:

- `storage`
- `https://web.whatsapp.com/*`
- endpoint API scelto, ad esempio `https://api.openai.com/*`

Evitare `http://127.0.0.1/*` e `http://localhost/*` se si pubblica la versione senza servizio locale.

## Privacy

Se l'estensione invia vocali a OpenAI/Google o a un backend nostro, bisogna dichiararlo chiaramente nella scheda privacy del Chrome Web Store e in una privacy policy pubblica.

Riferimento ufficiale privacy dashboard: <https://developer.chrome.com/docs/webstore/cws-dashboard-privacy>

## Checklist prima dell'upload

1. Scegliere nome definitivo.
2. Scegliere icone 16/32/48/128 px.
3. Preparare screenshot.
4. Preparare privacy policy pubblica.
5. Ridurre i permessi al minimo.
6. Controllare che non ci siano API key nel codice.
7. Generare lo ZIP solo estensione:

   ```powershell
   .\package-release.ps1
   ```

8. Caricare `release\whatsapp-voice-transcriber-*-extension-only.zip`.
