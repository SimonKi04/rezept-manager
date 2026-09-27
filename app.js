'use strict';

(function () {
  // ===== Einstellungen =====

  // Gesundheitsnote (Schulnote 1–6) – hier kannst du alle Regeln anpassen.
  // So wird gerechnet (immer pro Portion):
  //   1. Energie aus Protein, Fett und Kohlenhydraten (Gramm x kcalProGramm),
  //      davon jeweils der Anteil in Prozent an der Summe.
  //   2. Liegt ein Anteil außerhalb seines Zielbereichs: so viele Punkte, wie er
  //      in Prozentpunkten von der nächsten Grenze entfernt ist.
  //   3. Ballaststoffe: je Gramm unter dem Ziel 1 Punkt.
  //   4. Note = 1 + (alle Punkte / teiler), auf ganze Note gerundet, höchstens schlechtesteNote.
  const GESUNDHEIT = {
    kcalProGramm: { protein: 4, fett: 9, kohlenhydrate: 4 },
    zielbereiche: {                       // Anteil an der Energie in Prozent
      protein: { von: 20, bis: 30 },
      fett: { von: 25, bis: 35 },
      kohlenhydrate: { von: 40, bis: 55 }
    },
    ballaststoffZiel_g: 10,               // Gramm pro Portion
    teiler: 5,
    schlechtesteNote: 6
  };

  // Standard-Personenzahl, solange im Browser noch keine eigene gespeichert ist
  const STANDARD_PERSONEN_VORGABE = 2;

  // Reihenfolge der Bereiche auf der Einkaufsliste
  const BEREICHE = [
    { id: 'obst-gemuese', titel: 'Obst & Gemüse' },
    { id: 'brot-backwaren', titel: 'Brot & Backwaren' },
    { id: 'kuehlregal', titel: 'Kühlregal' },
    { id: 'trockenware', titel: 'Trockenware' },
    { id: 'tiefkuehl', titel: 'Tiefkühl' },
    { id: 'getraenke', titel: 'Getränke' },
    { id: 'sonstiges', titel: 'Sonstiges' }, // Auffangbereich für Tippfehler in der Kategorie
    { id: 'vorrat', titel: 'Vorrat prüfen' }
  ];
  const BEREICH_IDS = new Set(BEREICHE.map(b => b.id));

  // Umrechenbare Einheiten werden vor dem Zusammenzählen vereinheitlicht
  const UMRECHNUNG = { kg: { einheit: 'g', faktor: 1000 }, l: { einheit: 'ml', faktor: 1000 } };
  const AUFRUNDEN = ['Stück', 'Zehe', 'Scheibe'];
  const GANZZAHLIG = ['g', 'ml'];
  const MEHRZAHL = { Zehe: 'Zehen', Scheibe: 'Scheiben', Zweig: 'Zweige' };
  const BRUECHE = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

  const SPEICHER_SCHLUESSEL = 'rezept-manager-v1';
  // Eigener Schlüssel, damit "Liste zurücksetzen" die Standard-Personenzahl nicht löscht
  const STANDARD_SCHLUESSEL = 'rezept-manager-standard-personen';
  const MIN_PORTIONEN = 1;
  const MAX_PORTIONEN = 20;
  const PLATZHALTER_BILD = 'bilder/platzhalter.svg';

  const rezepte = Array.isArray(window.REZEPTE) ? window.REZEPTE : [];
  const fehlendeBilder = new Set();

  // ===== Hilfsfunktionen =====

  function esc(text) {
    return String(text).replace(/[&<>"']/g, z => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z]));
  }

  function rezeptNachId(id) {
    return rezepte.find(r => r.id === id);
  }

  function begrenze(portionen) {
    return Math.min(MAX_PORTIONEN, Math.max(MIN_PORTIONEN, Math.round(portionen)));
  }

  function gueltigeVariante(rezept, varianteId) {
    const varianten = rezept.varianten || [];
    if (varianten.length === 0) return null;
    return varianten.some(v => v.id === varianteId) ? varianteId : varianten[0].id;
  }

  function zutatenFuer(rezept, varianteId) {
    const variante = (rezept.varianten || []).find(v => v.id === varianteId);
    return rezept.zutaten.concat(variante ? variante.zutaten : []);
  }

  function bildPfad(rezept) {
    return fehlendeBilder.has(rezept.id) ? PLATZHALTER_BILD : 'bilder/' + rezept.id + '.jpg';
  }

  // ===== Speicher im Browser =====

  function leererZustand() {
    return { auswahl: {}, abgehakt: {} };
  }

  function zustandLaden() {
    const zustand = leererZustand();
    try {
      const roh = JSON.parse(localStorage.getItem(SPEICHER_SCHLUESSEL));
      if (!roh || typeof roh !== 'object') return zustand;
      for (const [id, wahl] of Object.entries(roh.auswahl || {})) {
        const rezept = rezeptNachId(id);
        if (!rezept || !wahl) continue;
        zustand.auswahl[id] = {
          portionen: begrenze(Number(wahl.portionen) || rezept.portionen),
          variante: gueltigeVariante(rezept, wahl.variante)
        };
      }
      if (roh.abgehakt && typeof roh.abgehakt === 'object') zustand.abgehakt = roh.abgehakt;
    } catch (e) {
      // Speicher nicht lesbar (z. B. privates Fenster) – dann eben leer starten
    }
    return zustand;
  }

  function zustandSpeichern() {
    try {
      localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(zustand));
    } catch (e) {
      // Speicher nicht verfügbar – die App funktioniert trotzdem, nur ohne Merken
    }
  }

  let zustand = zustandLaden();

  function standardPersonenLaden() {
    try {
      const zahl = Number(localStorage.getItem(STANDARD_SCHLUESSEL));
      if (zahl) return begrenze(zahl);
    } catch (e) {
      // Speicher nicht lesbar – Vorgabe verwenden
    }
    return begrenze(STANDARD_PERSONEN_VORGABE);
  }

  function standardPersonenSpeichern() {
    try {
      localStorage.setItem(STANDARD_SCHLUESSEL, String(standardPersonen));
    } catch (e) {
      // Speicher nicht verfügbar – gilt dann nur bis zum Neuladen
    }
  }

  let standardPersonen = standardPersonenLaden();

  // ===== Nährwerte und Gesundheitsnote (immer pro Portion) =====

  const NAEHRSTOFF_NAMEN = { protein: 'Protein', fett: 'Fett', kohlenhydrate: 'Kohlenhydrate' };

  // Nährwerte des Rezepts bzw. der gewählten Variante (nicht ausgewählt: erste Variante)
  function naehrwerteFuer(rezept) {
    const wahl = zustand.auswahl[rezept.id];
    const varianteId = gueltigeVariante(rezept, wahl ? wahl.variante : null);
    const variante = (rezept.varianten || []).find(v => v.id === varianteId);
    const quelle = variante && variante.kcal != null ? variante : rezept;
    if (quelle.kcal == null) return null;
    return {
      kcal: quelle.kcal,
      protein_g: quelle.protein_g,
      fett_g: quelle.fett_g,
      kohlenhydrate_g: quelle.kohlenhydrate_g,
      ballaststoffe_g: quelle.ballaststoffe_g,
      variante: variante ? variante.name : null
    };
  }

  function gesundheitsnote(werte) {
    if (!werte) return null;
    const k = GESUNDHEIT.kcalProGramm;
    const energie = {
      protein: (werte.protein_g || 0) * k.protein,
      fett: (werte.fett_g || 0) * k.fett,
      kohlenhydrate: (werte.kohlenhydrate_g || 0) * k.kohlenhydrate
    };
    const summe = energie.protein + energie.fett + energie.kohlenhydrate;
    if (!(summe > 0)) return null;

    let punkte = 0;
    const naehrstoffe = Object.entries(GESUNDHEIT.zielbereiche).map(([schluessel, ziel]) => {
      const anteil = energie[schluessel] / summe * 100;
      const abweichung = anteil < ziel.von ? ziel.von - anteil : anteil > ziel.bis ? anteil - ziel.bis : 0;
      punkte += abweichung;
      return { name: NAEHRSTOFF_NAMEN[schluessel] || schluessel, anteil, ziel, punkte: abweichung };
    });

    const ballaststoffPunkte = Math.max(0, GESUNDHEIT.ballaststoffZiel_g - (werte.ballaststoffe_g || 0));
    punkte += ballaststoffPunkte;

    const note = Math.min(GESUNDHEIT.schlechtesteNote, Math.round(1 + punkte / GESUNDHEIT.teiler));
    return { note, punkte, naehrstoffe, ballaststoffe: werte.ballaststoffe_g || 0, ballaststoffPunkte };
  }

  // ===== Mengen rechnen und anzeigen =====

  function inBasiseinheit(menge, einheit) {
    const u = UMRECHNUNG[einheit];
    return u ? { menge: menge * u.faktor, einheit: u.einheit } : { menge, einheit };
  }

  function runde(menge, einheit) {
    if (AUFRUNDEN.includes(einheit)) return Math.max(1, Math.ceil(menge - 1e-9));
    if (GANZZAHLIG.includes(einheit)) return Math.max(1, Math.round(menge));
    return Math.max(0.25, Math.round(menge * 4) / 4);
  }

  function zahlText(n) {
    const ganz = Math.floor(n + 1e-9);
    const rest = Math.round((n - ganz) * 100) / 100;
    if (rest === 0) return String(ganz);
    if (BRUECHE[rest]) return (ganz > 0 ? ganz : '') + BRUECHE[rest];
    return n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }

  function mengeText(menge, einheit) {
    const basis = inBasiseinheit(menge, einheit);
    const m = runde(basis.menge, basis.einheit);
    if (basis.einheit === 'g' && m >= 1000) return (m / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' kg';
    if (basis.einheit === 'ml' && m >= 1000) return (m / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l';
    const wort = m > 1 && MEHRZAHL[basis.einheit] ? MEHRZAHL[basis.einheit] : basis.einheit;
    return zahlText(m) + (wort ? ' ' + wort : '');
  }

  // ===== Einkaufsliste berechnen =====

  function baueEinkaufsliste() {
    const posten = new Map();

    for (const [id, wahl] of Object.entries(zustand.auswahl)) {
      const rezept = rezeptNachId(id);
      if (!rezept) continue;
      const faktor = wahl.portionen / rezept.portionen;

      for (const zutat of zutatenFuer(rezept, wahl.variante)) {
        const kategorie = BEREICH_IDS.has(zutat.kategorie) ? zutat.kategorie : 'sonstiges';
        const teile = kategorie === 'vorrat'
          ? [{ name: zutat.name, menge: null, einheit: null }]
          : [zutat, zutat.oder].filter(Boolean).map(t => t.menge == null
            ? { name: t.name, menge: null, einheit: null }
            : Object.assign({ name: t.name }, inBasiseinheit(t.menge * faktor, t.einheit)));

        const schluessel = kategorie + '|' + teile.map(t => t.name + '|' + (t.einheit || '')).join('|oder|');
        const vorhanden = posten.get(schluessel);
        if (vorhanden) {
          vorhanden.teile.forEach((t, i) => { if (t.menge != null) t.menge += teile[i].menge; });
        } else {
          posten.set(schluessel, { schluessel, kategorie, teile, nachGefuehl: false });
        }
      }
    }

    // Zutat "nach Gefühl" + dieselbe Zutat mit Menge → ein Eintrag "Menge + nach Gefühl"
    for (const eintrag of posten.values()) {
      const t = eintrag.teile;
      if (eintrag.kategorie === 'vorrat' || t.length !== 1 || t[0].menge != null) continue;
      const mitMenge = Array.from(posten.values()).find(e =>
        e !== eintrag && e.kategorie === eintrag.kategorie && e.teile.length === 1 &&
        e.teile[0].name === t[0].name && e.teile[0].menge != null);
      if (mitMenge) {
        mitMenge.nachGefuehl = true;
        posten.delete(eintrag.schluessel);
      }
    }

    return BEREICHE
      .map(bereich => ({
        bereich,
        eintraege: Array.from(posten.values())
          .filter(e => e.kategorie === bereich.id)
          .map(e => Object.assign(e, {
            name: e.teile.map(t => t.name).join(' / '),
            menge: e.kategorie === 'vorrat' || e.teile.every(t => t.menge == null)
              ? ''
              : e.teile.map(t => t.menge == null ? '' : mengeText(t.menge, t.einheit)).join(' / ') +
                (e.nachGefuehl ? ' + nach Gefühl' : '')
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'de'))
      }))
      .filter(gruppe => gruppe.eintraege.length > 0);
  }

  // ===== Anzeige: Rezeptkarten =====

  const rezeptListe = document.getElementById('rezept-liste');
  const einkaufsliste = document.getElementById('einkaufsliste');
  const zuruecksetzenKnopf = document.getElementById('zuruecksetzen');
  const dialog = document.getElementById('rezept-dialog');
  const dialogInhalt = document.getElementById('dialog-inhalt');
  const suchfeld = document.getElementById('suche');
  const sortierAuswahl = document.getElementById('sortierung');

  // Bei welchen Rezepten ist die Aufschlüsselung der Note gerade aufgeklappt
  const offeneNoten = new Set();

  function klein(text) {
    return String(text).toLocaleLowerCase('de-DE');
  }

  function passtZurSuche(rezept, suchtext) {
    if (!suchtext) return true;
    const alleZutaten = rezept.zutaten.concat(...(rezept.varianten || []).map(v => v.zutaten));
    const woerter = [rezept.name].concat(
      alleZutaten.flatMap(z => [z.name, z.oder ? z.oder.name : ''])
    );
    return woerter.some(w => klein(w).includes(suchtext));
  }

  // Sortierschlüssel: kleinere Zahl steht weiter oben
  const SORTIERUNGEN = {
    arbeitszeit: r => r.arbeitszeit_min,
    gesamtzeit: r => r.gesamtzeit_min,
    kcal: r => (naehrwerteFuer(r) || {}).kcal,
    protein: r => { const w = naehrwerteFuer(r); return w ? -w.protein_g : null; },
    note: r => { const n = gesundheitsnote(naehrwerteFuer(r)); return n ? n.punkte : null; }
  };

  function sortiere(liste, art) {
    const schluessel = SORTIERUNGEN[art];
    if (!schluessel) return liste;
    return liste
      .map((rezept, stelle) => ({ rezept, stelle, wert: schluessel(rezept) }))
      .sort((a, b) => {
        const aFehlt = a.wert == null, bFehlt = b.wert == null;
        if (aFehlt || bFehlt) return aFehlt - bFehlt || a.stelle - b.stelle; // ohne Wert ans Ende
        return a.wert - b.wert || a.stelle - b.stelle;
      })
      .map(e => e.rezept);
  }

  function zahl(n, stellen) {
    return n.toLocaleString('de-DE', { maximumFractionDigits: stellen });
  }

  function zeitText(minuten) {
    if (minuten < 60) return minuten + ' Min';
    const std = Math.floor(minuten / 60), min = minuten % 60;
    return std + ' Std' + (min ? ' ' + min + ' Min' : '');
  }

  function kennzahlenHtml(rezept, werte) {
    const zeiten = [];
    if (rezept.arbeitszeit_min != null) zeiten.push('ca. ' + zeitText(rezept.arbeitszeit_min) + ' Arbeit');
    if (rezept.gesamtzeit_min != null) zeiten.push('ca. ' + zeitText(rezept.gesamtzeit_min) + ' gesamt');
    const zeilen = [];
    if (zeiten.length) zeilen.push(`<span>⏱ ${esc(zeiten.join(' · '))}</span>`);
    if (werte) zeilen.push(`<span>🔥 ca. ${zahl(werte.kcal, 0)} kcal pro Portion</span>`);
    if (!zeilen.length) return '';
    return `<p class="kennzahlen">${zeilen.join('')}</p>`;
  }

  function makrosHtml(werte) {
    if (!werte) return '';
    const wert = (icon, kurz, lang, gramm) => `
      <li title="${lang}"><span class="makro-icon" aria-hidden="true">${icon}</span>
        <strong>${zahl(gramm || 0, 0)} g</strong><small><abbr title="${lang}">${kurz}</abbr></small></li>`;
    return `<ul class="makros" aria-label="Nährwerte pro Portion">
      ${wert('💪', 'P', 'Protein', werte.protein_g)}
      ${wert('🥑', 'F', 'Fett', werte.fett_g)}
      ${wert('🍞', 'KH', 'Kohlenhydrate', werte.kohlenhydrate_g)}
    </ul>`;
  }

  function noteKnopfHtml(rezept, bewertung) {
    if (!bewertung) return '';
    const offen = offeneNoten.has(rezept.id);
    return `<button type="button" class="note note-${bewertung.note}" data-aktion="note" data-id="${esc(rezept.id)}"
      aria-expanded="${offen}" aria-label="Gesundheitsnote ${bewertung.note}, Aufschlüsselung ${offen ? 'zuklappen' : 'anzeigen'}">
      <small>Note</small>${bewertung.note}</button>`;
  }

  function aufschluesselungHtml(bewertung) {
    const zeile = (text, punkte) => `<li><span>${text}</span><span class="${punkte > 0 ? 'abzug' : 'passt'}">${
      punkte > 0 ? zahl(punkte, 1) + ' Punkte' : '✓ im Ziel'}</span></li>`;
    return `
      <div class="aufschluesselung">
        <p><strong>So entsteht die Note</strong> (pro Portion)</p>
        <ul>
          ${bewertung.naehrstoffe.map(n => zeile(
            `${esc(n.name)}: ${zahl(n.anteil, 0)} % der Energie <small>(Ziel ${n.ziel.von}–${n.ziel.bis} %)</small>`,
            n.punkte)).join('')}
          ${zeile(`Ballaststoffe: ${zahl(bewertung.ballaststoffe, 1)} g <small>(Ziel ${GESUNDHEIT.ballaststoffZiel_g} g)</small>`,
            bewertung.ballaststoffPunkte)}
        </ul>
        <p class="rechnung">1 + ${zahl(bewertung.punkte, 1)} Punkte / ${GESUNDHEIT.teiler}
          = ${zahl(1 + bewertung.punkte / GESUNDHEIT.teiler, 1)} → <strong>Note ${bewertung.note}</strong></p>
      </div>`;
  }

  function zeigeRezepte() {
    if (rezepte.length === 0) {
      rezeptListe.innerHTML = '<p class="leer">Keine Rezepte gefunden. Prüfe die Datei rezepte.js.</p>';
      return;
    }
    const suchtext = klein(suchfeld.value.trim());
    const sichtbar = sortiere(rezepte.filter(r => passtZurSuche(r, suchtext)), sortierAuswahl.value);
    if (sichtbar.length === 0) {
      rezeptListe.innerHTML = `<p class="leer">Kein Rezept passt zu „${esc(suchfeld.value.trim())}“.</p>`;
      return;
    }
    rezeptListe.innerHTML = sichtbar.map(rezept => {
      const wahl = zustand.auswahl[rezept.id];
      const varianten = rezept.varianten || [];
      const werte = naehrwerteFuer(rezept);
      const bewertung = gesundheitsnote(werte);
      return `
        <article class="karte${wahl ? ' ausgewaehlt' : ''}">
          <button type="button" class="karte-bild" data-aktion="ansehen" data-id="${esc(rezept.id)}" aria-label="${esc(rezept.name)} ansehen">
            <img src="${esc(bildPfad(rezept))}" alt="" data-bild="${esc(rezept.id)}" loading="lazy">
          </button>
          <div class="karte-inhalt">
            <div class="karte-kopf">
              <h2>${esc(rezept.name)}</h2>
              ${noteKnopfHtml(rezept, bewertung)}
            </div>
            ${bewertung && offeneNoten.has(rezept.id) ? aufschluesselungHtml(bewertung) : ''}
            ${kennzahlenHtml(rezept, werte)}
            ${makrosHtml(werte)}
            ${rezept.werte_geschaetzt ? `<p class="geschaetzt">Zeiten und Nährwerte geschätzt${
              werte && werte.variante ? ' · Nährwerte für „' + esc(werte.variante) + '“' : ''}</p>` : ''}
            <p class="meta">Grundrezept für ${rezept.portionen} Portionen</p>
            ${rezept.anleitungVonClaude ? '<p class="markierung">Anleitung von Claude ergänzt</p>' : ''}
            ${wahl && varianten.length > 0 ? `
              <div class="varianten" role="group" aria-label="Variante wählen">
                ${varianten.map(v => `
                  <button type="button" class="variante" data-aktion="variante" data-id="${esc(rezept.id)}" data-variante="${esc(v.id)}"
                    aria-pressed="${wahl.variante === v.id}">${esc(v.name)}</button>`).join('')}
              </div>` : ''}
            ${wahl ? `
              <div class="portionen" role="group" aria-label="Portionen">
                <button type="button" class="rund" data-aktion="weniger" data-id="${esc(rezept.id)}" aria-label="Eine Portion weniger"
                  ${wahl.portionen <= MIN_PORTIONEN ? 'disabled' : ''}>−</button>
                <span class="portionen-zahl"><strong>${wahl.portionen}</strong> ${wahl.portionen === 1 ? 'Portion' : 'Portionen'}</span>
                <button type="button" class="rund" data-aktion="mehr" data-id="${esc(rezept.id)}" aria-label="Eine Portion mehr"
                  ${wahl.portionen >= MAX_PORTIONEN ? 'disabled' : ''}>+</button>
              </div>` : ''}
            <div class="aktionen">
              <button type="button" class="knopf ${wahl ? 'knopf-aktiv' : 'knopf-haupt'}" data-aktion="auswaehlen" data-id="${esc(rezept.id)}" aria-pressed="${Boolean(wahl)}">
                ${wahl ? '✓ Ausgewählt' : 'Auswählen'}
              </button>
              <button type="button" class="knopf knopf-leise" data-aktion="ansehen" data-id="${esc(rezept.id)}">Rezept ansehen</button>
            </div>
          </div>
        </article>`;
    }).join('');
    bilderUeberwachen(rezeptListe);
  }

  // Fehlt ein Foto, wird der Platzhalter gezeigt (und das Foto nicht erneut gesucht)
  function bilderUeberwachen(bereich) {
    bereich.querySelectorAll('img[data-bild]').forEach(img => {
      img.addEventListener('error', () => {
        fehlendeBilder.add(img.dataset.bild);
        if (!img.src.endsWith(PLATZHALTER_BILD)) img.src = PLATZHALTER_BILD;
      }, { once: true });
    });
  }

  rezeptListe.addEventListener('click', ereignis => {
    const knopf = ereignis.target.closest('[data-aktion]');
    if (!knopf) return;
    const rezept = rezeptNachId(knopf.dataset.id);
    if (!rezept) return;
    const wahl = zustand.auswahl[rezept.id];

    switch (knopf.dataset.aktion) {
      case 'ansehen':
        oeffneRezept(rezept);
        return;
      case 'note':
        if (offeneNoten.has(rezept.id)) offeneNoten.delete(rezept.id);
        else offeneNoten.add(rezept.id);
        zeigeRezepte();
        return;
      case 'auswaehlen':
        // Neu ausgewählte Rezepte starten mit der Standard-Personenzahl
        if (wahl) delete zustand.auswahl[rezept.id];
        else zustand.auswahl[rezept.id] = { portionen: standardPersonen, variante: gueltigeVariante(rezept, null) };
        break;
      case 'mehr':
      case 'weniger':
        if (!wahl) return;
        wahl.portionen = begrenze(wahl.portionen + (knopf.dataset.aktion === 'mehr' ? 1 : -1));
        break;
      case 'variante':
        if (!wahl) return;
        wahl.variante = gueltigeVariante(rezept, knopf.dataset.variante);
        break;
      default:
        return;
    }
    zustandSpeichern();
    allesAnzeigen();
  });

  // ===== Anzeige: Rezept im Detail =====

  function zutatZeile(zutat, faktor) {
    const teile = [zutat, zutat.oder].filter(Boolean).map(t =>
      (t.menge != null ? `<span class="menge">${esc(mengeText(t.menge * faktor, t.einheit))}</span> ` : '') + esc(t.name));
    const hinweis = zutat.hinweis ? ` <span class="hinweis">(${esc(zutat.hinweis)})</span>` : '';
    return `<li>${teile.join(' <em>oder</em> ')}${hinweis}</li>`;
  }

  function oeffneRezept(rezept) {
    const wahl = zustand.auswahl[rezept.id];
    const portionen = wahl ? wahl.portionen : rezept.portionen;
    const faktor = portionen / rezept.portionen;
    const varianten = rezept.varianten || [];
    const variantenName = id => (varianten.find(v => v.id === id) || {}).name || id;

    dialogInhalt.innerHTML = `
      <div class="dialog-kopf">
        <h2>${esc(rezept.name)}</h2>
        <button type="button" class="rund schliessen" data-schliessen aria-label="Schließen">✕</button>
      </div>
      <img class="dialog-bild" src="${esc(bildPfad(rezept))}" alt="" data-bild="${esc(rezept.id)}">
      <div class="dialog-text">
        <p class="meta">Mengen für ${portionen} ${portionen === 1 ? 'Portion' : 'Portionen'}</p>
        <h3>Zutaten</h3>
        <ul class="zutaten">${rezept.zutaten.map(z => zutatZeile(z, faktor)).join('')}</ul>
        ${varianten.map(v => `
          <h3>Variante ${esc(v.name)}</h3>
          <ul class="zutaten">${v.zutaten.map(z => zutatZeile(z, faktor)).join('')}</ul>`).join('')}
        <h3>Zubereitung</h3>
        ${rezept.anleitungVonClaude ? '<p class="markierung">Diese Anleitung wurde von Claude ergänzt.</p>' : ''}
        <ol class="schritte">
          ${(rezept.anleitung || []).map(schritt => {
            const s = typeof schritt === 'string' ? { text: schritt } : schritt;
            return `<li>
              ${s.variante ? `<span class="etikett">nur ${esc(variantenName(s.variante))}</span>` : ''}
              ${s.vonClaude ? '<span class="etikett etikett-claude">von Claude ergänzt</span>' : ''}
              ${s.titel ? `<strong>${esc(s.titel)}</strong>` : ''}
              <p>${esc(s.text || '')}</p>
            </li>`;
          }).join('')}
        </ol>
      </div>`;
    bilderUeberwachen(dialogInhalt);
    dialog.showModal();
    dialogInhalt.scrollTop = 0;
  }

  dialog.addEventListener('click', ereignis => {
    // Klick auf den abgedunkelten Rand oder auf "Schließen"
    if (ereignis.target === dialog || ereignis.target.closest('[data-schliessen]')) dialog.close();
  });

  // ===== Anzeige: Einkaufsliste =====

  function zeigeEinkaufsliste() {
    const gruppen = baueEinkaufsliste();
    const nichtsDa = gruppen.length === 0;

    einkaufsliste.innerHTML = nichtsDa
      ? '<p class="leer">Noch keine Rezepte ausgewählt.<br>Wähle unter „Rezepte“ aus, was du kochen möchtest.</p>'
      : gruppen.map(({ bereich, eintraege }) => `
        <section class="bereich${bereich.id === 'vorrat' ? ' bereich-vorrat' : ''}">
          <h2>${esc(bereich.titel)}</h2>
          <ul>
            ${eintraege.map(e => {
              const erledigt = Boolean(zustand.abgehakt[e.schluessel]);
              return `<li class="posten${erledigt ? ' erledigt' : ''}">
                <label>
                  <input type="checkbox" data-schluessel="${esc(e.schluessel)}" ${erledigt ? 'checked' : ''}>
                  <span class="posten-name">${esc(e.name)}</span>
                  ${e.menge ? `<span class="posten-menge">${esc(e.menge)}</span>` : ''}
                </label>
              </li>`;
            }).join('')}
          </ul>
        </section>`).join('');

    zuruecksetzenKnopf.hidden = nichtsDa;
  }

  einkaufsliste.addEventListener('change', ereignis => {
    const kaestchen = ereignis.target;
    if (!kaestchen.matches('input[type="checkbox"]')) return;
    if (kaestchen.checked) zustand.abgehakt[kaestchen.dataset.schluessel] = true;
    else delete zustand.abgehakt[kaestchen.dataset.schluessel];
    kaestchen.closest('.posten').classList.toggle('erledigt', kaestchen.checked);
    zustandSpeichern();
  });

  zuruecksetzenKnopf.addEventListener('click', () => {
    if (!window.confirm('Liste zurücksetzen?\n\nAlle ausgewählten Rezepte, Portionen und Haken werden gelöscht.')) return;
    zustand = leererZustand();
    zustandSpeichern();
    allesAnzeigen();
    zeigeAnsicht('rezepte');
  });

  // ===== Umschalten zwischen "Rezepte" und "Einkaufsliste" =====

  const reiterKnoepfe = document.querySelectorAll('.reiter [data-ansicht]');

  function zeigeAnsicht(name) {
    document.getElementById('ansicht-rezepte').hidden = name !== 'rezepte';
    document.getElementById('ansicht-liste').hidden = name !== 'liste';
    reiterKnoepfe.forEach(k => {
      if (k.dataset.ansicht === name) k.setAttribute('aria-current', 'page');
      else k.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  reiterKnoepfe.forEach(k => k.addEventListener('click', () => zeigeAnsicht(k.dataset.ansicht)));

  // ===== Suche, Sortierung, Standard-Personenzahl =====

  suchfeld.addEventListener('input', zeigeRezepte);
  sortierAuswahl.addEventListener('change', zeigeRezepte);

  const standardZahl = document.getElementById('standard-zahl');
  const standardWeniger = document.getElementById('standard-weniger');
  const standardMehr = document.getElementById('standard-mehr');

  function zeigeStandardPersonen() {
    standardZahl.textContent = standardPersonen;
    standardWeniger.disabled = standardPersonen <= MIN_PORTIONEN;
    standardMehr.disabled = standardPersonen >= MAX_PORTIONEN;
  }

  function aendereStandardPersonen(schritt) {
    // Bereits ausgewählte Rezepte behalten ihre Personenzahl
    standardPersonen = begrenze(standardPersonen + schritt);
    standardPersonenSpeichern();
    zeigeStandardPersonen();
  }

  standardWeniger.addEventListener('click', () => aendereStandardPersonen(-1));
  standardMehr.addEventListener('click', () => aendereStandardPersonen(1));
  zeigeStandardPersonen();

  function allesAnzeigen() {
    zeigeRezepte();
    zeigeEinkaufsliste();
  }

  allesAnzeigen();
})();
