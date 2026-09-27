'use strict';

(function () {
  // ===== Einstellungen =====

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

  function zeigeRezepte() {
    if (rezepte.length === 0) {
      rezeptListe.innerHTML = '<p class="leer">Keine Rezepte gefunden. Prüfe die Datei rezepte.js.</p>';
      return;
    }
    rezeptListe.innerHTML = rezepte.map(rezept => {
      const wahl = zustand.auswahl[rezept.id];
      const varianten = rezept.varianten || [];
      return `
        <article class="karte${wahl ? ' ausgewaehlt' : ''}">
          <button type="button" class="karte-bild" data-aktion="ansehen" data-id="${esc(rezept.id)}" aria-label="${esc(rezept.name)} ansehen">
            <img src="${esc(bildPfad(rezept))}" alt="" data-bild="${esc(rezept.id)}" loading="lazy">
          </button>
          <div class="karte-inhalt">
            <h2>${esc(rezept.name)}</h2>
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
      case 'auswaehlen':
        if (wahl) delete zustand.auswahl[rezept.id];
        else zustand.auswahl[rezept.id] = { portionen: rezept.portionen, variante: gueltigeVariante(rezept, null) };
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

  function allesAnzeigen() {
    zeigeRezepte();
    zeigeEinkaufsliste();
  }

  allesAnzeigen();
})();
