import QuizQuestion from "@/types/QuizQuestion";

const uri: QuizQuestion[] = [
    {
        "id": 1,
        "section": "uri",
        "question": "Cos'è un URI?",
        "options": [
            "Un identificatore univoco per risorse accessibili tramite HTTP",
            "Un meccanismo per identificare risorse digitali, fisiche o concettuali",
            "Una stringa che rappresenta esclusivamente URL",
            "Un insieme di indirizzi IP statici"
        ],
        "correctAnswers": [1]
    },
    {
        "id": 2,
        "section": "uri",
        "question": "Qual è la differenza principale tra URL e URN?",
        "options": [
            "Un URL specifica dove e come accedere a una risorsa, mentre un URN identifica una risorsa in modo univoco e permanente",
            "Un URN è sempre più corto di un URL",
            "Gli URL sono utilizzati solo su Internet, mentre gli URN non lo sono",
            "Gli URL non supportano query string, mentre gli URN sì"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 3,
        "section": "uri",
        "question": "Quale parte della sintassi URI rappresenta il protocollo utilizzato?",
        "options": [
            "<scheme>",
            "<host>",
            "<path>",
            "<query>"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 4,
        "section": "uri",
        "question": "Qual è la funzione della componente <query> in un URL?",
        "options": [
            "Descrivere il protocollo di accesso alla risorsa",
            "Fornire parametri aggiuntivi al server",
            "Identificare il server su cui si trova la risorsa",
            "Specificare le credenziali per l'accesso"
        ],
        "correctAnswers": [1]
    },
    {
        "id": 5,
        "section": "uri",
        "question": "Quale tra questi è un esempio di URI opaca?",
        "options": [
            "mailto:paolo.rossi@disi.unibo.it",
            "http://informatica.unibo.it/",
            "ftp://example.com/resource.txt",
            "https://www.example.com/home"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 6,
        "section": "uri",
        "question": "Quale caratteristica distingue un'URI gerarchica da una opaca?",
        "options": [
            "Le URI gerarchiche seguono una struttura organizzata in parti analizzabili, mentre le URI opache no",
            "Le URI opache possono essere normalizzate, mentre le gerarchiche no",
            "Le URI opache sono sempre più corte delle gerarchiche",
            "Le URI gerarchiche non includono componenti <query>"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 7,
        "section": "uri",
        "question": "Quale processo permette di ottenere una URI risultante a partire da una URI originaria?",
        "options": [
            "Risoluzione",
            "Normalizzazione",
            "Relativizzazione",
            "Decodifica"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 8,
        "section": "uri",
        "question": "Cosa avviene durante la normalizzazione di una URI gerarchica?",
        "options": [
            "I segmenti '.' e '..' vengono rimossi dal percorso",
            "La URI viene convertita in una URI opaca",
            "Si ottiene una URI relativa alla base URI",
            "Viene cambiato il protocollo della URI"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 9,
        "section": "uri",
        "question": "Quale tra questi è un esempio di processo di relativizzazione?",
        "options": [
            "Ottenere una URI originaria relativa alla base URI a partire da una URI risultante",
            "Convertire una URI opaca in una URI gerarchica",
            "Modificare una URI per renderla più leggibile",
            "Rimuovere le componenti <query> e <path> da una URI"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 10,
        "section": "uri",
        "question": "Qual è la componente della sintassi URI che indica l'indirizzo del server?",
        "options": [
            "<host>",
            "<scheme>",
            "<path>",
            "<query>"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 11,
        "section": "uri",
        "question": "Che vantaggio offre il concetto di mapping concettuale negli URI?",
        "options": [
            "Permette che un URI rimanga valido anche se l'entità cambia nel tempo",
            "Elimina la necessità di utilizzare schemi di protocollo",
            "Garantisce sempre la disponibilità della risorsa",
            "Limita l'accesso alle sole risorse HTTP"
        ],
        "correctAnswers": [0]
    },
    {
        "id": 12,
        "section": "uri",
        "question": "Quale tra queste proprietà non appartiene agli URI?",
        "options": [
            "Estensibilità",
            "Convenzioni sintattiche comuni",
            "Validità temporanea",
            "Semantica comune per l'interpretazione"
        ],
        "correctAnswers": [2]
    }
];

export default uri;