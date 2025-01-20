
import { QuizQuestion } from "./quiz-data";

const ajax: QuizQuestion[] = [
    {
        "id": 0,
        "question": "Quale tecnologia permette di inviare e ricevere dati dal server in modo asincrono senza ricaricare la pagina?",
        "options": [
            "XML",
            "DHTML",
            "AJAX",
            "CSS"
        ],
        "correctAnswers": [2],
        "section": "ajax"
    },
    {
        "id": 1,
        "question": "Quale oggetto JavaScript viene utilizzato per inviare richieste HTTP asincrone al server?",
        "options": [
            "fetch",
            "XMLHttpRequest",
            "HTTPrequest",
            "requestAPI"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 2,
        "question": "Qual è uno dei principali vantaggi della comunicazione asincrona in AJAX?",
        "options": [
            "Blocca l'interazione con la pagina fino alla risposta del server",
            "Consente di aggiornare dinamicamente i contenuti senza ricaricare la pagina",
            "Richiede il ricaricamento della pagina ad ogni richiesta",
            "Riduce il carico del server eliminando completamente le richieste"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 3,
        "question": "Qual è la sequenza corretta degli eventi in un'operazione AJAX?",
        "options": [
            "Esecuzione funzione JavaScript → Evento utente → Configurazione XMLHttpRequest → Risposta del server",
            "Evento utente → Esecuzione funzione JavaScript → Istanziazione XMLHttpRequest → Configurazione XMLHttpRequest → Chiamata al server → Risposta del server → Aggiornamento del DOM",
            "Chiamata al server → Evento utente → Risposta del server → Configurazione XMLHttpRequest → Aggiornamento del DOM",
            "Aggiornamento del DOM → Istanziazione XMLHttpRequest → Configurazione XMLHttpRequest → Evento utente"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 4,
        "question": "Quale metodo di richiesta AJAX invia dati nel corpo della richiesta?",
        "options": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 5,
        "question": "Quale tra le seguenti affermazioni è vera riguardo XMLHttpRequest?",
        "options": [
            "Sostituisce sempre l'URI corrente",
            "Non può inviare parametri al server",
            "Può essere utilizzato solo per richieste nello stesso dominio per motivi di sicurezza",
            "Supporta solo richieste di tipo GET"
        ],
        "correctAnswers": [2],
        "section": "ajax"
    },
    {
        "id": 6,
        "question": "Come si crea un'istanza di XMLHttpRequest nei browser moderni?",
        "options": [
            "var xhr = new XMLHttpRequest();",
            "var xhr = XMLHttpRequest.create();",
            "var xhr = new requestXML();",
            "var xhr = new HttpRequest();"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 7,
        "question": "Cosa rappresenta il termine 'postback' nelle applicazioni web tradizionali?",
        "options": [
            "Una tecnica per inviare dati al server e aggiornare la pagina senza ricaricarla",
            "Un'operazione in cui la pagina viene ricaricata dopo aver inviato dati al server",
            "Un metodo per gestire gli eventi a livello di client senza interagire con il server",
            "Una funzione JavaScript per inviare dati a server esterni"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 8,
        "question": "Quale tecnologia combina JavaScript, DOM e CSS per creare pagine web dinamiche?",
        "options": [
            "AJAX",
            "DHTML",
            "XML",
            "JSON"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 9,
        "question": "Cosa significa che una richiesta AJAX è asincrona?",
        "options": [
            "L'esecuzione del codice viene bloccata fino alla risposta del server",
            "Il codice continua a essere eseguito mentre si attende la risposta dal server",
            "La richiesta viene inviata più volte per assicurare la ricezione della risposta",
            "La richiesta può essere effettuata solo dopo aver ricevuto una risposta precedente"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 10,
        "question": "Quale metodo di XMLHttpRequest viene utilizzato per inizializzare una richiesta?",
        "options": [
            "setRequestHeader()",
            "open()",
            "send()",
            "abort()"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 11,
        "question": "Qual è il parametro che deve essere impostato su 'true' per garantire un'esecuzione asincrona della richiesta?",
        "options": [
            "method",
            "uri",
            "async",
            "status"
        ],
        "correctAnswers": [2],
        "section": "ajax"
    },
    {
        "id": 12,
        "question": "Quale metodo viene utilizzato per impostare gli header HTTP di una richiesta XMLHttpRequest?",
        "options": [
            "setRequestHeader()",
            "open()",
            "send()",
            "getResponseHeader()"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 13,
        "question": "Quale metodo di XMLHttpRequest invia la richiesta al server?",
        "options": [
            "open()",
            "send()",
            "setRequestHeader()",
            "abort()"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 14,
        "question": "Quale proprietà di XMLHttpRequest contiene il codice di stato della risposta HTTP?",
        "options": [
            "status",
            "readyState",
            "responseText",
            "responseXML"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 15,
        "question": "Quale valore della proprietà readyState indica che l'operazione è stata completata?",
        "options": [
            "0",
            "2",
            "3",
            "4"
        ],
        "correctAnswers": [3],
        "section": "ajax"
    },
    {
        "id": 16,
        "question": "In quale stato di readyState è possibile leggere in modo sicuro la risposta completa del server?",
        "options": [
            "0",
            "1",
            "3",
            "4"
        ],
        "correctAnswers": [3],
        "section": "ajax"
    },
    {
        "id": 17,
        "question": "Quale metodo di XMLHttpRequest consente di interrompere immediatamente una richiesta in corso?",
        "options": [
            "abort()",
            "close()",
            "terminate()",
            "stop()"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 18,
        "question": "Quale funzione viene utilizzata per registrare una callback da eseguire quando cambia lo stato di una richiesta XMLHttpRequest?",
        "options": [
            "onreadystatechange",
            "callbackFunction",
            "requestState",
            "setCallback"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 19,
        "question": "Quale proprietà di XMLHttpRequest contiene i dati restituiti dal server come stringa?",
        "options": [
            "responseXML",
            "responseText",
            "statusText",
            "responseBody"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 20,
        "question": "Qual è l'unico codice di stato HTTP che garantisce il successo di una richiesta AJAX?",
        "options": [
            "200",
            "403",
            "404",
            "500"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 21,
        "question": "Quale formato di dati è comunemente utilizzato per scambiare informazioni tra client e server in AJAX?",
        "options": [
            "HTML",
            "CSS",
            "JSON",
            "PHP"
        ],
        "correctAnswers": [2],
        "section": "ajax"
    },
    {
        "id": 22,
        "question": "Quale metodo di XMLHttpRequest consente di ottenere il valore di uno specifico header di risposta?",
        "options": [
            "getResponseHeader()",
            "getAllResponseHeaders()",
            "setRequestHeader()",
            "fetchHeader()"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 23,
        "question": "Qual è una delle principali criticità dello sviluppo con AJAX?",
        "options": [
            "Tempi di risposta troppo veloci",
            "Difficoltà di debugging e mantenimento",
            "Mancanza di interattività",
            "Necessità di ricaricare la pagina"
        ],
        "correctAnswers": [1],
        "section": "ajax"
    },
    {
        "id": 24,
        "question": "Quale tra questi è un vantaggio dell'uso di AJAX nelle applicazioni web?",
        "options": [
            "Maggiore interattività senza ricaricare la pagina",
            "Maggiore complessità per l'utente",
            "Necessità di aggiornamenti costanti del browser",
            "Aumento del traffico di rete"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
    {
        "id": 25,
        "question": "Cosa si consiglia di fare per migliorare l'interazione utente durante le richieste AJAX?",
        "options": [
            "Utilizzare indicatori di caricamento",
            "Evitare richieste asincrone",
            "Limitare il numero di richieste a una sola",
            "Nascondere gli errori all'utente"
        ],
        "correctAnswers": [0],
        "section": "ajax"
    },
];

export default ajax;