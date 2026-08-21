# Come funziona "Eventi Oggi" — istruzioni rapide

## Cosa fanno questi file

| File | A cosa serve |
|---|---|
| `eventi.pdf` | L'opuscolo APT che carichi tu, con lo stesso nome ogni volta |
| `parse_eventi.py` | Lo script che legge `eventi.pdf` ed estrae gli eventi |
| `eventi.json` | Il file con gli eventi in formato dati, letto dalla Web App |
| `.github/workflows/aggiorna-eventi.yml` | L'automazione: rigenera `eventi.json` da sola |
| `index.html` | La tua Web App, con la nuova scheda "Eventi Oggi" già integrata |

## Cosa devi fare tu, ogni volta che hai un nuovo opuscolo

1. Vai sul repository GitHub della tua Web App.
2. Carica il nuovo PDF **con lo stesso nome**: `eventi.pdf` (sostituendo quello vecchio).
   - Su GitHub: apri la cartella del repository → "Add file" → "Upload files" →
     trascina il PDF → in basso scrivi un messaggio tipo "Aggiorno opuscolo eventi" → "Commit changes".
3. Basta così. Entro un paio di minuti GitHub Actions:
   - legge il PDF,
   - genera un nuovo `eventi.json`,
   - lo salva da solo nel repository.
4. La Web App, al prossimo caricamento da parte di un ospite, mostrerà gli eventi aggiornati.

Non serve toccare `index.html` né lo script Python per il normale uso mensile.

## Se un evento risulta sbagliato

Il PDF ha un impaginato complesso (rivista a più colonne) e, occasionalmente,
lo script può abbinare un orario o un luogo alla voce sbagliata, oppure perdere
un evento. È normale: consideralo un aiuto che ti fa risparmiare il 95% del
lavoro, non una garanzia assoluta.

Per correggere:
1. Vai su GitHub, apri `eventi.json` nel repository.
2. Clicca sulla matita ("Edit this file").
3. Cerca la voce sbagliata (puoi usare Ctrl+F del browser) e correggi a mano
   `titolo`, `orario_inizio`, `orario_fine`, `luogo` o `comune`.
4. "Commit changes" in basso.

La correzione resterà finché non carichi un nuovo PDF (a quel punto lo script
rigenera tutto da capo).

## Se in futuro cambiano molto la grafica dell'opuscolo

Lo script `parse_eventi.py` è calibrato sull'impaginato attuale della APT Val
di Sole. Se in futuro l'aspetto grafico dell'opuscolo cambierà sensibilmente
(nuovo layout, nuovi colori, posizione diversa di orari/titoli), lo script
potrebbe iniziare a sbagliare più spesso: in tal caso fammi sapere e lo
ricalibro sul nuovo formato.

## Nomi di comuni/frazioni non riconosciuti

Lo script riconosce i nomi di comuni e frazioni della Val di Sole da un elenco
scritto dentro `parse_eventi.py` (variabile `NOMI_LUOGHI_NOTI`). Se in futuro
compare un nuovo comune/frazione come intestazione e gli eventi di quella zona
risultano "orfani" (senza comune assegnato), basta aggiungere il nome
(in MAIUSCOLO) a quella lista.
