import QuizQuestion from "@/types/QuizQuestion";

const maintenance: QuizQuestion[] = [
    {
        id: 1,
        question: "Qual è l'obiettivo principale del Software Configuration Management (SCM)?",
        options: [
            "Garantire che il software sia sviluppato rapidamente",
            "Assicurare il controllo, il tracciamento e la manutenzione organizzata dei componenti software",
            "Ridurre i costi del progetto senza alterare le specifiche",
            "Ottimizzare le performance del software durante l'esecuzione"
        ],
        correctAnswers: [1],
        section: "Maintenance"
    },
    {
        id: 2,
        question: "Quali delle seguenti attività fanno parte del processo di Software Configuration Management?",
        options: [
            "Definizione del framework di gestione",
            "Scrittura del codice sorgente",
            "Formazione e applicazione del processo di gestione",
            "Compilazione del codice"
        ],
        correctAnswers: [0, 2],
        section: "Maintenance"
    },
    {
        id: 3,
        question: "Cosa influenza la scelta degli strumenti software per il Software Configuration Management?",
        options: [
            "Il tipo di processo di sviluppo adottato dall'organizzazione",
            "Il numero di sviluppatori impiegati",
            "Il budget del progetto",
            "Il livello di dettaglio nella gestione degli artefatti"
        ],
        correctAnswers: [0, 3],
        section: "Maintenance"
    },
    {
        id: 4,
        question: "Quali sono le principali fasi del processo di build?",
        options: [
            "Compilazione",
            "Testing automatico",
            "Linking",
            "Validazione utente"
        ],
        correctAnswers: [0, 2],
        section: "Maintenance"
    },
    {
        id: 5,
        question: "Quali funzioni supportano lo storage degli artefatti software?",
        options: [
            "Creare nuovi artefatti",
            "Eliminare artefatti obsoleti",
            "Modificare gli artefatti con controllo delle versioni",
            "Eseguire il deployment su ambiente di produzione"
        ],
        correctAnswers: [0, 1, 2],
        section: "Maintenance"
    },
    {
        id: 6,
        question: "Perché è importante stimare il tasso di notifica di problemi del software?",
        options: [
            "Per capire se il software è esente da problemi",
            "Per verificare la qualità del software dopo il rilascio",
            "Per stimare la durata del ciclo di vita del software",
            "Per ottenere un feedback rapido sugli errori"
        ],
        correctAnswers: [1, 3],
        section: "Maintenance"
    },
    {
        id: 7,
        question: "Quali ruoli sono presenti in un centro di supporto?",
        options: [
            "Rappresentanti del supporto clienti",
            "Team tecnico per la risoluzione approfondita",
            "Project Manager",
            "Supervisore del flusso delle richieste"
        ],
        correctAnswers: [0, 1, 3],
        section: "Maintenance"
    },
    {
        id: 8,
        question: "Quali problemi possono sorgere durante la distribuzione e installazione delle patch?",
        options: [
            "Incompatibilità tra patch regolari ed emergenziali",
            "Tempi di inattività lunghi per il recupero delle patch precedenti",
            "Rimozione di tutte le configurazioni degli utenti",
            "Diffidenza degli utenti nell'installare nuove patch"
        ],
        correctAnswers: [0, 1, 3],
        section: "Maintenance"
    }
];

export default maintenance;