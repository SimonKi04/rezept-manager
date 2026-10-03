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
    arbeitszeit_min: 25,
    gesamtzeit_min: 30,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Nudeln", menge: 400, einheit: "g", kategorie: "trockenware" },
      { name: "Ricotta", menge: 200, einheit: "g", kategorie: "kuehlregal" },
      { name: "Parmesan", menge: 60, einheit: "g", kategorie: "kuehlregal" },
      { name: "Zitrone", menge: 2, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "Schale für die Soße, Saft für Soße und Garnelen" },
      { name: "Petersilie", menge: 1, einheit: "Bund", kategorie: "obst-gemuese", hinweis: "eine gute Handvoll in die Soße, etwas zum Garnieren – Menge geschätzt" },
      { name: "Minze", menge: 1, einheit: "Bund", kategorie: "obst-gemuese", hinweis: "eine gute Handvoll in die Soße, etwas zum Garnieren – Menge geschätzt" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" }
    ],
    varianten: [
      {
        id: "garnelen",
        name: "mit Garnelen",
        kcal: 590, protein_g: 34, fett_g: 17, kohlenhydrate_g: 75, ballaststoffe_g: 5,
        zutaten: [
          { name: "Garnelen", menge: 250, einheit: "g", kategorie: "tiefkuehl" },
          { name: "Fischgewürz", kategorie: "vorrat", hinweis: "Gewürzmischung für Fisch; oder nur Salz, Pfeffer und Kräuter" }
        ]
      },
      {
        id: "tomaten",
        name: "mit Tomaten",
        kcal: 565, protein_g: 24, fett_g: 16, kohlenhydrate_g: 80, ballaststoffe_g: 6,
        zutaten: [
          { name: "Kirschtomaten", menge: 300, einheit: "g", kategorie: "obst-gemuese", hinweis: "oder Cocktailtomaten" },
          { name: "Zwiebel", menge: 0.5, einheit: "Stück", kategorie: "obst-gemuese" },
          { name: "Knoblauch", menge: 2, einheit: "Zehe", kategorie: "obst-gemuese", hinweis: "oder eine große" },
          { name: "Basilikum", kategorie: "obst-gemuese", hinweis: "nach Wunsch, oder Petersilie – je nachdem, was da ist" }
        ]
      }
    ],
    anleitung: [
      { titel: "Soße vorbereiten", text: "Petersilie und Minze hacken und von beiden etwas zum Garnieren beiseitelegen. Die Schale der Zitronen abreiben. Ricotta, Zitronenschale, Parmesan, Petersilie und Minze in einer Schüssel verrühren. Eine Zitrone auspressen und den Saft dazugeben. Mit Salz und Pfeffer abschmecken." },
      { titel: "Nudeln kochen", text: "Nudeln in reichlich Salzwasser kochen. Währenddessen mit dem nächsten Schritt weitermachen." },
      { titel: "Garnelen würzen und anbraten", variante: "garnelen", text: "Die Garnelen mit dem restlichen Zitronensaft beträufeln und ein paar Minuten ziehen lassen. Dann mit Fischgewürz und Pfeffer würzen. Statt Fischgewürz gehen auch Salz, Pfeffer und ein paar Kräuter. Olivenöl in einer großen Pfanne erhitzen und die Garnelen darin scharf anbraten." },
      { titel: "Tomaten anbraten", variante: "tomaten", text: "Zwiebel und Knoblauch fein hacken, die Tomaten halbieren. Olivenöl in einer großen Pfanne erhitzen. Zwiebel und Knoblauch darin kurz anbraten. Dann die Tomaten dazugeben und kurz mitbraten. Nach Wunsch ein paar Kräuter dazugeben, z. B. Basilikum oder Petersilie." },
      { titel: "Soße erhitzen", text: "Die Soße in die Pfanne geben und verrühren. Die Nudeln kurz bevor sie al dente sind mit der Nudelzange direkt aus dem Wasser in die Pfanne geben (nicht abgießen). In der Soße fertig garen und dabei durchschwenken." },
      { titel: "Anrichten", text: "Mit der zurückbehaltenen Petersilie und Minze bestreuen." }
    ]
  },

  {
    id: "asia-nudeln",
    name: "Scharfe Asia-Nudeln (veggie)",
    portionen: 2,
    arbeitszeit_min: 30,
    gesamtzeit_min: 35,
    kcal: 595, protein_g: 27, fett_g: 22, kohlenhydrate_g: 70, ballaststoffe_g: 9,
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
    anleitung: [
      { titel: "Nudeln kochen", text: "Die Nudeln in kochendem Wasser garen, bis sie gerade weich sind (meist ca. 3 Minuten). Abgießen und kalt abspülen. Gut abtropfen lassen, mit etwas Öl mischen und beiseitestellen." },
      { titel: "Tofu vorbereiten", text: "Den Tofu abtropfen lassen, mit Küchenpapier trocken tupfen und in ca. 2 cm große Würfel schneiden." },
      { titel: "Gemüse schneiden", text: "Die Pilze putzen und je nach Größe halbieren oder vierteln. Paprika und Chili entkernen und in feine Streifen schneiden. Die Zucchini in feine Streifen, die Frühlingszwiebeln in feine Ringe schneiden. Knoblauch schälen und in dünne Scheiben schneiden. Ingwer schälen und fein hacken." },
      { titel: "Dressing anrühren", text: "Die Limette in eine kleine Schüssel auspressen und die Sojasauce untermischen. Die Korianderblätter abzupfen und den größten Teil davon klein gezupft dazugeben. Den Rest zum Garnieren aufheben." },
      { titel: "Tofu und Pilze braten", text: "Etwas Öl in einer großen beschichteten Pfanne bei mittlerer Hitze erhitzen. Tofu und Pilze nebeneinander hineinlegen und einige Minuten braten, bis der Tofu rundum goldbraun ist. Dabei ab und zu wenden. Den Sesam darüberstreuen und 1 Minute mitrösten. Alles auf einen Teller geben und warm halten." },
      { titel: "Gemüse pfannenrühren", text: "Die Pfanne kurz mit Küchenpapier auswischen und auf hohe Hitze stellen. Etwas Öl hineingeben. Knoblauch, Ingwer, Chili und Frühlingszwiebeln 30 Sekunden braten. Dann Paprika und Zucchini dazugeben und unter Rühren braten, bis sie gerade anfangen weich zu werden." },
      { titel: "Nudeln dazugeben", text: "Die Nudeln in die Pfanne geben und unter Rühren erhitzen. Den Herd ausschalten und die Hälfte des Dressings untermischen." },
      { titel: "Anrichten", text: "Die Nudeln auf Teller verteilen und Tofu und Pilze darauf geben. Das restliche Dressing darüberträufeln und mit dem übrigen Koriander bestreuen." }
    ]
  },

  {
    id: "katsu-tofu",
    name: "Katsu-Style Tofu",
    portionen: 4,
    arbeitszeit_min: 35,
    gesamtzeit_min: 115,
    kcal: 730, protein_g: 29, fett_g: 21, kohlenhydrate_g: 108, ballaststoffe_g: 8,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Tofu", menge: 450, einheit: "g", kategorie: "kuehlregal", hinweis: "fest" },
      { name: "Miso-Paste", menge: 2, einheit: "EL", kategorie: "kuehlregal", hinweis: "weiß; halb Marinade, halb Dressing" },
      { name: "Sushireis", menge: 300, einheit: "g", kategorie: "trockenware" },
      { name: "Paniermehl", menge: 60, einheit: "g", kategorie: "trockenware" },
      { name: "Sesam", menge: 40, einheit: "g", kategorie: "trockenware" },
      { name: "Mango-Chutney", menge: 2, einheit: "EL", kategorie: "trockenware" },
      { name: "Ananas", menge: 0.5, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Rote Chili", menge: 2, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "frisch" },
      { name: "Frühlingszwiebeln", menge: 4, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Knackiges Gemüse", menge: 400, einheit: "g", kategorie: "obst-gemuese", hinweis: "gemischt, z. B. Karotten, Zuckerschoten, Gurken, Kohl" },
      { name: "Koriander", menge: 0.5, einheit: "Bund", kategorie: "obst-gemuese", hinweis: "frisch, ca. 15 g" },
      { name: "Kurkuma", menge: 0.5, einheit: "TL", kategorie: "vorrat", hinweis: "gemahlen" },
      { name: "Currypulver", menge: 0.5, einheit: "TL", kategorie: "vorrat" },
      { name: "Reisessig", menge: 2, einheit: "EL", kategorie: "vorrat", hinweis: "halb Marinade, halb Dressing" },
      { name: "Mirin", menge: 3, einheit: "EL", kategorie: "vorrat", hinweis: "japanischer Reiswein; für Marinade und Reis" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Chilisauce", kategorie: "vorrat", hinweis: "scharf, nach Belieben" }
    ],
    anleitung: [
      { titel: "Tofu vorbereiten", text: "Den Tofu mit Küchenpapier trocken tupfen und in vier flache „Steaks“ schneiden." },
      { titel: "Marinieren", text: "In einer breiten, flachen Schüssel Kurkuma, die Hälfte der Miso-Paste, die Hälfte des Reisessigs und den größten Teil des Mirins gut verrühren. Die Tofu-Steaks hineinlegen und rundum wenden. Mindestens 1 Stunde ziehen lassen und nach der Hälfte der Zeit einmal wenden." },
      { titel: "Ofen vorheizen", text: "Den Backofen auf 200 °C Ober-/Unterhitze vorheizen." },
      { titel: "Reis kochen", text: "Den Reis nach Packungsanweisung kochen. Mit dem restlichen Mirin würzen und beiseitestellen." },
      { titel: "Tofu panieren", text: "Paniermehl und Sesam auf einem Teller mischen. Die Tofu-Steaks aus der Marinade nehmen und kurz abtropfen lassen. Die Marinade aufheben, sie wird für das Dressing gebraucht. Den Tofu in der Mischung wenden, bis er rundum bedeckt ist." },
      { titel: "Tofu backen", text: "Den Tofu auf ein Backblech legen und mit etwas Olivenöl beträufeln. Etwa 30 Minuten backen, bis er goldbraun und knusprig ist." },
      { titel: "Katsu-Dressing anrühren", text: "Die restliche Miso-Paste und den restlichen Reisessig zur aufgehobenen Marinade geben. Currypulver und Mango-Chutney dazugeben. Mit einem Schuss Wasser glatt rühren." },
      { titel: "Ananas anbraten", text: "Die Ananas schälen, den harten Strunk entfernen und das Fruchtfleisch in vier Spalten schneiden. Eine Pfanne ohne Öl sehr heiß werden lassen. Die Ananas darin von jeder Seite etwa 3 Minuten braten, bis sie dunkle Röststellen hat." },
      { titel: "Gemüse schneiden", text: "Chili, Frühlingszwiebeln und das knackige Gemüse in feine Streifen schneiden, von Hand oder in der Küchenmaschine. Die Korianderblätter abzupfen." },
      { titel: "Anrichten", text: "Reis, Gemüse und Koriander auf Schalen verteilen. Die Tofu-Steaks in Streifen schneiden und darauflegen. Je eine Ananasspalte und ein kleines Schälchen Dressing zum Darübergießen dazugeben. Wer mag, gibt noch etwas scharfe Chilisauce darüber." }
    ]
  },

  {
    id: "huehnchen-spiesse",
    name: "Masala-Hähnchenpfanne mit gelbem Reis",
    portionen: 2,
    arbeitszeit_min: 30,
    gesamtzeit_min: 165,
    kcal: 690, protein_g: 51, fett_g: 18, kohlenhydrate_g: 78, ballaststoffe_g: 7,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Hähnchenbrustfilet", menge: 2, einheit: "Stück", kategorie: "kuehlregal", hinweis: "ohne Haut, Freilandhaltung" },
      { name: "Naturjoghurt", menge: 70, einheit: "g", kategorie: "kuehlregal" },
      { name: "Rote Paprika", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "groß",
        oder: { name: "Spitzpaprika", menge: 2, einheit: "Stück" } },
      { name: "Zwiebel", menge: 1, einheit: "Stück", kategorie: "obst-gemuese" },
      { name: "Knoblauch", menge: 1, einheit: "Zehe", kategorie: "obst-gemuese" },
      { name: "Ingwer", menge: 1.5, einheit: "cm", kategorie: "obst-gemuese" },
      { name: "Basmatireis", menge: 150, einheit: "g", kategorie: "trockenware" },
      { name: "Passata", menge: 250, einheit: "ml", kategorie: "trockenware", hinweis: "passierte Tomaten; ein kleiner Teil für die Marinade, der Rest für die Soße – Menge geschätzt" },
      { name: "Garam Masala", menge: 1, einheit: "TL", kategorie: "vorrat", hinweis: "halb Marinade, halb Soße" },
      { name: "Paprikapulver (geräuchert)", menge: 0.5, einheit: "TL", kategorie: "vorrat", hinweis: "halb Marinade, halb Soße" },
      { name: "Kurkuma", menge: 1, einheit: "TL", kategorie: "vorrat", hinweis: "gemahlen; für Marinade, Soße und Reis – Menge geschätzt" },
      { name: "Currypulver", kategorie: "vorrat", hinweis: "für die Soße" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" }
    ],
    anleitung: [
      { titel: "Marinade anrühren", text: "Knoblauch und Ingwer schälen und fein reiben. In einer großen Schüssel mit dem Joghurt, einem kleinen Teil der Passata und einem Schuss Olivenöl verrühren. Jeweils die Hälfte von Garam Masala und Paprikapulver und etwas Kurkuma dazugeben und gut mischen." },
      { titel: "Marinieren", text: "Das Hähnchen in mundgerechte Stücke schneiden, in die Schüssel geben und leicht salzen. Alles gut vermengen, abdecken und im Kühlschrank etwa 2 Stunden marinieren lassen." },
      { titel: "Gemüse schneiden", text: "Die Paprika halbieren und entkernen. Paprika und Zwiebel in grobe Stücke schneiden, etwa so groß wie das Hähnchen." },
      { titel: "Gelben Reis kochen", text: "Den Reis in einem Sieb kurz abspülen. Mit der doppelten Menge Wasser, einer Prise Salz und etwas Kurkuma aufkochen. Zugedeckt bei kleiner Hitze ca. 12 Minuten garen und dann 5 Minuten ohne Hitze nachquellen lassen." },
      { titel: "Hähnchen anbraten", text: "Etwas Olivenöl in einer großen Pfanne bei mittlerer bis hoher Hitze erhitzen. Das Hähnchen samt Marinade hineingeben und rundum anbraten. Paprika und Zwiebel dazugeben und mitbraten, bis das Hähnchen durchgegart ist (innen nicht mehr rosa) und das Gemüse leicht gebräunt ist. Das dauert etwa 10–12 Minuten." },
      { titel: "Tomatensoße kochen", text: "Währenddessen die restliche Passata in einen kleinen Topf geben. Mit der zweiten Hälfte von Garam Masala und Paprikapulver, dem restlichen Kurkuma, etwas Currypulver, Salz und Pfeffer würzen. Etwa 5 Minuten köcheln lassen." },
      { titel: "Servieren", text: "Die Hähnchenpfanne mit dem gelben Reis und der Tomatensoße anrichten." },
      { titel: "Tipp: als Spieße", text: "Statt in der Pfanne kannst du Hähnchen, Paprika und Zwiebel auch abwechselnd auf Holzspieße stecken. Die Spieße vorher in Wasser einweichen, damit sie nicht verbrennen. Dann in der Grillpfanne, im Backofengrill oder auf dem Grill rundum braten." }
    ]
  },

  {
    id: "garnelen-nudeln",
    name: "Garnelen-Nudeln mit Tomaten",
    portionen: 2,
    arbeitszeit_min: 25,
    gesamtzeit_min: 40,
    kcal: 645, protein_g: 33, fett_g: 16, kohlenhydrate_g: 82, ballaststoffe_g: 7,
    werte_geschaetzt: true,
    zutaten: [
      { name: "Nudeln", menge: 200, einheit: "g", kategorie: "trockenware" },
      { name: "Garnelen", menge: 200, einheit: "g", kategorie: "tiefkuehl" },
      { name: "Kirschtomaten", menge: 300, einheit: "g", kategorie: "obst-gemuese", hinweis: "oder Cocktailtomaten" },
      { name: "Zwiebel", menge: 1, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "klein – Menge geschätzt" },
      { name: "Knoblauch", menge: 2, einheit: "Zehe", kategorie: "obst-gemuese", hinweis: "Menge geschätzt" },
      { name: "Zitrone", menge: 0.5, einheit: "Stück", kategorie: "obst-gemuese", hinweis: "nur der Saft" },
      { name: "Petersilie", kategorie: "obst-gemuese", hinweis: "nach Gefühl" },
      { name: "Basilikum", kategorie: "obst-gemuese", hinweis: "für die Tomaten; oder Petersilie – je nachdem, was da ist" },
      { name: "Parmesan", kategorie: "kuehlregal", hinweis: "nach Gefühl" },
      { name: "Tomatenmark", menge: 1, einheit: "EL", kategorie: "trockenware", hinweis: "Menge geschätzt" },
      { name: "Weißwein", menge: 150, einheit: "ml", kategorie: "getraenke", hinweis: "trocken – Menge geschätzt" },
      { name: "Fischgewürz", kategorie: "vorrat", hinweis: "Gewürzmischung für Fisch" },
      { name: "Olivenöl", kategorie: "vorrat" },
      { name: "Salz", kategorie: "vorrat" },
      { name: "Pfeffer", kategorie: "vorrat" }
    ],
    anleitung: [
      { titel: "Garnelen auftauen", text: "Die Garnelen im Kühlschrank auftauen lassen (oder im Beutel unter kaltem Wasser) und danach trocken tupfen." },
      { titel: "Garnelen würzen", text: "Die Zitrone auspressen und die Garnelen mit dem Saft beträufeln. Ein paar Minuten ziehen lassen. Dann mit Fischgewürz und Pfeffer würzen." },
      { titel: "Vorbereiten", text: "Die Tomaten halbieren. Zwiebel und Knoblauch fein hacken. Die Petersilie hacken." },
      { titel: "Nudeln kochen", text: "Die Nudeln in reichlich Salzwasser kochen." },
      { titel: "Garnelen anbraten", text: "Olivenöl in einer großen Pfanne erhitzen. Die Garnelen darin 1–2 Minuten anbraten. Sie bleiben ab jetzt in der Pfanne." },
      { titel: "Zwiebel und Knoblauch dazugeben", text: "Knoblauch, Zwiebel und das Tomatenmark dazugeben und etwa 1 Minute mitbraten." },
      { titel: "Ablöschen", text: "Mit einem Teil des Weißweins ablöschen und einkochen lassen, bis kaum noch Flüssigkeit in der Pfanne ist." },
      { titel: "Tomaten anbraten", text: "Die Tomaten dazugeben, mit etwas Salz und Kräutern (Basilikum oder Petersilie) würzen und bei hoher Hitze kurz scharf anbraten." },
      { titel: "Köcheln lassen", text: "Mit dem restlichen Weißwein ablöschen. Die Hitze herunterdrehen, den Deckel auflegen und alles köcheln lassen, bis die Tomaten weich sind. Das dauert etwa 5–8 Minuten. Kein Wasser dazugeben, der Wein reicht als Flüssigkeit. Es soll keine richtige Tomatensoße werden: Nur ein paar Tomaten mit der Gabel zerdrücken." },
      { titel: "Nudeln dazugeben", text: "Die Nudeln kurz bevor sie al dente sind mit der Nudelzange direkt aus dem Wasser in die Pfanne geben. Durchschwenken und kurz fertig garen." },
      { titel: "Anrichten", text: "Die Petersilie obendrauf streuen, nicht ganz untermischen. Mit frisch geriebenem Parmesan servieren." }
    ]
  }
];
