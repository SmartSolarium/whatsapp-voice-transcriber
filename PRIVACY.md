# Privacy Policy

Bozza per test interno. Da rivedere prima della pubblicazione pubblica.

## Dati trattati

L'estensione rileva i messaggi vocali visibili in WhatsApp Web e può recuperare l'audio del vocale per trascriverlo.

## Modalità Whisper locale

Quando è selezionato **Whisper locale**, l'audio viene inviato solo al servizio locale in esecuzione sullo stesso computer, all'indirizzo `http://127.0.0.1:8765`.

In questa modalità l'audio non viene inviato a server esterni dall'estensione.

## Modalità OpenAI API

Quando è selezionato **OpenAI API**, l'audio del vocale viene inviato all'API OpenAI per ottenere la trascrizione.

La API key inserita dall'utente viene salvata localmente nel profilo Chrome tramite `chrome.storage.local`.

## Cache

L'estensione può salvare localmente nel profilo Chrome le trascrizioni già generate, associate all'hash dell'audio, per evitare trascrizioni duplicate.

## Dati non raccolti

L'estensione non raccoglie intenzionalmente:

- rubrica;
- cronologia completa delle chat;
- messaggi testuali non necessari alla funzione;
- dati di pagamento;
- password;
- credenziali WhatsApp.

## Condivisione dei dati

Nella modalità locale, l'estensione non condivide l'audio con terze parti.

Nella modalità OpenAI API, l'audio viene inviato a OpenAI secondo le condizioni e policy del servizio OpenAI.

## Contatti

Inserire qui email o pagina di contatto prima della pubblicazione.
