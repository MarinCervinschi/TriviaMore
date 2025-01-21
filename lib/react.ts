
import { QuizQuestion } from "./quiz-data";

const react: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Qual è il ruolo principale di React nello sviluppo web?",
        "options": [
            "Gestione del back-end delle applicazioni",
            "Rendering delle interfacce utente",
            "Gestione dei database",
            "Creazione di API REST"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 2,
        "question": "In quale anno è stato rilasciato pubblicamente React?",
        "options": [
            "2011",
            "2012",
            "2013",
            "2015"
        ],
        "correctAnswers": [2],
        "section": "react"
    },
    {
        "id": 3,
        "question": "Quale delle seguenti affermazioni è vera riguardo React?",
        "options": [
            "È un framework full-stack",
            "Si occupa del front-end e back-end",
            "Si basa su JavaScript ed esegue il codice nel browser",
            "Richiede un server per funzionare"
        ],
        "correctAnswers": [2],
        "section": "react"
    },
    {
        "id": 4,
        "question": "Qual è il principale vantaggio dell'approccio Single Page Application (SPA) utilizzato da React?",
        "options": [
            "Riduzione del tempo di caricamento iniziale",
            "Interfaccia più interattiva senza ricaricare la pagina",
            "Miglior gestione del database",
            "Maggiore sicurezza rispetto alle applicazioni tradizionali"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 5,
        "question": "Quali sono le principali caratteristiche di React?",
        "options": [
            "Architettura a componenti",
            "Virtual DOM",
            "Multi-threading",
            "One-Way Data Flow"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "react"
    },
    {
        "id": 6,
        "question": "Qual è la funzione principale del Virtual DOM in React?",
        "options": [
            "Aumentare la sicurezza dell'applicazione",
            "Ridurre le modifiche al DOM reale per migliorare le prestazioni",
            "Gestire le chiamate API in modo più efficiente",
            "Memorizzare i dati lato client"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 7,
        "question": "Cos'è JSX in React?",
        "options": [
            "Un linguaggio di programmazione separato",
            "Un'estensione di sintassi che permette di scrivere markup HTML dentro JavaScript",
            "Un database per memorizzare dati dell'interfaccia",
            "Un framework per la gestione delle API"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 8,
        "question": "Quali regole bisogna seguire quando si scrive codice JSX?",
        "options": [
            "Restituire un singolo elemento radice",
            "Chiudere tutti i tag",
            "Usare nomi di attributi in camelCase",
            "Separare logica e markup in file distinti"
        ],
        "correctAnswers": [0, 1, 2],
        "section": "react"
    },
    {
        "id": 9,
        "question": "Quale attributo viene utilizzato in React al posto di 'class' in HTML?",
        "options": [
            "cssClass",
            "className",
            "classReact",
            "styleClass"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 10,
        "question": "Quale funzione ha Babel in un progetto React?",
        "options": [
            "Compilare JSX in JavaScript standard",
            "Gestire le chiamate API",
            "Eseguire il rendering dell'interfaccia utente",
            "Fornire un database integrato"
        ],
        "correctAnswers": [0],
        "section": "react"
    },
    {
        "id": 11,
        "question": "Come si possono inserire espressioni JavaScript all'interno di JSX?",
        "options": [
            "Usando le parentesi graffe {}",
            "Usando le doppie parentesi graffe {{}}",
            "Scrivendole direttamente senza parentesi",
            "Includendole tra virgolette"
        ],
        "correctAnswers": [0],
        "section": "react"
    },
    {
        "id": 12,
        "question": "Quando si usa `{{ }}` in JSX?",
        "options": [
            "Per definire oggetti all'interno del markup",
            "Per scrivere funzioni inline",
            "Per inserire array nel markup",
            "Per definire variabili globali"
        ],
        "correctAnswers": [0],
        "section": "react"
    },
    {
        "id": 13,
        "question": "Quali vantaggi offre React per lo sviluppatore?",
        "options": [
            "Riutilizzo del codice",
            "Separazione della logica e interfaccia",
            "Costruzione modulare e scalabile",
            "Gestione avanzata dei database"
        ],
        "correctAnswers": [0, 1, 2],
        "section": "react"
    },
    {
        "id": 14,
        "question": "Qual è uno dei principali benefici per l'utente nell'uso di React?",
        "options": [
            "Maggiore interattività dell'interfaccia grazie al Virtual DOM",
            "Migliore gestione del back-end",
            "Accesso diretto ai dati del server",
            "Maggiore protezione dei dati personali"
        ],
        "correctAnswers": [0],
        "section": "react"
    },
    {
        "id": 15,
        "question": "Come si chiama l'algoritmo che React utilizza per confrontare il Virtual DOM con il DOM reale?",
        "options": [
            "Rendering",
            "Reconciliation",
            "Diffing",
            "Syncing"
        ],
        "correctAnswers": [2],
        "section": "react"
    },
    {
        "id": 16,
        "question": "Quale metodo viene utilizzato per renderizzare un React Element nel DOM?",
        "options": [
            "React.render()",
            "ReactDOM.render()",
            "document.render()",
            "React.createElement()"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 17,
        "question": "Quale affermazione è vera riguardo ai componenti React?",
        "options": [
            "Devono sempre restituire un singolo elemento radice.",
            "I nomi dei componenti devono iniziare con una lettera maiuscola.",
            "I componenti possono essere definiti solo come funzioni.",
            "I componenti non possono accettare props."
        ],
        "correctAnswers": [0, 1],
        "section": "react"
    },
    {
        "id": 18,
        "question": "Come viene definito un componente React basato su classe?",
        "options": [
            "function ComponentName() {}",
            "const ComponentName = () => {}",
            "class ComponentName extends React.Component {}",
            "React.createClass(ComponentName)"
        ],
        "correctAnswers": [2],
        "section": "react"
    },
    {
        "id": 19,
        "question": "Quale metodo deve essere definito all'interno di un componente di classe React?",
        "options": [
            "execute()",
            "render()",
            "display()",
            "init()"
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 20,
        "question": "Cosa sono i 'props' in React?",
        "options": [
            "Variabili locali definite all'interno di un componente.",
            "Valori immutabili passati da un componente padre a un componente figlio.",
            "Funzioni che restituiscono elementi React.",
            "Eventi speciali di React."
        ],
        "correctAnswers": [1],
        "section": "react"
    },
    {
        "id": 21,
        "question": "Quale hook viene utilizzato per gestire lo stato nei componenti a funzione in React?",
        "options": [
            "useEffect",
            "useContext",
            "useState",
            "useReducer"
        ],
        "correctAnswers": [2],
        "section": "react"
    },
    {
        "id": 22,
        "question": "Quale delle seguenti è una caratteristica delle Synthetic Events in React?",
        "options": [
            "Garantiscono compatibilità cross-browser.",
            "Sono meno efficienti degli eventi nativi.",
            "Utilizzano il bubbling e capturing nativo.",
            "Non supportano `preventDefault()` e `stopPropagation()`."
        ],
        "correctAnswers": [0, 2],
        "section": "react"
    },
    {
        "id": 23,
        "question": "Come si associa un gestore di eventi a un elemento JSX in React?",
        "options": [
            "Usando attributi in minuscolo come `onclick`.",
            "Passando la funzione senza parentesi.",
            "Utilizzando funzioni anonime direttamente nel JSX.",
            "Utilizzando la sintassi PascalCase per gli eventi."
        ],
        "correctAnswers": [1, 2],
        "section": "react"
    },
    {
        "id": 24,
        "question": "Quale metodo viene utilizzato per ottenere dati da un'API in React?",
        "options": [
            "getAPI()",
            "fetch()",
            "axios.get()",
            "ReactHTTP()"
        ],
        "correctAnswers": [1, 2],
        "section": "react"
    },
    {
        "id": 25,
        "question": "Quali sono i passaggi corretti per definire un componente a funzione in React?",
        "options": [
            "Esportare la funzione.",
            "Dichiarare la funzione con la lettera minuscola.",
            "Restituire il markup con il return.",
            "Includere lo stato con `useState`."
        ],
        "correctAnswers": [0, 2, 3],
        "section": "react"
    }
]

export default react;