# Preparazione repository GitHub

## Stato repository

La cartella contiene codice pronto per GitHub, ma la cartella `.git` locale risulta vuota/non valida. Per inizializzare il repository:

```powershell
git init
git add .
git commit -m "Initial WhatsApp voice transcription extension"
```

Poi creare un repository su GitHub e collegarlo:

```powershell
git remote add origin https://github.com/USERNAME/NOME_REPO.git
git branch -M main
git push -u origin main
```

## Da non pubblicare

Non pubblicare mai:

- API key;
- cartella `server\.venv`;
- cartella `logs`;
- pacchetti in `release` se non vuoi versionarli;
- dati personali o screenshot di chat reali.

Questi elementi sono già coperti da `.gitignore`, dove applicabile.

## Licenza

Scegliere una licenza prima di rendere il repository pubblico:

- MIT: semplice e permissiva;
- Apache-2.0: permissiva con clausole brevetti;
- nessuna licenza: codice visibile ma non open-source in senso pratico.

Non ho aggiunto una licenza perché è una scelta del proprietario del progetto.
