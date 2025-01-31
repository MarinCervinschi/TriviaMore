import QuizQuestion from "@/types/QuizQuestion";

const design: QuizQuestion[] = [
    {
        id: 1,
        question: "Quali sono le due principali fasi del design software?",
        options: [
          "Fase di design architettonico e fase di design dettagliato",
          "Fase di implementazione e fase di testing",
          "Fase di raccolta requisiti e fase di manutenzione",
          "Fase di sviluppo e fase di rilascio"
        ],
        correctAnswers: [0],
        section: "Design"
      },
      {
        id: 2,
        question: "Quale principio SOLID afferma che una classe dovrebbe avere una sola ragione per cambiare?",
        options: [
          "Open-Closed Principle (OCP)",
          "Liskov Substitution Principle (LSP)",
          "Single Responsibility Principle (SRP)",
          "Interface Segregation Principle (ISP)"
        ],
        correctAnswers: [2],
        section: "Design"
      },
      {
        id: 3,
        question: "Cosa afferma il principio Open-Closed (OCP)?",
        options: [
          "Le classi devono essere chiuse alla modifica ma aperte all'estensione",
          "Le classi devono essere aperte alla modifica e chiuse all'estensione",
          "Le classi dovrebbero avere una sola responsabilità",
          "Le interfacce devono essere segregate per evitare dipendenze inutili"
        ],
        correctAnswers: [0],
        section: "Design"
      },
      {
        id: 4,
        question: "Secondo il principio di sostituzione di Liskov (LSP), cosa devono poter fare le classi derivate?",
        options: [
          "Aggiungere nuove funzionalità senza modificarne il comportamento",
          "Sostituire le classi base senza alterare il comportamento del programma",
          "Essere specializzate per casi d'uso specifici",
          "Essere indipendenti dalle classi base"
        ],
        correctAnswers: [1],
        section: "Design"
      },
      {
        id: 5,
        question: "Quale principio di coesione afferma che un componente dovrebbe essere riutilizzabile e rilasciabile come unità coesa?",
        options: [
          "Common Reuse Principle (CRP)",
          "Reuse/Release Equivalence Principle (REP)",
          "Common Closure Principle (CCP)",
          "Stable Abstraction Principle (SAP)"
        ],
        correctAnswers: [1],
        section: "Design"
      },
      {
        id: 6,
        question: "Cosa rappresenta il Fan-in nella misurazione della qualità del design dei componenti?",
        options: [
          "Il numero di dipendenze in uscita da un componente",
          "Il numero di classi che dipendono da un determinato componente",
          "Il rapporto tra le dipendenze in ingresso e uscita",
          "Il numero di classi astratte in un componente"
        ],
        correctAnswers: [1],
        section: "Design"
      },
      {
        id: 7,
        question: "Cosa si intende per decoupling layers nell'architettura Clean?",
        options: [
          "Separare i vari strati orizzontali di un sistema per ridurre le dipendenze",
          "Separare i diversi casi d'uso in moduli indipendenti",
          "Utilizzare servizi di terze parti per ridurre la complessità",
          "Evitare la duplicazione del codice tra componenti"
        ],
        correctAnswers: [0],
        section: "Design"
      },
      {
        id: 8,
        question: "Qual è lo scopo principale del livello 'Entities' nell'architettura Clean?",
        options: [
          "Gestire le interazioni utente",
          "Definire le regole di business fondamentali e i dati critici",
          "Connettere il sistema al database",
          "Fornire interfacce utente intuitive"
        ],
        correctAnswers: [1],
        section: "Design"
      },
      {
        id: 9,
        question: "Quale componente nell'architettura Clean si occupa di tradurre i dati tra formati interni ed esterni?",
        options: [
          "Entities",
          "Use Cases",
          "Interface Adapters",
          "Frameworks & Drivers"
        ],
        correctAnswers: [2],
        section: "Design"
      },
      {
        id: 10,
        question: "Quale principio afferma che le dipendenze tra i componenti devono formare un grafo aciclico?",
        options: [
          "Stable Dependencies Principle (SDP)",
          "Acyclic Dependencies Principle (ADP)",
          "Stable Abstraction Principle (SAP)",
          "Common Closure Principle (CCP)"
        ],
        correctAnswers: [1],
        section: "Design"
      },
      {
        id: 11,
        question: "Qual è l'obiettivo principale dell'architettura software?",
        options: [
            "Facilitare lo sviluppo, il deployment, l'operazione e la manutenzione del software",
            "Minimizzare il numero di componenti del sistema",
            "Massimizzare il numero di funzionalità indipendenti",
            "Eliminare del tutto le dipendenze tra componenti"
        ],
        correctAnswers: [0],
        section: "Design"
    },
    {
        id: 12,
        question: "Quale delle seguenti opzioni descrive una caratteristica architetturale?",
        options: [
            "Una decisione sulla scelta del framework di sviluppo",
            "Un requisito non funzionale come la scalabilità o la testabilità",
            "Una directory che contiene componenti logici",
            "Un'implementazione specifica di un servizio"
        ],
        correctAnswers: [1],
        section: "Design"
    },
    {
        id: 13,
        question: "Cosa rappresentano i componenti logici in un'architettura software?",
        options: [
            "Le unità di deployment dell'applicazione",
            "Le funzionalità principali organizzate in directory",
            "Le librerie di terze parti utilizzate dal sistema",
            "I database utilizzati per la persistenza dei dati"
        ],
        correctAnswers: [1],
        section: "Design"
    },
    {
        id: 14,
        question: "Quale dei seguenti stili architetturali è basato sulla separazione dei componenti in livelli tecnici distinti?",
        options: [
            "Microkernel Architecture",
            "Event-Driven Architecture",
            "Layered Architecture",
            "Microservices Architecture"
        ],
        correctAnswers: [2],
        section: "Design"
    },
    {
        id: 15,
        question: "Quale principio dell'architettura Clean suggerisce la separazione dei vari strati orizzontali del sistema?",
        options: [
            "Decoupling Layers",
            "Dependency Inversion Principle",
            "Common Closure Principle",
            "Stable Dependencies Principle"
        ],
        correctAnswers: [0],
        section: "Design"
    },
    {
        id: 16,
        question: "In un'architettura a microservizi, quale approccio consente di coordinare il flusso dei servizi tramite un componente centrale?",
        options: [
            "Coreografia",
            "Orchestrazione",
            "Broker topology",
            "Mediator topology"
        ],
        correctAnswers: [1],
        section: "Design"
    },
    {
        id: 17,
        question: "Quale formula viene utilizzata per calcolare la stabilità di un componente software?",
        options: [
            "I = Fan-out / (Fan-in + Fan-out)",
            "I = Fan-in / (Fan-in + Fan-out)",
            "I = Fan-out * Fan-in",
            "I = (Fan-in + Fan-out) / Fan-out"
        ],
        correctAnswers: [0],
        section: "Design"
    },
    {
        id: 18,
        question: "Cosa rappresentano le entità nell'architettura Clean?",
        options: [
            "Componenti che gestiscono la logica di presentazione",
            "Unità di persistenza per i dati di basso livello",
            "Regole aziendali fondamentali indipendenti dai dettagli implementativi",
            "Interfacce usate per la comunicazione con altri servizi"
        ],
        correctAnswers: [2],
        section: "Design"
    },
    {
        id: 19,
        question: "Quale principio di coesione suggerisce che le classi che cambiano per gli stessi motivi dovrebbero essere raggruppate?",
        options: [
            "Common Closure Principle (CCP)",
            "Stable Abstraction Principle (SAP)",
            "Common Reuse Principle (CRP)",
            "Reuse/Release Equivalence Principle (REP)"
        ],
        correctAnswers: [0],
        section: "Design"
    },
    {
        id: 20,
        question: "In quale stile architetturale i servizi comunicano rispondendo a eventi in modo asincrono?",
        options: [
            "Microservices Architecture",
            "Event-Driven Architecture",
            "Layered Architecture",
            "Microkernel Architecture"
        ],
        correctAnswers: [1],
        section: "Design"
    },
    {
        id: 21,
        question: "Quale tra le seguenti affermazioni descrive meglio la coerenza nella progettazione del software?",
        options: [
            "Garantisce uniformità nell'aspetto estetico del software",
            "Assicura che il design copra tutti i requisiti identificati",
            "Garantisce uniformità nel flusso logico e nelle interfacce",
            "Migliora le prestazioni del software"
        ],
        correctAnswers: [2],
        section: "Design Characteristics"
    },
    {
        id: 22,
        question: "Quale delle seguenti NON è una categoria di metriche software?",
        options: [
            "Metriche di prodotto",
            "Metriche di processo",
            "Metriche di manutenzione",
            "Metriche di progetto"
        ],
        correctAnswers: [2],
        section: "Software Metrics"
    },
    {
        id: 23,
        question: "Quale delle seguenti è una limitazione nell'uso delle metriche software?",
        options: [
            "Possono essere interpretate universalmente in tutti i progetti",
            "Possono portare a comportamenti opportunistici",
            "Garantiscono sempre la qualità del software",
            "Sono prive di errori di valutazione"
        ],
        correctAnswers: [1],
        section: "Software Metrics Limitations"
    },
    {
        id: 24,
        question: "Quale delle seguenti metriche è utilizzata nell'analisi statica del software?",
        options: [
            "Code Coverage",
            "Bugs-per-Line-of-Code",
            "Cyclomatic Complexity",
            "Feature Usage"
        ],
        correctAnswers: [2],
        section: "Static vs Dynamic Analysis"
    },
    {
        id: 25,
        question: "Come viene calcolata la complessità ciclomatica di McCabe?",
        options: [
            "E - N + 2P",
            "Numero di linee di codice / numero di metodi",
            "Somma di operatori e operandi distinti",
            "Fan-in * Fan-out"
        ],
        correctAnswers: [0],
        section: "Code Complexity Metrics"
    },
    {
        id: 26,
        question: "Quale problema principale deriva dalla duplicazione del codice?",
        options: [
            "Maggiore riusabilità del codice",
            "Difficoltà di manutenzione e aggiornamento",
            "Aumento delle prestazioni",
            "Migliore leggibilità del codice"
        ],
        correctAnswers: [1],
        section: "Code Duplication Issues"
    },
    {
        id: 27,
        question: "Quale delle seguenti metriche misura il numero di connessioni tra una classe e le altre in OOP?",
        options: [
            "WMC (Weighted Methods per Class)",
            "DIT (Depth of Inheritance Tree)",
            "CBO (Coupling Between Object Classes)",
            "RFC (Response for a Class)"
        ],
        correctAnswers: [2],
        section: "Object-Oriented Metrics (CK Metrics)"
    },
    {
        id: 28,
        question: "Quale di questi elementi è un indicatore di elevato accoppiamento tra moduli software?",
        options: [
            "I moduli condividono solo i dati necessari",
            "I moduli sono altamente indipendenti",
            "Un cambiamento in un modulo richiede modifiche in molti altri",
            "I moduli contengono elementi strettamente correlati"
        ],
        correctAnswers: [2],
        section: "Coupling and Cohesion"
    }
];

export default design;