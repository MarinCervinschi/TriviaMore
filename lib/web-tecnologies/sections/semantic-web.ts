import QuizQuestion from "@/types/QuizQuestion";

const semanticWeb: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Che cos'è il Web semantico?",
        "options": [
            "Un'estensione del Web in cui i dati sono collegati e comprensibili dalle macchine",
            "Un sistema che utilizza solo il linguaggio HTML",
            "Un insieme di tecnologie per visualizzare contenuti su Internet",
            "Un tipo di software per la gestione dei database"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 2,
        "question": "Quali sono le principali caratteristiche di un'ontologia nel Semantic Web?",
        "options": [
            "Concettualizzazione, esplicito, formale, condiviso",
            "Definire regole per il linguaggio HTML",
            "Gestire dati in formato CSV",
            "Rappresentare concetti e relazioni in un dominio"
        ],
        "correctAnswers": [0, 3],
        "section": "semantic-web"
    },
    {
        "id": 3,
        "question": "Cosa definisce una tripla RDF nel Semantic Web?",
        "options": [
            "Una dichiarazione su una risorsa, composta da soggetto, predicato e oggetto",
            "Un tipo di metadato in formato HTML",
            "Una struttura di dati XML per il Web",
            "Un modello di linguaggio per la semantica"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 4,
        "question": "Quali sono i principali vantaggi dei Linked Open Data (LOD)?",
        "options": [
            "Facilitano la creazione di una rete di conoscenza globale",
            "Consentono di usare dati in formati proprietari",
            "Rendono i dati facilmente accessibili e combinabili",
            "Utilizzano dati RDF pubblici con URI risolvibili"
        ],
        "correctAnswers": [0, 2, 3],
        "section": "semantic-web"
    },
    {
        "id": 5,
        "question": "Quali tecnologie sono utilizzate nel Web semantico per rappresentare e comprendere i dati?",
        "options": [
            "Ontologie come OWL e RDF",
            "JSON-LD e RDFa",
            "Linguaggi di markup come HTML e CSS",
            "Tecniche di inferenza logica e disambiguazione"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "semantic-web"
    },
    {
        "id": 6,
        "question": "Cos'è un Knowledge Graph nel contesto del Web semantico?",
        "options": [
            "Una rappresentazione strutturata di conoscenza in un grafo di entità e relazioni",
            "Un sistema di gestione dei contenuti web",
            "Un tipo di database relazionale",
            "Un insieme di link a pagine web"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 7,
        "question": "Cosa significa la 'disambiguazione' nel Web semantico?",
        "options": [
            "Definire esplicitamente il significato delle entità e classi",
            "Usare solo linguaggi di programmazione specifici",
            "Creare un database centralizzato di tutte le informazioni",
            "Analizzare la sintassi dei dati"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 8,
        "question": "Qual è la funzione principale di un'ontologia nel Semantic Web?",
        "options": [
            "Definire concetti e relazioni in un dominio specifico",
            "Creare pagine web interattive",
            "Gestire e archiviare file di grandi dimensioni",
            "Codificare la semantica di un linguaggio di programmazione"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 9,
        "question": "In che formato sono tipicamente pubblicati i Linked Open Data?",
        "options": [
            "RDF/XML, Turtle, RDFa",
            "JSON, CSV, XML",
            "HTML, CSS, JavaScript",
            "PDF, DOCX, XLSX"
        ],
        "correctAnswers": [0],
        "section": "semantic-web"
    },
    {
        "id": 10,
        "question": "Quali strumenti Python possono essere utilizzati per lavorare con dati RDF nel Web semantico?",
        "options": [
            "RDFlib",
            "Flask",
            "Pandas",
            "PyLD"
        ],
        "correctAnswers": [0, 3],
        "section": "semantic-web"
    }
];

export default semanticWeb;