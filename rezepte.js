/*
  REZEPTDATEN
  ===========
  In dieser Datei stehen nur die Rezepte. Hier kannst du später neue Rezepte
  ergänzen, ohne den Programmcode (app.js) anzufassen.

  So ist ein Rezept aufgebaut:
    id          Kurzname: klein, ohne Umlaute, mit Bindestrichen (z. B. "pasta-limone").
                Das Foto dazu heißt genauso: bilder/pasta-limone.jpg
    name        So erscheint das Rezept auf der Karte.
    portionen   Für wie viele Personen die Mengen gelten.
    zutaten     Liste der Zutaten (siehe unten).
    varianten   (optional) Wahlweise Zutaten, z. B. "mit Garnelen" oder "mit Tomaten".
    anleitung   Liste der Schritte. Ein Schritt ist entweder ein Text in "…"
                oder { titel: "…", text: "…" }.
                Zusätzlich möglich: variante: "tomaten" (Schritt gilt nur für diese Variante)
                und vonClaude: true (dieser Schritt wurde von Claude ergänzt).
    anleitungVonClaude   true, wenn die ganze Anleitung von Claude ergänzt wurde.

  Zeiten und Nährwerte (alle Nährwerte PRO PORTION):
    arbeitszeit_min   Minuten, in denen man wirklich etwas tut (schneiden, braten …).
    gesamtzeit_min    Minuten bis zum Essen, inkl. Warten (Marinieren, Ofen, Auftauen …).
    kcal, protein_g, fett_g, kohlenhydrate_g, ballaststoffe_g
                      Kalorien und Gramm pro Portion.
    werte_geschaetzt  true = Zeiten und Nährwerte sind geschätzt (von Claude aus
                      Zutaten und Mengen berechnet), keine Laborwerte.
    Hat ein Rezept Varianten, stehen die fünf Nährwerte in JEDER Variante
    (vollständige Werte für das ganze Gericht in dieser Variante, nicht nur der Zusatz).
    Die Gesundheitsnote wird NICHT hier eingetragen – die rechnet app.js selbst aus.

  So ist eine Zutat aufgebaut:
    { name: "Zwiebel", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "rot" }
    - name:      Gleiche Namen werden auf der Einkaufsliste zusammengezählt.
                 Deshalb immer gleich schreiben (z. B. immer "Knoblauch").
    - menge:     Zahl mit Punkt statt Komma (1.5 statt 1,5). Weglassen = "nach Gefühl".
    - einheit:   g, kg, ml, l, Stück, Zehe, Scheibe, EL, TL, cm, Bund, Zweig
                 (Stück, Zehe und Scheibe werden auf ganze Zahlen aufgerundet)
    - kategorie: obst-gemuese, brot-backwaren, kuehlregal, trockenware,
                 tiefkuehl, getraenke, vorrat
                 ("vorrat" = steht ohne Menge unter "Vorrat prüfen")
    - hinweis:   (optional) kleiner Zusatz, erscheint nur in der Rezeptansicht.
    - oder:      (optional) eine Alternative, z. B. { name: "Spitzpaprika", menge: 2, einheit: "Stück" }

  Wichtig: Nach jeder } zwischen zwei Einträgen steht ein Komma.
*/

window.REZEPTE = [
  {
    id: "pasta-limone",
    name: "Pasta Limone",
    portionen: 4,
    arbeitszeit_min: 20,
    gesamtzeit_min: 25,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Nudeln", menge: 400, einheit: "g", kategorie: "trockenware" },
      { name: "Ricotta", menge: 200, einheit: "g", kategorie: "kuehlregal" },
      { name: "Parmesan", menge: 60, einheit: "g", kategorie: "kuehlregal" },
      { name: "Zitrone", menge: 2, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "Zesten von 2, Saft von 1" },
      { name: "Minze", kategorie: "obst-gemuese", hinweis: "gehackt, nach Gefühl" },
      { name: "Petersilie", kategorie: "obst-gemuese", hinweis: "gehackt, nach Gefühl" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" }
    ],
    varianten: [
      {
        id: "garnelen",
        name: "mit Garnelen",
        kcal: 585, protein_g: 34, fett_g: 17, kohlenhydrate_g: 75, ballaststoffe_g: 4,
        zutaten: [
          { name: "Garnelen", menge: 250, einheit: "g", kategorie: "tiefkuehl" }
        ]
      },
      {
        id: "tomaten",
        name: "mit Tomaten",
        kcal: 555, protein_g: 24, fett_g: 16, kohlenhydrate_g: 78, ballaststoffe_g: 5,
        zutaten: [
          { name: "Tomaten", menge: 300, einheit: "g", kategorie: "obst-gemuese", hinweis: "frisch" }
        ]
      }
    ],
    anleitung: [
      { titel: "Soße vorbereiten", text: "Ricotta, die Zesten von 2 Zitronen, den Saft einer Zitrone und den Parmesan in einer Schüssel vermischen. Mit Salz und Pfeffer abschmecken." },
      { titel: "Nudeln kochen", text: "Nudeln in Salzwasser kochen. Gleichzeitig mit dem nächsten Schritt beginnen." },
      { titel: "Garnelen anbraten", variante: "garnelen", text: "Garnelen mit Zitronensaft, Salz und Pfeffer abschmecken. Olivenöl und Petersilie in die Pfanne geben und die Garnelen darin scharf anbraten." },
      { titel: "Tomaten anbraten", variante: "tomaten", vonClaude: true, text: "Tomaten würfeln. Olivenöl und Petersilie in die Pfanne geben und die Tomaten darin kurz scharf anbraten. Mit Zitronensaft, Salz und Pfeffer abschmecken." },
      { titel: "Soße erhitzen", text: "Wenn ¾ der Kochzeit der Nudeln vorbei sind: die Soßen-Masse in die Pfanne geben und verrühren. Die Nudeln 2 Minuten vor Ende der Packungsangabe mit der Nudelzange direkt aus dem Wasser in die Pfanne geben (nicht abgießen) und durchschwenken." },
      { titel: "Anrichten", text: "Mit gehackter Minze und Petersilie bestreuen." }
    ]
  },

  {
    id: "asia-nudeln",
    name: "Scharfe Asia-Nudeln (veggie)",
    portionen: 2,
    arbeitszeit_min: 30,
    gesamtzeit_min: 35,
    kcal: 565, protein_g: 27, fett_g: 20, kohlenhydrate_g: 69, ballaststoffe_g: 8,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Eiernudeln", menge: 150, einheit: "g", kategorie: "trockenware", hinweis: "mittlere Freiland-Eiernudeln" },
      { name: "Tofu", menge: 150, einheit: "g", kategorie: "kuehlregal", hinweis: "fest" },
      { name: "Shiitake/Maronenpilze", menge: 150, einheit: "g", kategorie: "obst-gemuese" },
      { name: "Kräuterseitlinge", menge: 50, einheit: "g", kategorie: "obst-gemuese" },
      { name: "Rote Paprika", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "klein" },
      { name: "Rote Chili", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "klein, frisch" },
      { name: "Frühlingszwiebeln", menge: 3, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Knoblauch", menge: 1, einheit: "Zehe", kategorie: "obst-gemuese" },
      { name: "Ingwer", menge: 2, einheit: "cm", kategorie: "obst-gemuese" },
      { name: "Zucchini", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "klein" },
      { name: "Limette", menge: 1, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Koriander", menge: 0.5, einheit: "Bund", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Sesam", menge: 1, einheit: "EL", kategorie: "trockenware" },
      { name: "Sojasauce", menge: 2, einheit: "EL", kategorie: "vorrat", hinweis: "mit reduziertem Salzgehalt" },
      { name: "Erdnussöl", kategorie: "vorrat" }
    ],
    anleitungVonClaude: true,
    anleitung: [
      { titel: "Vorbereiten", text: "Tofu mit Küchenpapier trocken tupfen und würfeln. Pilze putzen und in Scheiben, Kräuterseitlinge in Streifen schneiden. Paprika und Zucchini in dünne Streifen schneiden. Chili fein hacken (für weniger Schärfe vorher entkernen). Frühlingszwiebeln in Ringe schneiden, helle und grüne Teile getrennt halten. Knoblauch und Ingwer fein hacken." },
      { titel: "Nudeln kochen", text: "Eiernudeln nach Packungsanweisung kochen, abgießen und kurz kalt abspülen, damit sie nicht zusammenkleben." },
      { titel: "Tofu braten", text: "Etwas Erdnussöl in einem Wok oder einer großen Pfanne stark erhitzen. Tofu darin ca. 5 Minuten rundum goldbraun braten, dann herausnehmen." },
      { titel: "Gemüse braten", text: "Etwas Öl nachgeben. Pilze 3–4 Minuten scharf anbraten. Paprika, Zucchini und die hellen Frühlingszwiebelringe dazugeben und 2–3 Minuten mitbraten. Knoblauch, Ingwer und Chili zugeben und 1 Minute weiterbraten." },
      { titel: "Zusammenführen", text: "Nudeln und Tofu zurück in die Pfanne geben. Sojasauce und den Saft einer halben Limette dazugeben und alles schwenken, bis es heiß ist." },
      { titel: "Anrichten", text: "Mit Koriander, Sesam und den grünen Frühlingszwiebelringen bestreuen. Die restliche Limette in Spalten dazu reichen." }
    ]
  },

  {
    id: "katsu-tofu",
    name: "Katsu-Style Tofu",
    portionen: 2,
    arbeitszeit_min: 30,
    gesamtzeit_min: 105,
    kcal: 705, protein_g: 27, fett_g: 20, kohlenhydrate_g: 104, ballaststoffe_g: 8,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Tofu", menge: 225, einheit: "g", kategorie: "kuehlregal", hinweis: "fest" },
      { name: "Miso-Paste", menge: 1, einheit: "EL", kategorie: "kuehlregal", hinweis: "weiß" },
      { name: "Sushireis", menge: 150, einheit: "g", kategorie: "trockenware" },
      { name: "Paniermehl", menge: 30, einheit: "g", kategorie: "trockenware" },
      { name: "Sesam", menge: 20, einheit: "g", kategorie: "trockenware" },
      { name: "Mango-Chutney", menge: 1, einheit: "EL", kategorie: "trockenware" },
      { name: "Ananas", menge: 2, einheit: "Scheibe", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Rote Chili", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Frühlingszwiebeln", menge: 2, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Knackiges Gemüse", menge: 200, einheit: "g", kategorie: "obst-gemuese", hinweis: "gemischt, z. B. Karotten, Zuckerschoten, Gurken, Kohl" },
      { name: "Koriander", menge: 0.5, einheit: "Bund", kategorie: "obst-gemuese", hinweis: "frisch, ca. 15 g" },
      { name: "Kurkuma", menge: 0.25, einheit: "TL", kategorie: "vorrat", hinweis: "gemahlen" },
      { name: "Currypulver", menge: 0.25, einheit: "TL", kategorie: "vorrat" },
      { name: "Reisessig", menge: 1, einheit: "EL", kategorie: "vorrat" },
      { name: "Mirin", menge: 1.5, einheit: "EL", kategorie: "vorrat", hinweis: "japanischer Reiswein" },
      { name: "Olivenöl", kategorie: "vorrat" }
    ],
    anleitung: [
      { titel: "Tofu vorbereiten", text: "Tofu mit Küchenpapier trocken tupfen und in 4 „Steaks“ schneiden. In einer flachen Schüssel ¼ TL gemahlenen Kurkuma, ½ EL weiße Miso-Paste, ½ EL Reisessig und 1 EL Mirin gut vermischen. Die Tofu-Steaks in die Marinade legen, gut darin wenden und mindestens 1 Stunde marinieren lassen, dabei einmal wenden." },
      { titel: "Reis kochen", text: "150 g Sushireis nach Packungsanweisung kochen, dann abgießen. Mit ½ EL Mirin würzen und beiseitestellen." },
      { titel: "Tofu panieren und backen", text: "In einer Schale 30 g Paniermehl und 20 g Sesam mischen. Den Tofu aus der Marinade nehmen (die Marinade aufbewahren) und in der Paniermehl-Sesam-Mischung wenden, bis er vollständig bedeckt ist. Mit etwas Olivenöl beträufeln und auf ein Backblech legen. Im vorgeheizten Ofen bei 200 °C (Umluft) 30 Minuten backen, bis der Tofu goldbraun und knusprig ist." },
      { titel: "Katsu-Dressing zubereiten", text: "Die aufbewahrte Marinade mit ½ EL weißer Miso-Paste, ½ EL Reisessig, ¼ TL Currypulver und 1 EL Mango-Chutney vermischen. 20 ml Wasser hinzufügen und gut umrühren, bis das Dressing glatt ist." },
      { titel: "Ananas und Gemüse vorbereiten", text: "2 Scheiben Ananas entkernen und in 4 Stücke schneiden. In einer heißen Pfanne 3 Minuten auf jeder Seite scharf anbraten, bis sie schön gebräunt sind. 1 frische rote Chili, 2 Frühlingszwiebeln und 200 g gemischtes knackiges Gemüse von Hand oder in einer Küchenmaschine fein schneiden. Die Korianderblätter abzupfen." },
      { titel: "Servieren", text: "Reis, geschnittenes Gemüse und Korianderblätter auf 2 Schalen verteilen. Die knusprigen Tofu-Steaks in Streifen schneiden und auf die Schalen aufteilen. Jeweils 2 Stücke gegrillte Ananas und ein kleines Schälchen Dressing dazugeben. Nach Belieben mit scharfer Chilisauce beträufeln und servieren." }
    ]
  },

  {
    id: "huehnchen-spiesse",
    name: "Hühnchen-Spieße mit Reis und Tomatensoße",
    portionen: 2,
    arbeitszeit_min: 30,
    gesamtzeit_min: 60,
    kcal: 655, protein_g: 53, fett_g: 15, kohlenhydrate_g: 76, ballaststoffe_g: 6,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Hähnchenbrustfilet", menge: 2, einheit: "Stück", kategorie: "kuehlregal", hinweis: "ohne Haut, Freilandhaltung" },
      { name: "Naturjoghurt", menge: 70, einheit: "g", kategorie: "kuehlregal" },
      { name: "Rote Paprika", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "groß",
        oder: { name: "Spitzpaprika", menge: 2, einheit: "Stück" } },
      { name: "Zwiebel", menge: 1, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Knoblauch", menge: 1, einheit: "Zehe", kategorie: "obst-gemuese" },
      { name: "Ingwer", menge: 1.5, einheit: "cm", kategorie: "obst-gemuese" },
      { name: "Basmatireis", menge: 150, einheit: "g", kategorie: "trockenware", hinweis: "Beilage, von Claude ergänzt" },
      { name: "Passata", menge: 200, einheit: "ml", kategorie: "trockenware", hinweis: "passierte Tomaten, für die Tomatensoße als Beilage" },
      { name: "Garam Masala", menge: 1, einheit: "TL", kategorie: "vorrat", hinweis: "halb Marinade, halb Soße" },
      { name: "Paprikapulver (geräuchert)", menge: 0.5, einheit: "TL", kategorie: "vorrat", hinweis: "halb Marinade, halb Soße" },
      { name: "Kurkuma", menge: 0.5, einheit: "TL", kategorie: "vorrat", hinweis: "gemahlen, halb Marinade, halb Soße" },
      { name: "Currypulver", kategorie: "vorrat" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" },
      { name: "Holzspieße", kategorie: "vorrat" }
    ],
    anleitungVonClaude: true,
    anleitung: [
      { titel: "Marinade anrühren", text: "Knoblauch und Ingwer fein reiben. Mit dem Joghurt, 1 EL Olivenöl, jeweils der Hälfte von Garam Masala, Paprikapulver und Kurkuma und einer Prise Salz verrühren." },
      { titel: "Marinieren", text: "Hähnchen in ca. 3 cm große Würfel schneiden, in der Marinade wenden und mindestens 30 Minuten im Kühlschrank ziehen lassen. Die Holzspieße in der Zeit in Wasser einweichen, damit sie in der Pfanne nicht verbrennen." },
      { titel: "Reis kochen", text: "Den Basmatireis in einem Sieb kurz abspülen. Mit der doppelten Menge Wasser (ca. 300 ml) und einer Prise Salz aufkochen, dann zugedeckt bei kleiner Hitze ca. 12 Minuten garen und 5 Minuten ohne Hitze nachquellen lassen." },
      { titel: "Spieße stecken", text: "Paprika und Zwiebel in ca. 3 cm große Stücke schneiden. Abwechselnd mit dem Hähnchen auf die Spieße stecken." },
      { titel: "Braten", text: "Etwas Olivenöl in einer großen Pfanne bei mittlerer bis hoher Hitze erhitzen. Die Spieße darin rundherum 10–12 Minuten braten, bis das Hähnchen durchgegart ist (innen nicht mehr rosa)." },
      { titel: "Tomatensoße", text: "Die Spieße herausnehmen und warm halten. Die Passata in dieselbe Pfanne geben, mit dem restlichen Garam Masala, Paprikapulver und Kurkuma sowie etwas Currypulver, Salz und Pfeffer würzen und 5 Minuten köcheln lassen. Bei Bedarf einen Schuss Wasser dazugeben." },
      { titel: "Servieren", text: "Die Spieße mit dem Reis und der Tomatensoße anrichten." }
    ]
  },

  {
    id: "garnelen-nudeln",
    name: "Garnelen-Nudeln mit Tomaten",
    portionen: 2,
    arbeitszeit_min: 25,
    gesamtzeit_min: 35,
    kcal: 605, protein_g: 34, fett_g: 16, kohlenhydrate_g: 76, ballaststoffe_g: 5,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Nudeln", menge: 200, einheit: "g", kategorie: "trockenware" },
      { name: "Garnelen", menge: 200, einheit: "g", kategorie: "tiefkuehl" },
      { name: "Tomaten", menge: 300, einheit: "g", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Petersilie", kategorie: "obst-gemuese", hinweis: "nach Gefühl" },
      { name: "Knoblauch", kategorie: "obst-gemuese", hinweis: "nach Gefühl" },
      { name: "Parmesan", kategorie: "kuehlregal", hinweis: "nach Gefühl" },
      { name: "Weißwein", kategorie: "getraenke", hinweis: "nach Gefühl" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" }
    ],
    anleitungVonClaude: true,
    anleitung: [
      { titel: "Garnelen auftauen", text: "Die Garnelen im Kühlschrank auftauen lassen (oder im Beutel unter kaltem Wasser) und danach trocken tupfen." },
      { titel: "Vorbereiten", text: "Tomaten würfeln, Knoblauch fein hacken, Petersilie hacken." },
      { titel: "Nudeln kochen", text: "Nudeln in reichlich Salzwasser nach Packungsanweisung kochen." },
      { titel: "Garnelen anbraten", text: "Olivenöl in einer Pfanne erhitzen. Die Garnelen darin 2–3 Minuten scharf anbraten, bis sie rosa sind, dann herausnehmen." },
      { titel: "Tomatensoße", text: "Knoblauch in der Pfanne kurz anschwitzen. Tomaten dazugeben, mit einem Schuss Weißwein ablöschen und 5–8 Minuten einköcheln lassen. Mit Salz und Pfeffer abschmecken." },
      { titel: "Zusammenführen", text: "Garnelen und Nudeln in die Soße geben und durchschwenken. Petersilie untermischen und mit frisch geriebenem Parmesan servieren." }
    ]
  }
];
