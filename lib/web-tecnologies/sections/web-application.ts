import QuizQuestion from "@/types/QuizQuestion";

const webApplication: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Quali sono i componenti principali di un'applicazione web?",
        "options": [
            "Web Server",
            "Application Server",
            "Client API",
            "Database"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-application"
    },
    {
        "id": 2,
        "question": "Quali linguaggi vengono comunemente utilizzati per il codice lato client di un'applicazione web?",
        "options": [
            "HTML",
            "CSS",
            "Python",
            "JavaScript"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-application"
    },
    {
        "id": 3,
        "question": "Quali sono le caratteristiche principali di un sito web tradizionale rispetto a un'applicazione web?",
        "options": [
            "Coinvolgimento utente elevato",
            "Contenuti prevalentemente statici",
            "Richiede autenticazione",
            "Facilità di integrazione con altri software"
        ],
        "correctAnswers": [1, 3],
        "section": "web-application"
    },
    {
        "id": 4,
        "question": "Quali vantaggi offre una Single Page Application (SPA)?",
        "options": [
            "Alte prestazioni",
            "Navigazione fluida",
            "Maggiore compatibilità SEO rispetto alle applicazioni a pagine multiple",
            "Migliore esperienza utente"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-application"
    },
    {
        "id": 5,
        "question": "Quali di questi elementi fanno parte del frontend di un'applicazione web?",
        "options": [
            "Interfaccia utente (UI)",
            "Gestione della logica applicativa",
            "Elaborazione dei dati lato server",
            "Componenti interattivi come bottoni e form"
        ],
        "correctAnswers": [0, 3],
        "section": "web-application"
    },
    {
        "id": 6,
        "question": "Quali sono i principali vantaggi di utilizzare un framework frontend come React o Angular?",
        "options": [
            "Componenti riutilizzabili",
            "Migliore gestione dello stato",
            "Maggiore sicurezza del database",
            "Rendering dinamico delle interfacce utente"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-application"
    },
    {
        "id": 7,
        "question": "Quale dei seguenti è un ruolo del database in un'applicazione web?",
        "options": [
            "Memorizzare informazioni essenziali come i dati degli utenti",
            "Eseguire la logica applicativa",
            "Fornire contenuti multimediali direttamente all'utente",
            "Generare codice HTML dinamicamente"
        ],
        "correctAnswers": [0],
        "section": "web-application"
    },
    {
        "id": 8,
        "question": "Quali sono gli step principali del processo di accesso a una web application?",
        "options": [
            "Invio della richiesta (GET o POST)",
            "Rendering delle immagini sul client",
            "Elaborazione della richiesta sul server",
            "Ritorno della risposta al client"
        ],
        "correctAnswers": [0, 2, 3],
        "section": "web-application"
    },
    {
        "id": 9,
        "question": "Quali tecnologie vengono tipicamente utilizzate per il backend di un'applicazione web?",
        "options": [
            "Node.js",
            "Flask",
            "React",
            "Django"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-application"
    },
    {
        "id": 10,
        "question": "Quali caratteristiche rendono un sito web compatibile con la SEO?",
        "options": [
            "Struttura ottimizzata per i motori di ricerca",
            "Navigazione fluida per gli utenti",
            "Facilità di indicizzazione da parte dei motori di ricerca",
            "Presenza di contenuti aggiornabili in tempo reale"
        ],
        "correctAnswers": [0, 2],
        "section": "web-application"
    },
    {
        "id": 11,
        "question": "Quali sono i principali vantaggi nell'uso di un web framework?",
        "options": [
            "Automatizzazione di compiti comuni",
            "Miglioramento della sicurezza",
            "Aumento della complessità del codice",
            "Sviluppo più rapido"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-framework"
    },
    {
        "id": 12,
        "question": "Quali delle seguenti affermazioni descrivono un microframework?",
        "options": [
            "Offre solo funzionalità essenziali come routing e gestione delle sessioni",
            "Include strumenti integrati per autenticazione e gestione del database",
            "È più leggero e modulare rispetto a un full-stack framework",
            "Richiede librerie aggiuntive per funzionalità avanzate"
        ],
        "correctAnswers": [0, 2, 3],
        "section": "web-framework"
    },
    {
        "id": 13,
        "question": "Quale delle seguenti affermazioni è vera riguardo all'architettura MVC?",
        "options": [
            "Il Model si occupa della logica di business e della gestione dei dati",
            "La View gestisce l'interazione con l'utente",
            "Il Controller si occupa della visualizzazione dei dati",
            "Il Model si occupa esclusivamente dell'interfaccia grafica"
        ],
        "correctAnswers": [0, 1],
        "section": "web-framework"
    },
    {
        "id": 14,
        "question": "Quali tra questi linguaggi di programmazione hanno framework per lo sviluppo web?",
        "options": [
            "Python",
            "Java",
            "C#",
            "Excel"
        ],
        "correctAnswers": [0, 1, 2],
        "section": "web-framework"
    },
    {
        "id": 15,
        "question": "Quali delle seguenti sono caratteristiche di PHP come linguaggio di programmazione web?",
        "options": [
            "È open-source",
            "Non supporta l'integrazione con database",
            "Può essere facilmente integrato con HTML",
            "È utilizzato per applicazioni lato client"
        ],
        "correctAnswers": [0, 2],
        "section": "web-framework"
    },
    {
        "id": 16,
        "question": "Quali dei seguenti vantaggi offre il framework .NET?",
        "options": [
            "Supporta più linguaggi di programmazione",
            "Fornisce strumenti per il monitoraggio e il controllo",
            "È specifico solo per applicazioni mobili",
            "Offre scalabilità per progetti di varie dimensioni"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-framework"
    },
    {
        "id": 17,
        "question": "Quale delle seguenti caratteristiche distingue il linguaggio di programmazione Java?",
        "options": [
            "Compilazione in bytecode eseguita dalla JVM",
            "L'approccio 'Write Once, Run Anywhere'",
            "È utilizzato esclusivamente per sviluppo web",
            "Necessita di un interprete per l'esecuzione"
        ],
        "correctAnswers": [0, 1],
        "section": "web-framework"
    },
    {
        "id": 18,
        "question": "Quali sono alcuni vantaggi dell'uso di Python per lo sviluppo web?",
        "options": [
            "Leggibilità del codice",
            "Supporto per intelligenza artificiale e machine learning",
            "Difficoltà di integrazione con altri strumenti",
            "Disponibilità di framework come Django e Flask"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-framework"
    },
    {
        "id": 19,
        "question": "Quali dei seguenti framework appartengono alla categoria dei Full-Stack Framework?",
        "options": [
            "Django",
            "Flask",
            "Spring",
            "Express.js"
        ],
        "correctAnswers": [0, 2, 3],
        "section": "web-framework"
    },
    {
        "id": 20,
        "question": "Quale delle seguenti affermazioni è vera riguardo a un Full-Stack Framework?",
        "options": [
            "Fornisce strumenti sia per il frontend che per il backend",
            "Include funzionalità di autenticazione e gestione del database",
            "È meno complesso di un microframework",
            "Offre una struttura completa per lo sviluppo web"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "web-framework"
    }
];

export default webApplication;