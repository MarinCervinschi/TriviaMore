import QuizQuestion from "@/types/QuizQuestion";

const javascript: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Qual è il linguaggio di programmazione utilizzato per rendere le pagine web interattive?",
        "options": [
            "HTML",
            "CSS",
            "JavaScript",
            "Python"
        ],
        "correctAnswers": [2],
        "section": "javascript"
    },
    {
        "id": 2,
        "question": "Qual è il principale vantaggio di utilizzare JavaScript in una pagina web?",
        "options": [
            "Permette di definire il layout delle pagine web",
            "Consente di rendere le pagine web dinamiche e interattive",
            "Offre un'alternativa ai linguaggi lato server per la gestione dei database",
            "Garantisce la compatibilità con tutti i browser"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 3,
        "question": "Che cosa rappresenta l'Abstract Syntax Tree (AST) nel contesto di JavaScript?",
        "options": [
            "Una struttura dati che memorizza i cookie di una pagina",
            "Una rappresentazione strutturata del codice JavaScript",
            "Un motore di esecuzione per ottimizzare il codice",
            "Una libreria esterna per la gestione delle richieste HTTP"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 4,
        "question": "Qual è la differenza principale tra JavaScript e Java?",
        "options": [
            "Java è compilato, mentre JavaScript è interpretato",
            "Java non supporta la programmazione orientata agli oggetti",
            "JavaScript richiede sempre un compilatore per funzionare",
            "Java non può essere utilizzato su browser web"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 5,
        "question": "Quale tag HTML viene utilizzato per includere uno script JavaScript esterno?",
        "options": [
            "<style>",
            "<script src=''>",
            "<link>",
            "<meta>"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 6,
        "question": "Cosa consente di fare il tag <noscript> in una pagina HTML?",
        "options": [
            "Eseguire uno script JavaScript in background",
            "Fornire contenuti alternativi per gli utenti senza JavaScript",
            "Abilitare JavaScript nel browser dell'utente",
            "Aggiungere commenti visibili agli utenti"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 7,
        "question": "Quale di queste caratteristiche rende JavaScript un linguaggio dinamico?",
        "options": [
            "È fortemente tipizzato",
            "Non richiede la dichiarazione esplicita del tipo di variabili",
            "Supporta solo la programmazione class-based",
            "Richiede compilazione per ogni modifica al codice"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 8,
        "question": "Quale dei seguenti motori JavaScript è stato sviluppato da Google?",
        "options": [
            "SpiderMonkey",
            "V8",
            "Chakra",
            "Rhino"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 9,
        "question": "Qual è il risultato dell'operazione '5' + 3 in JavaScript?",
        "options": [
            "8",
            "53",
            "5 + 3",
            "Errore"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 10,
        "question": "Come si dichiara una variabile in JavaScript?",
        "options": [
            "using var",
            "using let",
            "using const",
            "Tutte le precedenti"
        ],
        "correctAnswers": [3],
        "section": "javascript"
    },
    {
        "id": 11,
        "question": "Qual è il valore di una variabile dichiarata ma non inizializzata?",
        "options": [
            "null",
            "undefined",
            "0",
            "false"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 12,
        "question": "Quale valore rappresenta l'assenza di un valore in JavaScript?",
        "options": [
            "NaN",
            "null",
            "undefined",
            "infinity"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 13,
        "question": "Qual è la principale differenza tra NaN e undefined?",
        "options": [
            "NaN rappresenta un errore nei calcoli matematici, undefined indica una variabile non inizializzata.",
            "undefined rappresenta un errore nei calcoli matematici, NaN indica una variabile non inizializzata.",
            "Entrambi indicano lo stesso valore.",
            "NaN si usa solo con stringhe, mentre undefined si usa con numeri."
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 14,
        "question": "Come si può creare un oggetto vuoto in JavaScript?",
        "options": [
            "var obj = Object();",
            "var obj = {};",
            "var obj = new Object();",
            "Tutte le precedenti"
        ],
        "correctAnswers": [3],
        "section": "javascript"
    },
    {
        "id": 15,
        "question": "Quale metodo è usato per ottenere la lunghezza di una stringa?",
        "options": [
            ".length",
            ".size",
            ".count",
            ".chars"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 16,
        "question": "Quale delle seguenti sintassi è corretta per creare un array in JavaScript?",
        "options": [
            "var arr = Array();",
            "var arr = [];",
            "var arr = new Array();",
            "Tutte le precedenti"
        ],
        "correctAnswers": [3],
        "section": "javascript"
    },
    {
        "id": 17,
        "question": "Qual è la differenza principale tra un array e un oggetto in JavaScript?",
        "options": [
            "Gli array utilizzano indici numerici, mentre gli oggetti utilizzano chiavi stringa.",
            "Gli oggetti sono sempre immutabili, mentre gli array sono modificabili.",
            "Gli array sono di lunghezza fissa, mentre gli oggetti possono crescere dinamicamente.",
            "Non c'è differenza tra array e oggetti in JavaScript."
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 18,
        "question": "Come si accede a una proprietà chiamata 'nome' di un oggetto in JavaScript?",
        "options": [
            "oggetto['nome']",
            "oggetto.nome",
            "Tutte le precedenti",
            "Nessuna delle precedenti"
        ],
        "correctAnswers": [2],
        "section": "javascript"
    },
    {
        "id": 19,
        "question": "Quale funzione JavaScript restituisce una stringa rappresentante il tipo del suo operando?",
        "options": [
            "typeof",
            "typeofof",
            "type",
            "typeOf"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 20,
        "question": "Quale oggetto JavaScript fornisce informazioni sul browser in uso?",
        "options": [
            "window",
            "navigator",
            "document",
            "screen"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 21,
        "question": "Quale metodo JavaScript permette di scrivere direttamente all'interno di una pagina HTML durante il caricamento?",
        "options": [
            "console.log()",
            "document.write()",
            "alert()",
            "document.querySelector()"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 22,
        "question": "Qual è l'oggetto JavaScript utilizzato per accedere alle informazioni sullo schermo?",
        "options": [
            "navigator",
            "window",
            "screen",
            "document"
        ],
        "correctAnswers": [2],
        "section": "javascript"
    },
    {
        "id": 23,
        "question": "Quale evento viene attivato quando un controllo perde il focus?",
        "options": [
            "onclick",
            "onblur",
            "onfocus",
            "onchange"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 24,
        "question": "Quale metodo restituisce un riferimento a un elemento della pagina tramite il suo ID?",
        "options": [
            "getElementById(id)",
            "querySelector(id)",
            "getElementsByClassName(class)",
            "getElementByName(name)"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 25,
        "question": "Quale proprietà dell'oggetto 'form' rappresenta il numero di elementi presenti al suo interno?",
        "options": [
            "count",
            "length",
            "elements.length",
            "size"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 26,
        "question": "Quale tipo di controllo form HTML permette di selezionare solo una delle opzioni disponibili?",
        "options": [
            "Checkbox",
            "Radio",
            "Textarea",
            "File"
        ],
        "correctAnswers": [1],
        "section": "javascript"
    },
    {
        "id": 27,
        "question": "Quale evento viene utilizzato per validare i dati di un form prima del suo invio?",
        "options": [
            "onsubmit",
            "onreset",
            "onblur",
            "onchange"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 28,
        "question": "Qual è la funzione principale della libreria jQuery?",
        "options": [
            "Rendere il codice JavaScript più leggibile",
            "Creare applicazioni server-side",
            "Semplificare l'attraversamento del DOM e la gestione degli eventi",
            "Scrivere CSS più facilmente"
        ],
        "correctAnswers": [2],
        "section": "javascript"
    },
    {
        "id": 29,
        "question": "Quale proprietà dell'oggetto 'screen' restituisce l'altezza dello schermo in pixel?",
        "options": [
            "height",
            "screenHeight",
            "resolution",
            "windowHeight"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
    {
        "id": 30,
        "question": "Quale metodo jQuery è utilizzato per selezionare un elemento con uno specifico ID?",
        "options": [
            "$('#id')",
            "document.getElementById(id)",
            "$.querySelector(id)",
            "$.select(id)"
        ],
        "correctAnswers": [0],
        "section": "javascript"
    },
];

export default javascript;