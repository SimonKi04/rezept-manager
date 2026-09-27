# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Rezept-Manager: statische Web-App (Rezepte auswählen, Portionen einstellen, Einkaufsliste abhaken), gehostet auf GitHub Pages. Der Nutzer ist kein Programmierer – Erklärungen auf Deutsch und verständlich halten. Code, Bezeichner und Kommentare sind ebenfalls deutsch.

## Harte Regeln

- Nur HTML/CSS/JS, **keine Bibliotheken, kein Build, kein Server**. Muss direkt auf GitHub Pages laufen.
- Vor externen Bibliotheken, dem Löschen von Dateien und **jeglichen Git-Befehlen** fragen – Commits macht der Nutzer selbst.
- Nur das Gewünschte liefern, keine Zusatz-Features.
- Bestehende Funktionen (Auswahl, Portionen, Varianten, Einkaufsliste, Abhaken, Zurücksetzen) dürfen nicht kaputtgehen.
- `Quellen/` (Original-PDFs und Roh-Fotos) ist per `.gitignore` ausgeschlossen und wird nie hochgeladen. Fotos für die App werden nach `bilder/<rezept-id>.jpg` **kopiert** (kleingeschrieben, Endung `.jpg` – GitHub Pages ist case-sensitive).

## Ausführen / Prüfen

Kein Build, keine Tests, kein Linter. `index.html` direkt im Browser öffnen.
Syntaxcheck: `node --check app.js && node --check rezepte.js`.
Logik lässt sich ohne Browser prüfen, indem man `rezepte.js` und `app.js` in Node mit einem minimalen Stub für `document.getElementById`, `localStorage` und `window` per `eval` lädt und die registrierten Event-Handler aufruft.

## Architektur

- `rezepte.js` – nur Daten: `window.REZEPTE = [...]`. Der Kommentarkopf dokumentiert das Datenformat (Zutaten mit `kategorie`, `oder`-Alternative, `varianten`, `anleitung` mit `variante`/`vonClaude`). Neue Rezepte kommen hierher, nicht in `app.js`. Zeiten (`arbeitszeit_min`, `gesamtzeit_min`) und Nährwerte pro Portion (`kcal`, `protein_g`, `fett_g`, `kohlenhydrate_g`, `ballaststoffe_g`) sind geschätzt (`werte_geschaetzt: true`). Bei Rezepten mit Varianten stehen die Nährwerte vollständig in jeder Variante.
- `app.js` – eine IIFE. Oben der Einstellungsblock (`GESUNDHEIT` mit allen Regeln der Gesundheitsnote, `STANDARD_PERSONEN_VORGABE`, Einkaufsbereiche, Einheiten). Die Note wird immer zur Laufzeit berechnet (`gesundheitsnote`), nie in den Daten gespeichert; Nährwerte/Note sind unabhängig von der Portionenzahl.
- Zustand: `zustand = { auswahl: {id: {portionen, variante}}, abgehakt: {schluessel: true} }` in `localStorage` unter `rezept-manager-v1`. Die Standard-Personenzahl liegt bewusst unter eigenem Schlüssel `rezept-manager-standard-personen`, damit „Liste zurücksetzen“ sie nicht löscht.
- Rendering: jede Änderung → `zustandSpeichern()` + `allesAnzeigen()`, das die Karten und die Einkaufsliste komplett per `innerHTML` neu schreibt. Klicks laufen über Event-Delegation mit `data-aktion`/`data-id`. Alle Texte aus den Daten mit `esc()` escapen.
- Einkaufsliste (`baueEinkaufsliste`): Mengen werden mit `portionen / rezept.portionen` skaliert, Einheiten vereinheitlicht (kg→g, l→ml) und gleichnamige Zutaten pro Kategorie zusammengezählt; der Schlüssel eines Postens ist auch der Schlüssel für den Abhak-Zustand.
- Fehlt `bilder/<id>.jpg`, wird automatisch `bilder/platzhalter.svg` gezeigt.
- `style.css` – Farben als CSS-Variablen in `:root`, Mobile-first, Breakpoints bei 640px und 1000px.
