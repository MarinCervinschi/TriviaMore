import QuizQuestion from "@/types/QuizQuestion";

const requirements: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Quali sono le principali fasi del Requirement Engineering?",
        "options": [
            "Elicitation",
            "Specification",
            "Testing",
            "Review and validation"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "Requirements"
    },
    {
        "id": 2,
        "question": "Quale fase del processo di specifica dei requisiti riguarda la formalizzazione e la descrizione dei requisiti raccolti?",
        "options": [
            "Elicitation",
            "Documentation and definition",
            "Prototyping",
            "Analysis"
        ],
        "correctAnswers": [1],
        "section": "Requirements"
    },
    {
        "id": 3,
        "question": "Cosa caratterizza l'elicitation dei requisiti ad alto livello?",
        "options": [
            "Si concentra sugli obiettivi strategici e la logica aziendale",
            "Definisce dettagli operativi per gli utenti finali",
            "Considera vincoli come budget e tempi",
            "Analizza i formati di input e output del sistema"
        ],
        "correctAnswers": [0, 2],
        "section": "Requirements"
    },
    {
        "id": 4,
        "question": "Quali attività caratterizzano l'elicitation a livello di dettaglio?",
        "options": [
            "Analisi delle esigenze specifiche degli utenti finali",
            "Identificazione dei vincoli di business",
            "Progettazione delle interfacce utente",
            "Definizione degli obiettivi aziendali"
        ],
        "correctAnswers": [0, 2],
        "section": "Requirements"
    },
    {
        "id": 5,
        "question": "Qual è la differenza principale tra elicitation e analisi dei requisiti?",
        "options": [
            "L'elicitation raccoglie le necessità, l'analisi le organizza e dettaglia",
            "L'analisi precede sempre l'elicitation",
            "L'analisi si concentra solo sui requisiti non funzionali",
            "L'elicitation è un processo interno al team di sviluppo"
        ],
        "correctAnswers": [0],
        "section": "Requirements"
    },
    {
        "id": 6,
        "question": "Quali attività fanno parte dell'analisi dei requisiti?",
        "options": [
            "Clustering",
            "Prioritizing",
            "Prototyping",
            "Elicitation"
        ],
        "correctAnswers": [0, 1],
        "section": "Requirements"
    },
    {
        "id": 7,
        "question": "Cosa rappresentano i diagrammi UML di tipo Use Case?",
        "options": [
            "Le interazioni tra gli utenti e il sistema",
            "Le relazioni gerarchiche tra moduli software",
            "I flussi di dati interni al sistema",
            "Le fasi di sviluppo di un software"
        ],
        "correctAnswers": [0],
        "section": "Requirements"
    },
    {
        "id": 8,
        "question": "Quali informazioni sono rappresentate nei diagrammi UML Use Case?",
        "options": [
            "Gli attori che interagiscono con il sistema",
            "I casi d'uso che rappresentano gli obiettivi degli utenti",
            "Le specifiche dettagliate delle funzionalità interne",
            "I vincoli di budget e tempi di sviluppo"
        ],
        "correctAnswers": [0, 1],
        "section": "Requirements"
    },
    {
        "id": 9,
        "question": "Quali degli strumenti seguenti vengono utilizzati per rappresentare i requisiti?",
        "options": [
            "Use Case Diagram",
            "Activity Diagram",
            "Gantt Chart",
            "ER Diagram"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "Requirements"
    },
    {
        "id": 10,
        "question": "Quali sono gli scopi principali della prototipazione dei requisiti?",
        "options": [
            "Verificare e validare i requisiti",
            "Ridurre i costi di sviluppo",
            "Fornire un modello visivo del sistema",
            "Definire i ruoli del team di sviluppo"
        ],
        "correctAnswers": [0, 2],
        "section": "Requirements"
    }
];

export default requirements;