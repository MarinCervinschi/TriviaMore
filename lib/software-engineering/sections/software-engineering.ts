import QuizQuestion from "@/types/QuizQuestion";

const softwareEng: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Quale tra le seguenti affermazioni è vera riguardo la programmazione di un software di piccole dimensioni?",
        "options": [
            "Richiede una gestione altamente strutturata",
            "Ha requisiti generalmente chiari e ben definiti",
            "Richiede un intenso coordinamento tra sviluppatori",
            "Presenta elevati costi di manutenzione"
        ],
        "correctAnswers": [1],
        "section": "Software Engineering"
    },
    {
        "id": 2,
        "question": "Quali problemi aumentano con l'aumento delle dimensioni di un software complesso?",
        "options": [
            "Problemi di ampiezza dovuti all'aumento delle funzionalità",
            "Problemi di profondità legati alle relazioni tra elementi",
            "Riduzione della complessità del testing",
            "Diminuzione della necessità di documentazione"
        ],
        "correctAnswers": [0, 1],
        "section": "Software Engineering"
    },
    {
        "id": 3,
        "question": "Quali delle seguenti attività fanno parte del processo di produzione di un software?",
        "options": [
            "Analisi dei requisiti",
            "Progettazione",
            "Marketing",
            "Testing"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "Software Engineering"
    },
    {
        "id": 4,
        "question": "Quali sono gli obiettivi principali dell'ingegneria del software?",
        "options": [
            "Garantire l'affidabilità e la qualità del software",
            "Minimizzare i costi di produzione e manutenzione",
            "Evitare completamente la fase di testing",
            "Coordinare il lavoro in team"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "Software Engineering"
    },
    {
        "id": 5,
        "question": "Quale delle seguenti affermazioni descrive correttamente il testing di un software complesso?",
        "options": [
            "È sufficiente testare solo le singole componenti",
            "Bisogna verificare l'intero sistema e l'interazione tra moduli",
            "Il testing è meno importante rispetto alla codifica",
            "Non è necessario considerare casi limite e situazioni di errore"
        ],
        "correctAnswers": [1],
        "section": "Software Engineering"
    },
    {
        "id": 6,
        "question": "Quale fase del processo di produzione del software riguarda la traduzione della progettazione in codice sorgente?",
        "options": [
            "Analisi dei requisiti",
            "Progettazione",
            "Coding",
            "Testing"
        ],
        "correctAnswers": [2],
        "section": "Software Engineering"
    },
    {
        "id": 7,
        "question": "Cosa caratterizza principalmente un software complesso rispetto a uno di piccole dimensioni?",
        "options": [
            "Maggiore necessità di coordinamento tra sviluppatori",
            "Minori requisiti di documentazione",
            "Minor numero di casi limite da considerare",
            "Architettura semplificata e meno strutturata"
        ],
        "correctAnswers": [0],
        "section": "Software Engineering"
    },
    {
        "id": 8,
        "question": "Quale tra le seguenti è una caratteristica attesa dal software prodotto?",
        "options": [
            "Deve essere efficiente",
            "Deve essere affidabile",
            "Non deve necessitare di manutenzione",
            "Deve soddisfare i requisiti definiti"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "Software Engineering"
    },
    {
        "id": 9,
        "question": "Quale aspetto è fondamentale nella gestione delle relazioni tra elementi in un software complesso?",
        "options": [
            "Condivisione dei dati",
            "Presenza di relazioni gerarchiche o ricorsive",
            "Eliminazione della documentazione",
            "Semplificazione eccessiva delle architetture"
        ],
        "correctAnswers": [0, 1],
        "section": "Software Engineering"
    },
    {
        "id": 10,
        "question": "Quale attività non rientra nelle fasi del ciclo di sviluppo software?",
        "options": [
            "Progettazione",
            "Analisi dei requisiti",
            "Produzione fisica del software",
            "Testing"
        ],
        "correctAnswers": [2],
        "section": "Software Engineering"
    }
];

export default softwareEng;