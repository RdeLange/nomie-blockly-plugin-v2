// De lessen van de voorbeeldbibliotheek, in het Nederlands (het tabblad Uitgebreid van elk voorbeeld). Elke les zegt wat
// het voorbeeld bouwt, wat je eerst nodig hebt, en daarna de stappen, met de precieze blokken en waar je ze vindt. De
// sleutels zijn de namen van de voorbeelden.
export const TUTORIAL_NL: Record<string, string> = {
  'example-hello': `Wat je bouwt: een werkruimte die twee regels naar de console schrijft, en één melding van Nomie.

Stap 1: Open de Nomie-groep. Open in de blokkenlade links de Nomie-groep. Zoek het Planner-blok en sleep het naar het lege canvas.

Stap 2: Voeg de consoleregel toe. Open het onderdeel Schrijf en toon en sleep een consoleblok in de Planner, in het script. De Planner is het deel dat draait, dus elk blok dat je wilt laten draaien, staat erin.

Stap 3: Geef de regel tekst. Open de groep Tekst en sleep een tekstblok in de Value van het consoleblok. Klik op de tekst en typ: Hallo vanuit de console.

Stap 4: Voeg een tweede regel toe. Sleep nog een consoleblok onder de eerste, en steek er een tekstblok in met de tekst Hallo vanuit de browserconsole. De console toont de regels in de volgorde waarin ze staan.

Stap 5: Toon een melding van Nomie. Sleep een berichtblok onder de tweede regel en geef het een tekstblok met Hallo vanuit een melding.

Controleer: druk op Uitvoeren. Het tabblad Console in het paneel toont de twee regels, na elkaar. De melding verschijnt als bericht van Nomie.

Probeer daarna: verander de teksten en laat de werkruimte opnieuw draaien. Let erop dat de console alleen de regels van de laatste run bewaart.`,

  'example-yesterday-mood': `Wat je bouwt: één zin die het gemiddelde humeur van gisteren vertelt, gelezen uit je notities.

Wat je nodig hebt: een tracker in Nomie die #mood heet, met een paar notities van gisteren. Zonder notities toont de zin een nul, en dat klopt.

Stap 1: Voeg de Planner toe. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Voeg een bericht toe. Zet een berichtblok uit de Nomie-groep in de Planner. Het bericht is wat Nomie je toont als de run klaar is.

Stap 3: Voeg twee delen samen. Sleep een samenvoegblok in het bericht. Een samenvoegblok plakt teksten en waarden achter elkaar, en het heeft zoveel invoer als je nodig hebt. Met het tandwiel op het blok voeg je een derde invoer toe als je wilt.

Stap 4: Schrijf het eerste deel. Steek een tekstblok in de eerste invoer van het samenvoegblok, en typ: Je gemiddelde humeur gisteren was.

Stap 5: Lees de waarde. Sleep een dagwaarde-blok in de tweede invoer. Vul de drie invoeren in: een trackerblok met #mood in Tracker, een dagkiezer met gisteren in Dag, en een statistiekkiezer met gemiddelde in Statistiek.

Controleer: druk op Uitvoeren. Het bericht toont je zin met het getal. Zet de dagkiezer op vandaag en voer opnieuw uit.

Probeer daarna: voeg een tekstblok met een punt aan het eind toe, of gebruik het rondblok uit de groep Wiskunde om de decimalen weg te halen.`,

  'example-mood-period': `Wat je bouwt: een zin met het gemiddelde humeur van de laatste 30 dagen, afgerond op een heel getal.

Stap 1: Begin vanuit het voorbeeld van gisteren. Heb je het, kopieer dan de Planner met het bericht. Heb je het niet, voeg dan een Planner en een bericht toe uit de Nomie-groep.

Stap 2: Voeg een periodewaarde toe. Zoek het periodewaarde-blok in de Nomie-groep. Het werkt als het dagwaarde-blok, maar het beslaat een reeks dagen. Zet het in het samenvoegblok van het bericht.

Stap 3: Kies de tracker en de periode. Steek een trackerblok met #mood in Trackable. Steek een periodekiezer in Periode en kies Laatste 30 dagen. Steek een statistiekkiezer in Statistiek en kies gemiddelde.

Stap 4: Rond het getal af. Sleep een rondblok uit de groep Wiskunde en zet de periodewaarde in de getalinvoer. Laat de optie zoals die is: die haalt de decimalen weg.

Stap 5: Schrijf de zin. Zet een tekstblok voor het rondblok met: Je gemiddelde humeur over de laatste 30 dagen is.

Controleer: druk op Uitvoeren. Het bericht toont de zin met een heel getal aan het eind.

Probeer daarna: zet de periodekiezer op Laatste 7 dagen, dan verandert de zin mee. Zo maak je samenvattingen per week of per maand: verander de periode en de statistiek, en dezelfde blokken beantwoorden een andere vraag.`,

  'example-log-value': `Wat je bouwt: een notitie in je Nomie-tijdlijn voor elke dag dat de werkruimte draait, met een waarde voor de tracker #goodday.

Wat je nodig hebt: een dagelijkse planning. Dit voorbeeld schrijft naar je notities, dus je test het eerst.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas. Kies in het tabblad Details Dagelijks. De werkruimte draait dan één keer per dag.

Stap 2: Voeg het blok waarde loggen toe. Sleep het blok waarde loggen uit de Nomie-groep in de Planner.

Stap 3: Geef het een waarde. Sleep een getalblok in de invoer Value en typ 1.

Stap 4: Kies de tracker. Sleep een trackerblok in de invoer Tracker en typ #goodday. Nomie maakt de tracker aan als die nog niet bestaat.

Stap 5: Kies de dag. Sleep een dagkiezer in de invoer Datum en kies vandaag.

Stap 6: Test het eerst. Zet in het tabblad Uitvoeren de schakelaar Testmodus aan. Druk op Uitvoeren. De console toont de regel Zou loggen, met de dag, en er wordt geen notitie opgeslagen.

Controleer: zet de schakelaar Testmodus uit en druk op Uitvoeren. Dan staat er voor vandaag een notitie met #goodday(1) in je tijdlijn.

Probeer daarna: gebruik een tekstblok en een samenvoegblok om de dag ook in het bericht te zetten, of gebruik de knop Gisteren om te zien hoe een run voor gisteren werkt.`,

  'example-wait': `Wat je bouwt: twee consoleregels, met een pauze van één seconde ertussen.

Stap 1: Voeg de Planner toe. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Voeg de eerste regel toe. Sleep in de Planner een consoleblok uit het onderdeel Schrijf en toon, en steek er een tekstblok in: Eerste regel.

Stap 3: Voeg de pauze toe. Sleep het wachtblok onder de eerste regel (typ wacht in het zoekveld boven de lade om het te vinden). Zet de seconden op 1.

Stap 4: Voeg de tweede regel toe. Zet onder het wachtblok nog een consoleblok met de tekst: Tweede regel, één seconde later.

Controleer: druk op Uitvoeren. De console toont de eerste regel, en de tweede verschijnt een seconde later. De run wacht tijdens de pauze, en je ziet dat in de status boven het canvas.

Probeer daarna: zet de pauze op 3 seconden. Gebruik pauzes spaarzaam: elke seconde telt mee in de tijd die een run mag duren, en een run stopt na vijf minuten.`,

  'example-pickers': `Wat je bouwt: één bericht dat laat zien wat elke kiezer kiest, zodat je de waarden ziet voordat je ze gebruikt.

Wat je nodig hebt: niets anders. De kiezers zijn de kleine blokken die een waarde kiezen: een tracker, een dag, een periode, een statistiek en een datum.

Stap 1: Voeg de Planner en een bericht toe. Sleep de Planner uit de Nomie-groep naar het canvas, en zet een berichtblok erin.

Stap 2: Voeg een samenvoegblok toe. Sleep een samenvoegblok in het bericht. Daar vul je straks teksten en kiezers in, na elkaar.

Stap 3: Voeg de tracker toe. Zet een tekstblok met Tracker: erin, en sleep daarnaast een trackerblok met #mood.

Stap 4: Voeg de dag en de periode toe. Voeg een tekst toe met | Dag: , daarna een dagkiezer op gisteren. Voeg de tekst | Periode: toe, en daarna een periodekiezer op Laatste 7 dagen.

Stap 5: Voeg de statistiek en de datum toe. Voeg de tekst | Statistiek: toe en een statistiekkiezer op gemiddelde. Sluit af met | Datum: en een datumkiezer, waarin je een datum typt, zoals 2026-11-01.

Controleer: druk op Uitvoeren. Het bericht noemt elke kiezer met zijn waarde.

Probeer daarna: wijzig een kiezer in het keuzemenu en voer opnieuw uit. Elk blok dat notities leest of schrijft, neemt zijn tracker, dag of periode uit zulke kiezers.`,

  'example-history': `Wat je bouwt: twee regels uit je notities. De eerste geeft je laatste humeurwaarde van de laatste 14 dagen. De tweede telt de dagen sinds #mood voor het laatst is gelogd.

Wat je nodig hebt: een tracker #mood in Nomie, met een paar notities. De geschiedenis kijkt terug in je notities, dus een nieuw account toont nog niets.

Stap 1: Voeg de Planner toe. Sleep hem uit de Nomie-groep naar het canvas, en zet hem in het tabblad Details op dagelijks.

Stap 2: Voeg de laatste waarde toe. Zet in de Planner een bericht. Sleep in het samenvoegblok van het bericht een laatste-waarde-blok uit de Nomie-groep. Steek #mood in de invoer Tracker, en zet het aantal dagen op 14. Het blok zoekt de laatste notitie met die tracker in de laatste 14 dagen.

Stap 3: Schrijf de eerste regel. Zet een tekstblok voor de laatste waarde, met de woorden: Laatste humeur:.

Stap 4: Voeg de tweede regel toe. Zet onder het bericht een tweede bericht. Sleep een blok dagen sinds in het samenvoegblok, met een trackerblok #mood in de invoer.

Stap 5: Schrijf de tekst ervoor. Zet voor het blok dagen sinds een tekstblok met de woorden: Dagen sinds #mood is gelogd:.

Controleer: druk op Uitvoeren. Beide berichten komen uit dezelfde notities, dus ze kloppen met elkaar. Zonder notities is de eerste regel leeg, en telt de tweede vanaf nul.

Probeer daarna: zet de 14 op 60 dagen, en kijk hoe de laatste waarde verandert.`,

  'example-streak': `Wat je bouwt: een reeksteller. Die toont hoeveel dagen op rij een tracker is gelogd, en feliciteert je als de reeks drie dagen of meer is.

Wat je nodig hebt: een tracker #habit in Nomie, gelogd op een paar dagen.

Stap 1: Voeg de Planner en een bericht toe. Sleep de Planner uit de Nomie-groep naar het canvas, en zet er een bericht in.

Stap 2: Voeg een als-blok toe. Sleep een als-blok uit de groep Logica in de Planner, boven het bericht.

Stap 3: Bouw de voorwaarde. Sleep een vergelijkingsblok uit de groep Logica in de invoer van het als-blok. Zet het reeksblok uit de Nomie-groep links, en een getalblok met 3 rechts. Kies de operator groter dan of gelijk aan.

Stap 4: Kies de tracker. Steek een trackerblok met #habit in het reeksblok. Lees de tooltip: het reeksblok telt maximaal 60 dagen, tot en met de dag van de run.

Stap 5: Voeg de twee berichten toe. Zet in het als-blok een bericht met: Drie dagen op rij, goed gedaan! Klik op het tandwiel van het als-blok, voeg een anders-tak toe, en zet daar een bericht in met: Blijf doorgaan.

Controleer: druk op Uitvoeren. Zonder reeks verschijnt het anders-bericht. Probeer het met notities op drie dagen op rij om het eerste bericht te zien.

Probeer daarna: verander het getal 3 in 7, en maak er een weekdoel van.`,

  'example-write-note': `Wat je bouwt: een vrije notitie in je Nomie-tijdlijn, geschreven voor gisteren. Zo schrijf je een samenvatting of een herinnering.

Wat je nodig hebt: een dagelijkse planning. Dit voorbeeld schrijft naar je notities, dus je test het eerst.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas, en kies Dagelijks in het tabblad Details.

Stap 2: Voeg het blok notitie loggen toe. Sleep het blok notitie loggen uit de Nomie-groep in de Planner.

Stap 3: Schrijf de tekst. Steek een tekstblok in de invoer Tekst van de notitie, met de woorden: Week besproken #review. Het hekje zorgt dat Nomie de tracker #review aanmaakt als die nog niet bestaat.

Stap 4: Kies de dag. Steek een dagkiezer in de invoer Datum en kies gisteren. De notitie wordt voor gisteren geschreven.

Stap 5: Test het eerst. Zet in het tabblad Uitvoeren de schakelaar Testmodus aan en druk op Uitvoeren. De console toont de notitie die hij zou schrijven, en er wordt niets opgeslagen.

Controleer: zet de schakelaar Testmodus uit en druk op Uitvoeren. De notitie staat voor gisteren in je tijdlijn, met de review-tag.

Probeer daarna: schrijf een wekelijkse samenvatting met een samenvoegblok en een periodewaarde-blok, zodat de notitie je het gemiddelde van de week vertelt.`,

  'example-location': `Wat je bouwt: een bericht met je positie, of een duidelijk bericht als de positie niet bekend is.

Wat je nodig hebt: locatietoestemming voor Nomie. Nomie vraagt de eerste keer om toestemming, en je kunt die later wijzigen in de instellingen van je apparaat.

Stap 1: Voeg de Planner en een bericht toe. Sleep de Planner uit de Nomie-groep naar het canvas, en zet er een bericht in.

Stap 2: Voeg het blok mijn locatie toe. Sleep het uit de Nomie-groep in het bericht.

Stap 3: Zet er tekst voor. Zet een samenvoegblok in het bericht, met een tekstblok met de woorden: Je bent op, en het blok mijn locatie erachter.

Stap 4: Probeer het. Zet in het tabblad Uitvoeren de schakelaar Testmodus aan en druk op Uitvoeren. Nomie vraagt de eerste keer om toestemming: geef die.

Controleer: het bericht toont een breedtegraad en een lengtegraad. Verschijnt er niets, dan was de positie niet beschikbaar. Daarom moet elk gebruik van mijn locatie een vangnet hebben, zoals een tekst die zegt dat de positie onbekend is.

Probeer daarna: voeg een als-blok toe dat controleert of het resultaat leeg is, en toon in de anders-tak een tekst.`,

  'example-open-link': `Wat je bouwt: een blok dat een webpagina opent in Nomie, zoals een eigen dashboard.

Stap 1: Voeg de Planner toe. Sleep hem uit de Nomie-groep naar het canvas.

Stap 2: Voeg het blok link openen toe. Sleep het uit de Nomie-groep in de Planner.

Stap 3: Geef het een adres. Steek een tekstblok in de invoer van de link, met het volledige adres van de pagina, beginnend met https.

Stap 4: Test het. Druk vanuit de editor op Uitvoeren. Bij een handmatige run opent de pagina in een venster binnen Nomie.

Controleer: het venster opent met de pagina. Draai je de werkruimte volgens een planning, dan schrijft het blok alleen Zou openen naar de uitvoer. Een planning opent dus nooit een venster.

Probeer daarna: houd het adres in een geheim of een tekst die je kunt wijzigen, en gebruik alleen adressen die je vertrouwt. Een werkruimte die met iemand anders wordt gedeeld, draait hetzelfde adres op zijn apparaat.`,

  'example-fetch-page': `Wat je bouwt: een aanroep van een webadres, met het antwoord in de console.

Wat je nodig hebt: een internetverbinding, en een adres dat je vertrouwt. Het voorbeeld gebruikt een openbaar adres. Een gedeelde werkruimte draait de adressen op het apparaat van wie hem toevoegt.

Stap 1: Voeg de Planner toe. Sleep hem uit de Nomie-groep naar het canvas.

Stap 2: Voeg het blok ophalen toe. Sleep het blok ophalen uit de Nomie-groep in de Planner.

Stap 3: Geef het een adres. Steek een tekstblok in de invoer van het adres, met een pagina die je vertrouwt. Begin met https.

Stap 4: Toon het antwoord. Sleep een consoleblok onder het ophaalblok, en steek het ophaalblok in de Value van het consoleblok.

Controleer: druk op Uitvoeren. De console toont het antwoord als tekst, vaak het begin van een webpagina of een lijst in JSON.

Probeer daarna: de meeste diensten antwoorden met JSON. De voorbeelden van objecten laten stap voor stap zien hoe je dat leest.`,

  'example-widget-value': `Wat je bouwt: een dashboardwidget met een getal, een kleine trend en een voettekst.

Wat je nodig hebt: niets bijzonders. De widget wordt bewaard na een run, dus je moet de werkruimte één keer laten draaien.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas, en kies Dagelijks in het tabblad Details.

Stap 2: Voeg het dashboardblok toe. Sleep het dashboardblok uit de Nomie-groep in de Planner. Geef het een naam, zoals Humeur, en een emoji, zoals een smiley. De naam en de emoji staan in de kop van de widget.

Stap 3: Voeg de waarde toe. Sleep in het dashboard het waardeblok uit het gedeelte Dashboardwidget. Zet er een periodewaarde-blok in, met de tracker #mood, de periode Laatste 7 dagen en de statistiek gemiddelde. Geef de waarde een label: Gemiddelde van 7 dagen.

Stap 4: Voeg de trend toe. Sleep onder de waarde het trendblok. Steek #mood erin, en geef het het label Laatste 14 dagen.

Stap 5: Voeg de voettekst toe. Sleep als laatste het voettekstblok en typ: Elke ochtend bijgewerkt.

Controleer: druk één keer op Uitvoeren. Open daarna het gedeelte Voorbeeld onderaan het tabblad Uitvoeren. Het toont de widget zoals het dashboard hem laat zien. Een voorbeeld is een testrun, dus er worden geen notities geschreven.

Probeer daarna: verander het label van de waarde of de periode, en bekijk het voorbeeld opnieuw.`,

  'example-widget-charts': `Wat je bouwt: een dashboard met twee grafieken van dezelfde tracker. De eerste is een lijngrafiek over 30 dagen, de tweede een staafgrafiek over 7 dagen.

Wat je nodig hebt: een tracker #mood in Nomie, met notities op een paar dagen, zodat de grafieken iets te tekenen hebben.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Voeg het dashboard toe. Sleep het dashboardblok in de Planner, geef het de naam Humeurgrafieken en een emoji, zoals een grafiek.

Stap 3: Voeg de lijngrafiek toe. Sleep in het dashboard het lijngrafiekblok uit het gedeelte Dashboardwidget. Steek #mood in de invoer Tracker. Zet de dagen op 30, de kleur op blauw en het label op Laatste 30 dagen.

Stap 4: Voeg de staafgrafiek toe. Sleep onder de lijngrafiek het staafgrafiekblok. Steek opnieuw #mood erin, zet de dagen op 7, de kleur op groen en het label op Laatste 7 dagen.

Stap 5: Bekijk het voorbeeld. Druk één keer op Uitvoeren, en open daarna het gedeelte Voorbeeld in het tabblad Uitvoeren.

Controleer: de lijn verbindt de dagen, en een dag zonder notitie is een gat. De staven laten één staaf zien per dag van de laatste 7. Beide komen uit dezelfde notities, op twee manieren getekend.

Probeer daarna: verander de kleur van de staven, en kijk hoe de widget eruitziet in jouw Nomie-thema.`,

  'example-widget-html': `Wat je bouwt: een dashboardwidget met je eigen HTML, gevuld met een waarde uit je notities.

Wat je nodig hebt: een tracker #mood met notities op een paar dagen, zodat er een waarde te tonen is.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Voeg het dashboard toe. Sleep een dashboardblok in de Planner en geef het de naam Humeur-HTML.

Stap 3: Voeg het HTML-blok toe. Sleep in het dashboard het HTML-blok uit het gedeelte Dashboardwidget. Typ in het tekstvak: <p>Gemiddeld humeur: <b>{{mood}}</b></p>. De plaatshouder {{mood}} wordt bij elke run vervangen door een waarde.

Stap 4: Voeg een parameter toe. Sleep onder het HTML-blok een parameterblok. De naam is mood, dezelfde als de plaatshouder. De waarde is een periodewaarde-blok met #mood, de periode Laatste 7 dagen en de statistiek gemiddelde.

Stap 5: Bekijk het voorbeeld. Druk één keer op Uitvoeren en open het gedeelte Voorbeeld in het tabblad Uitvoeren.

Controleer: de widget toont het gemiddelde humeur in vet. De HTML wordt opgeschoond voordat hij wordt getoond: scripts en links worden verwijderd, en afbeeldingen moeten van https komen.

Probeer daarna: voeg een tweede plaatshouder toe, zoals {{count}}, met een ander parameterblok dat de notities telt.`,

  'example-remember': `Wat je bouwt: een werkruimte die zijn eigen runs telt. Hij houdt de teller van de ene run naar de andere bij, en vergeet de teller bij de derde run.

Wat je nodig hebt: niets. Dit voorbeeld gebruikt alleen het geheugen van de werkruimte.

Stap 1: Voeg de Planner toe en zet hem op dagelijks. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Onthoud een nieuwe teller. Sleep in de Planner een onthouden-blok. Noem het runs. De waarde is een rekenblok met de optie optellen: links een ophalen-blok met de naam runs en standaard 0, rechts het getal 1.

Stap 3: Toon de teller. Zet daaronder een berichtblok met een samenvoegblok: de tekst Deze werkruimte is gedraaid, een ophalen-blok met de naam runs en standaard 0, en de tekst keer.

Stap 4: Vergeet bij de derde run. Voeg een als-blok toe. De voorwaarde is een vergelijkingsblok: het ophalen-blok met de naam runs is gelijk aan 3. Zet in het als-blok een vergeten-blok met de naam runs, en een bericht dat zegt dat de teller is vergeten.

Controleer: druk drie keer op Uitvoeren. De teller gaat 1, 2, 3, en bij de derde run zegt het bericht dat de teller is vergeten. De volgende run begint weer bij 0.

Probeer daarna: verander het getal 3 in 5, om een langere reeks te onthouden.`,

  'example-secret': `Wat je bouwt: een werkruimte die een sleutel uit Instellingen gebruikt, zonder de sleutel in de blokken te zetten.

Wat je nodig hebt: een geheim dat EXAMPLE_KEY heet, in Instellingen. Open Instellingen in de plugin, en voeg het geheim toe met die naam en je sleutel.

Stap 1: Zet de sleutel in Instellingen. Open Instellingen en voeg een geheim toe dat EXAMPLE_KEY heet. De sleutel zelf wordt nooit in de blokken getoond.

Stap 2: Voeg de Planner toe. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 3: Voeg het geheimblok toe. Zet een bericht in de Planner. Sleep een geheimblok uit de Nomie-groep erin, en kies EXAMPLE_KEY.

Stap 4: Draai het. Druk op Uitvoeren. Het bericht toont het geheim als vier puntjes, zodat de sleutel nooit in de uitvoer staat.

Controleer: ontbreekt het geheim, dan stopt de run en vertelt hij welk geheim je moet toevoegen. Test dat door het geheim in Instellingen te hernoemen en opnieuw uit te voeren.

Probeer daarna: gebruik het geheim in een webadres, met een samenvoegblok. Gedeelde bestanden bevatten nooit je sleutel, dus je kunt de werkruimte veilig naar iemand anders sturen.`,

  'example-when-note': `Wat je bouwt: een werkruimte die draait wanneer een notitie met een bepaalde tracker wordt opgeslagen, in plaats van volgens een planning.

Wat je nodig hebt: een tracker #run in Nomie. Elke notitie met die tracker start de werkruimte.

Stap 1: Voeg het blok wanneer er een notitie is toe. Sleep het uit de Nomie-groep naar het canvas, en typ de tracker #run in het veld.

Stap 2: Voeg een bericht toe. Zet in het blok wanneer er een notitie is een berichtblok uit de Nomie-groep.

Stap 3: Lees de notitie. Zet in het bericht drie blokken uit de Nomie-groep aan elkaar: een notitiewaarde-blok met #mood, een notitietekst-blok en een notitiedag-blok. Zet een tekst ervoor, zodat het bericht duidelijk is.

Stap 4: Probeer het. Schrijf in Nomie een notitie met #run en #mood(4). Sla hem op.

Controleer: Nomie draait de werkruimte, en het bericht toont de moodwaarde 4, de tekst van de notitie en de dag. Buiten een notitierun geven deze blokken niets, en de controle vóór het draaien laat je dat weten.

Probeer daarna: voeg een als-blok toe dat de moodwaarde controleert, en toon een ander bericht als die lager is dan 3.`,

  'example-loop-days': `Wat je bouwt: lussen in twee vormen. Een herhalen-blok voert zijn blokken een vast aantal keren uit, en een voor-blok telt met een variabele.

Stap 1: Voeg de Planner toe. Sleep de Planner uit de Nomie-groep naar het canvas.

Stap 2: Voeg een herhalen-blok toe. Sleep uit de groep Lussen een herhalen-blok in de Planner. Zet het aantal keer op 3. Zet er in een consoleblok met de tekst Herhaald.

Stap 3: Voeg een voor-blok toe. Sleep onder het herhalen-blok een voor-blok uit de groep Lussen. De variabele is i, het begin is 1, het einde is 5 en de stap is 1.

Stap 4: Toon de teller. Zet in het voor-blok een bericht: een tekstblok met Stap en de variabele i uit de groep Variabelen, samengevoegd.

Controleer: druk op Uitvoeren. De console toont drie keer Herhaald, en daarna vijf regels, Stap 1 tot en met Stap 5. Met lussen dekt een werkruimte in één run veel dagen of notities.

Probeer daarna: zet het einde van het voor-blok op 30, en tel dagen met een dagelijkse planning.`,

  'example-while-break': `Wat je bouwt: een teller die herhaalt zolang een voorwaarde waar is, en vroeg stopt met een onderbreking.

Stap 1: Zet de variabele. Voeg een zet-blok uit de groep Variabelen toe, met de variabele n en het getal 0.

Stap 2: Voeg een zolang-lus toe. Sleep een zolang-lus uit de groep Lussen onder het zet-blok. Houd hem op zolang, en bouw de voorwaarde met een vergelijkingsblok: n kleiner dan 10.

Stap 3: Voeg het als-blok in de lus toe. Sleep in de zolang-lus een als-blok. De voorwaarde is een vergelijkingsblok: n gelijk aan 4.

Stap 4: Stop de lus. Zet in het als-blok een onderbrekingsblok uit de groep Lussen.

Stap 5: Toon en tel. Zet onder het als-blok, in de lus, een consoleblok met n, en een verander-blok dat 1 bij n optelt.

Controleer: druk op Uitvoeren. De console toont de getallen 0 tot en met 3, en daarna stopt de lus bij 4.

Probeer daarna: zet de onderbreking bij een ander getal. Let erop dat je de variabele in de lus verandert, anders stopt de lus nooit. De run stopt ook na een zeer groot aantal stappen, zodat hij niet eeuwig kan blijven hangen.`,

  'example-list-loop': `Wat je bouwt: een voor-elk-lus die één voor één door een lijst van drie dagen gaat.

Stap 1: Voeg het voor-elk-blok toe. Sleep uit de groep Lussen een voor-elk-blok naar het canvas. Zet de variabele op item.

Stap 2: Maak de lijst. Sleep een lijst-maken-blok uit de groep Lijsten in de lijstinvoer van het voor-elk-blok. Voeg er drie tekstblokken aan toe met de woorden Maandag, Dinsdag en Woensdag. Gebruik het tandwiel van het lijstblok om de invoeren toe te voegen.

Stap 3: Toon elk item. Zet in het voor-elk-blok een consoleblok, en steek de variabele item erin.

Controleer: druk op Uitvoeren. De console toont de drie items in de volgorde van de lijst.

Probeer daarna: zet een lijst met getallen in de lijst, en tel ze op met een somblok uit de groep Wiskunde.`,

  'example-decide': `Wat je bouwt: een beslissing met een als-blok, een anders-tak en logicablokken, plus een ternair blok dat in één regel een waarde kiest.

Stap 1: Voeg het als-blok toe. Sleep een als-blok uit de groep Logica naar het canvas, en klik op het tandwiel om een anders-tak toe te voegen.

Stap 2: Bouw de voorwaarde. Sleep een en-blok in de invoer van het als-blok. Zet links daarin een vergelijkingsblok: 3 kleiner dan 5. Zet rechts een niet-blok, met daarin een vergelijkingsblok: 2 groter dan 7.

Stap 3: Voeg de twee berichten toe. Zet in het als-blok een bericht met Beide zijn waar. Zet in de anders-tak een bericht met Iets klopt niet.

Stap 4: Kies een waarde in één regel. Sleep onder het als-blok een ternair blok in een consoleblok. De voorwaarde is het waar-blok, het dan-deel is ja en het anders-deel is nee.

Controleer: druk op Uitvoeren. Het eerste bericht toont de anders-tekst, omdat het niet-blok de voorwaarde onwaar maakt. Verander de getallen in de vergelijkingsblokken en voer opnieuw uit om beide takken te zien.

Probeer daarna: voeg een tweede vergelijkingsblok toe aan de en, en gebruik een of-blok voor een andere voorwaarde.`,

  'example-numbers': `Wat je bouwt: een kleine rekenmachine. Elke regel van de console toont een van de rekenblokken aan het werk.

Stap 1: Voeg een consoleblok toe voor elke som. Sleep een consoleblok uit het onderdeel Schrijf en toon naar het canvas, en zet er een rekenblok in: 2 plus 3.

Stap 2: Voeg meer bewerkingen toe. Zet meer consoleblokken neer, elk met één blok uit de groep Wiskunde: een vermenigvuldigblok, een wortelblok, een sinusblok uit het goniometrieblok, en de constante pi.

Stap 3: Controleer of een getal even is. Voeg een getalseigenschap-blok toe met de optie even, en een getalblok met 4.

Stap 4: Voeg een rest toe. Gebruik het restblok om de rest van 17 gedeeld door 5 te berekenen.

Controleer: druk op Uitvoeren. Elke regel toont zijn uitkomst. Lees de labels in de console om elke regel aan zijn blok te koppelen.

Probeer daarna: zet de uitkomsten in variabelen, en combineer ze in één bericht.`,

  'example-random-average': `Wat je bouwt: een reeks waarden die bij elke run verandert: willekeurige getallen, een afgerond getal, het gemiddelde van een lijst en een begrensde waarde.

Stap 1: Voeg de willekeurige blokken toe. Sleep een willekeurig geheel getal-blok uit de groep Wiskunde in een consoleblok. Zet de grenzen op 1 en 10. Voeg daarna een willekeurige breuk-blok toe, dat een getal tussen 0 en 1 geeft.

Stap 2: Rond naar boven af. Zet een rondblok met de optie naar boven afronden om een getalblok, en toon het.

Stap 3: Vind het gemiddelde van een lijst. Gebruik een lijst met getallen in een lijst-maken-blok, en de optie gemiddelde van het lijst-rekenblok.

Stap 4: Houd een waarde binnen het bereik. Gebruik een beperken-blok met de waarde 15, de ondergrens 0 en de bovengrens 10. De uitkomst is 10.

Controleer: draai de werkruimte meerdere keren. De willekeurige waarden veranderen elke keer, de rest blijft gelijk.

Probeer daarna: gebruik het willekeurig geheel getal-blok om een dag uit een lijst te kiezen, met de index van de lijst.`,

  'example-text-tools': `Wat je bouwt: een reeks tekstblokken aan het werk. Elk resultaat gaat op een eigen regel naar de console.

Stap 1: Voeg de lengte toe. Sleep een lengte-blok uit de groep Tekst in een consoleblok, en zet er een tekstblok in met het woord Nomie.

Stap 2: Verander de hoofdletters. Voeg een blok voor hoofdletters en een tekstblok toe. Kies hoofdletters.

Stap 3: Haal de spaties weg. Voeg een blok voor trimmen toe met een tekst die spaties aan beide kanten heeft.

Stap 4: Zoek een woord. Voeg een blok zoek-positie toe dat de positie van het woord blauw in een tekst zoekt.

Stap 5: Neem een deel. Voeg een blok deeltekst toe dat de eerste vijf letters van een tekst uitknipt.

Controleer: druk op Uitvoeren. Elke regel toont zijn resultaat. Vergelijk elk blok met de regel die het maakt.

Probeer daarna: voeg twee teksten samen met een samenvoegblok, en toon de lengte van het resultaat.`,

  'example-lists': `Wat je bouwt: een lijst, en de lijstblokken die erop werken: de lengte, een controle op leeg, de positie van een item, het item op een positie, een wijziging, en sorteren.

Stap 1: Voeg de lengte toe. Sleep een lengte-blok uit de groep Lijsten in een consoleblok, en zet er een lijst-maken-blok in met de teksten a, b en c.

Stap 2: Controleer of hij leeg is. Voeg een leeg-blok toe met een lege lijst-maken-blok, en toon het resultaat.

Stap 3: Zoek een positie. Voeg een positie-zoeken-blok toe dat de eerste b vindt in een lijst van a en b.

Stap 4: Haal een item op. Voeg een item-ophalen-blok toe voor het eerste item, en een blok dat het item op positie 1 vanaf het einde haalt.

Stap 5: Verander een item. Zet de variabele dagen op een lijst met Ma en Di. Gebruik een item-zetten-blok om het eerste item te wijzigen in Zo, en toon daarna dagen.

Stap 6: Splits en sorteer. Splits de tekst ma,di,wo met een komma in een lijst, en sorteer een lijst met getallen 3, 1 en 2.

Controleer: druk op Uitvoeren. Elke stap toont zijn resultaat, zodat je ziet hoe de lijst op elk moment eruitziet.

Probeer daarna: zet de gesorteerde getallen in een bericht met een samenvoegblok.`,

  'example-functions': `Wat je bouwt: twee functies, de ene geeft een waarde terug en de andere doet iets. Een functie is een reeks blokken met een naam die je opnieuw kunt aanroepen.

Wat je nodig hebt: niets. Het voorbeeld is een compleet klein programma in één werkruimte.

Stap 1: Definieer de functie dubbel. Sleep in de groep Functies een functie met resultaat naar het canvas. Noem hem dubbel en voeg met het tandwiel een parameter n toe.

Stap 2: Voeg de vroege terugkeer toe. Zet in de functie een als-terug-blok. De voorwaarde is n kleiner dan 0, en de waarde is 0. Als n onder nul is, stopt de functie daar, en wordt de rest overgeslagen.

Stap 3: Geef het resultaat terug. Zet onder het als-terug-blok het terugkeer-blok, met de waarde n maal 2.

Stap 4: Definieer de functie groet. Sleep een functie zonder resultaat, noem hem groet, en voeg de parameter wie toe. Toon erin een bericht dat Hallo en wie samenvoegt.

Stap 5: Roep ze aan. Toon in de Planner, onder de definities, een aanroep van dubbel met het getal 21, en een aanroep van groet met de tekst Nomie.

Controleer: druk op Uitvoeren. De console toont 42, en daarna Hallo Nomie.

Probeer daarna: definieer een functie die dubbel aanroept, zodat de ene functie de andere gebruikt.`,

  'example-objects': `Wat je bouwt: een klein record, en de blokken die het lezen en wijzigen. Objecten bewaren benoemde velden, en de JSON-blokken lezen en schrijven tekst in dezelfde vorm.

Stap 1: Maak een object. Sleep in de groep Objecten een object-maken-blok op een consoleblok. Voeg met het tandwiel twee velden toe: temp, met het getal 18, en mood, met het getal 7.

Stap 2: Lees een veld. Voeg een ophalen-blok toe dat temp leest uit een object dat is gemaakt van JSON-tekst. Gebruik de tekst {"temp": 18, "mood": 7} in een blok van JSON-tekst naar object.

Stap 3: Toon de sleutels. Voeg een sleutels-blok toe op hetzelfde object, en toon het resultaat.

Stap 4: Lees een waarde uit JSON. Voeg een waarde-uit-sleutel-blok toe, met de sleutel mood en het object uit de JSON-tekst.

Stap 5: Schrijf JSON. Voeg een object-naar-JSON-blok toe dat een object weer in tekst zet.

Stap 6: Wijzig een veld. Gebruik het zet-blok met het veld mood en het getal 9.

Controleer: druk op Uitvoeren. Elke consoleregel toont zijn resultaat. Webdiensten antwoorden met JSON, dus dit is het patroon om hun antwoorden te lezen.

Probeer daarna: lees het humeur uit het object, en toon het in een zin.`,

  'example-try-catch': `Wat je bouwt: een blok dat slechte gegevens probeert te lezen, en de fout opvangt zonder dat de run stopt.

Stap 1: Voeg een probeer-blok toe. Sleep in de groep Geavanceerd een probeer-en-vang-blok naar het canvas. De parameter is error.

Stap 2: Zet een risicovol blok in probeer. Zet in probeer een consoleblok, met een blok van JSON-tekst naar object dat de tekst {niet json leest, die geen geldige JSON is.

Stap 3: Vang de fout op. Zet in vang een bericht: een samenvoegblok met de tekst Kon de gegevens niet lezen en de variabele error.

Stap 4: Voeg een afsluiting toe. Klik op het tandwiel van het blok en voeg een deel afsluitend toe. Zet er een consoleblok in met de tekst Hoe dan ook klaar.

Controleer: druk op Uitvoeren. Het probeer-deel mislukt, en het bericht toont de fout. De afsluitende regel loopt nog steeds. Zonder het probeer-blok zou de hele run stoppen bij de slechte gegevens.

Probeer daarna: gebruik hetzelfde patroon voor een webadres dat soms uitvalt, en toon in vang een vriendelijk bericht.`,

  'example-ask': `Wat je bouwt: een vraag die je om een woord vraagt, en je antwoord toont in een zin.

Wat je nodig hebt: niets. De vraag verschijnt als je de werkruimte met de hand draait. Een geplande run heeft niemand om te antwoorden, dus dit voorbeeld is voor testruns.

Stap 1: Voeg de Planner toe. Sleep hem uit de Nomie-groep naar het canvas.

Stap 2: Voeg een bericht toe. Sleep in de Planner een berichtblok uit de Nomie-groep.

Stap 3: Voeg het antwoord samen. Voeg in het bericht een samenvoegblok toe. Het eerste deel is een tekstblok: Je antwoord was.

Stap 4: Stel de vraag. Sleep een vraagblok uit de groep Tekst in het tweede deel van het samenvoegblok. Typ in de tekst: Wat is je humeurwoord?

Controleer: druk op Uitvoeren. Nomie toont de vraag. Typ een woord, en het bericht toont je antwoord.

Probeer daarna: vraag om een getal, en gebruik het getal in een berekening. Onthoud dat een vraag alleen werkt als iemand er is om te antwoorden.`,

  'example-keyword-statistics': `Wat je bouwt: het aantal notities dat een woord noemt in de laatste 30 dagen, en de som van hun waarden.

Wat je nodig hebt: notities in Nomie die het woord beweging noemen, zodat de antwoorden niet nul zijn.

Stap 1: Voeg de Planner en een bericht toe. Sleep de Planner uit de Nomie-groep naar het canvas, en zet er een bericht in.

Stap 2: Begin de zin. Zet in het bericht een samenvoegblok. Het eerste deel is een tekstblok: Gevonden 'beweging' in.

Stap 3: Voeg de periodewaarde toe. Sleep een periodewaarde-blok in het samenvoegblok. Het onderwerp is de tekst beweging, geen tracker, zodat het het woord in de notities zoekt. De periode is Laatste 30 dagen en de statistiek is aantal.

Stap 4: Maak de zin af. Zet na de periodewaarde de tekst notities in de laatste 30 dagen.

Stap 5: Voeg de som toe. Zet een tweede bericht met een periodewaarde-blok met de statistiek som. Dat telt de waarden op van de notities die het woord noemen.

Controleer: druk op Uitvoeren. Het eerste bericht toont hoeveel notities beweging noemen, en het tweede de som van hun waarden.

Probeer daarna: verander het woord, of zet de periode op Laatste 90 dagen. Dezelfde twee blokken beantwoorden dan een andere vraag.`,

  'example-web-service': `Wat je bouwt: een weermeting van een webdienst, met je sleutel bewaard in Instellingen. Het laat zien hoe een echte keten werkt: een sleutel, een aanvraag, het antwoord als JSON, en de waarden die daaruit worden gelezen.

Wat je nodig hebt: een account bij een weerdienst dat een sleutel geeft. Voeg de sleutel toe in Instellingen onder de naam OPENWEATHER_KEY. Zonder die sleutel stopt de run en noemt hij het geheim dat je moet toevoegen.

Stap 1: Voeg de sleutel toe. Voeg in Instellingen een geheim toe dat OPENWEATHER_KEY heet, met je sleutel.

Stap 2: Bewaar het antwoord. Voeg een zet-blok toe met de variabele WeatherData. De waarde is een aanvraag-blok. Bouw het adres met een samenvoegblok: het begin van het adres, dan een geheimblok met OPENWEATHER_KEY, en daarna het deel met de taal en de eenheden.

Stap 3: Lees de temperatuur. Voeg een zet-blok toe met de variabele Temperatuur. De waarde is een waarde-uit-sleutel-blok met de sleutel temp, dat leest uit een object. Dat object komt van een waarde-uit-sleutel-blok met de sleutel main, dat leest uit het object van de variabele WeatherData.

Stap 4: Toon het resultaat. Voeg een bericht toe: samenvoegen van de tekst Het is, de variabele Temperatuur en de tekst graden in Amsterdam.

Controleer: druk op Uitvoeren. Het bericht toont de temperatuur. Ontbreekt de sleutel, dan vertelt de run welk geheim je moet toevoegen.

Probeer daarna: verander de stad in het adres, en lees de luchtvochtigheid uit hetzelfde antwoord.`,

  'example-expert-mood-analyst': `Wat je bouwt: een klein statistiekprogramma in één werkruimte. Het leest een lijst met humeuren, berekent het gemiddelde, de beste en de slechtste dag met de lijstblokken, telt de lage dagen met een functie die elke dag een oordeel geeft, en toont de resultaten. De namen van de functies en variabelen zijn Engels, zoals ze in de blokken staan.

Wat je nodig hebt: niets. De lijst met humeuren staat in het voorbeeld, zodat je elke stap ziet. Later kun je hem vervangen door je eigen notities.

Stap 1: Definieer de functie verdict. Sleep in de groep Functies een functie met resultaat, noem hem verdict, met de parameter score. Zet er twee als-terug-blokken in: bij score 7 of hoger geef je de tekst good terug; bij 5 of hoger de tekst okay. Het terugkeer-blok aan het eind geeft de tekst low.

Stap 2: Definieer de functie meanOf. Voeg een tweede functie met resultaat toe, met de parameter values. Het resultaat is de optie gemiddelde (AVERAGE) van het lijst-rekenblok, met values als lijst.

Stap 3: Lees de humeuren. Zet in de Planner de variabele moods op een splits-blok. De invoer is de tekst 6,7,4,8,5,9,7, en het scheidingsteken is een komma. Zo wordt de tekst een lijst.

Stap 4: Bereken de getallen. Zet mean op een aanroep van meanOf met moods. Zet best en worst op de opties maximum en minimum van het lijst-rekenblok over moods.

Stap 5: Tel de lage dagen. Zet lowDays op 0. Voeg een voor-elk over moods toe, met de variabele day. Zet erin een als-blok: als verdict van day gelijk is aan de tekst low, verander lowDays met 1.

Stap 6: Toon de resultaten. Voeg een bericht toe dat mean, best, worst en lowDays samenvoegt. Voeg een consoleregel toe die het oordeel over mean toont.

Controleer: druk op Uitvoeren. Het bericht geeft de getallen, de console geeft het oordeel. Verander de lijst met humeuren, en het oordeel en het aantal veranderen mee.

Probeer daarna: verander de grenzen in verdict, of toon een oordeel per dag in de console.`,

  'example-expert-habit-engine': `Wat je bouwt: een gewoonte-motor die zijn toestand tussen de runs bewaart. Elke ochtend kijkt hij naar gisteren: is de gewoonte gedaan, dan gaat de reeks streak één omhoog; zo niet, dan springt hij terug naar nul. Hij viert een week, en toont de reeks op een widget.

Wat je nodig hebt: een tracker #habit in Nomie, gelogd op de dagen dat je de gewoonte doet. De streak begint de eerste keer op nul.

Stap 1: Zet de planning. Voeg de Planner uit de Nomie-groep toe en kies Dagelijks in het tabblad Details.

Stap 2: Controleer gisteren. Zet in de Planner een als-blok met een anders-tak. De voorwaarde is een vergelijkingsblok: een dagwaarde-blok voor #habit, de dag yesterday en de statistiek sum, groter dan 0.

Stap 3: Werk de streak bij. Zet in de als-tak een onthouden-blok met de naam streak, en de waarde is een ophalen-blok van streak met standaard 0, plus 1. Zet in de anders-tak een onthouden-blok met de naam streak en het getal 0.

Stap 4: Vier een week. Voeg nog een als-blok toe: als een ophalen van streak met standaard 0 gelijk is aan 7, toon een bericht: A week in a row!

Stap 5: Bewaar een record en toon de widget. Voeg een als-blok toe: als ophalen van streak groter is dan ophalen van best (standaard 0), onthoud best met de streak en toon een bericht: New record. Voeg dan een dashboard toe met de naam Habit en de vuuremoji. Zet erin twee waardeblokken: Best streak (het ophalen van best) en Days in a row (het ophalen van streak), een trend van #habit en een voettekst.

Controleer: druk op Uitvoeren, en open daarna het gedeelte Voorbeeld in het tabblad Uitvoeren. De eerste run toont nul, omdat er nog niets is onthouden. De run van morgen telt verder vanaf vandaag.

Probeer daarna: verander de mijlpaal naar 30 dagen, en toon een ander bericht na de eerste dag van een nieuwe streak.`,

  'example-expert-budget-ledger': `Wat je bouwt: een budgetboekhouding. Hij bewaart een lijst met boekingen als objecten, telt de kosten op met een functie, waarschuwt als je over het budget gaat, leest slechte gegevens veilig met probeer en vang, en toont de uitgaven op een widget. De namen van de functies en variabelen zijn Engels, zoals ze in de blokken staan.

Wat je nodig hebt: niets. De boekingen staan in het voorbeeld, zodat je elke stap ziet. Later kun je ze wijzigen, of uit een webdienst lezen.

Stap 1: Definieer de functie costOf. Voeg in de groep Functies een functie met resultaat toe, met de parameter entry. Het resultaat is een ophalen-blok van objecten voor het veld cost, van entry.

Stap 2: Begin de dag. Zet in de Planner budget op 20 en spent op 0.

Stap 3: Maak de boekhouding. Zet ledger op een lijst-maken-blok met drie boekingen. Elke boeking is een object-maken-blok met de velden item en cost. Gebruik coffee met 3, lunch met 9 en books met 12.

Stap 4: Tel de boekingen op. Voeg een voor-elk over ledger toe, met de variabele entry. Verander erin spent met het resultaat van costOf met entry. Toon daarna een regel: het item van de boeking, een dubbele punt, en het resultaat van costOf.

Stap 5: Waarschuw bij overschrijding. Voeg een als-blok toe: als spent groter is dan budget, toon een bericht dat Over budget by samenvoegt met spent min budget.

Stap 6: Lees slechte gegevens veilig. Voeg een probeer-en-vang-blok toe. In probeer lees je een tekst die geen geldige JSON is, zoals {not json, met een blok van JSON-tekst naar object. In vang toon je een bericht met de fout. Voeg een afsluitende regel toe.

Stap 7: Toon de widget. Voeg een dashboard toe met de naam Budget. Zet erin een waardeblok voor spent, en een HTML-blok met de tekst Spent {{spent}} of {{budget}}, met twee parameters.

Controleer: druk op Uitvoeren. De console somt de boekingen op, het bericht meldt de overschrijding, en het probeer-blok meldt de slechte gegevens zonder de run te stoppen.

Probeer daarna: verhoog het budget naar 15, dan verdwijnt het bericht over de overschrijding.`,

  'example-expert-command-interpreter': `Wat je bouwt: een kleine opdrachtinterpreter. Hij leest een lijst met opdrachten, voert elke opdracht uit via de functie runCommand met een als-keten, en bewaart de teller counter tussen de runs. Onbekende opdrachten worden gemeld, niet genegeerd. De opdrachten zelf (up, down, reset, show) zijn Engels, net als in het blok.

Wat je nodig hebt: niets. De opdrachten staan in het voorbeeld, dus je kunt ze veranderen en opnieuw draaien.

Stap 1: Definieer de functie runCommand. Voeg in de groep Functies een functie zonder resultaat toe, met de parameter command. Zet er een als-blok in met drie anders-als-takken en een anders-tak: bij de tekst up telt counter 1 erbij op; bij down trekt het 1 af; bij reset zet het counter op 0; bij show toont het de tekst Counter is en de teller. De anders-tak meldt Unknown command en de opdracht.

Stap 2: Laad de teller. Zet in de Planner counter op een ophalen-blok van counter met standaard 0. Deze waarde is bewaard van eerdere runs.

Stap 3: Splits de opdrachten. Zet commands op een splits-blok over de tekst up,up,down,show,reset,up,bogus,show, met een komma als scheidingsteken.

Stap 4: Voer elke opdracht uit. Voeg een voor-elk over commands toe, met de variabele command. Roep erin runCommand aan met command.

Stap 5: Bewaar de teller. Voeg na de lus een onthouden-blok met de naam counter toe, met de waarde van de variabele counter.

Stap 6: Toon de widget. Voeg een dashboard toe met de naam Counter, met een waardeblok van de teller en een voettekst.

Controleer: druk op Uitvoeren. De console toont de teller na de show-opdrachten, en de onbekende opdracht bogus wordt gemeld. Draai het opnieuw: de teller begint waar de vorige run stopte.

Probeer daarna: voeg een opdracht double toe die de teller met 2 vermenigvuldigt, als extra anders-als-tak.`,
};
