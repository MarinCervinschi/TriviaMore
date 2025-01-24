import QuizQuestion from "@/types/QuizQuestion";

const css: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Qual è lo scopo principale dei fogli di stile CSS?",
        "options": [
            "Definire il contenuto di una pagina web",
            "Definire come il contenuto deve essere presentato all'utente",
            "Gestire le connessioni tra server e client",
            "Archiviare dati su server remoti"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 2,
        "question": "Qual è il principale vantaggio dell'uso di file CSS esterni?",
        "options": [
            "Consentono stili personalizzati per singoli elementi",
            "Facilitano l'applicazione degli stili a più pagine",
            "Evitano la necessità di dichiarare classi in HTML",
            "Consentono agli utenti di modificare direttamente lo stile dal browser"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 3,
        "question": "Qual è la sintassi corretta per definire una regola CSS?",
        "options": [
            "selettore { proprietà: valore; }",
            "proprietà { valore: selettore; }",
            "selettore ( proprietà: valore )",
            "valore: proprietà { selettore }"
        ],
        "correctAnswers": [0],
        "section": "css"
    },
    {
        "id": 4,
        "question": "Come si applica uno stile a tutti i paragrafi di una pagina HTML?",
        "options": [
            "* { color: red; }",
            "p { color: red; }",
            ".p { color: red; }",
            "#p { color: red; }"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 5,
        "question": "Qual è l'ordine di priorità nella risoluzione dei conflitti CSS?",
        "options": [
            "Stili inline, stili esterni, stili predefiniti del browser",
            "Stili predefiniti del browser, stili esterni, stili inline",
            "Stili esterni, stili inline, stili predefiniti del browser",
            "Stili esterni, stili predefiniti del browser, stili inline"
        ],
        "correctAnswers": [0],
        "section": "css"
    },
    {
        "id": 6,
        "question": "Quale dichiarazione CSS assegna priorità assoluta a una regola?",
        "options": [
            "specificità",
            "!important",
            "inline",
            "media query"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 7,
        "question": "Quale selettore CSS seleziona tutti gli elementi con l'attributo class=\"header\"?",
        "options": [
            "#header",
            ".header",
            "header",
            "*header"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 8,
        "question": "Quale selettore viene usato per selezionare un elemento con id=\"main\"?",
        "options": [
            "#main",
            ".main",
            "main",
            "*main"
        ],
        "correctAnswers": [0],
        "section": "css"
    },
    {
        "id": 9,
        "question": "Quale proprietà CSS è usata per cambiare il colore del testo?",
        "options": [
            "text-color",
            "font-color",
            "color",
            "text-style"
        ],
        "correctAnswers": [2],
        "section": "css"
    },
    {
        "id": 10,
        "question": "Quale proprietà CSS definisce lo spazio interno di un elemento?",
        "options": [
            "margin",
            "border",
            "padding",
            "content"
        ],
        "correctAnswers": [2],
        "section": "css"
    },
    {
        "id": 11,
        "question": "Qual è la funzione principale di una media query in CSS?",
        "options": [
            "Caricare file CSS diversi per dispositivi mobili",
            "Applicare stili specifici in base alle caratteristiche del dispositivo",
            "Definire una struttura flessibile per i layout",
            "Ottimizzare il caricamento delle immagini"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 12,
        "question": "Qual è la differenza tra padding e margin?",
        "options": [
            "Il padding controlla lo spazio tra il contenuto e il bordo, il margin lo spazio esterno",
            "Il margin controlla lo spazio tra il contenuto e il bordo, il padding lo spazio esterno",
            "Entrambi controllano lo spazio interno di un elemento",
            "Padding e margin sono usati per creare layout flessibili"
        ],
        "correctAnswers": [0],
        "section": "css"
    },
    {
        "id": 13,
        "question": "Quale regola CSS consente di selezionare il terzo elemento di una lista ordinata?",
        "options": [
            "ol li:nth-child(3)",
            "ol li:third",
            "ol li::nth(3)",
            "ol li:nth-of-type(3)"
        ],
        "correctAnswers": [0],
        "section": "css"
    },
    {
        "id": 14,
        "question": "Quale unità di misura è relativa alla dimensione del carattere corrente?",
        "options": [
            "px",
            "em",
            "cm",
            "pt"
        ],
        "correctAnswers": [1],
        "section": "css"
    },
    {
        "id": 15,
        "question": "Quale proprietà CSS permette di aggiungere un'ombreggiatura al testo?",
        "options": [
            "text-outline",
            "text-shadow",
            "font-shadow",
            "box-shadow"
        ],
        "correctAnswers": [1],
        "section": "css"
    }
];

export default css;