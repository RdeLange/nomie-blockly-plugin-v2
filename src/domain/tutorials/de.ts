// Die Anleitungen der Beispielbibliothek, auf Deutsch (der Reiter Ausführlich jedes Beispiels). Jede Anleitung sagt, was
// das Beispiel baut, was man vorher braucht, und dann die Schritte, mit den genauen Blöcken und wo man sie findet. Die
// Schlüssel sind die Namen der Beispiele. Namen von Funktionen, Variablen und Feldern stehen so in den Blöcken, also auf
// Englisch.
export const TUTORIAL_DE: Record<string, string> = {
  'example-hello': `Was du baust: einen Arbeitsbereich, der zwei Zeilen in die Konsole schreibt und eine Mitteilung von Nomie.

Schritt 1: Öffne die Nomie-Gruppe. Öffne in der Blockpalette links die Nomie-Gruppe. Finde den Zeitplan-Block und ziehe ihn auf die leere Arbeitsfläche.

Schritt 2: Füge die Konsolenzeile hinzu. Öffne den Abschnitt Schreiben und zeigen und ziehe einen Konsolen-Block in den Zeitplan, in sein Skript. Der Zeitplan ist der Teil, der läuft. Jeder Block, der laufen soll, gehört hinein.

Schritt 3: Gib der Zeile einen Text. Öffne die Gruppe Text und ziehe einen Text-Block in den Wert des Konsolen-Blocks. Klicke auf den Text und tippe: Hallo von der Konsole.

Schritt 4: Füge eine zweite Zeile hinzu. Ziehe einen weiteren Konsolen-Block unter den ersten, und setze einen Text-Block mit dem Text Hallo von der Browser-Konsole hinein. Die Konsole zeigt die Zeilen in der Reihenfolge, in der sie stehen.

Schritt 5: Zeige eine Mitteilung von Nomie. Ziehe einen Nachricht-Block unter die zweite Zeile und gib ihm einen Text-Block mit Hallo aus einer Nachricht.

Prüfe es: drücke auf Ausführen. Der Reiter Konsole im Bedienfeld zeigt die zwei Zeilen nacheinander. Die Mitteilung erscheint als Hinweis von Nomie.

Probiere danach: ändere die Texte und führe den Arbeitsbereich erneut aus. Die Konsole behält nur die Zeilen des letzten Laufs.`,

  'example-yesterday-mood': `Was du baust: einen Satz, der dir das durchschnittliche Befinden von gestern nennt, gelesen aus deinen Notizen.

Was du brauchst: einen Tracker in Nomie namens #mood, mit ein paar Notizen von gestern. Ohne Notizen zeigt der Satz eine Null, und das ist richtig.

Schritt 1: Füge den Zeitplan hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge eine Nachricht hinzu. Setze einen Nachricht-Block aus der Nomie-Gruppe in den Zeitplan. Die Nachricht ist, was Nomie dir am Ende des Laufs zeigt.

Schritt 3: Verbinde zwei Teile. Ziehe einen Verbinden-Block in die Nachricht. Ein Verbinden-Block fügt Texte und Werte aneinander, und er hat so viele Eingänge, wie du brauchst. Mit dem Zahnrad am Block fügst du einen dritten Eingang hinzu, wenn du willst.

Schritt 4: Schreibe den ersten Teil. Setze einen Text-Block in den ersten Eingang des Verbinden-Blocks und tippe: Dein durchschnittliches Befinden gestern war.

Schritt 5: Lies den Wert. Ziehe einen Tageswert-Block in den zweiten Eingang. Fülle seine drei Eingänge: einen Tracker-Block mit #mood bei Tracker, einen Tagesauswahl-Block mit gestern bei Tag, und einen Statistik-Auswahl-Block mit Durchschnitt bei Statistik.

Prüfe es: drücke auf Ausführen. Die Nachricht zeigt deinen Satz mit der Zahl. Stelle die Tagesauswahl auf heute und führe erneut aus.

Probiere danach: setze einen Text-Block mit einem Punkt am Ende ein, oder nimm den Rundungs-Block aus der Gruppe Mathematik, um die Nachkommastellen wegzunehmen.`,

  'example-mood-period': `Was du baust: einen Satz mit dem durchschnittlichen Befinden der letzten 30 Tage, auf eine ganze Zahl gerundet.

Schritt 1: Beginne mit dem Beispiel von gestern. Hast du es, kopiere den Zeitplan mit seiner Nachricht. Hast du es nicht, füge einen Zeitplan und eine Nachricht aus der Nomie-Gruppe hinzu.

Schritt 2: Füge einen Periodenwert hinzu. Suche den Periodenwert-Block in der Nomie-Gruppe. Er arbeitet wie der Tageswert-Block, deckt aber einen Zeitraum ab. Setze ihn in den Verbinden-Block der Nachricht.

Schritt 3: Wähle Tracker und Zeitraum. Setze einen Tracker-Block mit #mood bei Trackable. Setze einen Periodenauswahl-Block bei Periode und wähle Letzte 30 Tage. Setze einen Statistik-Auswahl-Block bei Statistik und wähle Durchschnitt.

Schritt 4: Runde die Zahl. Ziehe einen Rundungs-Block aus der Gruppe Mathematik und setze den Periodenwert in seine Zahleneingabe. Lass die Option, wie sie ist: sie entfernt die Nachkommastellen.

Schritt 5: Schreibe den Satz. Setze einen Text-Block vor den Rundungs-Block mit: Dein durchschnittliches Befinden in den letzten 30 Tagen ist.

Prüfe es: drücke auf Ausführen. Die Nachricht zeigt den Satz mit einer ganzen Zahl am Ende.

Probiere danach: stelle den Periodenauswahl-Block auf Letzte 7 Tage, dann ändert sich der Satz mit. So baust du Zusammenfassungen pro Woche oder Monat: Ändere den Zeitraum und die Statistik, und dieselben Blöcke beantworten eine andere Frage.`,

  'example-log-value': `Was du baust: eine Notiz in deiner Nomie-Zeitleiste für jeden Tag, an dem der Arbeitsbereich läuft, mit einem Wert für den Tracker #goodday.

Was du brauchst: einen täglichen Zeitplan. Dieses Beispiel schreibt in deine Notizen, also testest du es zuerst.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche. Wähle im Reiter Details Täglich. Der Arbeitsbereich läuft dann einmal am Tag.

Schritt 2: Füge den Block Wert protokollieren hinzu. Ziehe den Block Wert protokollieren aus der Nomie-Gruppe in den Zeitplan.

Schritt 3: Gib ihm einen Wert. Ziehe einen Zahlen-Block in den Eingang Wert und tippe 1.

Schritt 4: Wähle den Tracker. Ziehe einen Tracker-Block in den Eingang Tracker und tippe #goodday. Nomie legt den Tracker an, wenn er noch nicht existiert.

Schritt 5: Wähle den Tag. Ziehe eine Tagesauswahl in den Eingang Datum und wähle heute.

Schritt 6: Teste es zuerst. Schalte im Reiter Ausführen den Schalter Testlauf ein. Drücke auf Ausführen. Die Konsole zeigt die Zeile Würde protokollieren mit dem Tag, und es wird keine Notiz geschrieben.

Prüfe es: schalte den Testlauf aus und drücke auf Ausführen. Dann steht für heute eine Notiz mit #goodday(1) in deiner Zeitleiste.

Probiere danach: schreibe den Tag mit einem Text-Block und einem Verbinden-Block auch in die Nachricht, oder nutze den Button Gestern, um zu sehen, wie ein Lauf für gestern funktioniert.`,

  'example-wait': `Was du baust: zwei Konsolenzeilen, mit einer Pause von einer Sekunde dazwischen.

Schritt 1: Füge den Zeitplan hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge die erste Zeile hinzu. Ziehe im Zeitplan einen Konsolen-Block aus dem Abschnitt Schreiben und zeigen und setze einen Text-Block hinein: Erste Zeile.

Schritt 3: Füge die Pause hinzu. Ziehe den Warte-Block unter die erste Zeile (tippe warte in die Suche oben in der Palette, um ihn zu finden). Stelle die Sekunden auf 1.

Schritt 4: Füge die zweite Zeile hinzu. Setze unter den Warte-Block einen weiteren Konsolen-Block mit dem Text: Zweite Zeile, eine Sekunde später.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt die erste Zeile, und die zweite erscheint eine Sekunde später. Der Lauf wartet während der Pause, und du siehst das im Status über der Arbeitsfläche.

Probiere danach: stelle die Pause auf 3 Sekunden. Setze Pausen sparsam ein: jede Sekunde zählt zur Zeit, die ein Lauf dauern darf, und ein Lauf wird nach fünf Minuten gestoppt.`,

  'example-pickers': `Was du baust: eine Nachricht, die zeigt, was jede Auswahl wählt, damit du die Werte siehst, bevor du sie verwendest.

Was du brauchst: nichts weiter. Die Auswahlen sind die kleinen Blöcke, die einen Wert wählen: einen Tracker, einen Tag, einen Zeitraum, eine Statistik und ein Datum.

Schritt 1: Füge den Zeitplan und eine Nachricht hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und setze einen Nachricht-Block hinein.

Schritt 2: Füge einen Verbinden-Block hinzu. Ziehe einen Verbinden-Block in die Nachricht. Dort fügst du gleich nacheinander Texte und Auswahlen ein.

Schritt 3: Füge den Tracker hinzu. Setze einen Text-Block mit Tracker: davor, und ziehe daneben einen Tracker-Block mit #mood.

Schritt 4: Füge Tag und Zeitraum hinzu. Füge den Text | Tag: hinzu, dann eine Tagesauswahl auf gestern. Füge den Text | Zeitraum: hinzu, dann eine Zeitraumauswahl auf Letzte 7 Tage.

Schritt 5: Füge Statistik und Datum hinzu. Füge den Text | Statistik: hinzu und eine Statistikauswahl auf Durchschnitt. Schließe mit | Datum: ab und einer Datumsauswahl, in die du ein Datum wie 2026-11-01 tippst.

Prüfe es: drücke auf Ausführen. Die Nachricht nennt jede Auswahl mit ihrem Wert.

Probiere danach: ändere eine Auswahl im Auswahlmenü und führe erneut aus. Jeder Block, der Notizen liest oder schreibt, nimmt seinen Tracker, Tag oder Zeitraum aus solchen Auswahlen.`,

  'example-history': `Was du baust: zwei Zeilen aus deinen Notizen. Die erste zeigt deinen letzten Befinden-Wert der letzten 14 Tage. Die zweite zählt die Tage, seit #mood zuletzt protokolliert wurde.

Was du brauchst: einen Tracker #mood in Nomie, mit ein paar Notizen. Der Verlauf schaut in deine Notizen zurück, also zeigt ein neues Konto noch nichts.

Schritt 1: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche und stelle ihn im Reiter Details auf täglich.

Schritt 2: Füge den letzten Wert hinzu. Setze in den Zeitplan eine Nachricht. Ziehe in den Verbinden-Block der Nachricht einen Block Letzter Wert aus der Nomie-Gruppe. Setze #mood in den Eingang Tracker und stelle die Anzahl der Tage auf 14. Der Block sucht die letzte Notiz mit diesem Tracker in den letzten 14 Tagen.

Schritt 3: Schreibe die erste Zeile. Setze einen Text-Block vor den letzten Wert, mit den Worten: Letztes Befinden:.

Schritt 4: Füge die zweite Zeile hinzu. Setze unter die Nachricht eine zweite Nachricht. Ziehe einen Block Tage seit in den Verbinden-Block, mit einem Tracker-Block #mood im Eingang.

Schritt 5: Schreibe den Text davor. Setze vor den Block Tage seit einen Text-Block mit den Worten: Tage seit #mood protokolliert wurde:.

Prüfe es: drücke auf Ausführen. Beide Nachrichten stammen aus denselben Notizen, also stimmen sie überein. Ohne Notizen ist die erste Zeile leer, und die zweite zählt ab null.

Probiere danach: stelle die 14 auf 60 Tage und sieh, wie sich der letzte Wert ändert.`,

  'example-streak': `Was du baust: einen Serienzähler. Er zeigt, an wie vielen Tagen in Folge ein Tracker protokolliert wurde, und er gratuliert dir, wenn die Serie drei Tage oder mehr beträgt.

Was du brauchst: einen Tracker #habit in Nomie, protokolliert an ein paar Tagen.

Schritt 1: Füge den Zeitplan und eine Nachricht hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und setze eine Nachricht hinein.

Schritt 2: Füge einen Wenn-Block hinzu. Ziehe einen Wenn-Block aus der Gruppe Logik in den Zeitplan, über die Nachricht.

Schritt 3: Baue die Bedingung. Ziehe einen Vergleich-Block aus der Gruppe Logik in den Eingang des Wenn-Blocks. Setze links den Serien-Block aus der Nomie-Gruppe und rechts einen Zahlen-Block mit 3. Wähle den Operator größer oder gleich.

Schritt 4: Wähle den Tracker. Setze einen Tracker-Block mit #habit in den Serien-Block. Lies den Tooltip: der Serien-Block zählt höchstens 60 Tage, bis zum Tag des Laufs.

Schritt 5: Füge die beiden Nachrichten hinzu. Setze in den Wenn-Block eine Nachricht mit: Drei Tage am Stück, gut gemacht! Klicke auf das Zahnrad des Wenn-Blocks, füge einen Sonst-Zweig hinzu und setze dort eine Nachricht mit: Weiter so.

Prüfe es: drücke auf Ausführen. Ohne Serie erscheint die Sonst-Nachricht. Probiere es mit Notizen an drei Tagen in Folge, um die erste Nachricht zu sehen.

Probiere danach: ändere die Zahl 3 auf 7 und mach daraus ein Wochenziel.`,

  'example-write-note': `Was du baust: eine freie Notiz in deiner Nomie-Zeitleiste, geschrieben für gestern. So schreibst du eine Zusammenfassung oder eine Erinnerung.

Was du brauchst: einen täglichen Zeitplan. Dieses Beispiel schreibt in deine Notizen, also testest du es zuerst.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und wähle im Reiter Details Täglich.

Schritt 2: Füge den Block Notiz protokollieren hinzu. Ziehe den Block Notiz protokollieren aus der Nomie-Gruppe in den Zeitplan.

Schritt 3: Schreibe den Text. Setze einen Text-Block in den Eingang Text der Notiz, mit den Worten: Woche besprochen #review. Die Raute sorgt dafür, dass Nomie den Tracker #review anlegt, wenn er noch nicht existiert.

Schritt 4: Wähle den Tag. Setze eine Tagesauswahl in den Eingang Datum und wähle gestern. Die Notiz wird für gestern geschrieben.

Schritt 5: Teste es zuerst. Schalte im Reiter Ausführen den Schalter Testlauf ein und drücke auf Ausführen. Die Konsole zeigt die Notiz, die geschrieben würde, und es wird nichts gespeichert.

Prüfe es: schalte den Testlauf aus und drücke auf Ausführen. Die Notiz steht für gestern in deiner Zeitleiste, mit dem Review-Tag.

Probiere danach: schreibe eine wöchentliche Zusammenfassung mit einem Verbinden-Block und einem Block Periodenwert, damit die Notiz dir den Wochendurchschnitt nennt.`,

  'example-location': `Was du baust: eine Nachricht mit deiner Position, oder eine klare Nachricht, wenn die Position nicht bekannt ist.

Was du brauchst: die Standortberechtigung für Nomie. Nomie fragt beim ersten Mal, und du kannst sie später in den Einstellungen deines Geräts ändern.

Schritt 1: Füge den Zeitplan und eine Nachricht hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und setze eine Nachricht hinein.

Schritt 2: Füge den Block Mein Standort hinzu. Ziehe ihn aus der Nomie-Gruppe in die Nachricht.

Schritt 3: Setze einen Text davor. Setze in die Nachricht einen Verbinden-Block, mit einem Text-Block mit den Worten: Du bist bei, und dahinter den Block Mein Standort.

Schritt 4: Probiere es aus. Schalte im Reiter Ausführen den Schalter Testlauf ein und drücke auf Ausführen. Nomie fragt beim ersten Mal nach der Berechtigung: erteile sie.

Prüfe es: die Nachricht zeigt einen Breitengrad und einen Längengrad. Erscheint nichts, war die Position nicht verfügbar. Deshalb braucht jede Verwendung von Mein Standort eine Rückfalllösung, etwa einen Text, der sagt, dass die Position unbekannt ist.

Probiere danach: füge einen Wenn-Block hinzu, der prüft, ob das Ergebnis leer ist, und zeige im Sonst-Zweig einen Text.`,

  'example-open-link': `Was du baust: einen Block, der eine Webseite in Nomie öffnet, zum Beispiel ein eigenes Dashboard.

Schritt 1: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge den Block Link öffnen hinzu. Ziehe ihn aus der Nomie-Gruppe in den Zeitplan.

Schritt 3: Gib ihm eine Adresse. Setze einen Text-Block in den Eingang des Links, mit der vollständigen Adresse der Seite, beginnend mit https.

Schritt 4: Teste es. Drücke im Editor auf Ausführen. Ein manueller Lauf öffnet die Seite in einem Fenster innerhalb von Nomie.

Prüfe es: das Fenster öffnet sich mit der Seite. Läuft der Arbeitsbereich nach einem Zeitplan, schreibt der Block nur Würde öffnen in die Ausgabe. Ein Zeitplan öffnet also nie ein Fenster.

Probiere danach: halte die Adresse in einem Geheimnis oder einem Text, den du ändern kannst, und verwende nur Adressen, denen du vertraust. Ein Arbeitsbereich, der mit jemand anderem geteilt wird, ruft dieselbe Adresse auf dessen Gerät auf.`,

  'example-fetch-page': `Was du baust: einen Aufruf einer Webadresse, mit der Antwort in der Konsole.

Was du brauchst: eine Internetverbindung und eine Adresse, der du vertraust. Das Beispiel nutzt eine öffentliche Adresse. Ein geteilter Arbeitsbereich ruft seine Adressen auf dem Gerät dessen auf, der ihn hinzufügt.

Schritt 1: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge den Block Abrufen hinzu. Ziehe ihn aus der Nomie-Gruppe in den Zeitplan.

Schritt 3: Gib ihm eine Adresse. Setze einen Text-Block in den Eingang der Adresse, mit einer Seite, der du vertraust. Beginne mit https.

Schritt 4: Zeige die Antwort. Ziehe einen Konsolen-Block unter den Abruf-Block und stecke den Abruf-Block in den Wert des Konsolen-Blocks.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt die Antwort als Text, oft den Anfang einer Webseite oder eine Liste in JSON.

Probiere danach: die meisten Dienste antworten mit JSON. Die Beispiele zu Objekten zeigen Schritt für Schritt, wie du das liest.`,

  'example-widget-value': `Was du baust: ein Dashboard-Widget mit einer Zahl, einem kleinen Trend und einer Fußzeile.

Was du brauchst: nichts Besonderes. Das Widget wird nach einem Lauf behalten, also musst du den Arbeitsbereich einmal laufen lassen.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und wähle im Reiter Details Täglich.

Schritt 2: Füge den Dashboard-Block hinzu. Ziehe den Dashboard-Block aus der Nomie-Gruppe in den Zeitplan. Gib ihm einen Namen, etwa Befinden, und ein Emoji, etwa ein Smiley. Name und Emoji erscheinen in der Kopfzeile des Widgets.

Schritt 3: Füge den Wert hinzu. Ziehe im Dashboard den Wert-Block aus dem Abschnitt Dashboard-Widget. Setze einen Periodenwert-Block hinein, mit dem Tracker #mood, dem Zeitraum Letzte 7 Tage und der Statistik Durchschnitt. Gib dem Wert eine Beschriftung: Durchschnitt der letzten 7 Tage.

Schritt 4: Füge den Trend hinzu. Ziehe unter den Wert den Trend-Block. Setze #mood hinein und gib ihm die Beschriftung Letzte 14 Tage.

Schritt 5: Füge die Fußzeile hinzu. Ziehe zuletzt den Fußzeilen-Block und tippe: Jeden Morgen aktualisiert.

Prüfe es: drücke einmal auf Ausführen. Öffne danach den Abschnitt Vorschau unten im Reiter Ausführen. Er zeigt das Widget so, wie das Dashboard es zeigt. Eine Vorschau ist ein Testlauf, daher werden keine Notizen geschrieben.

Probiere danach: ändere die Beschriftung des Werts oder den Zeitraum und sieh dir die Vorschau erneut an.`,

  'example-widget-charts': `Was du baust: ein Dashboard mit zwei Diagrammen desselben Trackers. Das erste ist ein Liniendiagramm über 30 Tage, das zweite ein Balkendiagramm über 7 Tage.

Was du brauchst: einen Tracker #mood in Nomie, mit Notizen an ein paar Tagen, damit die Diagramme etwas zeichnen können.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge das Dashboard hinzu. Ziehe einen Dashboard-Block in den Zeitplan, gib ihm den Namen Befinden-Diagramme und ein Emoji, etwa ein Diagramm.

Schritt 3: Füge das Liniendiagramm hinzu. Ziehe im Dashboard den Liniendiagramm-Block aus dem Abschnitt Dashboard-Widget. Setze #mood in den Eingang Tracker. Stelle die Tage auf 30, die Farbe auf Blau und die Beschriftung auf Letzte 30 Tage.

Schritt 4: Füge das Balkendiagramm hinzu. Ziehe unter das Liniendiagramm den Balkendiagramm-Block. Setze wieder #mood hinein, stelle die Tage auf 7, die Farbe auf Grün und die Beschriftung auf Letzte 7 Tage.

Schritt 5: Sieh dir die Vorschau an. Drücke einmal auf Ausführen und öffne danach den Abschnitt Vorschau im Reiter Ausführen.

Prüfe es: die Linie verbindet die Tage, und ein Tag ohne Notiz ist eine Lücke. Die Balken zeigen für jeden der letzten 7 Tage einen Balken. Beide stammen aus denselben Notizen, auf zwei Arten gezeichnet.

Probiere danach: ändere die Farbe der Balken und sieh, wie das Widget in deinem Nomie-Design aussieht.`,

  'example-widget-html': `Was du baust: ein Dashboard-Widget mit eigenem HTML, gefüllt mit einem Wert aus deinen Notizen.

Was du brauchst: einen Tracker #mood mit Notizen an ein paar Tagen, damit es einen Wert zu zeigen gibt.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge das Dashboard hinzu. Ziehe einen Dashboard-Block in den Zeitplan und gib ihm den Namen Befinden-HTML.

Schritt 3: Füge den HTML-Block hinzu. Ziehe im Dashboard den HTML-Block aus dem Abschnitt Dashboard-Widget. Schreibe in das Textfeld: <p>Durchschnittliches Befinden: <b>{{mood}}</b></p>. Der Platzhalter {{mood}} wird bei jedem Lauf durch einen Wert ersetzt.

Schritt 4: Füge einen Parameter hinzu. Ziehe unter den HTML-Block einen Parameter-Block. Sein Name ist mood, derselbe wie der Platzhalter. Sein Wert ist ein Periodenwert-Block mit #mood, dem Zeitraum Letzte 7 Tage und der Statistik Durchschnitt.

Schritt 5: Sieh dir die Vorschau an. Drücke einmal auf Ausführen und öffne den Abschnitt Vorschau im Reiter Ausführen.

Prüfe es: das Widget zeigt das durchschnittliche Befinden fett. Das HTML wird vor der Anzeige bereinigt: Skripte und Links werden entfernt, und Bilder müssen von https stammen.

Probiere danach: füge einen zweiten Platzhalter hinzu, etwa {{count}}, mit einem weiteren Parameter-Block, der die Notizen zählt.`,

  'example-remember': `Was du baust: einen Arbeitsbereich, der seine eigenen Läufe zählt. Er behält den Zähler von einem Lauf zum nächsten und vergisst ihn beim dritten Lauf.

Was du brauchst: nichts. Dieses Beispiel nutzt nur das Gedächtnis des Arbeitsbereichs.

Schritt 1: Füge den Zeitplan hinzu und stelle ihn auf täglich. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Merke dir einen neuen Zähler. Ziehe im Zeitplan einen Merken-Block. Nenne ihn runs. Sein Wert ist ein Rechenblock mit der Addition: links ein Abrufen-Block mit dem Namen runs und dem Standard 0, rechts die Zahl 1.

Schritt 3: Zeige den Zähler. Setze darunter einen Nachricht-Block mit einem Verbinden-Block: den Text Dieser Arbeitsbereich ist gelaufen, einen Abrufen-Block mit dem Namen runs und dem Standard 0, und den Text Mal.

Schritt 4: Vergiss beim dritten Lauf. Füge einen Wenn-Block hinzu. Die Bedingung ist ein Vergleich-Block: der Abrufen-Block mit dem Namen runs ist gleich 3. Setze in den Wenn-Block einen Vergessen-Block mit dem Namen runs und eine Nachricht, dass der Zähler vergessen wurde.

Prüfe es: drücke dreimal auf Ausführen. Der Zähler geht 1, 2, 3, und beim dritten Lauf sagt die Nachricht, dass der Zähler vergessen wurde. Der nächste Lauf beginnt wieder bei 0.

Probiere danach: ändere die Zahl 3 auf 5, um eine längere Serie zu behalten.`,

  'example-secret': `Was du baust: einen Arbeitsbereich, der einen Schlüssel aus den Einstellungen nutzt, ohne den Schlüssel in die Blöcke zu schreiben.

Was du brauchst: ein Geheimnis namens EXAMPLE_KEY in den Einstellungen. Öffne die Einstellungen der Erweiterung und füge das Geheimnis mit diesem Namen und deinem Schlüssel hinzu.

Schritt 1: Lege den Schlüssel in den Einstellungen ab. Öffne die Einstellungen und füge ein Geheimnis namens EXAMPLE_KEY hinzu. Der Schlüssel selbst wird nie in den Blöcken angezeigt.

Schritt 2: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 3: Füge den Geheimnis-Block hinzu. Setze in den Zeitplan eine Nachricht. Ziehe einen Geheimnis-Block aus der Nomie-Gruppe hinein und wähle EXAMPLE_KEY.

Schritt 4: Führe es aus. Drücke auf Ausführen. Die Nachricht zeigt das Geheimnis als vier Punkte, damit der Schlüssel nie in der Ausgabe erscheint.

Prüfe es: fehlt das Geheimnis, stoppt der Lauf und sagt dir, welches du hinzufügen musst. Teste das, indem du das Geheimnis in den Einstellungen umbenennst und erneut ausführst.

Probiere danach: verwende das Geheimnis in einer Webadresse, mit einem Verbinden-Block. Geteilte Dateien enthalten nie deinen Schlüssel, du kannst den Arbeitsbereich also sicher an jemand anderen schicken.`,

  'example-when-note': `Was du baust: einen Arbeitsbereich, der läuft, wenn eine Notiz mit einem bestimmten Tracker gespeichert wird, statt nach einem Zeitplan.

Was du brauchst: einen Tracker #run in Nomie. Jede Notiz mit diesem Tracker startet den Arbeitsbereich.

Schritt 1: Füge den Block Wenn eine Notiz da ist hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche und tippe den Tracker #run in sein Feld.

Schritt 2: Füge eine Nachricht hinzu. Setze im Block Wenn eine Notiz da ist einen Nachricht-Block aus der Nomie-Gruppe.

Schritt 3: Lies die Notiz. Setze in die Nachricht drei Blöcke aus der Nomie-Gruppe nebeneinander: einen Notizwert-Block mit #mood, einen Notiztext-Block und einen Notiztag-Block. Setze vor jeden einen Text, damit die Nachricht klar ist.

Schritt 4: Probiere es. Schreibe in Nomie eine Notiz mit #run und #mood(4). Speichere sie.

Prüfe es: Nomie führt den Arbeitsbereich aus, und die Nachricht zeigt den Befinden-Wert 4, den Text der Notiz und ihren Tag. Außerhalb eines Notizlaufs geben diese Blöcke nichts aus, und die Prüfung vor dem Lauf zeigt dir das.

Probiere danach: füge einen Wenn-Block hinzu, der den Befinden-Wert prüft, und zeige eine andere Nachricht, wenn er unter 3 liegt.`,

  'example-loop-days': `Was du baust: Schleifen in zwei Formen. Ein Wiederholen-Block führt seine Blöcke eine festgelegte Anzahl von Malen aus, und ein Für-Block zählt mit einer Variablen.

Schritt 1: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge einen Wiederholen-Block hinzu. Ziehe aus der Gruppe Schleifen einen Wiederholen-Block in den Zeitplan. Stelle die Anzahl auf 3. Setze darin einen Konsolen-Block mit dem Text Wiederholt.

Schritt 3: Füge einen Für-Block hinzu. Ziehe unter den Wiederholen-Block einen Für-Block aus der Gruppe Schleifen. Die Variable ist i, der Anfang 1, das Ende 5 und die Schrittweite 1.

Schritt 4: Zeige den Zähler. Setze in den Für-Block eine Nachricht: einen Verbinden-Block mit dem Text Schritt und der Variablen i aus der Gruppe Variablen.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt dreimal Wiederholt und danach fünf Zeilen, Schritt 1 bis Schritt 5. Schleifen erlauben einem Arbeitsbereich, in einem Lauf viele Tage oder Notizen abzudecken.

Probiere danach: stelle das Ende des Für-Blocks auf 30 und zähle Tage mit einem täglichen Zeitplan.`,

  'example-while-break': `Was du baust: einen Zähler, der so lange wiederholt, wie eine Bedingung gilt, und der mit einem Abbruch früh stoppt.

Schritt 1: Setze die Variable. Füge einen Setzen-Block aus der Gruppe Variablen hinzu, mit der Variablen n und der Zahl 0.

Schritt 2: Füge eine Solange-Schleife hinzu. Ziehe eine Solange-Schleife aus der Gruppe Schleifen unter den Setzen-Block. Lass sie auf solange stehen und baue die Bedingung mit einem Vergleich-Block: n kleiner als 10.

Schritt 3: Füge den Wenn-Block in die Schleife ein. Ziehe in die Solange-Schleife einen Wenn-Block. Die Bedingung ist ein Vergleich-Block: n gleich 4.

Schritt 4: Brich die Schleife ab. Setze in den Wenn-Block einen Abbrechen-Block aus der Gruppe Schleifen.

Schritt 5: Zeige und zähle. Setze unter den Wenn-Block, in der Schleife, einen Konsolen-Block mit n und einen Ändern-Block, der 1 zu n addiert.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt die Zahlen 0 bis 3, und dann stoppt die Schleife bei 4.

Probiere danach: verschiebe den Abbruch auf eine andere Zahl. Achte darauf, die Variable in der Schleife zu ändern, sonst endet sie nie. Der Lauf stoppt außerdem nach einer sehr großen Anzahl von Schritten, damit er nicht ewig hängen bleibt.`,

  'example-list-loop': `Was du baust: eine Für-jedes-Schleife, die eine Liste mit drei Tagen nacheinander durchgeht.

Schritt 1: Füge den Für-jedes-Block hinzu. Ziehe aus der Gruppe Schleifen einen Für-jedes-Block auf die Arbeitsfläche. Stelle seine Variable auf item.

Schritt 2: Erstelle die Liste. Ziehe einen Liste-erstellen-Block aus der Gruppe Listen in den Listeneingang des Für-jedes-Blocks. Füge ihm drei Text-Blöcke hinzu mit den Worten Montag, Dienstag und Mittwoch. Mit dem Zahnrad des Listen-Blocks fügst du die Eingänge hinzu.

Schritt 3: Zeige jedes Element. Setze in den Für-jedes-Block einen Konsolen-Block und stecke die Variable item hinein.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt die drei Elemente in der Reihenfolge der Liste.

Probiere danach: lege eine Liste mit Zahlen an und addiere sie mit einem Summen-Block aus der Gruppe Mathematik.`,

  'example-decide': `Was du baust: eine Entscheidung mit einem Wenn-Block, einem Sonst-Zweig und Logik-Blöcken, dazu ein Ternär-Block, der in einer Zeile einen Wert wählt.

Schritt 1: Füge den Wenn-Block hinzu. Ziehe einen Wenn-Block aus der Gruppe Logik auf die Arbeitsfläche und klicke auf das Zahnrad, um einen Sonst-Zweig hinzuzufügen.

Schritt 2: Baue die Bedingung. Ziehe einen Und-Block in den Eingang des Wenn-Blocks. Setze links einen Vergleich-Block: 3 kleiner als 5. Setze rechts einen Nicht-Block mit einem Vergleich-Block darin: 2 größer als 7.

Schritt 3: Füge die beiden Nachrichten hinzu. Setze in den Wenn-Block eine Nachricht mit Beide sind wahr. Setze in den Sonst-Zweig eine Nachricht mit Irgendetwas stimmt nicht.

Schritt 4: Wähle einen Wert in einer Zeile. Ziehe unter den Wenn-Block einen Ternär-Block in einen Konsolen-Block. Seine Bedingung ist der Block Wahr, der Dann-Wert ist ja und der Sonst-Wert ist nein.

Prüfe es: drücke auf Ausführen. Die erste Nachricht zeigt den Sonst-Text, weil der Nicht-Block die Bedingung falsch macht. Ändere die Zahlen in den Vergleich-Blöcken und führe erneut aus, um beide Zweige zu sehen.

Probiere danach: füge dem Und einen zweiten Vergleich-Block hinzu und verwende einen Oder-Block für eine andere Bedingung.`,

  'example-numbers': `Was du baust: einen kleinen Taschenrechner. Jede Zeile der Konsole zeigt einen der Rechenblöcke im Einsatz.

Schritt 1: Füge für jede Summe einen Konsolen-Block hinzu. Ziehe einen Konsolen-Block aus dem Abschnitt Schreiben und zeigen auf die Arbeitsfläche und setze einen Rechen-Block hinein: 2 plus 3.

Schritt 2: Füge weitere Rechnungen hinzu. Setze weitere Konsolen-Blöcke, jeweils mit einem Block aus der Gruppe Mathematik: einen Multiplikations-Block, einen Wurzel-Block, einen Sinus-Block aus dem Trigonometrie-Block und die Konstante pi.

Schritt 3: Prüfe, ob eine Zahl gerade ist. Füge einen Zahleneigenschaft-Block mit der Option gerade hinzu, und einen Zahlen-Block mit 4.

Schritt 4: Berechne den Rest. Nutze den Modulo-Block, um den Rest von 17 geteilt durch 5 zu bekommen.

Prüfe es: drücke auf Ausführen. Jede Zeile zeigt ihr Ergebnis. Lies die Beschriftungen in der Konsole, um jede Zeile seinem Block zuzuordnen.

Probiere danach: lege die Ergebnisse in Variablen ab und fasse sie in einer einzigen Nachricht zusammen.`,

  'example-random-average': `Was du baust: eine Reihe von Werten, die sich bei jedem Lauf ändern: Zufallszahlen, ein gerundeter Wert, der Durchschnitt einer Liste und ein begrenzter Wert.

Schritt 1: Füge die Zufallsblöcke hinzu. Ziehe einen Zufallsganzzahl-Block aus der Gruppe Mathematik in einen Konsolen-Block. Stelle die Grenzen auf 1 und 10. Setze danach einen Zufallsbruch-Block, der eine Zahl zwischen 0 und 1 liefert.

Schritt 2: Aufrunden. Setze einen Rundungs-Block mit der Option aufrunden um einen Zahlen-Block und zeige ihn.

Schritt 3: Finde den Durchschnitt einer Liste. Nutze eine Liste mit Zahlen in einem Liste-erstellen-Block und die Option Durchschnitt des Listen-Rechenblocks.

Schritt 4: Halte einen Wert im Bereich. Nutze einen Begrenzen-Block mit dem Wert 15, der unteren Grenze 0 und der oberen Grenze 10. Das Ergebnis ist 10.

Prüfe es: starte den Arbeitsbereich mehrmals. Die Zufallswerte ändern sich jedes Mal, der Rest bleibt gleich.

Probiere danach: nutze den Zufallsganzzahl-Block, um einen Tag aus einer Liste zu wählen, mit dem Index der Liste.`,

  'example-text-tools': `Was du baust: eine Reihe von Textblöcken im Einsatz. Jedes Ergebnis geht auf eine eigene Zeile der Konsole.

Schritt 1: Füge die Länge hinzu. Ziehe einen Länge-Block aus der Gruppe Text in einen Konsolen-Block und setze einen Text-Block hinein mit dem Wort Nomie.

Schritt 2: Ändere die Groß- und Kleinschreibung. Füge einen Block zum Ändern der Schreibweise und einen Text-Block hinzu. Wähle Großbuchstaben.

Schritt 3: Entferne Leerzeichen. Füge einen Kürzen-Block mit einem Text hinzu, der Leerzeichen an beiden Enden hat.

Schritt 4: Finde ein Wort. Füge einen Position-finden-Block hinzu, der die Position des Wortes blau in einem Text sucht.

Schritt 5: Nimm einen Teil. Füge einen Teiltext-Block hinzu, der die ersten fünf Buchstaben eines Textes ausschneidet.

Prüfe es: drücke auf Ausführen. Jede Zeile zeigt ihr Ergebnis. Vergleiche jeden Block mit der Zeile, die er erzeugt.

Probiere danach: verbinde zwei Texte mit einem Verbinden-Block und zeige die Länge des Ergebnisses.`,

  'example-lists': `Was du baust: eine Liste und die Listenblöcke, die darauf arbeiten: die Länge, eine Prüfung auf leer, die Position eines Elements, das Element an einer Position, eine Änderung und Sortieren.

Schritt 1: Füge die Länge hinzu. Ziehe einen Längen-Block aus der Gruppe Listen in einen Konsolen-Block und setze einen Liste-erstellen-Block hinein mit den Texten a, b und c.

Schritt 2: Prüfe, ob sie leer ist. Füge einen Ist-leer-Block mit einem leeren Liste-erstellen-Block hinzu und zeige das Ergebnis.

Schritt 3: Finde eine Position. Füge einen Position-finden-Block hinzu, der das erste b in einer Liste aus a und b findet.

Schritt 4: Hole ein Element. Füge einen Element-holen-Block für das erste Element hinzu und einen Block, der das Element an Position 1 vom Ende holt.

Schritt 5: Ändere ein Element. Setze die Variable days auf eine Liste mit Mo und Di. Nutze einen Element-setzen-Block, um das erste Element in So zu ändern, und zeige danach days.

Schritt 6: Teile und sortiere. Teile den Text mo,di,mi mit einem Komma in eine Liste und sortiere eine Liste mit den Zahlen 3, 1 und 2.

Prüfe es: drücke auf Ausführen. Jeder Schritt zeigt sein Ergebnis, damit du verfolgen kannst, wie die Liste an jeder Stelle aussieht.

Probiere danach: lege die sortierten Zahlen mit einem Verbinden-Block in eine Nachricht.`,

  'example-functions': `Was du baust: zwei Funktionen, eine liefert einen Wert zurück und die andere tut etwas. Eine Funktion ist eine Reihe von Blöcken mit einem Namen, den du erneut aufrufen kannst.

Was du brauchst: nichts. Das Beispiel ist ein vollständiges kleines Programm in einem Arbeitsbereich.

Schritt 1: Definiere die Funktion doppelt. Ziehe aus der Gruppe Funktionen eine Funktion mit Ergebnis auf die Arbeitsfläche. Nenne sie doppelt und füge mit dem Zahnrad einen Parameter n hinzu.

Schritt 2: Füge die frühe Rückgabe hinzu. Setze in die Funktion einen Wenn-Rückgabe-Block. Die Bedingung ist n kleiner als 0, der Wert ist 0. Ist n unter null, endet die Funktion dort, und der Rest wird übersprungen.

Schritt 3: Gib das Ergebnis zurück. Setze unter den Wenn-Rückgabe-Block den Rückgabe-Block mit dem Wert n mal 2.

Schritt 4: Definiere die Funktion gruss. Ziehe eine Funktion ohne Ergebnis, nenne sie gruss und füge den Parameter wer hinzu. Zeige darin eine Nachricht, die Hallo und wer verbindet.

Schritt 5: Rufe sie auf. Zeige im Zeitplan unter den Definitionen einen Aufruf von doppelt mit der Zahl 21 und einen Aufruf von gruss mit dem Text Nomie.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt 42 und danach Hallo Nomie.

Probiere danach: definiere eine Funktion, die doppelt aufruft, damit die eine Funktion die andere nutzt.`,

  'example-objects': `Was du baust: einen kleinen Datensatz und die Blöcke, die ihn lesen und ändern. Objekte halten benannte Felder, und die JSON-Blöcke lesen und schreiben Text in derselben Form.

Schritt 1: Erstelle ein Objekt. Ziehe aus der Gruppe Objekte einen Objekt-erstellen-Block auf einen Konsolen-Block. Füge mit dem Zahnrad zwei Felder hinzu: temp mit der Zahl 18, und mood mit der Zahl 7.

Schritt 2: Lies ein Feld. Füge einen Abrufen-Block hinzu, der temp aus einem Objekt liest, das aus JSON-Text entstanden ist. Nutze den Text {"temp": 18, "mood": 7} in einem JSON-Text-zu-Objekt-Block.

Schritt 3: Zeige die Schlüssel. Füge einen Schlüssel-Block für dasselbe Objekt hinzu und zeige das Ergebnis.

Schritt 4: Lies einen Wert aus JSON. Füge einen Wert-aus-Schlüssel-Block hinzu, mit dem Schlüssel mood und dem Objekt aus dem JSON-Text.

Schritt 5: Schreibe JSON. Füge einen Objekt-zu-JSON-Block hinzu, der ein Objekt wieder in Text verwandelt.

Schritt 6: Ändere ein Feld. Nutze den Setzen-Block mit dem Feld mood und der Zahl 9.

Prüfe es: drücke auf Ausführen. Jede Konsolenzeile zeigt ihr Ergebnis. Webdienste antworten mit JSON, das ist also das Muster, um ihre Antworten zu lesen.

Probiere danach: lies das Befinden aus dem Objekt und zeige es in einem Satz.`,

  'example-try-catch': `Was du baust: einen Block, der versucht, fehlerhafte Daten zu lesen, und den Fehler abfängt, ohne dass der Lauf stoppt.

Schritt 1: Füge einen Versuch-Block hinzu. Ziehe aus der Gruppe Erweitert einen Versuch-und-Abfangen-Block auf die Arbeitsfläche. Sein Parameter ist error.

Schritt 2: Setze einen riskanten Block in Versuch. Setze in Versuch einen Konsolen-Block mit einem JSON-Text-zu-Objekt-Block, der den Text {kein json liest, der kein gültiges JSON ist.

Schritt 3: Fange den Fehler ab. Setze in Abfangen eine Nachricht: einen Verbinden-Block mit dem Text Daten konnten nicht gelesen werden und der Variablen error.

Schritt 4: Füge ein Finally hinzu. Klicke auf das Zahnrad des Blocks und füge einen Teil Abschließend hinzu. Setze dort einen Konsolen-Block mit dem Text Auf jeden Fall fertig.

Prüfe es: drücke auf Ausführen. Der Versuch-Teil schlägt fehl, und die Nachricht zeigt den Fehler. Die Abschlusszeile läuft trotzdem. Ohne den Versuch-Block würde der ganze Lauf an den fehlerhaften Daten stoppen.

Probiere danach: nutze dasselbe Muster für eine Webadresse, die manchmal ausfällt, und zeige im Abfangen eine freundliche Nachricht.`,

  'example-ask': `Was du baust: eine Frage, die dich nach einem Wort fragt, und die deine Antwort in einem Satz zeigt.

Was du brauchst: nichts. Die Frage erscheint, wenn du den Arbeitsbereich von Hand startest. Ein geplanter Lauf hat niemanden, der antwortet, also ist dieses Beispiel für Testläufe gedacht.

Schritt 1: Füge den Zeitplan hinzu. Ziehe ihn aus der Nomie-Gruppe auf die Arbeitsfläche.

Schritt 2: Füge eine Nachricht hinzu. Ziehe im Zeitplan einen Nachricht-Block aus der Nomie-Gruppe.

Schritt 3: Verbinde die Antwort. Füge in die Nachricht einen Verbinden-Block ein. Der erste Teil ist ein Text-Block: Deine Antwort war.

Schritt 4: Stelle die Frage. Ziehe einen Fragen-Block aus der Gruppe Text in den zweiten Teil des Verbinden-Blocks. Tippe in den Text: Wie lautet dein Stimmungswort?

Prüfe es: drücke auf Ausführen. Nomie zeigt die Frage. Tippe ein Wort, und die Nachricht zeigt deine Antwort.

Probiere danach: frage nach einer Zahl und nutze sie in einer Berechnung. Denke daran, dass eine Frage nur funktioniert, wenn jemand da ist, der antwortet.`,

  'example-keyword-statistics': `Was du baust: die Anzahl der Notizen, die ein Wort in den letzten 30 Tagen nennen, und die Summe ihrer Werte.

Was du brauchst: Notizen in Nomie, die das Wort Bewegung nennen, damit die Antworten nicht null sind.

Schritt 1: Füge den Zeitplan und eine Nachricht hinzu. Ziehe den Zeitplan aus der Nomie-Gruppe auf die Arbeitsfläche und setze eine Nachricht hinein.

Schritt 2: Beginne den Satz. Setze in die Nachricht einen Verbinden-Block. Der erste Teil ist ein Text-Block: Gefunden „Bewegung“ in.

Schritt 3: Füge den Periodenwert hinzu. Ziehe einen Periodenwert-Block in den Verbinden-Block. Sein Gegenstand ist der Text Bewegung, kein Tracker, damit er das Wort in den Notizen sucht. Der Zeitraum ist Letzte 30 Tage und die Statistik ist Anzahl.

Schritt 4: Beende den Satz. Schreibe nach dem Periodenwert den Text Notizen in den letzten 30 Tagen.

Schritt 5: Füge die Summe hinzu. Setze eine zweite Nachricht mit einem Periodenwert-Block und der Statistik Summe. Das addiert die Werte der Notizen, die das Wort nennen.

Prüfe es: drücke auf Ausführen. Die erste Nachricht zeigt, wie viele Notizen Bewegung nennen, die zweite die Summe ihrer Werte.

Probiere danach: ändere das Wort oder stelle den Zeitraum auf Letzte 90 Tage. Dieselben zwei Blöcke beantworten dann eine andere Frage.`,

  'example-web-service': `Was du baust: eine Wetterabfrage bei einem Webdienst, mit deinem Schlüssel in den Einstellungen gespeichert. Es zeigt, wie ein echter Ablauf funktioniert: ein Schlüssel, eine Anfrage, die Antwort als JSON, und die Werte, die daraus gelesen werden.

Was du brauchst: ein Konto bei einem Wetterdienst, der dir einen Schlüssel gibt. Lege den Schlüssel in den Einstellungen unter dem Namen OPENWEATHER_KEY ab. Ohne ihn stoppt der Lauf und nennt das Geheimnis, das du hinzufügen musst.

Schritt 1: Lege den Schlüssel an. Füge in den Einstellungen ein Geheimnis namens OPENWEATHER_KEY mit deinem Schlüssel hinzu.

Schritt 2: Speichere die Antwort. Füge einen Setzen-Block mit der Variablen WeatherData hinzu. Sein Wert ist ein Anfrage-Block. Baue die Adresse mit einem Verbinden-Block: den Anfang der Adresse, dann einen Geheimnis-Block mit OPENWEATHER_KEY, und danach den Rest mit Sprache und Einheiten.

Schritt 3: Lies die Temperatur. Füge einen Setzen-Block mit der Variablen Temperature hinzu. Sein Wert ist ein Wert-aus-Schlüssel-Block mit dem Schlüssel temp, der aus einem Objekt liest. Dieses Objekt kommt von einem Wert-aus-Schlüssel-Block mit dem Schlüssel main, der aus dem Objekt der Variablen WeatherData liest.

Schritt 4: Zeige das Ergebnis. Füge eine Nachricht hinzu: einen Verbinden-Block mit dem Text Es sind, der Variablen Temperature und dem Text Grad in Amsterdam.

Prüfe es: drücke auf Ausführen. Die Nachricht zeigt die Temperatur. Fehlt der Schlüssel, sagt dir der Lauf, welches Geheimnis du hinzufügen musst.

Probiere danach: ändere die Stadt in der Adresse und lies die Luftfeuchtigkeit aus derselben Antwort.`,

  'example-expert-mood-analyst': `Was du baust: ein kleines Statistikprogramm in einem Arbeitsbereich. Es liest eine Liste mit Befindenswerten, berechnet den Mittelwert, den besten und den schlechtesten Tag mit den Listenblöcken, zählt die schlechten Tage mit einer Funktion, die jedem Tag ein Urteil gibt, und zeigt die Ergebnisse. Die Namen von Funktionen und Variablen sind englisch, wie sie in den Blöcken stehen.

Was du brauchst: nichts. Die Liste der Befindenswerte steht im Beispiel, damit du jeden Schritt siehst. Später kannst du sie durch deine eigenen Notizen ersetzen.

Schritt 1: Definiere die Funktion verdict. Ziehe aus der Gruppe Funktionen eine Funktion mit Ergebnis, nenne sie verdict und gib ihr den Parameter score. Setze zwei Wenn-Rückgabe-Blöcke hinein: bei score 7 oder mehr gibst du den Text good zurück; bei 5 oder mehr den Text okay. Der Rückgabe-Block am Ende liefert den Text low.

Schritt 2: Definiere die Funktion meanOf. Füge eine zweite Funktion mit Ergebnis hinzu, mit dem Parameter values. Das Ergebnis ist die Option Durchschnitt (AVERAGE) des Listen-Rechenblocks, mit values als Liste.

Schritt 3: Lies die Befindenswerte. Setze im Zeitplan die Variable moods auf einen Teilen-Block. Die Eingabe ist der Text 6,7,4,8,5,9,7, das Trennzeichen ist ein Komma. So wird der Text zu einer Liste.

Schritt 4: Berechne die Zahlen. Setze mean auf einen Aufruf von meanOf mit moods. Setze best und worst auf die Optionen Maximum und Minimum des Listen-Rechenblocks über moods.

Schritt 5: Zähle die schlechten Tage. Setze lowDays auf 0. Füge eine Für-jedes-Schleife über moods hinzu, mit der Variablen day. Setze darin einen Wenn-Block: ist verdict von day gleich dem Text low, ändere lowDays um 1.

Schritt 6: Zeige die Ergebnisse. Füge eine Nachricht hinzu, die mean, best, worst und lowDays verbindet. Füge eine Konsolenzeile hinzu, die das Urteil über mean zeigt.

Prüfe es: drücke auf Ausführen. Die Nachricht gibt die Zahlen, die Konsole das Urteil. Ändere die Liste der Befindenswerte, und das Urteil und die Zählung ändern sich mit.

Probiere danach: ändere die Grenzen in verdict, oder zeige ein Urteil für jeden Tag in der Konsole.`,

  'example-expert-habit-engine': `Was du baust: eine Gewohnheits-Engine, die ihren Zustand zwischen den Läufen behält. Jeden Morgen schaut sie auf gestern: wurde die Gewohnheit erledigt, steigt die Serie streak um eins; wenn nicht, springt sie auf null zurück. Sie feiert eine Woche und zeigt die Serie auf einem Widget.

Was du brauchst: einen Tracker #habit in Nomie, protokolliert an den Tagen, an denen du die Gewohnheit ausübst. Die Serie beginnt beim ersten Mal bei null.

Schritt 1: Lege den Zeitplan fest. Füge den Zeitplan aus der Nomie-Gruppe hinzu und wähle im Reiter Details Täglich.

Schritt 2: Prüfe gestern. Setze in den Zeitplan einen Wenn-Block mit einem Sonst-Zweig. Die Bedingung ist ein Vergleich-Block: ein Tageswert-Block für #habit, der Tag yesterday und die Statistik sum, größer als 0.

Schritt 3: Aktualisiere die Serie. Setze im Wenn-Zweig einen Merken-Block mit dem Namen streak, und der Wert ist ein Abrufen-Block von streak mit Standard 0, plus 1. Setze im Sonst-Zweig einen Merken-Block mit dem Namen streak und der Zahl 0.

Schritt 4: Feiere eine Woche. Füge einen weiteren Wenn-Block hinzu: wenn ein Abrufen von streak mit Standard 0 gleich 7 ist, zeige eine Nachricht: A week in a row!

Schritt 5: Halte einen Rekord fest und zeige das Widget. Füge einen Wenn-Block hinzu: ist ein Abrufen von streak größer als ein Abrufen von best (Standard 0), merke dir best mit der Serie und zeige eine Nachricht: New record. Füge dann ein Dashboard mit dem Namen Habit und dem Flammen-Emoji hinzu. Setze darin zwei Wert-Blöcke: Best streak (das Abrufen von best) und Days in a row (das Abrufen von streak), einen Trend von #habit und eine Fußzeile.

Prüfe es: drücke auf Ausführen und öffne danach den Abschnitt Vorschau im Reiter Ausführen. Der erste Lauf zeigt null, weil noch nichts gemerkt wurde. Der Lauf von morgen zählt von heute weiter.

Probiere danach: ändere den Meilenstein auf 30 Tage, und zeige eine andere Nachricht nach dem ersten Tag einer neuen Serie.`,

  'example-expert-budget-ledger': `Was du baust: ein Budgetbuch. Es hält eine Liste von Buchungen als Objekte, summiert die Kosten mit einer Funktion, warnt, wenn du über dem Budget liegst, liest fehlerhafte Daten sicher mit Versuch und Abfangen, und zeigt die Ausgaben auf einem Widget. Die Namen von Funktionen und Variablen sind englisch, wie sie in den Blöcken stehen.

Was du brauchst: nichts. Die Buchungen stehen im Beispiel, damit du jeden Schritt siehst. Später kannst du sie ändern oder aus einem Webdienst lesen.

Schritt 1: Definiere die Kostenfunktion. Füge in der Gruppe Funktionen eine Funktion mit Ergebnis hinzu, mit dem Namen costOf und dem Parameter entry. Das Ergebnis ist ein Objekt-Abrufen-Block für das Feld cost von entry.

Schritt 2: Beginne den Tag. Setze im Zeitplan budget auf 20 und spent auf 0.

Schritt 3: Erstelle das Buch. Setze ledger auf einen Liste-erstellen-Block mit drei Buchungen. Jede Buchung ist ein Objekt-erstellen-Block mit zwei Feldern: item und cost. Nimm coffee mit 3, lunch mit 9 und books mit 12.

Schritt 4: Addiere die Buchungen. Füge eine Für-jedes-Schleife über ledger hinzu, mit der Variablen entry. Ändere darin spent um das Ergebnis von costOf mit entry. Zeige danach eine Zeile: das Feld item der Buchung, einen Doppelpunkt und das Ergebnis von costOf.

Schritt 5: Warne bei Überschreitung. Füge einen Wenn-Block hinzu: ist spent größer als budget, zeige eine Nachricht, die Over budget by mit spent minus budget verbindet.

Schritt 6: Lies fehlerhafte Daten sicher. Füge einen Versuch-und-Abfangen-Block hinzu. Im Versuch liest du einen Text, der kein gültiges JSON ist, etwa {not json, mit einem JSON-Text-zu-Objekt-Block. Im Abfangen zeigst du eine Nachricht mit dem Fehler. Füge eine abschließende Zeile hinzu.

Schritt 7: Zeige das Widget. Füge ein Dashboard mit dem Namen Budget hinzu. Setze darin einen Wert-Block für spent und einen HTML-Block mit dem Text Spent {{spent}} of {{budget}}, mit zwei Parametern.

Prüfe es: drücke auf Ausführen. Die Konsole listet die Buchungen auf, die Nachricht meldet die Überschreitung, und der Versuch-Block meldet die fehlerhaften Daten, ohne den Lauf zu stoppen.

Probiere danach: setze das Budget auf 15, dann verschwindet die Meldung zur Überschreitung.`,

  'example-expert-command-interpreter': `Was du baust: einen kleinen Befehlsinterpreter. Er liest eine Liste von Befehlen, führt jeden Befehl über eine Funktion mit einer Wenn-Kette aus, und behält einen Zähler zwischen den Läufen. Unbekannte Befehle werden gemeldet, nicht übergangen. Die Befehlswörter selbst (up, down, reset, show) sind englisch, wie im Block.

Was du brauchst: nichts. Die Befehle stehen im Beispiel, du kannst sie also ändern und erneut ausführen.

Schritt 1: Definiere die Funktion runCommand. Ziehe aus der Gruppe Funktionen eine Funktion ohne Ergebnis, nenne sie runCommand und gib ihr den Parameter command. Setze einen Wenn-Block hinein mit drei Sonst-Wenn-Zweigen und einem Sonst-Zweig: bei up erhöht counter um 1; bei down verringert es um 1; bei reset setzt es counter auf 0; bei show zeigt es den Text Counter is und den Zähler. Der Sonst-Zweig meldet Unknown command und den Befehl.

Schritt 2: Lade den Zähler. Setze im Zeitplan counter auf einen Abrufen-Block von counter mit Standard 0. Dieser Wert stammt aus früheren Läufen.

Schritt 3: Teile die Befehle. Setze commands auf einen Teilen-Block über den Text up,up,down,show,reset,up,bogus,show, mit einem Komma als Trennzeichen.

Schritt 4: Führe jeden Befehl aus. Füge eine Für-jedes-Schleife über commands hinzu, mit der Variablen command. Rufe darin runCommand mit command auf.

Schritt 5: Bewahre den Zähler. Füge nach der Schleife einen Merken-Block mit dem Namen counter hinzu, mit dem Wert der Variablen counter.

Schritt 6: Zeige das Widget. Füge ein Dashboard mit dem Namen Counter hinzu, mit einem Wert-Block für den Zähler und einer Fußzeile.

Prüfe es: drücke auf Ausführen. Die Konsole zeigt den Zähler nach den show-Befehlen, und der unbekannte Befehl bogus wird gemeldet. Führe es erneut aus: der Zähler beginnt dort, wo der letzte Lauf aufgehört hat.

Probiere danach: füge einen Befehl double hinzu, der den Zähler mit 2 multipliziert, als weiteren Sonst-Wenn-Zweig.`,
};
