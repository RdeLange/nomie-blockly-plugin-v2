// The example library in Dutch, German and Italian (phase 22), keyed by each example's name (see example-library.ts).
// The name of the workspace stays English, because the note "Run Blockly Workspace: name" uses it.
// the card line and the name in each language; the tutorials are in domain/tutorials (see example-tutorials.ts)
export type ExampleTranslation = { displayName: string; description: string };
export type ExampleLanguage = 'nl' | 'de' | 'it';
export const EXAMPLE_TRANSLATIONS: Record<string, Partial<Record<ExampleLanguage, ExampleTranslation>>> = {
 "example-hello": {
  "nl": {
   "displayName": "Voorbeeld: Hallo, console",
   "description": "De eerste werkruimte: regels in de console, en een melding van Nomie."
  },
  "de": {
   "displayName": "Beispiel: Hallo, Konsole",
   "description": "Der erste Arbeitsbereich: Zeilen in der Konsole und eine Mitteilung von Nomie."
  },
  "it": {
   "displayName": "Esempio: Ciao, console",
   "description": "Il primo spazio di lavoro: righe nella console e un avviso di Nomie."
  }
 },
 "example-yesterday-mood": {
  "nl": {
   "displayName": "Voorbeeld: Gisteren in één getal",
   "description": "Leest één tracker voor één dag en toont het gemiddelde."
  },
  "de": {
   "displayName": "Beispiel: Gestern als eine Zahl",
   "description": "Liest einen Tracker für einen Tag und zeigt den Durchschnitt."
  },
  "it": {
   "displayName": "Esempio: Ieri in un numero",
   "description": "Legge un tracker per un giorno e mostra la media."
  }
 },
 "example-mood-period": {
  "nl": {
   "displayName": "Voorbeeld: Stemming over een periode",
   "description": "Een periodewaarde, afgerond en getoond als zin."
  },
  "de": {
   "displayName": "Beispiel: Stimmung über einen Zeitraum",
   "description": "Ein Zeitraumwert, gerundet und als Satz gezeigt."
  },
  "it": {
   "displayName": "Esempio: Umore su un periodo",
   "description": "Un valore di periodo, arrotondato e mostrato come frase."
  }
 },
 "example-log-value": {
  "nl": {
   "displayName": "Voorbeeld: Elke dag een waarde noteren",
   "description": "Schrijft een notitie met een trackerwaarde, voor de dag van de run."
  },
  "de": {
   "displayName": "Beispiel: Jeden Tag einen Wert eintragen",
   "description": "Schreibt eine Notiz mit einem Trackerwert, für den Tag des Laufs."
  },
  "it": {
   "displayName": "Esempio: Registra un valore ogni giorno",
   "description": "Scrive una nota con un valore di tracker, per il giorno dell'esecuzione."
  }
 },
 "example-wait": {
  "nl": {
   "displayName": "Voorbeeld: Wachten tussen regels",
   "description": "Wacht een seconde tussen twee consoleregels."
  },
  "de": {
   "displayName": "Beispiel: Warten zwischen Zeilen",
   "description": "Wartet eine Sekunde zwischen zwei Konsolenzeilen."
  },
  "it": {
   "displayName": "Esempio: Attesa tra le righe",
   "description": "Attende un secondo tra due righe della console."
  }
 },
 "example-pickers": {
  "nl": {
   "displayName": "Voorbeeld: De kiezers",
   "description": "Kiezers voor tracker, dag, periode, statistiek en datum op één plek."
  },
  "de": {
   "displayName": "Beispiel: Die Auswahlen",
   "description": "Auswahlen für Tracker, Tag, Zeitraum, Statistik und Datum an einem Ort."
  },
  "it": {
   "displayName": "Esempio: I selettori",
   "description": "Selettori di tracker, giorno, periodo, statistica e data in un unico posto."
  }
 },
 "example-history": {
  "nl": {
   "displayName": "Voorbeeld: Laatste waarde en dagen geleden",
   "description": "De laatst gelogde waarde, en hoeveel dagen geleden die gelogd werd."
  },
  "de": {
   "displayName": "Beispiel: Letzter Wert und Tage seit",
   "description": "Der zuletzt erfasste Wert und wie viele Tage es her ist."
  },
  "it": {
   "displayName": "Esempio: Ultimo valore e giorni dall'ultimo",
   "description": "L'ultimo valore registrato, e quanti giorni fa è stato registrato."
  }
 },
 "example-streak": {
  "nl": {
   "displayName": "Voorbeeld: Een reeks",
   "description": "Telt de dagen op rij met een tracker, en feliciteert je."
  },
  "de": {
   "displayName": "Beispiel: Eine Serie",
   "description": "Zählt die Tage in Folge mit einem Tracker und gratuliert dir."
  },
  "it": {
   "displayName": "Esempio: Una serie",
   "description": "Conta i giorni di fila con un tracker, e ti fa i complimenti."
  }
 },
 "example-write-note": {
  "nl": {
   "displayName": "Voorbeeld: Een notitie schrijven",
   "description": "Schrijft een vrije tekstnotitie op een dag naar keuze."
  },
  "de": {
   "displayName": "Beispiel: Eine Notiz schreiben",
   "description": "Schreibt eine Freitext-Notiz an einem Tag deiner Wahl."
  },
  "it": {
   "displayName": "Esempio: Scrivi una nota",
   "description": "Scrive una nota di testo libero in un giorno a tua scelta."
  }
 },
 "example-location": {
  "nl": {
   "displayName": "Voorbeeld: Waar ben ik",
   "description": "Toont de locatie die Nomie meldt, als je dat toestaat."
  },
  "de": {
   "displayName": "Beispiel: Wo bin ich",
   "description": "Zeigt den Standort, den Nomie meldet, wenn du es erlaubst."
  },
  "it": {
   "displayName": "Esempio: Dove sono",
   "description": "Mostra la posizione che Nomie comunica, se lo consenti."
  }
 },
 "example-open-link": {
  "nl": {
   "displayName": "Voorbeeld: Een link openen",
   "description": "Opent een webpagina in Nomie als je het met de hand draait."
  },
  "de": {
   "displayName": "Beispiel: Einen Link öffnen",
   "description": "Öffnet eine Webseite in Nomie, wenn du den Lauf von Hand startest."
  },
  "it": {
   "displayName": "Esempio: Apri un link",
   "description": "Apre una pagina web in Nomie quando lo esegui a mano."
  }
 },
 "example-fetch-page": {
  "nl": {
   "displayName": "Voorbeeld: Een webpagina ophalen",
   "description": "Haalt een webpagina op en toont het begin van het antwoord."
  },
  "de": {
   "displayName": "Beispiel: Eine Webseite laden",
   "description": "Lädt eine Webseite und zeigt den Anfang der Antwort."
  },
  "it": {
   "displayName": "Esempio: Recupera una pagina web",
   "description": "Recupera una pagina web e mostra l'inizio della risposta."
  }
 },
 "example-widget-value": {
  "nl": {
   "displayName": "Voorbeeld: Dashboardwidget met een waarde",
   "description": "Een widget op het dashboard met een waarde, een trend en een voettekst."
  },
  "de": {
   "displayName": "Beispiel: Dashboard-Widget mit einem Wert",
   "description": "Ein Widget auf dem Dashboard mit einem Wert, einem Trend und einer Fußzeile."
  },
  "it": {
   "displayName": "Esempio: Widget della dashboard con un valore",
   "description": "Un widget sulla dashboard con un valore, una tendenza e un piè di pagina."
  }
 },
 "example-widget-charts": {
  "nl": {
   "displayName": "Voorbeeld: Grafieken op de widget",
   "description": "Een lijngrafiek en een staafdiagram op één widget."
  },
  "de": {
   "displayName": "Beispiel: Diagramme im Widget",
   "description": "Ein Liniendiagramm und ein Balkendiagramm in einem Widget."
  },
  "it": {
   "displayName": "Esempio: Grafici nel widget",
   "description": "Un grafico a linee e un grafico a barre in un unico widget."
  }
 },
 "example-widget-html": {
  "nl": {
   "displayName": "Voorbeeld: Widget met HTML",
   "description": "Een widget met je eigen HTML, gevuld met waarden uit de blokken."
  },
  "de": {
   "displayName": "Beispiel: Widget mit HTML",
   "description": "Ein Widget mit eigenem HTML, gefüllt mit Werten aus den Blöcken."
  },
  "it": {
   "displayName": "Esempio: Widget con HTML",
   "description": "Un widget con il tuo HTML, riempito con valori dai blocchi."
  }
 },
 "example-remember": {
  "nl": {
   "displayName": "Voorbeeld: Onthouden tussen runs",
   "description": "Houdt een telling bij van de ene run naar de volgende."
  },
  "de": {
   "displayName": "Beispiel: Merken zwischen den Läufen",
   "description": "Hält einen Zähler von einem Lauf zum nächsten."
  },
  "it": {
   "displayName": "Esempio: Ricordare tra le esecuzioni",
   "description": "Conserva un conteggio da un'esecuzione alla successiva."
  }
 },
 "example-secret": {
  "nl": {
   "displayName": "Voorbeeld: Een sleutel bewaren in Instellingen",
   "description": "Gebruikt een geheim uit Instellingen, zodat de sleutel niet in de blokken staat."
  },
  "de": {
   "displayName": "Beispiel: Einen Schlüssel in den Einstellungen halten",
   "description": "Verwendet ein Geheimnis aus den Einstellungen, damit der Schlüssel nicht in den Blöcken steht."
  },
  "it": {
   "displayName": "Esempio: Tenere una chiave nelle Impostazioni",
   "description": "Usa un segreto delle Impostazioni, così la chiave non è nei blocchi."
  }
 },
 "example-when-note": {
  "nl": {
   "displayName": "Voorbeeld: Wanneer een notitie wordt opgeslagen",
   "description": "Draait wanneer een notitie met een tracker wordt opgeslagen, en leest die notitie."
  },
  "de": {
   "displayName": "Beispiel: Wenn eine Notiz gespeichert wird",
   "description": "Läuft, wenn eine Notiz mit einem Tracker gespeichert wird, und liest diese Notiz."
  },
  "it": {
   "displayName": "Esempio: Quando una nota viene salvata",
   "description": "Si esegue quando viene salvata una nota con un tracker, e legge quella nota."
  }
 },
 "example-loop-days": {
  "nl": {
   "displayName": "Voorbeeld: Tellen met een lus",
   "description": "Herhaalt een blok een aantal keer, en telt met een for-lus."
  },
  "de": {
   "displayName": "Beispiel: Mit einer Schleife zählen",
   "description": "Wiederholt einen Block eine Anzahl Male und zählt mit einer For-Schleife."
  },
  "it": {
   "displayName": "Esempio: Contare con un ciclo",
   "description": "Ripete un blocco un certo numero di volte, e conta con un ciclo for."
  }
 },
 "example-while-break": {
  "nl": {
   "displayName": "Voorbeeld: Zolang en stoppen",
   "description": "Herhaalt zolang een voorwaarde geldt, en stopt vroeg met stoppen."
  },
  "de": {
   "displayName": "Beispiel: Solange und Abbrechen",
   "description": "Wiederholt, solange eine Bedingung gilt, und bricht mit Abbrechen früh ab."
  },
  "it": {
   "displayName": "Esempio: Mentre e interrompi",
   "description": "Ripete finché una condizione vale, e si ferma presto con interrompi."
  }
 },
 "example-list-loop": {
  "nl": {
   "displayName": "Voorbeeld: Door een lijst gaan",
   "description": "Gaat één voor één door elk item van een lijst."
  },
  "de": {
   "displayName": "Beispiel: Eine Liste durchgehen",
   "description": "Geht nacheinander durch jedes Element einer Liste."
  },
  "it": {
   "displayName": "Esempio: Scorrere una lista",
   "description": "Passa in rassegna ogni elemento di una lista, uno alla volta."
  }
 },
 "example-decide": {
  "nl": {
   "displayName": "Voorbeeld: Beslissen met logica",
   "description": "Als, en, of, niet, waar en onwaar, in één beslissing."
  },
  "de": {
   "displayName": "Beispiel: Mit Logik entscheiden",
   "description": "Wenn, und, oder, nicht, wahr und falsch, in einer Entscheidung."
  },
  "it": {
   "displayName": "Esempio: Decidere con la logica",
   "description": "Se, e, o, non, vero e falso, in un'unica decisione."
  }
 },
 "example-numbers": {
  "nl": {
   "displayName": "Voorbeeld: Getallen",
   "description": "Rekenen, machten, goniometrie, constanten en getalcontroles."
  },
  "de": {
   "displayName": "Beispiel: Zahlen",
   "description": "Rechnen, Potenzen, Trigonometrie, Konstanten und Zahlenprüfungen."
  },
  "it": {
   "displayName": "Esempio: Numeri",
   "description": "Aritmetica, potenze, trigonometria, costanti e controlli sui numeri."
  }
 },
 "example-random-average": {
  "nl": {
   "displayName": "Voorbeeld: Willekeurig, afronden en gemiddelden",
   "description": "Willekeurige getallen, afronden, een gemiddelde van een lijst, en een verandering."
  },
  "de": {
   "displayName": "Beispiel: Zufall, Runden und Durchschnitte",
   "description": "Zufallszahlen, Runden, ein Durchschnitt einer Liste und eine Änderung."
  },
  "it": {
   "displayName": "Esempio: Casuale, arrotondamenti e medie",
   "description": "Numeri casuali, arrotondamento, una media di una lista e una variazione."
  }
 },
 "example-text-tools": {
  "nl": {
   "displayName": "Voorbeeld: Tekstgereedschap",
   "description": "Lengte, hoofdletters, spaties verwijderen, zoeken en tekst knippen."
  },
  "de": {
   "displayName": "Beispiel: Textwerkzeuge",
   "description": "Länge, Großschreibung, Leerzeichen entfernen, Suchen und Text ausschneiden."
  },
  "it": {
   "displayName": "Esempio: Strumenti per il testo",
   "description": "Lunghezza, maiuscole, spazi, ricerca e taglio del testo."
  }
 },
 "example-lists": {
  "nl": {
   "displayName": "Voorbeeld: Lijsten",
   "description": "Lijsten maken, lezen, wijzigen, zoeken, splitsen en sorteren."
  },
  "de": {
   "displayName": "Beispiel: Listen",
   "description": "Listen erstellen, lesen, ändern, suchen, teilen und sortieren."
  },
  "it": {
   "displayName": "Esempio: Liste",
   "description": "Creare, leggere, modificare, cercare, dividere e ordinare liste."
  }
 },
 "example-functions": {
  "nl": {
   "displayName": "Voorbeeld: Functies met waarden",
   "description": "Definieert een functie met een parameter en een resultaat, en roept die aan."
  },
  "de": {
   "displayName": "Beispiel: Funktionen mit Werten",
   "description": "Definiert eine Funktion mit einem Parameter und einem Ergebnis und ruft sie auf."
  },
  "it": {
   "displayName": "Esempio: Funzioni con valori",
   "description": "Definisce una funzione con un parametro e un risultato, e la richiama."
  }
 },
 "example-objects": {
  "nl": {
   "displayName": "Voorbeeld: Objecten en JSON",
   "description": "Bouw een object, lees en wijzig de velden, en lees JSON."
  },
  "de": {
   "displayName": "Beispiel: Objekte und JSON",
   "description": "Ein Objekt bauen, seine Felder lesen und ändern und JSON lesen."
  },
  "it": {
   "displayName": "Esempio: Oggetti e JSON",
   "description": "Costruisce un oggetto, legge e modifica i suoi campi, e legge JSON."
  }
 },
 "example-try-catch": {
  "nl": {
   "displayName": "Voorbeeld: Proberen en opvangen",
   "description": "Vangt een probleem op, toont een vriendelijk bericht, en eindigt altijd."
  },
  "de": {
   "displayName": "Beispiel: Versuchen und Abfangen",
   "description": "Fängt ein Problem ab, zeigt eine freundliche Nachricht und endet immer."
  },
  "it": {
   "displayName": "Esempio: Provare e catturare",
   "description": "Cattura un problema, mostra un messaggio gentile e finisce sempre."
  }
 },
 "example-ask": {
  "nl": {
   "displayName": "Voorbeeld: Een vraag stellen",
   "description": "Vraagt je om een woord wanneer je het met de hand draait, en gebruikt het antwoord."
  },
  "de": {
   "displayName": "Beispiel: Eine Frage stellen",
   "description": "Fragt dich nach einem Wort, wenn du den Lauf von Hand startest, und verwendet die Antwort."
  },
  "it": {
   "displayName": "Esempio: Fai una domanda",
   "description": "Ti chiede una parola quando lo esegui a mano, e usa la risposta."
  }
 },
 "example-keyword-statistics": {
  "nl": {
   "displayName": "Voorbeeld: Een woord over een periode",
   "description": "Telt de notities die een woord noemen over de laatste 30 dagen, en telt hun waarden op."
  },
  "de": {
   "displayName": "Beispiel: Ein Stichwort über einen Zeitraum",
   "description": "Zählt die Notizen, die ein Wort nennen, über die letzten 30 Tage und summiert ihre Werte."
  },
  "it": {
   "displayName": "Esempio: Una parola su un periodo",
   "description": "Conta le note che citano una parola negli ultimi 30 giorni, e ne somma i valori."
  }
 },
 "example-web-service": {
  "nl": {
   "displayName": "Voorbeeld: Een webdienst lezen",
   "description": "Roept een weerdienst aan met je sleutel, en leest de temperatuur uit het antwoord."
  },
  "de": {
   "displayName": "Beispiel: Einen Webdienst lesen",
   "description": "Ruft einen Wetterdienst mit deinem Schlüssel auf und liest die Temperatur aus der Antwort."
  },
  "it": {
   "displayName": "Esempio: Leggere un servizio web",
   "description": "Chiama un servizio meteo con la tua chiave, e legge la temperatura dalla risposta."
  }
 },
 "example-expert-mood-analyst": {
  "nl": {
   "displayName": "Voorbeeld: Stemmingsanalist",
   "description": "Berekent het gemiddelde, de beste en de slechtste dag van een lijst met humeuren, met een oordeel per dag."
  },
  "de": {
   "displayName": "Beispiel: Stimmungsanalyst",
   "description": "Berechnet den Mittelwert, den besten und den schlechtesten Tag einer Liste von Befindenswerten, mit einem Urteil für jeden Tag."
  },
  "it": {
   "displayName": "Esempio: Analista dell'umore",
   "description": "Calcola la media, il giorno migliore e quello peggiore di una lista di umori, con un giudizio per ogni giorno."
  }
 },
 "example-expert-habit-engine": {
  "nl": {
   "displayName": "Voorbeeld: Gewoonte-motor",
   "description": "Telt een reeks over meerdere runs heen, viert een mijlpaal en toont de reeks op een widget."
  },
  "de": {
   "displayName": "Beispiel: Gewohnheits-Engine",
   "description": "Zählt eine Serie über mehrere Läufe hinweg, feiert einen Meilenstein und zeigt die Serie auf einem Widget."
  },
  "it": {
   "displayName": "Esempio: Motore delle abitudini",
   "description": "Conta una serie tra un'esecuzione e l'altra, festeggia una tappa e mostra la serie su un widget."
  }
 },
 "example-expert-budget-ledger": {
  "nl": {
   "displayName": "Voorbeeld: Budgetboekhouding",
   "description": "Een boekhouding van uitgaven als objecten, met een functie die optelt, een waarschuwing en veilig lezen van fouten."
  },
  "de": {
   "displayName": "Beispiel: Budgetbuch",
   "description": "Ein Buch über Ausgaben als Objekte, mit einer Funktion, die addiert, einer Warnung und sicherem Lesen von Fehlern."
  },
  "it": {
   "displayName": "Esempio: Registro del budget",
   "description": "Un registro di spese come oggetti, con una funzione che somma, un avviso e una lettura sicura degli errori."
  }
 },
 "example-expert-command-interpreter": {
  "nl": {
   "displayName": "Voorbeeld: Opdrachtinterpreter",
   "description": "Leest een lijst met opdrachten, voert elke opdracht uit via een functie, en bewaart de teller tussen de runs."
  },
  "de": {
   "displayName": "Beispiel: Befehlsinterpreter",
   "description": "Liest eine Liste von Befehlen, führt jeden über eine Funktion aus und behält den Zähler zwischen den Läufen."
  },
  "it": {
   "displayName": "Esempio: Interprete di comandi",
   "description": "Legge una lista di comandi, esegue ciascuno con una funzione e conserva il contatore tra le esecuzioni."
  }
 }
};
