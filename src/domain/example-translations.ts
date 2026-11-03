// The example library in Dutch, German and Italian (phase 22), keyed by each example's name (see example-library.ts).
// The name of the workspace stays English, because the note "Run Blockly Workspace: name" uses it.
export type ExampleTranslation = { displayName: string; description: string; detailedDescription: string };
export type ExampleLanguage = 'nl' | 'de' | 'it';
export const EXAMPLE_TRANSLATIONS: Record<string, Partial<Record<ExampleLanguage, ExampleTranslation>>> = {
 "example-hello": {
  "nl": {
   "displayName": "Voorbeeld: Hallo, console",
   "description": "De eerste werkruimte: regels in de console, en een melding van Nomie.",
   "detailedDescription": "In dit eerste voorbeeld bouw je de kleinste bruikbare werkruimte: één regel tekst in de console. Begin in de Nomie-sectie van de lade en zet het Scheduler-blok op het canvas. Het script erin is wat draait, dus zet het volgende blok erin. Voeg daarna het consoleblok toe en steek een tekstblok in de Value. Typ een groet in de tekst. Voeg dan een tweede consoleregel toe, en een bericht-blok dat dezelfde tekst als melding toont. Druk op Uitvoeren: de console toont elke regel in volgorde, en het bericht verschijnt als melding van Nomie. Probeer de tekst te veranderen en laat de werkruimte opnieuw draaien."
  },
  "de": {
   "displayName": "Beispiel: Hallo, Konsole",
   "description": "Der erste Arbeitsbereich: Zeilen in der Konsole und eine Mitteilung von Nomie.",
   "detailedDescription": "In diesem ersten Beispiel baust du den kleinsten nützlichen Arbeitsbereich: eine Textzeile in der Konsole. Beginne in der Nomie-Gruppe der Palette und setze den Scheduler-Block auf die Arbeitsfläche. Sein Skript ist der Teil, der läuft, also setze den nächsten Block hinein. Füge dann den Konsolen-Block hinzu und stecke einen Text-Block in seinen Wert. Tippe eine Begrüßung in den Text. Füge danach eine zweite Konsolenzeile hinzu und einen Nachricht-Block, der denselben Text als Mitteilung zeigt. Drücke Ausführen: Die Konsole zeigt jede Zeile der Reihe nach, und die Nachricht erscheint als Mitteilung von Nomie. Versuche, den Text zu ändern, und führe den Arbeitsbereich erneut aus."
  },
  "it": {
   "displayName": "Esempio: Ciao, console",
   "description": "Il primo spazio di lavoro: righe nella console e un avviso di Nomie.",
   "detailedDescription": "In questo primo esempio costruisci lo spazio di lavoro più piccolo e utile: una riga di testo nella console. Inizia dalla sezione Nomie del cassetto e metti il blocco Scheduler sulla tela. Il suo script è la parte che viene eseguita, quindi metti il blocco successivo al suo interno. Aggiungi poi il blocco della console e inserisci un blocco di testo nel suo Value. Scrivi un saluto nel testo. Aggiungi quindi una seconda riga della console e un blocco messaggio che mostra lo stesso testo come avviso. Premi Esegui: la console mostra ogni riga in ordine, e il messaggio compare come avviso di Nomie. Prova a cambiare il testo ed esegui di nuovo."
  }
 },
 "example-yesterday-mood": {
  "nl": {
   "displayName": "Voorbeeld: Gisteren in één getal",
   "description": "Leest één tracker voor één dag en toont het gemiddelde.",
   "detailedDescription": "Dit voorbeeld leest je notities. Het vraagt naar de gemiddelde stemming van gisteren en toont het antwoord met een zin eromheen. Begin met het Scheduler-blok. Voeg daarin een blok toon bericht toe. In het bericht voeg je twee delen samen met een samenvoegblok: een tekst die de zin begint, en een dagwaarde-blok. Het dagwaarde-blok heeft drie invoer: de tracker (#mood, uit het trackerblok), de dag (gisteren, uit de dagkiezer) en de statistiek (gemiddelde, uit de statistiekkiezer). Probeer het eerst in de testmodus. De zin toont de waarde die je notities bevatten; zonder notities toont hij een nul."
  },
  "de": {
   "displayName": "Beispiel: Gestern als eine Zahl",
   "description": "Liest einen Tracker für einen Tag und zeigt den Durchschnitt.",
   "detailedDescription": "Dieses Beispiel liest deine Notizen. Es fragt nach der durchschnittlichen Stimmung von gestern und zeigt die Antwort in einem Satz. Beginne mit dem Scheduler-Block. Füge darin einen Block Nachricht zeigen hinzu. In die Nachricht verbindest du zwei Teile mit einem Verbinden-Block: einen Text, der den Satz beginnt, und einen Tageswert-Block. Der Tageswert-Block hat drei Eingänge: den Tracker (#mood, aus dem Tracker-Block), den Tag (gestern, aus der Tagesauswahl) und die Statistik (Durchschnitt, aus der Statistikauswahl). Probiere es zuerst im Testmodus. Der Satz zeigt den Wert, den deine Notizen enthalten; ohne Notizen zeigt er eine Null."
  },
  "it": {
   "displayName": "Esempio: Ieri in un numero",
   "description": "Legge un tracker per un giorno e mostra la media.",
   "detailedDescription": "Questo esempio legge le tue note. Chiede la media dell'umore di ieri e mostra la risposta con una frase intorno. Inizia dal blocco Scheduler. Al suo interno aggiungi un blocco mostra messaggio. Nel messaggio unisci due parti con un blocco unisci: un testo che apre la frase, e un blocco valore del giorno. Il blocco valore del giorno ha tre ingressi: il tracker (#mood, dal blocco tracker), il giorno (ieri, dal selettore del giorno) e la statistica (media, dal selettore delle statistiche). Provalo prima in modalità prova. La frase mostra il valore che contengono le tue note; senza note mostra zero."
  }
 },
 "example-mood-period": {
  "nl": {
   "displayName": "Voorbeeld: Stemming over een periode",
   "description": "Een periodewaarde, afgerond en getoond als zin.",
   "detailedDescription": "Hier lees je een langere periode. Voeg het periodewaarde-blok toe; het werkt als het dagwaarde-blok, maar het beslaat een reeks dagen: kies Laatste 30 dagen in de periodekiezer, en de statistiek gemiddelde. Rond de periodewaarde af met een rondblok, zodat het antwoord geen decimalen heeft. Toon het met een bericht en een tekst ervoor. Dit is het patroon voor wekelijkse en maandelijkse overzichten: verander de periode en de statistiek, en dezelfde blokken beantwoorden een andere vraag."
  },
  "de": {
   "displayName": "Beispiel: Stimmung über einen Zeitraum",
   "description": "Ein Zeitraumwert, gerundet und als Satz gezeigt.",
   "detailedDescription": "Hier liest du einen längeren Zeitraum. Füge den Zeitraumwert-Block hinzu; er arbeitet wie der Tageswert-Block, deckt aber eine Reihe von Tagen ab: Wähle in der Zeitraumauswahl Letzte 30 Tage und bei der Statistik Durchschnitt. Runde den Zeitraumwert mit einem Runden-Block, damit die Antwort keine Nachkommastellen hat. Zeige ihn mit einer Nachricht und einem Text davor. Das ist das Muster für Wochen- und Monatsübersichten: Ändere den Zeitraum und die Statistik, und dieselben Blöcke beantworten eine andere Frage."
  },
  "it": {
   "displayName": "Esempio: Umore su un periodo",
   "description": "Un valore di periodo, arrotondato e mostrato come frase.",
   "detailedDescription": "Qui leggi un periodo più lungo. Aggiungi il blocco valore di periodo, che funziona come il blocco valore del giorno ma copre un intervallo: nel selettore del periodo scegli Ultimi 30 giorni, e la statistica media. Arrotonda il valore di periodo con un blocco arrotonda, così la risposta non ha decimali. Mostralo con un messaggio e un testo davanti. È lo schema per i riepiloghi settimanali e mensili: cambia il periodo e la statistica, e gli stessi blocchi rispondono a un'altra domanda."
  }
 },
 "example-log-value": {
  "nl": {
   "displayName": "Voorbeeld: Elke dag een waarde noteren",
   "description": "Schrijft een notitie met een trackerwaarde, voor de dag van de run.",
   "detailedDescription": "Dit voorbeeld schrijft naar je notities, dus probeer het het best eerst in de testmodus: in de testmodus zegt het alleen wat het zou schrijven. Zet het blok waarde noteren binnen een dagelijks Scheduler-blok, zodat het één notitie schrijft voor elke dag van een geplande run. Geef het de tracker #goodday, een waarde van 1, en de dagkiezer op vandaag. Probeer de testrun: de console toont de regel 'Zou loggen' met de dag. Als je tevreden bent, zet je de testmodus uit en draai je het echt."
  },
  "de": {
   "displayName": "Beispiel: Jeden Tag einen Wert eintragen",
   "description": "Schreibt eine Notiz mit einem Trackerwert, für den Tag des Laufs.",
   "detailedDescription": "Dieses Beispiel schreibt in deine Notizen, probiere es deshalb am besten zuerst im Testmodus: Im Testmodus sagt es nur, was es schreiben würde. Setze den Block Wert eintragen in einen täglichen Scheduler-Block, damit er für jeden Tag eines geplanten Laufs eine Notiz schreibt. Gib ihm den Tracker #goodday, den Wert 1 und die Tagesauswahl auf heute. Probiere den Testlauf: Die Konsole zeigt die Zeile „Würde eintragen“ mit dem Tag. Wenn du zufrieden bist, schalte den Testmodus aus und führe es echt aus."
  },
  "it": {
   "displayName": "Esempio: Registra un valore ogni giorno",
   "description": "Scrive una nota con un valore di tracker, per il giorno dell'esecuzione.",
   "detailedDescription": "Questo esempio scrive nelle tue note, quindi provalo meglio prima in modalità prova: in modalità prova dice solo cosa scriverebbe. Metti il blocco registra valore dentro un blocco Scheduler giornaliero, così scrive una nota per ogni giorno di un'esecuzione pianificata. Dagli il tracker #goodday, un valore di 1 e il selettore del giorno su oggi. Prova l'esecuzione di prova: la console mostra la riga 'Registrerebbe' con il giorno. Quando sei soddisfatto, disattiva la modalità prova ed eseguilo davvero."
  }
 },
 "example-wait": {
  "nl": {
   "displayName": "Voorbeeld: Wachten tussen regels",
   "description": "Wacht een seconde tussen twee consoleregels.",
   "detailedDescription": "Een werkruimte kan even pauzeren. Bouw twee consoleregels met een wachtblok ertussen: eerst de consoleregel, dan het wachtblok ingesteld op 1 seconde, dan de tweede regel. De run stopt voor het wachten, en de console toont de eerste regel voor de tweede. Gebruik wachten spaarzaam: elke seconde telt mee voor de tijd die een run mag duren."
  },
  "de": {
   "displayName": "Beispiel: Warten zwischen Zeilen",
   "description": "Wartet eine Sekunde zwischen zwei Konsolenzeilen.",
   "detailedDescription": "Ein Arbeitsbereich kann kurz pausieren. Baue zwei Konsolenzeilen mit einem Warten-Block dazwischen: zuerst die Konsolenzeile, dann den Warten-Block auf 1 Sekunde, dann die zweite Zeile. Der Lauf hält beim Warten an, und die Konsole zeigt die erste Zeile vor der zweiten. Setze Wartezeiten sparsam ein: Jede Sekunde zählt zur Zeit, die ein Lauf dauern darf."
  },
  "it": {
   "displayName": "Esempio: Attesa tra le righe",
   "description": "Attende un secondo tra due righe della console.",
   "detailedDescription": "Uno spazio di lavoro può fermarsi per un attimo. Costruisci due righe della console con un blocco attesa in mezzo: prima la riga della console, poi il blocco attesa impostato a 1 secondo, poi la seconda riga. L'esecuzione si ferma durante l'attesa, e la console mostra la prima riga prima della seconda. Usa le attese con parsimonia: ogni secondo conta sul tempo che un'esecuzione può impiegare."
  }
 },
 "example-pickers": {
  "nl": {
   "displayName": "Voorbeeld: De kiezers",
   "description": "Kiezers voor tracker, dag, periode, statistiek en datum op één plek.",
   "detailedDescription": "De kiezers zijn de kleine blokken die een waarde kiezen: een tracker, een dag, een periode, een statistiek en een datum. In dit voorbeeld zet je elke kiezer in een toon bericht, zodat je ziet wat hij kiest. Bouw het bericht met samenvoegblokken, één voor elke kiezer. Verander de gekozen waarde in de keuzelijst en draai opnieuw om de tekst te zien veranderen. Elk blok dat notities leest of schrijft, neemt zijn tracker, dag of periode uit deze kiezers."
  },
  "de": {
   "displayName": "Beispiel: Die Auswahlen",
   "description": "Auswahlen für Tracker, Tag, Zeitraum, Statistik und Datum an einem Ort.",
   "detailedDescription": "Die Auswahlen sind die kleinen Blöcke, die einen Wert wählen: einen Tracker, einen Tag, einen Zeitraum, eine Statistik und ein Datum. In diesem Beispiel setzt du jede Auswahl in eine Nachricht zeigen, damit du siehst, was sie wählt. Baue die Nachricht mit Verbinden-Blöcken, einen für jede Auswahl. Ändere den gewählten Wert im Auswahlfeld und führe erneut aus, um zu sehen, wie sich der Text ändert. Jeder Block, der Notizen liest oder schreibt, nimmt seinen Tracker, Tag oder Zeitraum aus diesen Auswahlen."
  },
  "it": {
   "displayName": "Esempio: I selettori",
   "description": "Selettori di tracker, giorno, periodo, statistica e data in un unico posto.",
   "detailedDescription": "I selettori sono i piccoli blocchi che scelgono un valore: un tracker, un giorno, un periodo, una statistica e una data. In questo esempio ogni selettore finisce in un mostra messaggio, così vedi cosa sceglie. Costruisci il messaggio con blocchi unisci, uno per ogni selettore. Cambia il valore scelto nel menu a tendina ed esegui di nuovo per vedere cambiare il testo. Ogni blocco che legge o scrive note prende il suo tracker, giorno o periodo da questi selettori."
  }
 },
 "example-history": {
  "nl": {
   "displayName": "Voorbeeld: Laatste waarde en dagen geleden",
   "description": "De laatst gelogde waarde, en hoeveel dagen geleden die gelogd werd.",
   "detailedDescription": "De geschiedenisblokken kijken terug door je notities. Het blok laatste waarde zoekt de nieuwste notitie met een tracker binnen een aantal dagen, en het blok dagen sinds telt de dagen van die notitie tot vandaag. Bouw ze in een dagelijks Scheduler-blok: een bericht met de laatste stemming (terugkijkend 14 dagen), en een tweede regel met de dagen sinds #mood voor het laatst gelogd werd. Beide antwoorden komen uit dezelfde notities, dus ze kloppen met elkaar."
  },
  "de": {
   "displayName": "Beispiel: Letzter Wert und Tage seit",
   "description": "Der zuletzt erfasste Wert und wie viele Tage es her ist.",
   "detailedDescription": "Die Verlaufsblöcke schauen in deine Notizen zurück. Der Block letzter Wert sucht die neueste Notiz mit einem Tracker innerhalb einer Anzahl von Tagen, und der Block Tage seit zählt die Tage von dieser Notiz bis heute. Baue sie in einen täglichen Scheduler-Block: eine Nachricht mit der letzten Stimmung (14 Tage zurückblickend) und eine zweite Zeile mit den Tagen seit #mood zuletzt erfasst wurde. Beide Antworten stammen aus denselben Notizen, also stimmen sie zueinander."
  },
  "it": {
   "displayName": "Esempio: Ultimo valore e giorni dall'ultimo",
   "description": "L'ultimo valore registrato, e quanti giorni fa è stato registrato.",
   "detailedDescription": "I blocchi di storico guardano indietro nelle tue note. Il blocco ultimo valore trova la nota più recente con un tracker entro un certo numero di giorni, e il blocco giorni dall'ultimo conta i giorni da quella nota a oggi. Costruiscili in un blocco Scheduler giornaliero: un messaggio con l'ultimo umore (guardando indietro 14 giorni), e una seconda riga con i giorni dall'ultima registrazione di #mood. Entrambe le risposte vengono dalle stesse note, quindi concordano."
  }
 },
 "example-streak": {
  "nl": {
   "displayName": "Voorbeeld: Een reeks",
   "description": "Telt de dagen op rij met een tracker, en feliciteert je.",
   "detailedDescription": "Een reeks telt de dagen op rij dat een tracker gelogd is, tot de dag van de run. Bouw een als-blok: als de reeks ten minste 3 is, toon je een felicitatiebericht, anders een kort aanmoedigingsbericht. De voorwaarde is een vergelijkblok, met het reeksblok links en het getal 3 rechts. Probeer het met andere trackers, en lees de tooltip van het reeksblok: het telt hoogstens 60 dagen."
  },
  "de": {
   "displayName": "Beispiel: Eine Serie",
   "description": "Zählt die Tage in Folge mit einem Tracker und gratuliert dir.",
   "detailedDescription": "Eine Serie zählt die Tage in Folge, an denen ein Tracker erfasst wurde, bis zum Tag des Laufs. Baue einen Wenn-Block: Ist die Serie mindestens 3, zeige eine Glückwunschnachricht, sonst eine kurze Aufmunterung. Die Bedingung ist ein Vergleichsblock, links der Serienblock, rechts die Zahl 3. Probiere es mit anderen Trackern und lies den Hinweistext des Serienblocks: Er zählt höchstens 60 Tage."
  },
  "it": {
   "displayName": "Esempio: Una serie",
   "description": "Conta i giorni di fila con un tracker, e ti fa i complimenti.",
   "detailedDescription": "Una serie conta i giorni consecutivi in cui un tracker è stato registrato, fino al giorno dell'esecuzione. Costruisci un blocco se: se la serie è almeno 3, mostra un messaggio di complimenti, altrimenti un breve incoraggiamento. La condizione è un blocco confronto, con il blocco serie a sinistra e il numero 3 a destra. Prova con altri tracker e leggi il suggerimento del blocco serie: conta al massimo 60 giorni."
  }
 },
 "example-write-note": {
  "nl": {
   "displayName": "Voorbeeld: Een notitie schrijven",
   "description": "Schrijft een vrije tekstnotitie op een dag naar keuze.",
   "detailedDescription": "Het blok notitie schrijven schrijft een vrije tekstnotitie, die trackers, personen en context kan bevatten zoals een Nomie-notitie. Bouw het in een Scheduler-blok met de tekst 'Week doorgenomen #review' en de dagkiezer op gisteren. Gebruik eerst de testmodus: die toont de notitie die het zou schrijven. Dit is het blok om te gebruiken voor een wekelijks overzicht of een herinnering die in je tijdlijn verschijnt."
  },
  "de": {
   "displayName": "Beispiel: Eine Notiz schreiben",
   "description": "Schreibt eine Freitext-Notiz an einem Tag deiner Wahl.",
   "detailedDescription": "Der Block Notiz schreiben schreibt eine Freitext-Notiz, die Tracker, Personen und Kontext enthalten kann, wie eine Nomie-Notiz. Baue ihn in einen Scheduler-Block mit dem Text „Woche durchgesehen #review“ und der Tagesauswahl auf gestern. Verwende zuerst den Testmodus: Er zeigt die Notiz, die er schreiben würde. Dieser Block eignet sich für eine Wochenübersicht oder eine Erinnerung, die in deiner Zeitleiste erscheint."
  },
  "it": {
   "displayName": "Esempio: Scrivi una nota",
   "description": "Scrive una nota di testo libero in un giorno a tua scelta.",
   "detailedDescription": "Il blocco scrivi nota scrive una nota di testo libero, che può contenere tracker, persone e contesto come una nota di Nomie. Costruiscilo in un blocco Scheduler con il testo 'Rivista la settimana #review' e il selettore del giorno su ieri. Usa prima la modalità prova: mostra la nota che scriverebbe. Questo è il blocco da usare per un riepilogo settimanale o un promemoria che compare nella tua cronologia."
  }
 },
 "example-location": {
  "nl": {
   "displayName": "Voorbeeld: Waar ben ik",
   "description": "Toont de locatie die Nomie meldt, als je dat toestaat.",
   "detailedDescription": "Het blok mijn locatie vraagt Nomie om je positie, en geeft een breedtegraad en lengtegraad, of niets als de positie niet bekend is. Bouw het in een bericht, met een tekst ervoor. Nomie vraagt de eerste keer om toestemming. Probeer het eerst in de testmodus, en zie de positie verschijnen. Verschijnt er niets, dan was de positie niet beschikbaar; daarom moet elk gebruik van mijn locatie een terugvaloptie hebben."
  },
  "de": {
   "displayName": "Beispiel: Wo bin ich",
   "description": "Zeigt den Standort, den Nomie meldet, wenn du es erlaubst.",
   "detailedDescription": "Der Block meine Position fragt Nomie nach deiner Position und gibt einen Breiten- und Längengrad zurück, oder nichts, wenn die Position nicht bekannt ist. Baue ihn in eine Nachricht mit einem Text davor. Nomie fragt beim ersten Mal nach der Erlaubnis. Probiere es zuerst im Testmodus und sieh zu, wie die Position erscheint. Erscheint nichts, war die Position nicht verfügbar; deshalb sollte jede Verwendung von meine Position einen Ersatzwert haben."
  },
  "it": {
   "displayName": "Esempio: Dove sono",
   "description": "Mostra la posizione che Nomie comunica, se lo consenti.",
   "detailedDescription": "Il blocco la mia posizione chiede a Nomie la tua posizione, e dà una latitudine e una longitudine, oppure niente quando la posizione non è nota. Costruiscilo in un messaggio, con un testo davanti. Nomie chiede il permesso la prima volta. Provalo prima in modalità prova e guarda comparire la posizione. Se non compare nulla, la posizione non era disponibile: per questo ogni uso di la mia posizione dovrebbe avere un ripiego."
  }
 },
 "example-open-link": {
  "nl": {
   "displayName": "Voorbeeld: Een link openen",
   "description": "Opent een webpagina in Nomie als je het met de hand draait.",
   "detailedDescription": "Het blok open link opent een webpagina in een venster binnen Nomie. Bouw het met een tekstblok dat het adres bevat. Bij een run met de hand wordt de pagina geopend; bij een geplande run schrijft het blok alleen 'Zou openen' naar de uitvoer, dus een schema opent nooit een venster. Gebruik dit voor een pagina die je elke dag bekijkt, zoals een dashboard van je eigen."
  },
  "de": {
   "displayName": "Beispiel: Einen Link öffnen",
   "description": "Öffnet eine Webseite in Nomie, wenn du den Lauf von Hand startest.",
   "detailedDescription": "Der Block Link öffnen öffnet eine Webseite in einem Fenster innerhalb von Nomie. Baue ihn mit einem Textblock, der die Adresse enthält. Bei einem Lauf von Hand wird die Seite geöffnet; bei einem geplanten Lauf schreibt der Block nur „Würde öffnen“ in die Ausgabe, ein Zeitplan öffnet also nie ein Fenster. Verwende ihn für eine Seite, die du jeden Tag ansiehst, etwa ein eigenes Dashboard."
  },
  "it": {
   "displayName": "Esempio: Apri un link",
   "description": "Apre una pagina web in Nomie quando lo esegui a mano.",
   "detailedDescription": "Il blocco apri link apre una pagina web in una finestra dentro Nomie. Costruiscilo con un blocco di testo che contiene l'indirizzo. In un'esecuzione manuale la pagina si apre; in un'esecuzione pianificata il blocco scrive solo 'Aprirebbe' nell'output, quindi una pianificazione non apre mai una finestra. Usalo per una pagina che controlli ogni giorno, come una dashboard tua."
  }
 },
 "example-fetch-page": {
  "nl": {
   "displayName": "Voorbeeld: Een webpagina ophalen",
   "description": "Haalt een webpagina op en toont het begin van het antwoord.",
   "detailedDescription": "Het blok ophalen roept een webadres aan en geeft het antwoord als tekst. Bouw het met een tekstblok met het adres, en toon het antwoord in de console. De meeste diensten antwoorden in JSON; de objectblokken in het voorbeeld Objecten en JSON laten zien hoe je dat leest. Roep alleen adressen aan die je vertrouwt, want een werkruimte die met jou gedeeld wordt, voert ze ook uit."
  },
  "de": {
   "displayName": "Beispiel: Eine Webseite laden",
   "description": "Lädt eine Webseite und zeigt den Anfang der Antwort.",
   "detailedDescription": "Der Block Seite laden ruft eine Webadresse auf und gibt die Antwort als Text zurück. Baue ihn mit einem Textblock mit der Adresse und zeige die Antwort in der Konsole. Die meisten Dienste antworten in JSON; die Objektblöcke im Beispiel Objekte und JSON zeigen, wie du das liest. Rufe nur Adressen auf, denen du vertraust, denn ein Arbeitsbereich, der mit dir geteilt wird, führt sie ebenfalls aus."
  },
  "it": {
   "displayName": "Esempio: Recupera una pagina web",
   "description": "Recupera una pagina web e mostra l'inizio della risposta.",
   "detailedDescription": "Il blocco recupera chiama un indirizzo web e dà la risposta come testo. Costruiscilo con un blocco di testo con l'indirizzo, e mostra la risposta nella console. La maggior parte dei servizi risponde in JSON; i blocchi oggetto nell'esempio Oggetti e JSON mostrano come leggerla. Chiama solo indirizzi di cui ti fidi, perché anche uno spazio di lavoro condiviso con te li esegue."
  }
 },
 "example-widget-value": {
  "nl": {
   "displayName": "Voorbeeld: Dashboardwidget met een waarde",
   "description": "Een widget op het dashboard met een waarde, een trend en een voettekst.",
   "detailedDescription": "Een dashboardwidget bestaat uit de widgetblokken, in volgorde. Begin met het dashboardblok: het heeft een naam en een emoji voor de kop. Toon erin een waarde met het periodewaarde-blok, een trend van #mood over 14 dagen, en een voettekstregel onderaan. Draai het één keer zodat de widget bewaard wordt, en kijk dan naar het dashboard in Nomie. Het tabblad Voorbeeld in de editor toont de widget zoals het dashboard hem toont."
  },
  "de": {
   "displayName": "Beispiel: Dashboard-Widget mit einem Wert",
   "description": "Ein Widget auf dem Dashboard mit einem Wert, einem Trend und einer Fußzeile.",
   "detailedDescription": "Ein Dashboard-Widget wird aus den Widget-Blöcken gebaut, in Reihenfolge. Beginne mit dem Dashboard-Block: Er hat einen Namen und ein Emoji für die Kopfzeile. Zeige darin einen Wert mit dem Zeitraumwert-Block, einen Trend von #mood über 14 Tage und eine Fußzeile unten. Führe es einmal aus, damit das Widget gespeichert wird, und sieh dir dann das Dashboard in Nomie an. Der Reiter Vorschau im Editor zeigt das Widget so, wie das Dashboard es zeigt."
  },
  "it": {
   "displayName": "Esempio: Widget della dashboard con un valore",
   "description": "Un widget sulla dashboard con un valore, una tendenza e un piè di pagina.",
   "detailedDescription": "Un widget della dashboard è costruito dai blocchi del widget, in ordine. Inizia dal blocco dashboard: ha un nome e un'emoji per l'intestazione. Al suo interno mostra un valore con il blocco valore di periodo, una tendenza di #mood su 14 giorni, e una riga di piè di pagina in fondo. Eseguilo una volta perché il widget venga conservato, poi guarda la dashboard in Nomie. La scheda Anteprima nell'editor mostra il widget come lo mostra la dashboard."
  }
 },
 "example-widget-charts": {
  "nl": {
   "displayName": "Voorbeeld: Grafieken op de widget",
   "description": "Een lijngrafiek en een staafdiagram op één widget.",
   "detailedDescription": "Een grafiek toont een tracker dag voor dag. De lijngrafiek verbindt de dagen met een lijn, en een dag zonder notitie is een gat. Het staafdiagram geeft één staaf per dag. Bouw beide in één dashboardblok: een lijngrafiek van #mood over 30 dagen in blauw, en een staafdiagram van de laatste 7 dagen in groen. Elke grafiek heeft een eigen label. Vergelijk ze in het tabblad Voorbeeld: ze tekenen dezelfde notities, op twee manieren."
  },
  "de": {
   "displayName": "Beispiel: Diagramme im Widget",
   "description": "Ein Liniendiagramm und ein Balkendiagramm in einem Widget.",
   "detailedDescription": "Ein Diagramm zeigt einen Tracker Tag für Tag. Das Liniendiagramm verbindet die Tage mit einer Linie, und ein Tag ohne Notiz ist eine Lücke. Das Balkendiagramm zeigt einen Balken pro Tag. Baue beide in einen Dashboard-Block: ein Liniendiagramm von #mood über 30 Tage in Blau und ein Balkendiagramm der letzten 7 Tage in Grün. Jedes Diagramm hat eine eigene Beschriftung. Vergleiche sie im Reiter Vorschau: Sie zeichnen dieselben Notizen auf zwei Arten."
  },
  "it": {
   "displayName": "Esempio: Grafici nel widget",
   "description": "Un grafico a linee e un grafico a barre in un unico widget.",
   "detailedDescription": "Un grafico mostra un tracker giorno per giorno. Il grafico a linee unisce i giorni con una linea, e un giorno senza nota è un vuoto. Il grafico a barre dà una barra per ogni giorno. Costruisci entrambi in un blocco dashboard: un grafico a linee di #mood su 30 giorni in blu, e un grafico a barre degli ultimi 7 giorni in verde. Ogni grafico ha la sua etichetta. Confrontali nella scheda Anteprima: disegnano le stesse note in due modi."
  }
 },
 "example-widget-html": {
  "nl": {
   "displayName": "Voorbeeld: Widget met HTML",
   "description": "Een widget met je eigen HTML, gevuld met waarden uit de blokken.",
   "detailedDescription": "Het HTML-blok toont je eigen HTML op een widget. Schrijf de HTML in het tekstvak, en zet een plaatsaanduiding zoals {{mood}} waar een waarde moet komen. Voeg dan een parameterblok toe voor elke plaatsaanduiding: de naam is de naam van de plaatsaanduiding, en de waarde is elk blok, hier het gemiddelde van de stemming. De HTML wordt opgeschoond voordat hij getoond wordt: scripts en links worden verwijderd, en afbeeldingen moeten van https komen. Verander de HTML, draai, en kijk in het tabblad Voorbeeld."
  },
  "de": {
   "displayName": "Beispiel: Widget mit HTML",
   "description": "Ein Widget mit eigenem HTML, gefüllt mit Werten aus den Blöcken.",
   "detailedDescription": "Der HTML-Block zeigt dein eigenes HTML in einem Widget. Schreibe das HTML in das Textfeld und setze einen Platzhalter wie {{mood}} dorthin, wo ein Wert hin soll. Füge dann für jeden Platzhalter einen Parameter-Block hinzu: Der Name ist der Name des Platzhalters, und der Wert ist ein beliebiger Block, hier der Durchschnitt der Stimmung. Das HTML wird vor der Anzeige bereinigt: Skripte und Links werden entfernt, und Bilder müssen von https kommen. Ändere das HTML, führe aus und sieh im Reiter Vorschau nach."
  },
  "it": {
   "displayName": "Esempio: Widget con HTML",
   "description": "Un widget con il tuo HTML, riempito con valori dai blocchi.",
   "detailedDescription": "Il blocco HTML mostra il tuo HTML su un widget. Scrivi l'HTML nella casella di testo, e metti un segnaposto come {{mood}} dove deve andare un valore. Aggiungi poi un blocco parametro per ogni segnaposto: il nome è il nome del segnaposto, e il valore è un blocco qualsiasi, qui la media dell'umore. L'HTML viene ripulito prima di essere mostrato: script e link vengono rimossi, e le immagini devono venire da https. Cambia l'HTML, esegui e guarda nella scheda Anteprima."
  }
 },
 "example-remember": {
  "nl": {
   "displayName": "Voorbeeld: Onthouden tussen runs",
   "description": "Houdt een telling bij van de ene run naar de volgende.",
   "detailedDescription": "Een werkruimte vergeet alles tussen de runs, tenzij het een waarde onthoudt. In dit voorbeeld tel je hoe vaak hij gedraaid heeft. Onthoud neemt een naam en een waarde. Herinner neemt een naam en een standaardwaarde voor de eerste run. Bouw het in volgorde: herinner de telling (standaard 0), tel er 1 bij op met een rekenblok, onthoud het resultaat onder dezelfde naam, en toon het. Draai het drie keer: de telling gaat 1, 2, 3. Bij de derde run vergeet een als-blok de waarde met het vergeetblok, zodat de volgende run weer bij 0 begint."
  },
  "de": {
   "displayName": "Beispiel: Merken zwischen den Läufen",
   "description": "Hält einen Zähler von einem Lauf zum nächsten.",
   "detailedDescription": "Ein Arbeitsbereich vergisst zwischen den Läufen alles, außer er merkt sich einen Wert. In diesem Beispiel zählst du, wie oft er gelaufen ist. Merken nimmt einen Namen und einen Wert. Erinnern nimmt einen Namen und einen Standardwert für den ersten Lauf. Baue es in Reihenfolge: den Zähler erinnern (Standard 0), mit einem Rechenblock 1 dazuzählen, das Ergebnis unter demselben Namen merken und anzeigen. Führe es dreimal aus: Der Zähler geht auf 1, 2, 3. Beim dritten Lauf vergisst ein Wenn-Block den Wert mit dem Vergessen-Block, sodass der nächste Lauf wieder bei 0 beginnt."
  },
  "it": {
   "displayName": "Esempio: Ricordare tra le esecuzioni",
   "description": "Conserva un conteggio da un'esecuzione alla successiva.",
   "detailedDescription": "Uno spazio di lavoro dimentica tutto tra le esecuzioni, a meno che non ricordi un valore. In questo esempio conti quante volte è stato eseguito. Ricorda prende un nome e un valore. Richiama prende un nome e un valore predefinito per la prima esecuzione. Costruiscilo in ordine: richiama il conteggio (predefinito 0), aggiungi 1 con un blocco aritmetico, ricorda il risultato con lo stesso nome, e mostralo. Eseguilo tre volte: il conteggio va a 1, 2, 3. Alla terza esecuzione un blocco se dimentica il valore con il blocco dimentica, così la successiva riparte da 0."
  }
 },
 "example-secret": {
  "nl": {
   "displayName": "Voorbeeld: Een sleutel bewaren in Instellingen",
   "description": "Gebruikt een geheim uit Instellingen, zodat de sleutel niet in de blokken staat.",
   "detailedDescription": "Een werkruimte heeft vaak een sleutel nodig. Schrijf de sleutel niet in een tekstblok, waar elk gedeeld bestand hem meeneemt; gebruik het geheimblok met de naam van de sleutel. Voeg de sleutel toe in Instellingen onder dezelfde naam. De run toont het geheim als vier stippen, dus het verschijnt nooit in de uitvoer. Ontbreekt het geheim, dan stopt de run en zegt hij welk geheim je moet toevoegen. Dit voorbeeld heeft een sleutel nodig met de naam EXAMPLE_KEY; een testrun controleert alleen of het blok goed is ingesteld."
  },
  "de": {
   "displayName": "Beispiel: Einen Schlüssel in den Einstellungen halten",
   "description": "Verwendet ein Geheimnis aus den Einstellungen, damit der Schlüssel nicht in den Blöcken steht.",
   "detailedDescription": "Ein Arbeitsbereich braucht oft einen Schlüssel. Schreibe den Schlüssel nicht in einen Textblock, wo jede geteilte Datei ihn mitnimmt; verwende den Geheimnis-Block mit dem Namen des Schlüssels. Füge den Schlüssel in den Einstellungen unter demselben Namen hinzu. Der Lauf zeigt das Geheimnis als vier Punkte, es erscheint also nie in der Ausgabe. Fehlt das Geheimnis, stoppt der Lauf und nennt, welches du hinzufügen musst. Dieses Beispiel braucht einen Schlüssel namens EXAMPLE_KEY; ein Testlauf prüft nur, ob der Block richtig eingerichtet ist."
  },
  "it": {
   "displayName": "Esempio: Tenere una chiave nelle Impostazioni",
   "description": "Usa un segreto delle Impostazioni, così la chiave non è nei blocchi.",
   "detailedDescription": "Uno spazio di lavoro spesso ha bisogno di una chiave. Non scrivere la chiave in un blocco di testo, dove ogni file condiviso la porterebbe con sé; usa il blocco segreto con il nome della chiave. Aggiungi la chiave nelle Impostazioni con lo stesso nome. L'esecuzione mostra il segreto come quattro puntini, quindi non compare mai nell'output. Se il segreto manca, l'esecuzione si ferma e dice quale aggiungere. Questo esempio richiede una chiave chiamata EXAMPLE_KEY; un'esecuzione di prova controlla solo che il blocco sia impostato correttamente."
  }
 },
 "example-when-note": {
  "nl": {
   "displayName": "Voorbeeld: Wanneer een notitie wordt opgeslagen",
   "description": "Draait wanneer een notitie met een tracker wordt opgeslagen, en leest die notitie.",
   "detailedDescription": "In plaats van een schema draait een blok wanneer een notitie wordt opgeslagen. Bouw het met de tracker #run. Lees erin de notitie: het blok waarde in deze notitie geeft de waarde van #mood in de notitie, het blok tekst van deze notitie geeft de tekst, en het blok dag van deze notitie geeft de dag. Toon ze in één bericht. Log een notitie met #run en #mood(4) om ze te zien. Buiten een notitie-run geven deze blokken niets, wat de controle vóór de run aangeeft."
  },
  "de": {
   "displayName": "Beispiel: Wenn eine Notiz gespeichert wird",
   "description": "Läuft, wenn eine Notiz mit einem Tracker gespeichert wird, und liest diese Notiz.",
   "detailedDescription": "Statt eines Zeitplans läuft ein Wenn-Notiz-Block, sobald eine Notiz mit seinem Tracker gespeichert wird. Baue ihn mit dem Tracker #run. Darin liest du die Notiz: Der Block Wert in dieser Notiz gibt den Wert von #mood in der Notiz, der Block Text dieser Notiz gibt den Text, und der Block Tag dieser Notiz gibt den Tag. Zeige sie in einer Nachricht. Erfasse eine Notiz mit #run und #mood(4), um sie zu sehen. Außerhalb eines Notiz-Laufs geben diese Blöcke nichts zurück, was die Prüfung vor dem Lauf anzeigt."
  },
  "it": {
   "displayName": "Esempio: Quando una nota viene salvata",
   "description": "Si esegue quando viene salvata una nota con un tracker, e legge quella nota.",
   "detailedDescription": "Invece di una pianificazione, un blocco quando una nota viene salvata esegue lo spazio di lavoro quando viene salvata una nota con il suo tracker. Costruiscilo con il tracker #run. Al suo interno leggi la nota: il blocco valore in questa nota dà il valore di #mood nella nota, il blocco testo di questa nota dà il testo, e il blocco giorno di questa nota dà il giorno. Mostrali in un unico messaggio. Registra una nota con #run e #mood(4) per vederli. Fuori da un'esecuzione da nota questi blocchi non danno nulla, e il controllo prima dell'esecuzione lo segnala."
  }
 },
 "example-loop-days": {
  "nl": {
   "displayName": "Voorbeeld: Tellen met een lus",
   "description": "Herhaalt een blok een aantal keer, en telt met een for-lus.",
   "detailedDescription": "Een lus herhaalt zijn blokken. Het herhaalblok voert zijn inhoud een vast aantal keer uit: hier drie. De for-lus telt met een variabele: hij begint bij 1, stopt bij 5 en stapt met 1, en de variabele i houdt het huidige getal. Bouw een for-lus met een bericht dat 'Stap ' en i samenvoegt. De console toont vijf regels. Lussen zijn hoe een werkruimte veel dagen of veel notities in één keer afhandelt."
  },
  "de": {
   "displayName": "Beispiel: Mit einer Schleife zählen",
   "description": "Wiederholt einen Block eine Anzahl Male und zählt mit einer For-Schleife.",
   "detailedDescription": "Eine Schleife wiederholt ihre Blöcke. Der Block Wiederholen führt seinen Inhalt eine feste Anzahl Male aus: hier dreimal. Die For-Schleife zählt mit einer Variablen: Sie beginnt bei 1, endet bei 5 und schreitet mit 1 fort, und die Variable i enthält die aktuelle Zahl. Baue eine For-Schleife mit einer Nachricht, die „Schritt “ und i verbindet. Die Konsole zeigt fünf Zeilen. Schleifen sind die Art, wie ein Arbeitsbereich viele Tage oder viele Notizen auf einmal behandelt."
  },
  "it": {
   "displayName": "Esempio: Contare con un ciclo",
   "description": "Ripete un blocco un certo numero di volte, e conta con un ciclo for.",
   "detailedDescription": "Un ciclo ripete i suoi blocchi. Il blocco ripeti esegue il suo contenuto un numero fisso di volte: qui tre. Il ciclo for conta con una variabile: parte da 1, si ferma a 5 e avanza di 1, e la variabile i contiene il numero corrente. Costruisci un ciclo for con un messaggio che unisce 'Passo ' e i. La console mostra cinque righe. I cicli sono il modo in cui uno spazio di lavoro copre molti giorni o molte note in una volta."
  }
 },
 "example-while-break": {
  "nl": {
   "displayName": "Voorbeeld: Zolang en stoppen",
   "description": "Herhaalt zolang een voorwaarde geldt, en stopt vroeg met stoppen.",
   "detailedDescription": "Een zolang-lus herhaalt zolang zijn voorwaarde waar is, en een stopblok breekt de lus vroeg af. Bouw een teller: zet de variabele n op 0. Dan een zolang-lus met de voorwaarde n < 10, en daarin een als-blok: als n 4 is, stop de lus; anders toon je n en tel je 1 bij n op. De console toont de getallen 0 tot 3, dan stopt de lus. Let op dat je de variabele in de lus verandert, anders eindigt de lus nooit; de run stopt ook na een zeer groot aantal stappen."
  },
  "de": {
   "displayName": "Beispiel: Solange und Abbrechen",
   "description": "Wiederholt, solange eine Bedingung gilt, und bricht mit Abbrechen früh ab.",
   "detailedDescription": "Eine Solange-Schleife wiederholt sich, solange ihre Bedingung wahr ist, und ein Abbrechen-Block beendet die Schleife früh. Baue einen Zähler: Setze die Variable n auf 0. Dann eine Solange-Schleife mit der Bedingung n < 10, und darin ein Wenn-Block: Ist n 4, brich ab; sonst zeige n und zähle n um 1 hoch. Die Konsole zeigt die Zahlen 0 bis 3, dann stoppt die Schleife. Achte darauf, die Variable in der Schleife zu ändern, sonst endet die Schleife nie; der Lauf stoppt außerdem nach sehr vielen Schritten."
  },
  "it": {
   "displayName": "Esempio: Mentre e interrompi",
   "description": "Ripete finché una condizione vale, e si ferma presto con interrompi.",
   "detailedDescription": "Un ciclo mentre si ripete finché la sua condizione è vera, e un blocco interrompi esce dal ciclo in anticipo. Costruisci un contatore: imposta la variabile n a 0. Poi un ciclo mentre con la condizione n < 10, e al suo interno un blocco se: se n è 4, interrompi il ciclo; altrimenti mostra n e aggiungi 1 a n. La console mostra i numeri da 0 a 3, poi il ciclo si ferma. Fai attenzione a cambiare la variabile nel ciclo, altrimenti il ciclo non finisce mai; l'esecuzione si ferma comunque dopo un numero molto grande di passi."
  }
 },
 "example-list-loop": {
  "nl": {
   "displayName": "Voorbeeld: Door een lijst gaan",
   "description": "Gaat één voor één door elk item van een lijst.",
   "detailedDescription": "Een voor-elk-blok neemt om beurt elk item van een lijst. Bouw een lijst van drie dagen met een blok lijst maken, dan een voor-elk-blok over de lijst, met de variabele item. Toon daarin het item. De console toont de drie items in volgorde. Lijsten zijn de manier om meerdere waarden vast te houden, zoals de stemmingen van de afgelopen week, voordat de werkruimte ermee aan de slag gaat."
  },
  "de": {
   "displayName": "Beispiel: Eine Liste durchgehen",
   "description": "Geht nacheinander durch jedes Element einer Liste.",
   "detailedDescription": "Ein Für-jedes-Block nimmt der Reihe nach jedes Element einer Liste. Baue eine Liste mit drei Tagen mit einem Liste-erstellen-Block, dann einen Für-jedes-Block über die Liste, mit der Variablen item. Darin zeige das Element. Die Konsole zeigt die drei Elemente in Reihenfolge. Listen sind die Art, mehrere Werte zu halten, etwa die Stimmungen der letzten Woche, bevor der Arbeitsbereich damit arbeitet."
  },
  "it": {
   "displayName": "Esempio: Scorrere una lista",
   "description": "Passa in rassegna ogni elemento di una lista, uno alla volta.",
   "detailedDescription": "Un blocco per ogni prende a turno ogni elemento di una lista. Costruisci una lista di tre giorni con un blocco crea lista, poi un blocco per ogni sulla lista, con la variabile item. Al suo interno mostra l'elemento. La console mostra i tre elementi in ordine. Le liste sono il modo di contenere più valori, come gli umori dell'ultima settimana, prima che lo spazio di lavoro ci lavori."
  }
 },
 "example-decide": {
  "nl": {
   "displayName": "Voorbeeld: Beslissen met logica",
   "description": "Als, en, of, niet, waar en onwaar, in één beslissing.",
   "detailedDescription": "Logicablokken geven een waar- of onwaarantwoord, en een als-blok handelt ernaar. Bouw een voorwaarde uit twee vergelijkblokken, verbonden met een en-blok, en keer het resultaat om met het niet-blok. Het als-blok toont een bericht als het waar is, en een anders-tak toont een ander bericht als het niet waar is. Verander de getallen in de vergelijkblokken en draai opnieuw om beide takken te zien. Het ternaire blok kiest een van twee waarden in één regel, zoals de laatste regel laat zien."
  },
  "de": {
   "displayName": "Beispiel: Mit Logik entscheiden",
   "description": "Wenn, und, oder, nicht, wahr und falsch, in einer Entscheidung.",
   "detailedDescription": "Logik-Blöcke liefern eine wahr- oder falsch-Antwort, und ein Wenn-Block handelt danach. Baue eine Bedingung aus zwei Vergleichsblöcken, verbunden mit einem Und-Block, und kehre das Ergebnis mit dem Nicht-Block um. Der Wenn-Block zeigt eine Nachricht, wenn es wahr ist, und ein Sonst-Zweig zeigt eine andere, wenn nicht. Ändere die Zahlen in den Vergleichsblöcken und führe erneut aus, um beide Zweige zu sehen. Der Ternäre Block wählt in einer Zeile einen von zwei Werten, wie die letzte Zeile zeigt."
  },
  "it": {
   "displayName": "Esempio: Decidere con la logica",
   "description": "Se, e, o, non, vero e falso, in un'unica decisione.",
   "detailedDescription": "I blocchi di logica danno una risposta vero o falso, e un blocco se agisce di conseguenza. Costruisci una condizione da due blocchi confronto, uniti con un blocco e, e inverti il risultato con il blocco non. Il blocco se mostra un messaggio quando è vero, e un ramo altrimenti ne mostra un altro quando non lo è. Cambia i numeri nei blocchi confronto ed esegui di nuovo per vedere entrambi i rami. Il blocco ternario sceglie uno di due valori in una riga, come mostra l'ultima riga."
  }
 },
 "example-numbers": {
  "nl": {
   "displayName": "Voorbeeld: Getallen",
   "description": "Rekenen, machten, goniometrie, constanten en getalcontroles.",
   "detailedDescription": "De rekenblokken werken met getallen. Dit voorbeeld bouwt een kleine rekenmachine: een rekenblok telt op en vermenigvuldigt, een blok met één getal neemt een wortel, een goniometrieblok geeft een sinus, en de constante pi komt uit zijn blok. Een getaleigenschapblok controleert of een getal even is, en een modulo-blok geeft de rest. Toon elk resultaat op een eigen regel, en lees de labels in de console om elke regel bij zijn blok te zoeken."
  },
  "de": {
   "displayName": "Beispiel: Zahlen",
   "description": "Rechnen, Potenzen, Trigonometrie, Konstanten und Zahlenprüfungen.",
   "detailedDescription": "Die Rechenblöcke arbeiten mit Zahlen. Dieses Beispiel baut einen kleinen Taschenrechner: Ein Rechenblock addiert und multipliziert, ein Ein-Zahl-Block zieht eine Wurzel, ein Trigonometrie-Block gibt einen Sinus, und die Konstante Pi kommt aus ihrem Block. Ein Zahleneigenschaft-Block prüft, ob eine Zahl gerade ist, und ein Modulo-Block gibt den Rest. Zeige jedes Ergebnis in einer eigenen Zeile und lies die Bezeichnungen in der Konsole, um jede Zeile ihrem Block zuzuordnen."
  },
  "it": {
   "displayName": "Esempio: Numeri",
   "description": "Aritmetica, potenze, trigonometria, costanti e controlli sui numeri.",
   "detailedDescription": "I blocchi matematici lavorano sui numeri. Questo esempio costruisce una piccola calcolatrice: un blocco aritmetico somma e moltiplica, un blocco su un numero fa una radice quadrata, un blocco trigonometrico dà un seno, e la costante pi greco viene dal suo blocco. Un blocco proprietà del numero controlla se un numero è pari, e un blocco modulo dà il resto. Mostra ogni risultato su una riga propria, e leggi le etichette nella console per associare ogni riga al suo blocco."
  }
 },
 "example-random-average": {
  "nl": {
   "displayName": "Voorbeeld: Willekeurig, afronden en gemiddelden",
   "description": "Willekeurige getallen, afronden, een gemiddelde van een lijst, en een verandering.",
   "detailedDescription": "Dit voorbeeld behandelt de blokken die afronden, willekeurig kiezen en een lijst samenvatten. Een willekeurig geheel-getal-blok kiest een geheel getal tussen twee grenzen, en een willekeurig breuk-blok kiest een getal tussen 0 en 1. Een afrond-blok met de optie naar boven afronden rondt omhoog af. Een gemiddeldeblok werkt op een lijst, en een begrenzen-blok houdt een waarde tussen een lage en een hoge grens. Draai het meerdere keren: de willekeurige waarden veranderen, de rest blijft gelijk."
  },
  "de": {
   "displayName": "Beispiel: Zufall, Runden und Durchschnitte",
   "description": "Zufallszahlen, Runden, ein Durchschnitt einer Liste und eine Änderung.",
   "detailedDescription": "Dieses Beispiel behandelt die Blöcke, die runden, zufällig wählen und eine Liste zusammenfassen. Ein Zufallsganzzahl-Block wählt eine ganze Zahl zwischen zwei Grenzen, und ein Zufallsbruch-Block wählt eine Zahl zwischen 0 und 1. Ein Runden-Block mit der Option aufrunden rundet nach oben. Ein Durchschnitt-Block arbeitet auf einer Liste, und ein Begrenzen-Block hält einen Wert zwischen einer unteren und einer oberen Grenze. Führe es mehrmals aus: Die Zufallswerte ändern sich, der Rest bleibt gleich."
  },
  "it": {
   "displayName": "Esempio: Casuale, arrotondamenti e medie",
   "description": "Numeri casuali, arrotondamento, una media di una lista e una variazione.",
   "detailedDescription": "Questo esempio copre i blocchi che arrotondano, scelgono a caso e riassumono una lista. Un blocco intero casuale sceglie un numero intero tra due limiti, e un blocco frazione casuale sceglie un numero tra 0 e 1. Un blocco arrotonda con l'opzione arrotonda per eccesso arrotonda verso l'alto. Un blocco media lavora su una lista, e un blocco limita tiene un valore tra un limite basso e uno alto. Eseguilo più volte: i valori casuali cambiano, il resto resta uguale."
  }
 },
 "example-text-tools": {
  "nl": {
   "displayName": "Voorbeeld: Tekstgereedschap",
   "description": "Lengte, hoofdletters, spaties verwijderen, zoeken en tekst knippen.",
   "detailedDescription": "Tekstblokken veranderen en onderzoeken woorden. Dit voorbeeld toont de lengte van een tekst, verandert de hoofdletters, verwijdert spaties aan beide kanten, zoekt de positie van een woord, pakt één letter, en knipt een deel eruit. Elk resultaat gaat op een eigen regel naar de console. Bouw ze één na één, en vergelijk elk blok met de regel die het oplevert. Een tekst maakt een variabele met de groet en voegt er tekst aan toe."
  },
  "de": {
   "displayName": "Beispiel: Textwerkzeuge",
   "description": "Länge, Großschreibung, Leerzeichen entfernen, Suchen und Text ausschneiden.",
   "detailedDescription": "Textblöcke verändern und prüfen Wörter. Dieses Beispiel zeigt die Länge eines Textes, ändert die Groß- und Kleinschreibung, entfernt Leerzeichen an beiden Enden, findet die Position eines Wortes, nimmt einen Buchstaben und schneidet einen Teil heraus. Jedes Ergebnis steht in einer eigenen Zeile in der Konsole. Baue sie nacheinander und vergleiche jeden Block mit der Zeile, die er erzeugt. Ein Text hängt außerdem an eine Variable mit der Begrüßung an."
  },
  "it": {
   "displayName": "Esempio: Strumenti per il testo",
   "description": "Lunghezza, maiuscole, spazi, ricerca e taglio del testo.",
   "detailedDescription": "I blocchi di testo modificano e ispezionano le parole. Questo esempio mostra la lunghezza di un testo, cambia le maiuscole, toglie gli spazi a entrambe le estremità, trova la posizione di una parola, prende una lettera e taglia una parte. Ogni risultato va su una propria riga nella console. Costruiscili uno dopo l'altro, e confronta ogni blocco con la riga che produce. Un testo aggiunge anche in coda a una variabile il saluto."
  }
 },
 "example-lists": {
  "nl": {
   "displayName": "Voorbeeld: Lijsten",
   "description": "Lijsten maken, lezen, wijzigen, zoeken, splitsen en sorteren.",
   "detailedDescription": "Een lijst houdt meerdere waarden in volgorde. Dit voorbeeld bouwt een lijst en gebruikt de lijstblokken erop: de lengte, een controle op een lege lijst, de positie van een item, het item op een positie, en het wijzigen van een item. Een splitsblok knipt een tekst in een lijst, en een sorteerblok ordent de getallen. Elke stap toont zijn resultaat in de console, zodat je kunt volgen hoe de lijst op elk punt eruitziet."
  },
  "de": {
   "displayName": "Beispiel: Listen",
   "description": "Listen erstellen, lesen, ändern, suchen, teilen und sortieren.",
   "detailedDescription": "Eine Liste hält mehrere Werte in Reihenfolge. Dieses Beispiel baut eine Liste und verwendet die Listenblöcke darauf: die Länge, eine Prüfung auf leere Liste, die Position eines Elements, das Element an einer Position und das Ändern eines Elements. Ein Teilen-Block schneidet einen Text in eine Liste, und ein Sortieren-Block ordnet die Zahlen. Jeder Schritt zeigt sein Ergebnis in der Konsole, damit du verfolgen kannst, wie die Liste an jedem Punkt aussieht."
  },
  "it": {
   "displayName": "Esempio: Liste",
   "description": "Creare, leggere, modificare, cercare, dividere e ordinare liste.",
   "detailedDescription": "Una lista contiene più valori in ordine. Questo esempio costruisce una lista e usa su di essa i blocchi lista: la lunghezza, un controllo di lista vuota, la posizione di un elemento, l'elemento in una posizione e la modifica di un elemento. Un blocco dividi taglia un testo in una lista, e un blocco ordina mette in ordine i numeri. Ogni passo mostra il suo risultato nella console, così puoi seguire com'è la lista in ogni punto."
  }
 },
 "example-functions": {
  "nl": {
   "displayName": "Voorbeeld: Functies met waarden",
   "description": "Definieert een functie met een parameter en een resultaat, en roept die aan.",
   "detailedDescription": "Een functie is een reeks blokken met een naam die je opnieuw kunt aanroepen. Deze verdubbelt een getal. Bouw eerst de definitie: een functieblok met de naam double, een parameter n, en een teruggeefblok dat n keer 2 geeft. Daarin komt eerst een als-terug-blok: als n lager is dan 0, geeft het direct 0 terug, zodat de rest wordt overgeslagen. Roep de functie dan aan met het getal 21 in een toon-blok. De console toont 42. Definieer een functie één keer en roep haar aan waar je ze nodig hebt."
  },
  "de": {
   "displayName": "Beispiel: Funktionen mit Werten",
   "description": "Definiert eine Funktion mit einem Parameter und einem Ergebnis und ruft sie auf.",
   "detailedDescription": "Eine Funktion ist eine Gruppe von Blöcken mit einem Namen, die du erneut aufrufen kannst. Diese hier verdoppelt eine Zahl. Baue zuerst die Definition: einen Funktionsblock mit dem Namen double, einen Parameter n und einen Rückgabe-Block, der n mal 2 liefert. Darin kommt zuerst ein Wenn-Rückgabe-Block: Ist n kleiner als 0, gibt er sofort 0 zurück, und der Rest wird übersprungen. Rufe die Funktion dann mit der Zahl 21 in einem Anzeige-Block auf. Die Konsole zeigt 42. Definiere eine Funktion einmal und rufe sie überall auf, wo du sie brauchst."
  },
  "it": {
   "displayName": "Esempio: Funzioni con valori",
   "description": "Definisce una funzione con un parametro e un risultato, e la richiama.",
   "detailedDescription": "Una funzione è un insieme di blocchi con un nome che puoi richiamare di nuovo. Questa raddoppia un numero. Costruisci prima la definizione: un blocco funzione con il nome double, un parametro n, e un blocco ritorno che dà n per 2. Al suo interno viene prima un blocco se-ritorna: se n è minore di 0, restituisce subito 0, e il resto viene saltato. Poi richiama la funzione con il numero 21 in un blocco mostra. La console mostra 42. Definisci una funzione una volta e richiamala dove serve."
  }
 },
 "example-objects": {
  "nl": {
   "displayName": "Voorbeeld: Objecten en JSON",
   "description": "Bouw een object, lees en wijzig de velden, en lees JSON.",
   "detailedDescription": "Een object houdt benoemde velden, als een klein record. Bouw er een met het blok object maken: twee velden, temp en mood. Lees een veld met het blok ophalen en wijzig er een met het blok zetten. De JSON-blokken werken de andere kant op: het blok van JSON-tekst leest een tekst met JSON in een object, en het blok waarde van sleutel haalt er één waarde uit. Toon elk resultaat in de console. Webdiensten antwoorden in JSON, dus dit is het patroon om hun antwoorden te lezen."
  },
  "de": {
   "displayName": "Beispiel: Objekte und JSON",
   "description": "Ein Objekt bauen, seine Felder lesen und ändern und JSON lesen.",
   "detailedDescription": "Ein Objekt enthält benannte Felder, wie ein kleiner Datensatz. Baue eines mit dem Block Objekt erstellen: zwei Felder, temp und mood. Ein Feld liest du mit dem Block holen, eines änderst du mit dem Block setzen. Die JSON-Blöcke gehen den anderen Weg: Der Block JSON-Text in Objekt liest einen Text mit JSON in ein Objekt, und der Block Wert aus Schlüssel holt daraus einen Wert. Zeige jedes Ergebnis in der Konsole. Webdienste antworten in JSON, dies ist also das Muster, um ihre Antworten zu lesen."
  },
  "it": {
   "displayName": "Esempio: Oggetti e JSON",
   "description": "Costruisce un oggetto, legge e modifica i suoi campi, e legge JSON.",
   "detailedDescription": "Un oggetto contiene campi con un nome, come un piccolo record. Costruiscine uno con il blocco crea oggetto: due campi, temp e mood. Leggi un campo con il blocco ottieni, e modificane uno con il blocco imposta. I blocchi JSON vanno nell'altra direzione: il blocco da testo JSON legge un testo in JSON in un oggetto, e il blocco valore dalla chiave ne estrae un valore. Mostra ogni risultato nella console. I servizi web rispondono in JSON, quindi questo è lo schema per leggere le loro risposte."
  }
 },
 "example-try-catch": {
  "nl": {
   "displayName": "Voorbeeld: Proberen en opvangen",
   "description": "Vangt een probleem op, toont een vriendelijk bericht, en eindigt altijd.",
   "detailedDescription": "Sommige stappen kunnen mislukken, bijvoorbeeld als een tekst geen geldige JSON is. Een probeerblok voert zijn blokken uit; als er één mislukt, draait het opvangblok en krijgt het de fout. Het tot-slot-blok draait in beide gevallen. Bouw een probeerblok met een blok van JSON-tekst dat een kapotte tekst leest. Toon in het opvangblok 'Kon de gegevens niet lezen' met de fout. De run gaat na het opvangen door, dus één probleem stopt de hele werkruimte niet."
  },
  "de": {
   "displayName": "Beispiel: Versuchen und Abfangen",
   "description": "Fängt ein Problem ab, zeigt eine freundliche Nachricht und endet immer.",
   "detailedDescription": "Manche Schritte können fehlschlagen, etwa wenn ein Text kein gültiges JSON ist. Ein Versuchen-Block führt seine Blöcke aus; scheitert einer, läuft der Abfangen-Block und erhält den Fehler. Der Abschließend-Block läuft in beiden Fällen. Baue einen Versuchen-Block mit einem JSON-Text-Block, der einen kaputten Text liest. Zeige im Abfangen-Block „Die Daten konnten nicht gelesen werden“ mit dem Fehler. Der Lauf geht nach dem Abfangen weiter, ein einzelnes Problem stoppt also nicht den ganzen Arbeitsbereich."
  },
  "it": {
   "displayName": "Esempio: Provare e catturare",
   "description": "Cattura un problema, mostra un messaggio gentile e finisce sempre.",
   "detailedDescription": "Alcuni passaggi possono fallire, per esempio quando un testo non è JSON valido. Un blocco prova esegue i suoi blocchi; se uno fallisce, si esegue il blocco cattura e riceve l'errore. Il blocco infine viene eseguito in entrambi i casi. Costruisci un blocco prova con un blocco testo JSON che legge un testo rotto. Nel blocco cattura mostra 'Impossibile leggere i dati' con l'errore. L'esecuzione prosegue dopo la cattura, quindi un solo problema non ferma l'intero spazio di lavoro."
  }
 },
 "example-ask": {
  "nl": {
   "displayName": "Voorbeeld: Een vraag stellen",
   "description": "Vraagt je om een woord wanneer je het met de hand draait, en gebruikt het antwoord.",
   "detailedDescription": "Een vraagblok stelt je een vraag wanneer je de werkruimte met de hand draait, en geeft het antwoord als tekst. Bouw het in een bericht: 'Je antwoord was ' gevolgd door het vraagblok, met de vraag 'Wat is je stemmingswoord?'. Bij een geplande run wordt de vraag niet gesteld. Gebruik een vraag voor een keuze die je elke keer maakt, en een tracker voor alles wat je wilt bewaren."
  },
  "de": {
   "displayName": "Beispiel: Eine Frage stellen",
   "description": "Fragt dich nach einem Wort, wenn du den Lauf von Hand startest, und verwendet die Antwort.",
   "detailedDescription": "Ein Fragen-Block stellt dir eine Frage, wenn du den Arbeitsbereich von Hand startest, und gibt die Antwort als Text zurück. Baue ihn in eine Nachricht: „Deine Antwort war “, gefolgt vom Fragen-Block mit der Frage „Welches Wort beschreibt deine Stimmung?“. Bei einem geplanten Lauf wird die Frage nicht gestellt. Verwende eine Frage für eine Wahl, die du jedes Mal triffst, und einen Tracker für alles, was du behalten willst."
  },
  "it": {
   "displayName": "Esempio: Fai una domanda",
   "description": "Ti chiede una parola quando lo esegui a mano, e usa la risposta.",
   "detailedDescription": "Un blocco domanda ti fa una domanda quando esegui lo spazio di lavoro a mano, e dà la risposta come testo. Costruiscilo in un messaggio: 'La tua risposta era ' seguito dal blocco domanda, con la domanda 'Quale parola descrive il tuo umore?'. In un'esecuzione pianificata la domanda non viene fatta. Usa una domanda per una scelta che fai ogni volta, e un tracker per tutto ciò che vuoi conservare."
  }
 },
 "example-keyword-statistics": {
  "nl": {
   "displayName": "Voorbeeld: Een woord over een periode",
   "description": "Telt de notities die een woord noemen over de laatste 30 dagen, en telt hun waarden op.",
   "detailedDescription": "Niet elke waarde is een tracker. Een periodewaarde-blok kan ook een woord nemen, en dan zoekt het dat woord in je notities over de periode. In dit voorbeeld zoek je het woord beweging over de laatste 30 dagen, en vraag je om de som. Bouw het periodewaarde-blok met een tekstblok in de invoer Trackable, een periodekiezer op Laatste 30 dagen, en een statistiekkiezer op som. Zet het resultaat in een bericht met een zin ervoor. Verander het woord in alles waar je in je notities over schrijft, en draai opnieuw: dezelfde blokken beantwoorden een andere vraag."
  },
  "de": {
   "displayName": "Beispiel: Ein Stichwort über einen Zeitraum",
   "description": "Zählt die Notizen, die ein Wort nennen, über die letzten 30 Tage und summiert ihre Werte.",
   "detailedDescription": "Nicht jeder Wert ist ein Tracker. Ein Zeitraumwert-Block kann auch ein Wort nehmen, und dann sucht er dieses Wort in deinen Notizen über den Zeitraum. In diesem Beispiel suchst du das Wort Bewegung über die letzten 30 Tage und fragst nach der Summe. Baue den Zeitraumwert-Block mit einem Textblock im Eingang Trackable, einer Zeitraumauswahl auf Letzte 30 Tage und einer Statistikauswahl auf Summe. Setze das Ergebnis in eine Nachricht mit einem Satz davor. Ändere das Wort in alles, worüber du in deinen Notizen schreibst, und führe erneut aus: Dieselben Blöcke beantworten eine andere Frage."
  },
  "it": {
   "displayName": "Esempio: Una parola su un periodo",
   "description": "Conta le note che citano una parola negli ultimi 30 giorni, e ne somma i valori.",
   "detailedDescription": "Non ogni valore è un tracker. Un blocco valore di periodo può anche prendere una parola, e allora cerca quella parola nelle tue note sul periodo. In questo esempio cerchi la parola esercizio negli ultimi 30 giorni, e chiedi la somma. Costruisci il blocco valore di periodo con un blocco testo nell'ingresso Trackable, un selettore del periodo su Ultimi 30 giorni, e un selettore delle statistiche su somma. Metti il risultato in un messaggio con una frase davanti. Cambia la parola in qualsiasi cosa scrivi nelle tue note ed esegui di nuovo: gli stessi blocchi rispondono a un'altra domanda."
  }
 },
 "example-web-service": {
  "nl": {
   "displayName": "Voorbeeld: Een webdienst lezen",
   "description": "Roept een weerdienst aan met je sleutel, en leest de temperatuur uit het antwoord.",
   "detailedDescription": "Dit voorbeeld verbindt meerdere delen in één stroom. Eerst de sleutel: het is een geheim, toegevoegd in Instellingen onder de naam OPENWEATHER_KEY, zodat hij niet in de blokken staat. Dan het verzoek: een ophaal-blok met een samenvoeging van het adres, het geheim en de opties. Het antwoord is tekst in JSON, dus het wordt in twee stappen gelezen: de waarde van de sleutel main geeft een object, en de waarde van de sleutel temp in dat object is de temperatuur. Het antwoord wordt bewaard in twee variabelen, WeatherData en Temperature, en getoond in een bericht. Zonder het geheim stopt de run en noemt hij het geheim dat je moet toevoegen."
  },
  "de": {
   "displayName": "Beispiel: Einen Webdienst lesen",
   "description": "Ruft einen Wetterdienst mit deinem Schlüssel auf und liest die Temperatur aus der Antwort.",
   "detailedDescription": "Dieses Beispiel verbindet mehrere Teile in einem Ablauf. Zuerst der Schlüssel: Er ist ein Geheimnis, in den Einstellungen unter dem Namen OPENWEATHER_KEY hinzugefügt, damit er nicht in den Blöcken steht. Dann die Anfrage: ein Laden-Block mit einer Verbindung aus Adresse, Geheimnis und Optionen. Die Antwort ist Text in JSON, sie wird deshalb in zwei Schritten gelesen: Der Wert des Schlüssels main liefert ein Objekt, und der Wert des Schlüssels temp darin ist die Temperatur. Die Antwort wird in zwei Variablen gehalten, WeatherData und Temperature, und in einer Nachricht gezeigt. Ohne das Geheimnis stoppt der Lauf und nennt das Geheimnis, das du hinzufügen musst."
  },
  "it": {
   "displayName": "Esempio: Leggere un servizio web",
   "description": "Chiama un servizio meteo con la tua chiave, e legge la temperatura dalla risposta.",
   "detailedDescription": "Questo esempio unisce più parti in un unico flusso. Prima la chiave: è un segreto, aggiunto nelle Impostazioni con il nome OPENWEATHER_KEY, così non è nei blocchi. Poi la richiesta: un blocco recupera con un unisci dell'indirizzo, del segreto e delle opzioni. La risposta è testo in JSON, quindi si legge in due passi: il valore della chiave main dà un oggetto, e il valore della chiave temp in quell'oggetto è la temperatura. La risposta viene tenuta in due variabili, WeatherData e Temperature, e mostrata in un messaggio. Senza il segreto l'esecuzione si ferma e dice quale segreto aggiungere."
  }
 }
};
