import QuizQuestion from "@/types/QuizQuestion";

const webDinamico: QuizQuestion[] = [
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
        "section": "web-dinamico"
    },
    {
        "id": 2,
        "question": "Quale linguaggio viene comunemente utilizzato per rendere interattive le pagine web?",
        "options": [
            "JavaScript",
            "Python",
            "PHP",
            "Ruby"
        ],
        "correctAnswers": [0],
        "section": "web-dinamico"
    },
    {
        "id": 3,
        "question": "Qual è la differenza principale tra il metodo GET e il metodo POST in HTTP?",
        "options": [
            "GET permette di inviare dati solo in formato JSON, mentre POST accetta qualsiasi formato",
            "GET espone i dati nell'URL, mentre POST li invia nel corpo della richiesta",
            "GET è più sicuro di POST per inviare informazioni sensibili",
            "POST è limitato a un massimo di 256 caratteri"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 4,
        "question": "Quale variabile di ambiente viene utilizzata per identificare il metodo HTTP usato nella richiesta?",
        "options": [
            "CONTENT_TYPE",
            "REQUEST_METHOD",
            "QUERY_STRING",
            "REMOTE_HOST"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 5,
        "question": "Qual è una delle principali limitazioni dei programmi CGI tradizionali?",
        "options": [
            "Non possono essere eseguiti su sistemi Windows",
            "Richiedono l'installazione di database proprietari",
            "Ogni richiesta crea un nuovo processo, causando problemi di performance",
            "Non supportano linguaggi moderni come Python o Ruby"
        ],
        "correctAnswers": [2],
        "section": "web-dinamico"
    },
    {
        "id": 6,
        "question": "Quale di questi è un vantaggio dell'uso di un database relazionale in un sistema web dinamico?",
        "options": [
            "Riduce il tempo di caricamento delle pagine statiche",
            "Permette di separare i contenuti dalla loro presentazione",
            "Evita l'uso di programmi CGI",
            "Elimina la necessità di un server web"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 7,
        "question": "Quale componente di un server web è responsabile di identificare e gestire i programmi CGI?",
        "options": [
            "La directory dedicata (cgi-bin)",
            "Il browser dell'utente",
            "Il database relazionale",
            "Il protocollo HTTP"
        ],
        "correctAnswers": [0],
        "section": "web-dinamico"
    },
    {
        "id": 8,
        "question": "Cosa accade quando si invia una richiesta HTTP con il metodo POST?",
        "options": [
            "I dati vengono aggiunti all'URL come stringa di query",
            "I dati vengono inviati nel corpo della richiesta",
            "Il server ignora i dati se non specificati nel header HTTP",
            "Viene creato automaticamente un programma CGI per elaborare i dati"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 9,
        "question": "Qual è uno svantaggio dell'approccio CGI tradizionale rispetto a tecnologie moderne?",
        "options": [
            "Non supporta il metodo POST",
            "Richiede processi separati per ogni richiesta, rallentando il server",
            "Non consente di eseguire script scritti in linguaggi diversi da Perl",
            "Non gestisce dati dinamici provenienti da database"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 10,
        "question": "Quale è il vantaggio di usare un template HTML in un sistema web dinamico?",
        "options": [
            "Riduce la necessità di un server web dedicato",
            "Facilita la modifica del layout di tutte le pagine",
            "Aumenta la sicurezza contro attacchi informatici",
            "Evita la necessità di usare linguaggi di programmazione"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 11,
        "question": "Qual è la principale funzione di un application server?",
        "options": [
            "Gestire la connessione al database",
            "Eseguire il rendering del contenuto HTML",
            "Gestire il ciclo di vita delle applicazioni server-side",
            "Fornire servizi di sicurezza per le applicazioni client"
        ],
        "correctAnswers": [2],
        "section": "server"
    },
    {
        "id": 12,
        "question": "Quale delle seguenti affermazioni descrive correttamente un sistema stateful?",
        "options": [
            "Ogni richiesta è indipendente dalle altre",
            "Il server non mantiene alcuna traccia dell'interazione",
            "Lo stato delle richieste è memorizzato e riutilizzato durante l'interazione",
            "Ogni messaggio ricevuto viene ignorato"
        ],
        "correctAnswers": [2],
        "section": "web-dinamico"
    },
    {
        "id": 13,
        "question": "Qual è la principale differenza tra un'architettura a 3 tier e una a 2 tier?",
        "options": [
            "Un'architettura a 3 tier ha meno livelli rispetto a quella a 2 tier",
            "Un'architettura a 2 tier separa più chiaramente la logica applicativa dal database",
            "Un'architettura a 3 tier separa la logica di business dal database, mentre in quella a 2 tier questa separazione non esiste",
            "Un'architettura a 2 tier è più scalabile rispetto a quella a 3 tier"
        ],
        "correctAnswers": [2],
        "section": "architettura"
    },
    {
        "id": 14,
        "question": "Cosa implica la gestione dello stato di sessione sul server in un'applicazione web?",
        "options": [
            "I dati di sessione sono memorizzati solo sul lato client",
            "Il server mantiene le informazioni relative all'utente durante l'interazione",
            "Ogni richiesta viene trattata come una nuova sessione",
            "Lo stato di sessione è gestito solo tramite cookie"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
    {
        "id": 15,
        "question": "Cosa significa che un'operazione è idempotente in un sistema web?",
        "options": [
            "L'operazione produce un risultato che può variare ogni volta che viene invocata",
            "L'operazione restituisce sempre lo stesso risultato indipendentemente dal numero di invocazioni",
            "L'operazione può essere eseguita solo una volta",
            "L'operazione è efficace solo in contesti stateless"
        ],
        "correctAnswers": [1],
        "section": "web-dinamico"
    },
];

export default webDinamico;