// Le guide della biblioteca di esempi, in italiano (la scheda Dettagliato di ogni esempio). Ogni guida dice cosa costruisce
// l'esempio, cosa serve prima, e poi i passi, con i blocchi esatti e dove trovarli. Le chiavi sono i nomi degli esempi.
// Nomi di funzioni, variabili e campi restano in inglese, come appaiono nei blocchi.
export const TUTORIAL_IT: Record<string, string> = {
  'example-hello': `Cosa costruisci: uno spazio di lavoro che scrive due righe nella console e un messaggio di Nomie.

Passo 1: apri il gruppo Nomie. Nella tavolozza dei blocchi a sinistra apri il gruppo Nomie. Trova il blocco Pianificatore e trascinalo sulla tela vuota.

Passo 2: aggiungi la riga della console. Apri la sezione Scrivi e mostra e trascina un blocco console dentro il Pianificatore, nel suo script. Il Pianificatore è la parte che viene eseguita, quindi ogni blocco che deve girare va dentro.

Passo 3: dai un testo alla riga. Apri il gruppo Testo e trascina un blocco di testo nel Value del blocco console. Clicca sul testo e scrivi: Ciao dalla console.

Passo 4: aggiungi una seconda riga. Trascina un altro blocco console sotto la prima, e inseriscine uno con il testo Ciao dalla console del browser. La console mostra le righe nell'ordine in cui le trova.

Passo 5: mostra un messaggio di Nomie. Trascina un blocco messaggio sotto la seconda riga e dagli un blocco di testo con Ciao da un messaggio.

Verifica: premi Esegui. La scheda Console nel pannello mostra le due righe, una dopo l'altra. Il messaggio compare come avviso di Nomie.

Prova poi: cambia i testi ed esegui di nuovo. La console conserva solo le righe dell'ultima esecuzione.`,

  'example-yesterday-mood': `Cosa costruisci: una frase che ti dice il valore medio dell'umore di ieri, letto dalle tue note.

Cosa ti serve: un tracciatore in Nomie chiamato #mood, con alcune note di ieri. Senza note la frase mostra uno zero, ed è corretto.

Passo 1: aggiungi il Pianificatore. Trascina il Pianificatore dal gruppo Nomie sulla tela.

Passo 2: aggiungi un messaggio. Metti un blocco messaggio dal gruppo Nomie dentro il Pianificatore. Il messaggio è ciò che Nomie ti mostra quando l'esecuzione finisce.

Passo 3: unisci due parti. Trascina un blocco unisci nel messaggio. Unisci inserisce testi e valori uno dopo l'altro, e ha tanti ingressi quanti ne servono. Con l'ingranaggio sul blocco puoi aggiungere un terzo ingresso.

Passo 4: scrivi la prima parte. Metti un blocco di testo nel primo ingresso di unisci e scrivi: Il tuo umore medio di ieri era.

Passo 5: leggi il valore. Trascina un blocco valore giornaliero nel secondo ingresso. Compila i tre ingressi: un blocco tracciatore con #mood in Tracker, un selettore di giorno con ieri in Giorno, e un selettore di statistica con media in Statistica.

Verifica: premi Esegui. Il messaggio mostra la frase con il numero. Imposta il selettore di giorno su oggi ed esegui di nuovo.

Prova poi: metti un blocco di testo con un punto alla fine, oppure usa il blocco arrotonda dal gruppo Matematica per togliere i decimali.`,

  'example-mood-period': `Cosa costruisci: una frase con l'umore medio degli ultimi 30 giorni, arrotondato a un numero intero.

Passo 1: parti dall'esempio di ieri. Se ce l'hai, copia il Pianificatore con il suo messaggio. Altrimenti aggiungi un Pianificatore e un messaggio dal gruppo Nomie.

Passo 2: aggiungi un valore di periodo. Cerca il blocco valore di periodo nel gruppo Nomie. Funziona come il valore giornaliero, ma copre un intervallo di giorni. Mettilo nel blocco unisci del messaggio.

Passo 3: scegli tracciatore e periodo. Metti un blocco tracciatore con #mood in Trackable. Metti un selettore di periodo in Periodo e scegli Ultimi 30 giorni. Metti un selettore di statistica in Statistica e scegli media.

Passo 4: arrotonda il numero. Trascina un blocco arrotonda dal gruppo Matematica e metti il valore di periodo nel suo ingresso numerico. Lascia l'opzione com'è: elimina i decimali.

Passo 5: scrivi la frase. Metti un blocco di testo prima del blocco arrotonda con: Il tuo umore medio negli ultimi 30 giorni è.

Verifica: premi Esegui. Il messaggio mostra la frase con un numero intero alla fine.

Prova poi: cambia il selettore di periodo su Ultimi 7 giorni, e la frase cambia con lui. È lo schema per i riepiloghi settimanali o mensili: cambia periodo e statistica, e gli stessi blocchi rispondono a un'altra domanda.`,

  'example-log-value': `Cosa costruisci: una nota nella tua cronologia Nomie per ogni giorno in cui lo spazio di lavoro gira, con un valore per il tracciatore #goodday.

Cosa ti serve: una pianificazione giornaliera. Questo esempio scrive nelle tue note, quindi lo provi prima.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela. Nella scheda Dettagli scegli Giornaliero. Lo spazio di lavoro gira così una volta al giorno.

Passo 2: aggiungi il blocco registra valore. Trascina il blocco registra valore dal gruppo Nomie dentro il Pianificatore.

Passo 3: dagli un valore. Trascina un blocco numero nell'ingresso Value e scrivi 1.

Passo 4: scegli il tracciatore. Trascina un blocco tracciatore nell'ingresso Tracker e scrivi #goodday. Nomie crea il tracciatore se non esiste ancora.

Passo 5: scegli il giorno. Trascina un selettore di giorno nell'ingresso Data e scegli oggi.

Passo 6: prova prima. Nella scheda Esegui attiva l'interruttore Test. Premi Esegui. La console mostra la riga Registrerei, con il giorno, e nessuna nota viene scritta.

Verifica: disattiva il Test e premi Esegui. Allora compare per oggi una nota con #goodday(1) nella tua cronologia.

Prova poi: usa un blocco di testo e un blocco unisci per scrivere anche il giorno nel messaggio, oppure usa il pulsante Ieri per vedere come gira un'esecuzione per ieri.`,

  'example-wait': `Cosa costruisci: due righe nella console, con una pausa di un secondo tra le due.

Passo 1: aggiungi il Pianificatore. Trascina il Pianificatore dal gruppo Nomie sulla tela.

Passo 2: aggiungi la prima riga. Nel Pianificatore trascina un blocco console dalla sezione Scrivi e mostra e inseriscine uno di testo: Prima riga.

Passo 3: aggiungi la pausa. Trascina il blocco attesa sotto la prima riga (scrivi attesa nella ricerca in cima alla tavolozza per trovarlo). Imposta i secondi su 1.

Passo 4: aggiungi la seconda riga. Sotto il blocco attesa metti un altro blocco console con il testo: Seconda riga, un secondo dopo.

Verifica: premi Esegui. La console mostra la prima riga, e la seconda compare un secondo dopo. L'esecuzione aspetta durante la pausa, e lo vedi nello stato sopra la tela.

Prova poi: imposta la pausa a 3 secondi. Usa le pause con parsimonia: ogni secondo conta nel tempo che un'esecuzione può impiegare, e un'esecuzione si ferma dopo cinque minuti.`,

  'example-pickers': `Cosa costruisci: un messaggio che mostra cosa sceglie ogni selettore, così vedi i valori prima di usarli.

Cosa ti serve: nient'altro. I selettori sono i piccoli blocchi che scelgono un valore: un tracciatore, un giorno, un periodo, una statistica e una data.

Passo 1: aggiungi il Pianificatore e un messaggio. Trascina il Pianificatore dal gruppo Nomie sulla tela e metti un blocco messaggio dentro.

Passo 2: aggiungi un blocco unisci. Trascina un blocco unisci nel messaggio. Lì inserirai in fila testi e selettori.

Passo 3: aggiungi il tracciatore. Metti un blocco di testo con Tracker: e accanto trascina un blocco tracciatore con #mood.

Passo 4: aggiungi giorno e periodo. Aggiungi il testo | Giorno: , poi un selettore di giorno su ieri. Aggiungi il testo | Periodo: , poi un selettore di periodo su Ultimi 7 giorni.

Passo 5: aggiungi statistica e data. Aggiungi il testo | Statistica: e un selettore di statistica su media. Chiudi con | Data: e un selettore di data, dove scrivi una data come 2026-11-01.

Verifica: premi Esegui. Il messaggio elenca ogni selettore con il suo valore.

Prova poi: cambia un selettore nel menu a tendina ed esegui di nuovo. Ogni blocco che legge o scrive note prende il suo tracciatore, giorno o periodo da selettori come questi.`,

  'example-history': `Cosa costruisci: due righe dalle tue note. La prima dà il tuo ultimo valore dell'umore degli ultimi 14 giorni. La seconda conta i giorni dall'ultima volta in cui #mood è stato registrato.

Cosa ti serve: un tracciatore #mood in Nomie, con alcune note. La cronologia guarda indietro nelle tue note, quindi un account nuovo non mostra ancora nulla.

Passo 1: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela e impostalo su giornaliero nella scheda Dettagli.

Passo 2: aggiungi l'ultimo valore. Metti un messaggio nel Pianificatore. Nel blocco unisci del messaggio trascina un blocco ultimo valore dal gruppo Nomie. Metti #mood nell'ingresso Tracker e imposta i giorni su 14. Il blocco cerca l'ultima nota con quel tracciatore negli ultimi 14 giorni.

Passo 3: scrivi la prima riga. Metti un blocco di testo prima dell'ultimo valore, con le parole: Ultimo umore:.

Passo 4: aggiungi la seconda riga. Sotto il messaggio metti un secondo messaggio. Trascina un blocco giorni da in un blocco unisci, con un blocco tracciatore #mood nell'ingresso.

Passo 5: scrivi il testo davanti. Prima del blocco giorni da metti un blocco di testo con le parole: Giorni da quando #mood è stato registrato:.

Verifica: premi Esegui. Entrambi i messaggi vengono dalle stesse note, quindi concordano. Senza note la prima riga è vuota, e la seconda conta da zero.

Prova poi: porta i 14 giorni a 60, e guarda come cambia l'ultimo valore.`,

  'example-streak': `Cosa costruisci: un contatore di serie. Mostra per quanti giorni di seguito è stato registrato un tracciatore, e ti fa i complimenti quando la serie è di tre giorni o più.

Cosa ti serve: un tracciatore #habit in Nomie, registrato in alcuni giorni.

Passo 1: aggiungi il Pianificatore e un messaggio. Trascina il Pianificatore dal gruppo Nomie sulla tela e mettici un messaggio dentro.

Passo 2: aggiungi un blocco se. Trascina un blocco se dal gruppo Logica nel Pianificatore, sopra il messaggio.

Passo 3: costruisci la condizione. Trascina un blocco confronto dal gruppo Logica nell'ingresso del blocco se. A sinistra metti il blocco serie dal gruppo Nomie, a destra un blocco numero con 3. Scegli l'operatore maggiore o uguale.

Passo 4: scegli il tracciatore. Metti un blocco tracciatore con #habit nel blocco serie. Leggi il suggerimento: il blocco serie conta al massimo 60 giorni, fino al giorno dell'esecuzione.

Passo 5: aggiungi i due messaggi. Nel blocco se metti un messaggio con: Tre giorni di fila, complimenti! Clicca l'ingranaggio del blocco se, aggiungi un ramo altrimenti e mettici un messaggio con: Continua così.

Verifica: premi Esegui. Senza serie compare il messaggio del ramo altrimenti. Prova con note su tre giorni di fila per vedere il primo messaggio.

Prova poi: cambia il 3 in 7, e fanne un obiettivo settimanale.`,

  'example-write-note': `Cosa costruisci: una nota libera nella tua cronologia Nomie, scritta per ieri. È un modo semplice per scrivere un riepilogo o un promemoria.

Cosa ti serve: una pianificazione giornaliera. Questo esempio scrive nelle tue note, quindi lo provi prima.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela e scegli Giornaliero nella scheda Dettagli.

Passo 2: aggiungi il blocco registra nota. Trascina il blocco registra nota dal gruppo Nomie nel Pianificatore.

Passo 3: scrivi il testo. Metti un blocco di testo nell'ingresso Testo della nota, con le parole: Settimana discussa #review. Il cancelletto fa sì che Nomie crei il tracciatore #review se non esiste.

Passo 4: scegli il giorno. Metti un selettore di giorno nell'ingresso Data e scegli ieri. La nota viene scritta per ieri.

Passo 5: prova prima. Nella scheda Esegui attiva l'interruttore Test e premi Esegui. La console mostra la nota che scriverebbe, e non viene salvato nulla.

Verifica: disattiva il Test e premi Esegui. La nota compare per ieri nella tua cronologia, con il tag review.

Prova poi: scrivi un riepilogo settimanale con un blocco unisci e un valore di periodo, così la nota ti dice la media della settimana.`,

  'example-location': `Cosa costruisci: un messaggio con la tua posizione, o un messaggio chiaro se la posizione non è nota.

Cosa ti serve: l'autorizzazione alla posizione per Nomie. Nomie la chiede la prima volta, e puoi cambiarla dopo nelle impostazioni del dispositivo.

Passo 1: aggiungi il Pianificatore e un messaggio. Trascina il Pianificatore dal gruppo Nomie sulla tela e mettici un messaggio.

Passo 2: aggiungi il blocco la mia posizione. Trascinalo dal gruppo Nomie nel messaggio.

Passo 3: metti un testo davanti. Nel messaggio inserisci un blocco unisci, con un blocco di testo con le parole: Ti trovi a, e dopo di lui il blocco la mia posizione.

Passo 4: provalo. Nella scheda Esegui attiva l'interruttore Test e premi Esegui. La prima volta Nomie chiede l'autorizzazione: concedila.

Verifica: il messaggio mostra una latitudine e una longitudine. Se non compare nulla, la posizione non era disponibile. Per questo ogni uso di la mia posizione dovrebbe avere un'alternativa, come un testo che dice che la posizione è sconosciuta.

Prova poi: aggiungi un blocco se che controlla se il risultato è vuoto, e mostra un testo nel ramo altrimenti.`,

  'example-open-link': `Cosa costruisci: un blocco che apre una pagina web dentro Nomie, come una dashboard tua.

Passo 1: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela.

Passo 2: aggiungi il blocco apri link. Trascinalo dal gruppo Nomie nel Pianificatore.

Passo 3: dagli un indirizzo. Metti un blocco di testo nell'ingresso del link, con l'indirizzo completo della pagina, che inizia con https.

Passo 4: provalo. Dall'editor premi Esegui. Un'esecuzione manuale apre la pagina in una finestra dentro Nomie.

Verifica: la finestra si apre con la pagina. Se fai girare lo spazio di lavoro con una pianificazione, il blocco scrive solo Aprirei nell'uscita. Una pianificazione quindi non apre mai una finestra.

Prova poi: tieni l'indirizzo in un segreto o in un testo che puoi cambiare, e usa solo indirizzi di cui ti fidi. Uno spazio di lavoro condiviso con qualcun altro esegue lo stesso indirizzo sul suo dispositivo.`,

  'example-fetch-page': `Cosa costruisci: una richiesta a un indirizzo web, con la risposta mostrata nella console.

Cosa ti serve: una connessione a internet, e un indirizzo di cui ti fidi. L'esempio usa un indirizzo pubblico. Uno spazio di lavoro condiviso esegue i suoi indirizzi sul dispositivo di chi lo aggiunge.

Passo 1: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela.

Passo 2: aggiungi il blocco richiedi. Trascinalo dal gruppo Nomie nel Pianificatore.

Passo 3: dagli un indirizzo. Metti un blocco di testo nell'ingresso dell'indirizzo, con una pagina di cui ti fidi. Inizia con https.

Passo 4: mostra la risposta. Trascina un blocco console sotto la richiesta e inserisci il blocco richiedi nel Value del blocco console.

Verifica: premi Esegui. La console mostra la risposta come testo, spesso l'inizio di una pagina web o una lista in JSON.

Prova poi: la maggior parte dei servizi risponde in JSON. Gli esempi sugli oggetti mostrano passo per passo come leggerlo.`,

  'example-widget-value': `Cosa costruisci: un widget della dashboard con un numero, una piccola tendenza e un piè di pagina.

Cosa ti serve: niente di speciale. Il widget viene conservato dopo un'esecuzione, quindi devi far girare lo spazio di lavoro una volta.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela e scegli Giornaliero nella scheda Dettagli.

Passo 2: aggiungi il blocco dashboard. Trascina il blocco dashboard dal gruppo Nomie nel Pianificatore. Dagli un nome, come Umore, e un'emoji, come una faccina. Nome ed emoji compaiono nell'intestazione del widget.

Passo 3: aggiungi il valore. Dentro la dashboard trascina il blocco valore dalla sezione Widget dashboard. Mettici un blocco valore di periodo, con il tracciatore #mood, il periodo Ultimi 7 giorni e la statistica media. Dai al valore un'etichetta: Media degli ultimi 7 giorni.

Passo 4: aggiungi la tendenza. Sotto il valore trascina il blocco tendenza. Inserisci #mood e dagli l'etichetta Ultimi 14 giorni.

Passo 5: aggiungi il piè di pagina. Trascina per ultimo il blocco piè di pagina e scrivi: Aggiornato ogni mattina.

Verifica: premi Esegui una volta. Poi apri la sezione Anteprima in fondo alla scheda Esegui. Mostra il widget come lo mostrerà la dashboard. Un'anteprima è un test, quindi non viene scritta nessuna nota.

Prova poi: cambia l'etichetta del valore o il periodo, e rivedi l'anteprima.`,

  'example-widget-charts': `Cosa costruisci: una dashboard con due grafici dello stesso tracciatore. Il primo è un grafico a linee su 30 giorni, il secondo un grafico a barre su 7 giorni.

Cosa ti serve: un tracciatore #mood in Nomie, con note in alcuni giorni, così i grafici hanno qualcosa da disegnare.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela.

Passo 2: aggiungi la dashboard. Trascina un blocco dashboard nel Pianificatore, dagli il nome Grafici umore e un'emoji, come un grafico.

Passo 3: aggiungi il grafico a linee. Dentro la dashboard trascina il blocco grafico a linee dalla sezione Widget dashboard. Metti #mood nell'ingresso Tracker. Imposta i giorni su 30, il colore su blu e l'etichetta su Ultimi 30 giorni.

Passo 4: aggiungi il grafico a barre. Sotto il grafico a linee trascina il blocco grafico a barre. Metti di nuovo #mood, imposta i giorni su 7, il colore su verde e l'etichetta su Ultimi 7 giorni.

Passo 5: guarda l'anteprima. Premi una volta Esegui, poi apri la sezione Anteprima nella scheda Esegui.

Verifica: la linea collega i giorni, e un giorno senza nota è un vuoto. Le barre mostrano una barra per ognuno degli ultimi 7 giorni. Entrambi vengono dalle stesse note, disegnate in due modi.

Prova poi: cambia il colore delle barre e guarda come appare il widget nel tuo tema di Nomie.`,

  'example-widget-html': `Cosa costruisci: un widget della dashboard con un tuo HTML, riempito con un valore dalle tue note.

Cosa ti serve: un tracciatore #mood con note in alcuni giorni, perché ci sia un valore da mostrare.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela.

Passo 2: aggiungi la dashboard. Trascina un blocco dashboard nel Pianificatore e dagli il nome HTML umore.

Passo 3: aggiungi il blocco HTML. Dentro la dashboard trascina il blocco HTML dalla sezione Widget dashboard. Nella casella di testo scrivi: <p>Umore medio: <b>{{mood}}</b></p>. Il segnaposto {{mood}} viene sostituito con un valore a ogni esecuzione.

Passo 4: aggiungi un parametro. Sotto il blocco HTML trascina un blocco parametro. Il suo nome è mood, come il segnaposto. Il suo valore è un blocco valore di periodo con #mood, il periodo Ultimi 7 giorni e la statistica media.

Passo 5: guarda l'anteprima. Premi una volta Esegui e apri la sezione Anteprima nella scheda Esegui.

Verifica: il widget mostra l'umore medio in grassetto. L'HTML viene ripulito prima di essere mostrato: script e link vengono rimossi, e le immagini devono venire da https.

Prova poi: aggiungi un secondo segnaposto, come {{count}}, con un altro blocco parametro che conta le note.`,

  'example-remember': `Cosa costruisci: uno spazio di lavoro che conta le proprie esecuzioni. Conserva il conteggio da un'esecuzione all'altra, e lo dimentica alla terza.

Cosa ti serve: niente. Questo esempio usa solo la memoria dello spazio di lavoro.

Passo 1: aggiungi il Pianificatore e impostalo su giornaliero. Trascina il Pianificatore dal gruppo Nomie sulla tela.

Passo 2: ricorda un nuovo conteggio. Nel Pianificatore trascina un blocco ricorda. Chiamalo runs. Il suo valore è un blocco aritmetico con l'addizione: a sinistra un blocco richiama chiamato runs con predefinito 0, a destra il numero 1.

Passo 3: mostra il conteggio. Sotto metti un blocco messaggio con un blocco unisci: il testo Questo spazio di lavoro è stato eseguito, un blocco richiama chiamato runs con predefinito 0, e il testo volte.

Passo 4: dimentica alla terza esecuzione. Aggiungi un blocco se. La condizione è un blocco confronto: il blocco richiama chiamato runs uguale a 3. Nel blocco se metti un blocco dimentica chiamato runs e un messaggio che dice che il conteggio è stato dimenticato.

Verifica: premi tre volte Esegui. Il conteggio va 1, 2, 3, e alla terza esecuzione il messaggio dice che il conteggio è stato dimenticato. L'esecuzione successiva riparte da 0.

Prova poi: cambia il 3 in 5, per ricordare una serie più lunga.`,

  'example-secret': `Cosa costruisci: uno spazio di lavoro che usa una chiave dalle Impostazioni, senza scriverla nei blocchi.

Cosa ti serve: un segreto chiamato EXAMPLE_KEY nelle Impostazioni. Apri le Impostazioni del plugin e aggiungi il segreto con quel nome e la tua chiave.

Passo 1: metti la chiave nelle Impostazioni. Apri le Impostazioni e aggiungi un segreto chiamato EXAMPLE_KEY. La chiave stessa non viene mai mostrata nei blocchi.

Passo 2: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela.

Passo 3: aggiungi il blocco segreto. Metti un messaggio nel Pianificatore. Trascina un blocco segreto dal gruppo Nomie dentro, e scegli EXAMPLE_KEY.

Passo 4: eseguilo. Premi Esegui. Il messaggio mostra il segreto come quattro puntini, così la chiave non compare mai nell'uscita.

Verifica: se il segreto manca, l'esecuzione si ferma e ti dice quale aggiungere. Provalo rinominando il segreto nelle Impostazioni ed eseguendo di nuovo.

Prova poi: usa il segreto in un indirizzo web, con un blocco unisci. I file condivisi non contengono mai la tua chiave, quindi puoi mandare lo spazio di lavoro a qualcun altro in sicurezza.`,

  'example-when-note': `Cosa costruisci: uno spazio di lavoro che gira quando viene salvata una nota con un certo tracciatore, invece che con una pianificazione.

Cosa ti serve: un tracciatore #run in Nomie. Ogni nota con quel tracciatore avvia lo spazio di lavoro.

Passo 1: aggiungi il blocco quando c'è una nota. Trascinalo dal gruppo Nomie sulla tela e scrivi il tracciatore #run nel suo campo.

Passo 2: aggiungi un messaggio. Dentro il blocco quando c'è una nota metti un blocco messaggio dal gruppo Nomie.

Passo 3: leggi la nota. Nel messaggio unisci tre blocchi dal gruppo Nomie: un blocco valore nota con #mood, un blocco testo nota e un blocco giorno nota. Metti un testo davanti a ciascuno, perché il messaggio sia chiaro.

Passo 4: provalo. In Nomie scrivi una nota con #run e #mood(4). Salvala.

Verifica: Nomie esegue lo spazio di lavoro, e il messaggio mostra il valore dell'umore 4, il testo della nota e il suo giorno. Fuori da un'esecuzione su nota questi blocchi non danno nulla, e il controllo prima dell'esecuzione te lo segnala.

Prova poi: aggiungi un blocco se che controlla il valore dell'umore, e mostra un messaggio diverso quando è sotto 3.`,

  'example-loop-days': `Cosa costruisci: cicli in due forme. Un blocco ripeti esegue i suoi blocchi un numero fisso di volte, e un blocco per conta con una variabile.

Passo 1: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela.

Passo 2: aggiungi un blocco ripeti. Dal gruppo Cicli trascina un blocco ripeti nel Pianificatore. Imposta il numero di volte su 3. Dentro metti un blocco console con il testo Ripetuto.

Passo 3: aggiungi un blocco per. Sotto il blocco ripeti trascina un blocco per dal gruppo Cicli. La variabile è i, l'inizio è 1, la fine è 5 e il passo è 1.

Passo 4: mostra il contatore. Nel blocco per metti un messaggio: un blocco unisci con il testo Passo e la variabile i dal gruppo Variabili.

Verifica: premi Esegui. La console mostra Ripetuto tre volte, e poi cinque righe, da Passo 1 a Passo 5. I cicli permettono a uno spazio di lavoro di coprire molti giorni o molte note in un'unica esecuzione.

Prova poi: porta la fine del blocco per a 30, e conta i giorni con una pianificazione giornaliera.`,

  'example-while-break': `Cosa costruisci: un contatore che ripete finché una condizione è vera, e che si ferma presto con un'interruzione.

Passo 1: imposta la variabile. Aggiungi un blocco imposta dal gruppo Variabili, con la variabile n e il numero 0.

Passo 2: aggiungi un ciclo mentre. Trascina un ciclo mentre dal gruppo Cicli sotto il blocco imposta. Tienilo su mentre e costruisci la condizione con un blocco confronto: n minore di 10.

Passo 3: aggiungi il blocco se nel ciclo. Nel ciclo mentre trascina un blocco se. La condizione è un blocco confronto: n uguale a 4.

Passo 4: interrompi il ciclo. Nel blocco se metti un blocco interrompi dal gruppo Cicli.

Passo 5: mostra e conta. Sotto il blocco se, dentro il ciclo, metti un blocco console con n, e un blocco cambia che aggiunge 1 a n.

Verifica: premi Esegui. La console mostra i numeri da 0 a 3, poi il ciclo si ferma a 4.

Prova poi: sposta l'interruzione a un altro numero. Fai attenzione a cambiare la variabile nel ciclo, altrimenti non finisce mai. L'esecuzione si ferma anche dopo un numero molto alto di passi, così non può restare bloccata per sempre.`,

  'example-list-loop': `Cosa costruisci: un ciclo per ogni elemento che passa uno alla volta su una lista di tre giorni.

Passo 1: aggiungi il blocco per ogni. Dal gruppo Cicli trascina un blocco per ogni sulla tela. Imposta la sua variabile su item.

Passo 2: crea la lista. Trascina un blocco crea lista dal gruppo Liste nell'ingresso della lista del blocco per ogni. Aggiungi tre blocchi di testo con le parole Lunedì, Martedì e Mercoledì. Usa l'ingranaggio del blocco lista per aggiungere gli ingressi.

Passo 3: mostra ogni elemento. Dentro il blocco per ogni metti un blocco console e inserisci la variabile item.

Verifica: premi Esegui. La console mostra i tre elementi nell'ordine della lista.

Prova poi: metti una lista di numeri e sommali con un blocco somma dal gruppo Matematica.`,

  'example-decide': `Cosa costruisci: una decisione con un blocco se, un ramo altrimenti e blocchi logici, più un blocco ternario che sceglie un valore in una sola riga.

Passo 1: aggiungi il blocco se. Trascina un blocco se dal gruppo Logica sulla tela, e clicca l'ingranaggio per aggiungere un ramo altrimenti.

Passo 2: costruisci la condizione. Trascina un blocco e nell'ingresso del blocco se. A sinistra metti un blocco confronto: 3 minore di 5. A destra metti un blocco non con dentro un blocco confronto: 2 maggiore di 7.

Passo 3: aggiungi i due messaggi. Nel blocco se metti un messaggio con Entrambe sono vere. Nel ramo altrimenti metti un messaggio con Qualcosa non va.

Passo 4: scegli un valore in una riga. Sotto il blocco se trascina un blocco ternario in un blocco console. La sua condizione è il blocco vero, il valore allora è sì e il valore altrimenti è no.

Verifica: premi Esegui. Il primo messaggio mostra il testo del ramo altrimenti, perché il blocco non rende falsa la condizione. Cambia i numeri nei blocchi confronto ed esegui di nuovo per vedere entrambi i rami.

Prova poi: aggiungi un secondo blocco confronto al e, e usa un blocco o per un'altra condizione.`,

  'example-numbers': `Cosa costruisci: una piccola calcolatrice. Ogni riga della console mostra uno dei blocchi matematici al lavoro.

Passo 1: aggiungi un blocco console per ogni somma. Trascina un blocco console dalla sezione Scrivi e mostra sulla tela, e mettici un blocco aritmetico: 2 più 3.

Passo 2: aggiungi altre operazioni. Metti altri blocchi console, ognuno con un blocco dal gruppo Matematica: un blocco moltiplica, un blocco radice quadrata, un blocco seno dal blocco trigonometria, e la costante pi greco.

Passo 3: controlla se un numero è pari. Aggiungi un blocco proprietà del numero con l'opzione pari, e un blocco numero con 4.

Passo 4: aggiungi un resto. Usa il blocco modulo per ottenere il resto di 17 diviso 5.

Verifica: premi Esegui. Ogni riga mostra il suo risultato. Leggi le etichette nella console per collegare ogni riga al suo blocco.

Prova poi: metti i risultati in variabili e uniscili in un unico messaggio.`,

  'example-random-average': `Cosa costruisci: una serie di valori che cambiano a ogni esecuzione: numeri casuali, un valore arrotondato, la media di una lista e un valore limitato.

Passo 1: aggiungi i blocchi casuali. Trascina un blocco intero casuale dal gruppo Matematica in un blocco console. Imposta i limiti su 1 e 10. Poi aggiungi un blocco frazione casuale, che dà un numero tra 0 e 1.

Passo 2: arrotonda per eccesso. Metti un blocco arrotonda con l'opzione arrotonda per eccesso attorno a un blocco numero, e mostralo.

Passo 3: trova la media di una lista. Usa una lista di numeri in un blocco crea lista, e l'opzione media del blocco matematico per le liste.

Passo 4: tieni un valore nell'intervallo. Usa un blocco limita con il valore 15, il limite inferiore 0 e il limite superiore 10. Il risultato è 10.

Verifica: fai girare lo spazio di lavoro più volte. I valori casuali cambiano ogni volta, il resto resta uguale.

Prova poi: usa il blocco intero casuale per scegliere un giorno da una lista, con l'indice della lista.`,

  'example-text-tools': `Cosa costruisci: una serie di blocchi di testo al lavoro. Ogni risultato va su una riga separata della console.

Passo 1: aggiungi la lunghezza. Trascina un blocco lunghezza dal gruppo Testo in un blocco console, e mettici un blocco di testo con la parola Nomie.

Passo 2: cambia le maiuscole. Aggiungi un blocco cambia maiuscole e un blocco di testo. Scegli maiuscole.

Passo 3: togli gli spazi. Aggiungi un blocco taglia con un testo che ha spazi ai due estremi.

Passo 4: trova una parola. Aggiungi un blocco trova posizione che cerca la posizione della parola blu in un testo.

Passo 5: prendi una parte. Aggiungi un blocco sottotesto che ritaglia le prime cinque lettere di un testo.

Verifica: premi Esegui. Ogni riga mostra il suo risultato. Confronta ogni blocco con la riga che produce.

Prova poi: unisci due testi con un blocco unisci, e mostra la lunghezza del risultato.`,

  'example-lists': `Cosa costruisci: una lista e i blocchi lista che ci lavorano: la lunghezza, un controllo di vuoto, la posizione di un elemento, l'elemento in una posizione, una modifica e l'ordinamento.

Passo 1: aggiungi la lunghezza. Trascina un blocco lunghezza dal gruppo Liste in un blocco console, e mettici un blocco crea lista con i testi a, b e c.

Passo 2: controlla se è vuota. Aggiungi un blocco è vuota con un blocco crea lista vuota, e mostra il risultato.

Passo 3: trova una posizione. Aggiungi un blocco trova posizione che trova la prima b in una lista di a e b.

Passo 4: prendi un elemento. Aggiungi un blocco prendi elemento per il primo elemento, e un blocco che prende l'elemento in posizione 1 dalla fine.

Passo 5: cambia un elemento. Imposta la variabile days su una lista con Lun e Mar. Usa un blocco imposta elemento per cambiare il primo elemento in Dom, e poi mostra days.

Passo 6: dividi e ordina. Dividi il testo lun,mar,mer con una virgola in una lista, e ordina una lista di numeri 3, 1 e 2.

Verifica: premi Esegui. Ogni passo mostra il suo risultato, così puoi seguire com'è la lista in ogni momento.

Prova poi: metti i numeri ordinati in un messaggio con un blocco unisci.`,

  'example-functions': `Cosa costruisci: due funzioni, una restituisce un valore e l'altra fa qualcosa. Una funzione è un insieme di blocchi con un nome che puoi richiamare più volte.

Cosa ti serve: niente. L'esempio è un piccolo programma completo in un unico spazio di lavoro.

Passo 1: definisci la funzione doppio. Dal gruppo Funzioni trascina una funzione con risultato sulla tela. Chiamala doppio e aggiungi con l'ingranaggio un parametro n.

Passo 2: aggiungi il ritorno anticipato. Dentro la funzione metti un blocco se-ritorna. La condizione è n minore di 0, il valore è 0. Se n è sotto zero, la funzione si ferma lì e il resto viene saltato.

Passo 3: restituisci il risultato. Sotto il blocco se-ritorna metti il blocco ritorna con il valore n per 2.

Passo 4: definisci la funzione saluto. Trascina una funzione senza risultato, chiamala saluto e aggiungi il parametro chi. Dentro mostra un messaggio che unisce Ciao e chi.

Passo 5: richiamale. Nel Pianificatore, sotto le definizioni, mostra una chiamata a doppio con il numero 21 e una chiamata a saluto con il testo Nomie.

Verifica: premi Esegui. La console mostra 42, e poi Ciao Nomie.

Prova poi: definisci una funzione che richiama doppio, così una funzione usa l'altra.`,

  'example-objects': `Cosa costruisci: un piccolo record e i blocchi che lo leggono e lo cambiano. Gli oggetti contengono campi con nome, e i blocchi JSON leggono e scrivono testo nella stessa forma.

Passo 1: crea un oggetto. Dal gruppo Oggetti trascina un blocco crea oggetto su un blocco console. Aggiungi con l'ingranaggio due campi: temp, con il numero 18, e mood, con il numero 7.

Passo 2: leggi un campo. Aggiungi un blocco ottieni che legge temp da un oggetto ricavato da testo JSON. Usa il testo {"temp": 18, "mood": 7} in un blocco da testo JSON a oggetto.

Passo 3: mostra le chiavi. Aggiungi un blocco chiavi sullo stesso oggetto, e mostra il risultato.

Passo 4: leggi un valore dal JSON. Aggiungi un blocco valore da chiave, con la chiave mood e l'oggetto dal testo JSON.

Passo 5: scrivi JSON. Aggiungi un blocco da oggetto a JSON che trasforma un oggetto di nuovo in testo.

Passo 6: cambia un campo. Usa il blocco imposta con il campo mood e il numero 9.

Verifica: premi Esegui. Ogni riga della console mostra il suo risultato. I servizi web rispondono in JSON, quindi questo è lo schema per leggerne le risposte.

Prova poi: leggi l'umore dall'oggetto e mostralo in una frase.`,

  'example-try-catch': `Cosa costruisci: un blocco che prova a leggere dati sbagliati e cattura l'errore senza fermare l'esecuzione.

Passo 1: aggiungi un blocco prova. Dal gruppo Avanzato trascina un blocco prova e cattura sulla tela. Il suo parametro è error.

Passo 2: metti un blocco rischioso in prova. Dentro prova metti un blocco console con un blocco da testo JSON a oggetto che legge il testo {non json, che non è JSON valido.

Passo 3: cattura l'errore. Dentro cattura metti un messaggio: un blocco unisci con il testo Impossibile leggere i dati e la variabile error.

Passo 4: aggiungi un finalmente. Clicca l'ingranaggio del blocco e aggiungi una parte finalmente. Dentro metti un blocco console con il testo Comunque finito.

Verifica: premi Esegui. La parte prova fallisce e il messaggio mostra l'errore. La riga finalmente viene eseguita comunque. Senza il blocco prova, l'intera esecuzione si fermerebbe sui dati sbagliati.

Prova poi: usa lo stesso schema per un indirizzo web che a volte non risponde, e mostra un messaggio gentile in cattura.`,

  'example-ask': `Cosa costruisci: una domanda che ti chiede una parola, e mostra la tua risposta in una frase.

Cosa ti serve: niente. La domanda compare quando fai girare lo spazio di lavoro a mano. Un'esecuzione pianificata non ha nessuno che risponda, quindi questo esempio serve per i test manuali.

Passo 1: aggiungi il Pianificatore. Trascinalo dal gruppo Nomie sulla tela.

Passo 2: aggiungi un messaggio. Nel Pianificatore trascina un blocco messaggio dal gruppo Nomie.

Passo 3: unisci la risposta. Nel messaggio aggiungi un blocco unisci. La prima parte è un blocco di testo: La tua risposta era.

Passo 4: fai la domanda. Trascina un blocco domanda dal gruppo Testo nella seconda parte del blocco unisci. Nel testo scrivi: Qual è la tua parola per l'umore?

Verifica: premi Esegui. Nomie mostra la domanda. Scrivi una parola, e il messaggio mostra la tua risposta.

Prova poi: chiedi un numero e usalo in un calcolo. Ricorda che una domanda funziona solo se c'è qualcuno a rispondere.`,

  'example-keyword-statistics': `Cosa costruisci: il numero di note che nominano una parola negli ultimi 30 giorni, e la somma dei loro valori.

Cosa ti serve: alcune note in Nomie che nominano la parola movimento, così le risposte non sono zero.

Passo 1: aggiungi il Pianificatore e un messaggio. Trascina il Pianificatore dal gruppo Nomie sulla tela e mettici un messaggio.

Passo 2: inizia la frase. Nel messaggio metti un blocco unisci. La prima parte è un blocco di testo: Trovato "movimento" in.

Passo 3: aggiungi il valore di periodo. Trascina un blocco valore di periodo nel blocco unisci. Il suo soggetto è il testo movimento, non un tracciatore, così cerca la parola nelle note. Il periodo è Ultimi 30 giorni e la statistica è conteggio.

Passo 4: chiudi la frase. Dopo il valore di periodo scrivi il testo note negli ultimi 30 giorni.

Passo 5: aggiungi la somma. Metti un secondo messaggio con un blocco valore di periodo e la statistica somma. Questo somma i valori delle note che nominano la parola.

Verifica: premi Esegui. Il primo messaggio mostra quante note nominano movimento, il secondo la somma dei loro valori.

Prova poi: cambia la parola, oppure porta il periodo a Ultimi 90 giorni. Gli stessi due blocchi rispondono a un'altra domanda.`,

  'example-web-service': `Cosa costruisci: una lettura del meteo da un servizio web, con la tua chiave conservata nelle Impostazioni. Mostra come funziona un flusso reale: una chiave, una richiesta, la risposta in JSON, e i valori letti da essa.

Cosa ti serve: un account presso un servizio meteo che ti dà una chiave. Metti la chiave nelle Impostazioni con il nome OPENWEATHER_KEY. Senza, l'esecuzione si ferma e ti dice quale segreto aggiungere.

Passo 1: metti la chiave. Nelle Impostazioni aggiungi un segreto chiamato OPENWEATHER_KEY con la tua chiave.

Passo 2: conserva la risposta. Aggiungi un blocco imposta con la variabile WeatherData. Il suo valore è un blocco richiesta. Costruisci l'indirizzo con un blocco unisci: l'inizio dell'indirizzo, poi un blocco segreto con OPENWEATHER_KEY, e poi il resto con lingua e unità.

Passo 3: leggi la temperatura. Aggiungi un blocco imposta con la variabile Temperature. Il suo valore è un blocco valore da chiave con la chiave temp, che legge da un oggetto. Quell'oggetto viene da un blocco valore da chiave con la chiave main, che legge dall'oggetto della variabile WeatherData.

Passo 4: mostra il risultato. Aggiungi un messaggio: un blocco unisci con il testo Fa, la variabile Temperature e il testo gradi ad Amsterdam.

Verifica: premi Esegui. Il messaggio mostra la temperatura. Se manca la chiave, l'esecuzione ti dice quale segreto aggiungere.

Prova poi: cambia la città nell'indirizzo, e leggi l'umidità dalla stessa risposta.`,

  'example-expert-mood-analyst': `Cosa costruisci: un piccolo programma statistico in un unico spazio di lavoro. Legge una lista di umori, calcola la media, il giorno migliore e quello peggiore con i blocchi lista, conta i giorni bassi con una funzione che dà a ogni giorno un giudizio, e mostra i risultati. I nomi di funzioni e variabili restano in inglese, come nei blocchi.

Cosa ti serve: niente. La lista di umori è scritta nell'esempio, così vedi ogni passo. Più avanti puoi sostituirla con le tue note.

Passo 1: definisci la funzione verdict. Dal gruppo Funzioni trascina una funzione con risultato, chiamala verdict, con il parametro score. Mettici due blocchi se-ritorna: se score è 7 o più, restituisci il testo good; se è 5 o più, il testo okay. Il blocco ritorna finale dà il testo low.

Passo 2: definisci la funzione meanOf. Aggiungi una seconda funzione con risultato, con il parametro values. Il risultato è l'opzione media (AVERAGE) del blocco matematico per le liste, con values come lista.

Passo 3: leggi gli umori. Nel Pianificatore imposta la variabile moods su un blocco dividi. L'ingresso è il testo 6,7,4,8,5,9,7, e il separatore è una virgola. Così il testo diventa una lista.

Passo 4: calcola i numeri. Imposta mean su una chiamata di meanOf con moods. Imposta best e worst sulle opzioni massimo e minimo del blocco matematico per le liste su moods.

Passo 5: conta i giorni bassi. Imposta lowDays a 0. Aggiungi un ciclo per ogni su moods, con la variabile day. Dentro metti un blocco se: se verdict di day è uguale al testo low, cambia lowDays di 1.

Passo 6: mostra i risultati. Aggiungi un messaggio che unisce mean, best, worst e lowDays. Aggiungi una riga della console che mostra il giudizio su mean.

Verifica: premi Esegui. Il messaggio dà i numeri, la console il giudizio. Cambia la lista degli umori, e il giudizio e il conteggio cambiano con lei.

Prova poi: cambia le soglie in verdict, oppure mostra un giudizio per ogni giorno nella console.`,

  'example-expert-habit-engine': `Cosa costruisci: un motore delle abitudini che conserva il suo stato tra le esecuzioni. Ogni mattina guarda a ieri: se l'abitudine è stata fatta, la serie streak sale di uno; se no, torna a zero. Festeggia una settimana, e mostra la serie su un widget.

Cosa ti serve: un tracciatore #habit in Nomie, registrato nei giorni in cui fai l'abitudine. La serie parte da zero la prima volta.

Passo 1: imposta la pianificazione. Aggiungi il Pianificatore dal gruppo Nomie e scegli Giornaliero nella scheda Dettagli.

Passo 2: controlla ieri. Nel Pianificatore metti un blocco se con un ramo altrimenti. La condizione è un blocco confronto: un blocco valore giornaliero per #habit, il giorno yesterday e la statistica sum, maggiore di 0.

Passo 3: aggiorna la serie. Nel ramo se metti un blocco ricorda chiamato streak, il cui valore è un blocco richiama di streak con predefinito 0, più 1. Nel ramo altrimenti metti un blocco ricorda chiamato streak con il numero 0.

Passo 4: festeggia una settimana. Aggiungi un altro blocco se: se un richiama di streak con predefinito 0 è uguale a 7, mostra un messaggio: A week in a row!

Passo 5: tieni il record e mostra il widget. Aggiungi un blocco se: se un richiama di streak è maggiore di un richiama di best (predefinito 0), ricorda best con la serie e mostra un messaggio: New record. Poi aggiungi una dashboard chiamata Habit con l'emoji del fuoco. Dentro metti due blocchi valore: Best streak (il richiama di best) e Days in a row (il richiama di streak), una tendenza di #habit e un piè di pagina.

Verifica: premi Esegui, poi apri la sezione Anteprima nella scheda Esegui. La prima esecuzione mostra zero, perché non c'è ancora nulla di ricordato. L'esecuzione di domani conta da oggi.

Prova poi: porta la tappa a 30 giorni, e mostra un altro messaggio dopo il primo giorno di una nuova serie.`,

  'example-expert-budget-ledger': `Cosa costruisci: un registro del budget. Conserva un elenco di movimenti come oggetti, somma i costi con una funzione, avvisa quando superi il budget, legge i dati sbagliati in modo sicuro con prova e cattura, e mostra le spese su un widget. I nomi di funzioni e variabili restano in inglese, come nei blocchi.

Cosa ti serve: niente. I movimenti sono nell'esempio, così vedi ogni passo. Più avanti puoi cambiarli, oppure leggerli da un servizio web.

Passo 1: definisci la funzione costOf. Dal gruppo Funzioni aggiungi una funzione con risultato, chiamata costOf, con il parametro entry. Il risultato è un blocco ottieni oggetto per il campo cost di entry.

Passo 2: inizia la giornata. Nel Pianificatore imposta budget a 20 e spent a 0.

Passo 3: crea il registro. Imposta ledger su un blocco crea lista con tre movimenti. Ogni movimento è un blocco crea oggetto con due campi: item e cost. Usa coffee con 3, lunch con 9 e books con 12.

Passo 4: somma i movimenti. Aggiungi un ciclo per ogni su ledger, con la variabile entry. Dentro cambia spent con il risultato di costOf con entry. Poi mostra una riga: il campo item del movimento, due punti e il risultato di costOf.

Passo 5: avvisa quando superi il budget. Aggiungi un blocco se: se spent è maggiore di budget, mostra un messaggio che unisce Over budget by con spent meno budget.

Passo 6: leggi i dati sbagliati in sicurezza. Aggiungi un blocco prova e cattura. In prova leggi un testo che non è JSON valido, come {not json, con un blocco da testo JSON a oggetto. In cattura mostra un messaggio con l'errore. Aggiungi una riga finale.

Passo 7: mostra il widget. Aggiungi una dashboard chiamata Budget. Dentro metti un blocco valore per spent, e un blocco HTML con il testo Spent {{spent}} of {{budget}}, con due parametri.

Verifica: premi Esegui. La console elenca i movimenti, il messaggio segnala il superamento, e il blocco prova segnala i dati sbagliati senza fermare l'esecuzione.

Prova poi: alza il budget a 15, e il messaggio sul superamento sparisce.`,

  'example-expert-command-interpreter': `Cosa costruisci: un piccolo interprete di comandi. Legge una lista di comandi, esegue ciascuno con una funzione con una catena di se, e conserva un contatore tra le esecuzioni. I comandi sconosciuti vengono segnalati, non ignorati. I comandi stessi (up, down, reset, show) sono in inglese, come nel blocco.

Cosa ti serve: niente. I comandi sono scritti nell'esempio, quindi puoi cambiarli ed eseguire di nuovo.

Passo 1: definisci la funzione runCommand. Dal gruppo Funzioni aggiungi una funzione senza risultato, chiamata runCommand, con il parametro command. Mettici un blocco se con tre rami altrimenti-se e un ramo altrimenti: con il testo up aggiunge 1 a counter; con down ne toglie 1; con reset imposta counter a 0; con show mostra il testo Counter is e il contatore. Il ramo altrimenti segnala Unknown command e il comando.

Passo 2: carica il contatore. Nel Pianificatore imposta counter su un blocco richiama di counter con predefinito 0. Questo valore viene dalle esecuzioni precedenti.

Passo 3: dividi i comandi. Imposta commands su un blocco dividi sul testo up,up,down,show,reset,up,bogus,show, con una virgola come separatore.

Passo 4: esegui ogni comando. Aggiungi un ciclo per ogni su commands, con la variabile command. Dentro richiama runCommand con command.

Passo 5: conserva il contatore. Dopo il ciclo aggiungi un blocco ricorda chiamato counter, con il valore della variabile counter.

Passo 6: mostra il widget. Aggiungi una dashboard chiamata Counter, con un blocco valore del contatore e un piè di pagina.

Verifica: premi Esegui. La console mostra il contatore dopo i comandi show, e il comando sconosciuto bogus viene segnalato. Eseguilo di nuovo: il contatore parte da dove si era fermata l'esecuzione precedente.

Prova poi: aggiungi un comando double che moltiplica il contatore per 2, come un altro ramo altrimenti-se.`,
};
