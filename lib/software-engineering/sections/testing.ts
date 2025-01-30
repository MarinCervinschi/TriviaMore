import QuizQuestion from "@/types/QuizQuestion";

const testing: QuizQuestion[] = [
    {
        id: 1,
        question: "Qual è la differenza tra verifica e validazione nel processo di testing del software?",
        options: [
            "La verifica controlla che il software soddisfi i requisiti tecnici, mentre la validazione verifica che soddisfi le esigenze degli utenti.",
            "La validazione si concentra solo sulla documentazione, mentre la verifica si occupa del codice.",
            "La verifica è svolta dai tester dopo lo sviluppo, mentre la validazione avviene durante la progettazione.",
            "La verifica e la validazione sono sinonimi e si riferiscono allo stesso processo."
        ],
        correctAnswers: [0],
        section: "Testing"
    },
    {
        id: 2,
        question: "Quale tra le seguenti attività fa parte del Controllo della Qualità (Quality Control)?",
        options: [
            "Definizione delle strategie di sviluppo",
            "Esecuzione di casi di test per identificare difetti",
            "Monitoraggio del processo produttivo",
            "Valutazione delle competenze del team di sviluppo"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 3,
        question: "Quale livello di testing si concentra sulla verifica delle interazioni tra componenti software?",
        options: [
            "Acceptance Test",
            "Unit Test",
            "Integration Test",
            "System Test"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 4,
        question: "Cosa caratterizza il testing funzionale?",
        options: [
            "Verifica la stabilità del sistema sotto carico",
            "Analizza il comportamento del software rispetto alle specifiche funzionali",
            "Valuta la manutenibilità del codice",
            "Conferma che il codice segua standard aziendali"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 5,
        question: "Quale tecnica si utilizza nel Black-box testing per testare i valori limite?",
        options: [
            "Equivalence Partitioning",
            "Boundary Value Analysis",
            "Path Testing",
            "Error Guessing"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 6,
        question: "Chi esegue generalmente l'Acceptance Test?",
        options: [
            "Sviluppatori",
            "Tester professionisti",
            "Stakeholder e utenti finali",
            "Project manager"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 7,
        question: "Qual è l'obiettivo principale del Regression Testing?",
        options: [
            "Garantire che nuove funzionalità non abbiano introdotto difetti in funzioni già esistenti",
            "Ottimizzare le performance del software",
            "Verificare che l'interfaccia utente sia conforme agli standard",
            "Analizzare il codice sorgente senza eseguirlo"
        ],
        correctAnswers: [0],
        section: "Testing"
    },
    {
        id: 8,
        question: "In cosa consiste l'Equivalence Partitioning nel Black-box testing?",
        options: [
            "Testare tutti i percorsi del codice sorgente",
            "Dividere gli input in classi equivalenti e testare un rappresentante per ogni classe",
            "Identificare errori comuni basandosi sull'intuito",
            "Verificare la sicurezza del sistema in situazioni anomale"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 9,
        question: "Qual è il livello di testing che verifica singoli componenti o moduli del software?",
        options: [
            "Unit Test",
            "Integration Test",
            "System Test",
            "Acceptance Test"
        ],
        correctAnswers: [0],
        section: "Testing"
    },
    {
        id: 10,
        question: "Quale fase del processo di testing prevede la definizione dei test case e la preparazione dell'ambiente?",
        options: [
            "Esecuzione",
            "Progettazione",
            "Analisi",
            "Completion"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 11,
        question: "Qual è l'obiettivo principale della Statement Coverage?",
        options: [
            "Verificare che ogni decisione sia valutata come vera e falsa",
            "Assicurare che ogni riga di codice venga eseguita almeno una volta",
            "Testare condizioni atomiche nelle decisioni",
            "Verificare il comportamento dei cicli in vari scenari"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 12,
        question: "Quale tecnica di testing verifica che ogni decisione venga valutata sia come vera che come falsa?",
        options: [
            "Statement Coverage",
            "Decision Coverage",
            "Condition Coverage",
            "Loop Coverage"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 13,
        question: "Qual è uno scenario fondamentale da testare nella Loop Coverage?",
        options: [
            "Ogni riga di codice deve essere eseguita almeno una volta",
            "Verificare che ogni decisione sia valutata sia come vera che come falsa",
            "Zero iterazioni, una sola iterazione e numero massimo di iterazioni",
            "Solo testare il massimo numero di iterazioni"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 14,
        question: "La Condition Coverage si concentra su:",
        options: [
            "Verificare che ogni ciclo venga eseguito almeno una volta",
            "Assicurare che ogni condizione atomica sia testata sia come TRUE che FALSE",
            "Analizzare il flusso complessivo del programma",
            "Verificare ogni percorso di esecuzione"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 15,
        question: "Quale affermazione è vera per la Modified Condition/Decision Coverage (MC/DC)?",
        options: [
            "Ogni ciclo deve essere eseguito almeno una volta",
            "Ogni condizione atomica deve essere valutata sia come TRUE che FALSE, e deve esserci almeno un test in cui una specifica condizione influenza il risultato del predicato",
            "Assicura solo la copertura delle decisioni",
            "Analizza esclusivamente la copertura delle dichiarazioni"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 16,
        question: "Qual è l'obiettivo principale del Path Testing?",
        options: [
            "Verificare ogni decisione come vera e falsa",
            "Assicurare la copertura di tutte le condizioni atomiche",
            "Esplorare e testare tutte le possibili sequenze nel flusso di esecuzione del codice",
            "Assicurare che ogni ciclo venga eseguito almeno una volta"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 17,
        question: "Qual è la principale differenza tra ispezioni e review?",
        options: [
            "Le ispezioni sono meno formali rispetto alle review",
            "Le review si concentrano solo sul codice sorgente",
            "Le ispezioni sono un processo formale e strutturato, mentre le review sono meno formali",
            "Entrambe sono ugualmente formali e non differiscono"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 18,
        question: "Qual è uno dei vantaggi principali delle tecniche automatizzate nel testing?",
        options: [
            "Aumentano il tempo di sviluppo del software",
            "Riducono la ripetibilità dei test",
            "Consentono di eseguire test su un ampio spettro di scenari in tempi brevi",
            "Sono meno affidabili dei test manuali"
        ],
        correctAnswers: [2],
        section: "Testing"
    },
    {
        id: 19,
        question: "Quale affermazione è vera riguardo a FindBugs?",
        options: [
            "Esegue il codice per identificare errori",
            "Analizza il codice sorgente Java senza eseguirlo per rilevare potenziali problemi",
            "È uno strumento esclusivamente per il testing manuale",
            "Si utilizza solo per verificare la copertura delle decisioni"
        ],
        correctAnswers: [1],
        section: "Testing"
    },
    {
        id: 20,
        question: "Qual è uno dei vantaggi principali del Continuous Integration?",
        options: [
            "Riduce la necessità di test automatizzati",
            "Consente di rilevare errori di integrazione in fasi avanzate dello sviluppo",
            "Aumenta il tempo di rilascio del software",
            "Non è compatibile con lo sviluppo Agile"
        ],
        correctAnswers: [1],
        section: "Testing"
    }
];

export default testing;