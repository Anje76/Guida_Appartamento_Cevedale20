#!/usr/bin/env python3
"""
Estrae gli eventi dall'opuscolo PDF "Val di Sole estate - Attività, Eventi, Esperienze"
e produce un file eventi.json utilizzabile dalla Web App "Cevedale 20".

Uso:
    python3 parse_eventi.py eventi.pdf eventi.json

Note sui limiti:
- Il PDF ha un impaginato a più colonne (rivista). Il testo viene estratto
  nell'ordine "logico" dei blocchi del documento, che nei test corrisponde
  all'ordine visivo degli eventi. Non è garantito al 100% per ogni numero
  futuro dell'opuscolo: se la grafica cambia molto, alcuni eventi possono
  finire abbinati a orario/luogo sbagliati. Il file eventi.json prodotto
  va quindi considerato una BOZZA: un controllo occasionale (specie dopo
  il primo utilizzo con un nuovo numero) è consigliato.
- Vengono riconosciuti sia gli eventi con DATA SPECIFICA (es. "Sabato 1
  agosto") sia quelli RICORRENTI (es. "Ogni lunedì", "Tutti i giorni").
- L'elenco NOMI_LUOGHI_NOTI va aggiornato se compaiono nuovi comuni o
  frazioni non ancora presenti nella lista.
"""
import sys
import re
import json
import subprocess
from datetime import date

MESI = {
    "GENNAIO": 1, "FEBBRAIO": 2, "MARZO": 3, "APRILE": 4, "MAGGIO": 5,
    "GIUGNO": 6, "LUGLIO": 7, "AGOSTO": 8, "SETTEMBRE": 9, "OTTOBRE": 10,
    "NOVEMBRE": 11, "DICEMBRE": 12,
}
GIORNI_SETT = ["LUNEDÌ", "MARTEDÌ", "MERCOLEDÌ", "GIOVEDÌ", "VENERDÌ", "SABATO", "DOMENICA"]

RE_DATA = re.compile(
    r"^(" + "|".join(GIORNI_SETT) + r")\s+(\d{1,2})\s+(" + "|".join(MESI.keys()) + r")$"
)
RE_RICORRENTE = re.compile(r"^(OGNI\s+(" + "|".join(GIORNI_SETT) + r")|TUTTI I GIORNI)$")
RE_ORA = re.compile(r"(\d{1,2}:\d{2})")

ANNO_DEFAULT = 2026

NOMI_LUOGHI_NOTI = {
    "MALÉ", "MALÈ", "MALE", "DIMARO FOLGARIDA", "DIMARO", "FOLGARIDA",
    "MEZZANA", "PELLIZZANO", "PEIO", "PEIO FONTI", "PEIO PAESE",
    "OSSANA", "RABBI", "RABBI FONTI", "COMMEZZADURA", "VERMIGLIO",
    "CALDES", "PASSO TONALE", "CROVIANA", "MARILLEVA 1400", "MARILLEVA 900",
    "COGOLO", "TERZOLAS", "CELLEDIZZO", "SAN BERNARDO", "MESTRIAGO",
    "ARNAGO", "MAGRAS", "PRACORNO", "CARCIATO", "BOZZANA", "DEGGIANO",
    "MASTELLINA", "STROMBIANO", "COMASINE", "CELENTINO", "SOMRABBI",
    "SAN GIACOMO", "ORTISÉ", "MONCLASSICO",
}


def testo_pagine(pdf_path):
    out = subprocess.run(
        ["pdftotext", pdf_path, "-"], capture_output=True, text=True, check=True
    ).stdout
    return out.split("\f")


def chunk_pagina(testo_pagina):
    blocchi, corrente = [], []
    for riga in testo_pagina.split("\n"):
        if riga.strip() == "":
            if corrente:
                blocchi.append(corrente)
                corrente = []
        else:
            corrente.append(riga.strip())
    if corrente:
        blocchi.append(corrente)
    return blocchi


RE_CHIP_PRIMA_RIGA = re.compile(r"^(ore|dalle|alle)(\s+\d{1,2}[:.]\d{2})?$", re.IGNORECASE)


def e_chip_orario(blocco):
    """Vero solo se la prima riga del blocco è ESATTAMENTE un orario
    (es. 'ore 21:00', 'dalle', 'alle'), non una frase che inizia per caso
    con 'Ore HH:MM ...' (queste sono descrizioni, non etichette luogo/orario)."""
    return bool(RE_CHIP_PRIMA_RIGA.match(blocco[0].strip()))


def e_tutto_maiuscolo(blocco):
    testo = " ".join(blocco)
    lettere = [c for c in testo if c.isalpha()]
    return len(lettere) > 0 and all(c.upper() == c for c in lettere)


def riga_maiuscola(riga):
    lettere = [c for c in riga if c.isalpha()]
    return len(lettere) > 0 and all(c.upper() == c for c in lettere)


def separa_titolo_descrizione(blocco):
    """A volte il titolo (maiuscolo) e la descrizione (mista) restano nello
    stesso blocco per mancanza di riga vuota nel PDF. Separa le righe
    iniziali tutte maiuscole (titolo) dal resto (descrizione)."""
    i = 0
    while i < len(blocco) and riga_maiuscola(blocco[i]):
        i += 1
    return blocco[:i], blocco[i:]


def parse_chip(blocco):
    testo = " ".join(blocco)
    ore = RE_ORA.findall(testo)
    inizio = ore[0] if len(ore) >= 1 else None
    fine = ore[1] if len(ore) >= 2 else None
    luogo_righe = [r for r in blocco if not RE_ORA.search(r) and r not in ("-", "ore", "dalle", "alle")]
    luogo = " ".join(luogo_righe).strip(" -")
    return {"orario_inizio": inizio, "orario_fine": fine, "luogo": luogo}


def estrai_eventi(pdf_path, anno=ANNO_DEFAULT):
    pagine = testo_pagine(pdf_path)
    eventi = []

    contesto_data = None
    contesto_ricorrenza = None
    luogo_corrente = None
    evento_corrente = None
    chip_in_attesa = []

    def chiudi_evento_corrente():
        nonlocal evento_corrente
        if evento_corrente is not None:
            eventi.append(evento_corrente)
            evento_corrente = None

    for testo_pag in pagine:
        blocchi = chunk_pagina(testo_pag)
        chip_in_attesa = []  # i chip (orario+luogo) si abbinano solo entro la stessa pagina

        for b in blocchi:
            # Intestazioni di data/ricorrenza e nomi di comune a volte restano
            # "incollati" al blocco successivo (chip o altro) per mancanza di
            # riga vuota nel PDF: le separiamo controllando riga per riga
            # dall'inizio del blocco, poi si continua a processare il resto
            # normalmente.
            while b:
                prima_riga = b[0].upper()
                m = RE_DATA.match(prima_riga)
                if m:
                    gg, num, mese = m.groups()
                    chiudi_evento_corrente()
                    contesto_data = {"giorno_settimana": gg, "giorno": int(num), "mese": MESI[mese], "anno": anno}
                    contesto_ricorrenza = None
                    b = b[1:]
                    continue
                if RE_RICORRENTE.match(prima_riga):
                    chiudi_evento_corrente()
                    contesto_ricorrenza = prima_riga
                    contesto_data = None
                    b = b[1:]
                    continue
                if prima_riga.strip("* ") in NOMI_LUOGHI_NOTI:
                    chiudi_evento_corrente()
                    luogo_corrente = b[0].strip()
                    b = b[1:]
                    continue
                break
            if not b:
                continue
            if len(b) == 1 and b[0].strip().isdigit():
                continue  # numero di pagina isolato

            if e_chip_orario(b):
                chip_in_attesa.append(parse_chip(b))
                continue

            testo_intero = " ".join(b)
            righe_titolo, righe_desc = separa_titolo_descrizione(b)

            if righe_titolo:
                chiudi_evento_corrente()
                chip = chip_in_attesa.pop(0) if chip_in_attesa else {}
                evento_corrente = {
                    "comune": luogo_corrente,
                    "titolo": " ".join(righe_titolo).strip(" *"),
                    "descrizione": " ".join(righe_desc).strip(),
                    "orario_inizio": chip.get("orario_inizio"),
                    "orario_fine": chip.get("orario_fine"),
                    "luogo": chip.get("luogo"),
                }
                if contesto_data:
                    d = contesto_data
                    evento_corrente["tipo"] = "data_specifica"
                    evento_corrente["data"] = f"{d['anno']:04d}-{d['mese']:02d}-{d['giorno']:02d}"
                elif contesto_ricorrenza:
                    evento_corrente["tipo"] = "ricorrente"
                    evento_corrente["ricorrenza"] = contesto_ricorrenza
                else:
                    evento_corrente["tipo"] = "sconosciuto"
                continue

            if evento_corrente is not None:
                if evento_corrente["descrizione"]:
                    evento_corrente["descrizione"] += " " + testo_intero
                else:
                    evento_corrente["descrizione"] = testo_intero

    chiudi_evento_corrente()
    for e in eventi:
        e["descrizione"] = e["descrizione"].strip()
    return eventi


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python3 parse_eventi.py eventi.pdf eventi.json [anno]")
        sys.exit(1)
    anno = int(sys.argv[3]) if len(sys.argv) > 3 else ANNO_DEFAULT
    eventi = estrai_eventi(sys.argv[1], anno)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(
            {"generato_il": date.today().isoformat(), "eventi": eventi},
            f, ensure_ascii=False, indent=2
        )
    print(f"Estratti {len(eventi)} eventi -> {sys.argv[2]}")
