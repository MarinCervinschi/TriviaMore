import QuizQuestion from "@/types/QuizQuestion";

const http: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Qual è il ruolo principale del protocollo HTTP?",
        "options": [
            "Trasferire risorse Web da server a client",
            "Gestire l'instradamento dei pacchetti",
            "Fornire connessioni sicure tra server e client",
            "Archiviare dati su server remoti"
        ],
        "correctAnswers": [0],
        "section": "http"
    },
    {
        "id": 2,
        "question": "Quali caratteristiche sono associate a HTTP/1.0?",
        "options": [
            "Protocollo stateless",
            "Connessioni non persistenti",
            "Request-response one-shot",
            "Multiplexing delle richieste"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 3,
        "question": "Quali miglioramenti introduce HTTP/1.1 rispetto a HTTP/1.0?",
        "options": [
            "Connessioni persistenti",
            "Pipelining delle richieste",
            "Uso del protocollo QUIC",
            "Compressione degli header"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 4,
        "question": "Quali caratteristiche chiave sono introdotte in HTTP/2?",
        "options": [
            "Request-response multiplexing",
            "Compressione degli header",
            "Server push",
            "Controllo di flusso per-stream"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 5,
        "question": "Qual è il principale vantaggio di HTTP/3 rispetto a HTTP/2?",
        "options": [
            "Riduzione della latenza",
            "Compressione degli header",
            "Utilizzo del protocollo QUIC",
            "Compatibilità con HTTP/1.0"
        ],
        "section": "http",
        "correctAnswers": [0, 2]
    },
    {
        "id": 6,
        "question": "Quali sono fattori che influenzano la latenza?",
        "options": [
            "Distanza fisica tra client e server",
            "Congestione della rete",
            "Qualità della connessione",
            "Tipo di contenuto richiesto"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 7,
        "question": "Quali sono i metodi HTTP principali?",
        "options": [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "HEAD",
            "OPTIONS",
            "TRACE"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2, 3, 4, 5, 6]
    },
    {
        "id": 8,
        "question": "Qual è lo scopo del metodo GET?",
        "options": [
            "Richiedere risorse dal server",
            "Verificare un URL",
            "Cancellare risorse dal server",
            "Inviare dati al server"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 9,
        "question": "Quali affermazioni sono vere sul metodo POST?",
        "options": [
            "Invia dati al server nel body del messaggio",
            "Ha un limite di lunghezza per i parametri",
            "È utilizzato per creare o aggiornare risorse",
            "Può trasmettere dati senza limiti di lunghezza"
        ],
        "section": "http",
        "correctAnswers": [0, 3]
    },
    {
        "id": 10,
        "question": "Qual è la funzione del metodo HEAD?",
        "options": [
            "Richiedere l'intestazione di una risorsa senza il body",
            "Verificare l'accessibilità di un URL",
            "Cancellare risorse su un server",
            "Invocare il loopback remoto di un messaggio"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 11,
        "question": "Quali codici di stato HTTP indicano un successo?",
        "options": [
            "1xx",
            "2xx",
            "3xx",
            "4xx",
            "5xx"
        ],
        "section": "http",
        "correctAnswers": [1]
    },
    {
        "id": 12,
        "question": "Cosa rappresenta il codice di stato 404?",
        "options": [
            "Richiesta riuscita",
            "Risorsa non trovata",
            "Errore del server",
            "Reindirizzamento"
        ],
        "section": "http",
        "correctAnswers": [1]
    },
    {
        "id": 13,
        "question": "Quali sono caratteristiche degli header HTTP?",
        "options": [
            "Sono coppie nome-valore",
            "Specifica il formato dei dati nel body",
            "Indicano la versione del protocollo",
            "Servono solo per richieste GET"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 14,
        "question": "Quali sono i tre componenti principali di un messaggio HTTP?",
        "options": [
            "Request line o status line",
            "Headers",
            "Body",
            "Trailers"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 15,
        "question": "Quale protocollo viene utilizzato da HTTP/3 per ridurre la latenza?",
        "options": [
            "TCP",
            "UDP",
            "QUIC",
            "SPDY"
        ],
        "section": "http",
        "correctAnswers": [2]
    },
    {
        "id": 16,
        "question": "Quali sono le classi principali dei codici di stato HTTP?",
        "options": [
            "1xx: Informational",
            "2xx: Successful",
            "3xx: Redirection",
            "4xx: Client error",
            "5xx: Server error"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2, 3, 4]
    },
    {
        "id": 17,
        "question": "Quale funzione ha il metodo OPTIONS in HTTP?",
        "options": [
            "Inviare dati al server",
            "Richiedere opzioni di comunicazione disponibili",
            "Eliminare una risorsa",
            "Invocare il loopback remoto"
        ],
        "section": "http",
        "correctAnswers": [1]
    },
    {
        "id": 18,
        "question": "Quali sono vantaggi introdotti dal server push in HTTP/2?",
        "options": [
            "Inoltro di risorse al client senza richiesta esplicita",
            "Riduzione delle richieste client-server",
            "Compressione automatica degli header",
            "Gestione di connessioni multiple"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 19,
        "question": "Cosa significa che HTTP è un protocollo stateless?",
        "options": [
            "Non mantiene informazioni tra richieste consecutive",
            "Salva lo stato del client sul server",
            "Ogni richiesta è indipendente dalle altre",
            "Utilizza una cache per memorizzare lo stato"
        ],
        "section": "http",
        "correctAnswers": [0, 2]
    },
    {
        "id": 20,
        "question": "Quali header HTTP sono generici per tutte le comunicazioni?",
        "options": [
            "Data",
            "Content-Length",
            "Accept",
            "Content-Type"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 21,
        "question": "Quali caratteristiche distinguono HTTP/1.1 rispetto a HTTP/1.0?",
        "options": [
            "Connessioni persistenti",
            "Uso del pipelining",
            "Richieste stateless",
            "Compressione degli header"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 22,
        "question": "In quale scenario è utilizzato il metodo TRACE in HTTP?",
        "options": [
            "Testare la connettività e il loopback remoto",
            "Inviare dati sensibili al server",
            "Richiedere risorse al server",
            "Rimuovere una risorsa dal server"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 23,
        "question": "Quali metodi HTTP possono modificare o cancellare risorse su un server?",
        "options": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "section": "http",
        "correctAnswers": [2, 3]
    },
    {
        "id": 24,
        "question": "Quali problemi possono causare latenza elevata in HTTP?",
        "options": [
            "Distanza fisica tra client e server",
            "Congestione della rete",
            "Uso di HTTP/3",
            "Qualità della connessione"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 3]
    },
    {
        "id": 25,
        "question": "Quale ruolo svolge il Message Body in un messaggio HTTP?",
        "options": [
            "Contiene i dati trasportati",
            "Indica il formato dei dati trasportati",
            "Contiene informazioni di intestazione",
            "Definisce la connessione TCP"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 26,
        "question": "Quali metodi HTTP non trasportano dati nel body del messaggio?",
        "options": [
            "GET",
            "HEAD",
            "OPTIONS",
            "POST"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2]
    },
    {
        "id": 27,
        "question": "Quali vantaggi introduce HTTP/3 rispetto alle versioni precedenti?",
        "options": [
            "Riduzione della latenza",
            "Utilizzo del protocollo QUIC",
            "Compressione degli header",
            "Multiplexing delle connessioni"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 3]
    },
    {
        "id": 28,
        "question": "Cosa indica il campo 'Content-Type' in un header HTTP?",
        "options": [
            "Il tipo di dati trasportati nel body",
            "La dimensione dei dati trasportati",
            "La codifica dei dati trasportati",
            "Il formato dell'header"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 29,
        "question": "Quali metodi HTTP sono considerati sicuri, poiché non modificano risorse?",
        "options": [
            "GET",
            "HEAD",
            "POST",
            "OPTIONS"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 3]
    },
    {
        "id": 30,
        "question": "Quali sono gli obiettivi principali dell'header compression in HTTP/2?",
        "options": [
            "Ridurre la dimensione delle richieste e risposte",
            "Eliminare la necessità di inviare header ripetuti",
            "Aumentare la velocità di trasmissione",
            "Implementare la crittografia degli header"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 31,
        "question": "Quali sono i principi fondamentali di REST?",
        "options": [
            "Client-Server",
            "Stateless",
            "Cacheable",
            "Layered System"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2, 3]
    },
    {
        "id": 32,
        "question": "Quale metodo HTTP viene usato per creare una nuova risorsa?",
        "options": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "section": "http",
        "correctAnswers": [1]
    },
    {
        "id": 33,
        "question": "Quale proprietà di un cookie ne specifica la durata in secondi?",
        "options": [
            "Path",
            "Domain",
            "Max-age",
            "Secure"
        ],
        "section": "http",
        "correctAnswers": [2]
    },
    {
        "id": 34,
        "question": "Quale attributo del cookie garantisce che venga trasmesso solo su connessioni HTTPS?",
        "options": [
            "Secure",
            "Path",
            "Domain",
            "Max-age"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 35,
        "question": "Quale è un vantaggio dell'autenticazione HTTP Digest rispetto a quella Basic?",
        "options": [
            "Le credenziali sono criptate",
            "Non richiede un certificato TLS",
            "Non utilizza header HTTP",
            "Supporta solo connessioni stateless"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 36,
        "question": "Quali sono gli svantaggi dell'autenticazione basata su indirizzo IP?",
        "options": [
            "Non funziona con IP assegnati dinamicamente",
            "Supporta solo indirizzi IPv6",
            "Facile da aggirare con IP spoofing",
            "Richiede sempre SSL/TLS"
        ],
        "section": "http",
        "correctAnswers": [0, 2]
    },
    {
        "id": 37,
        "question": "Quali proprietà sono garantite da un protocollo sicuro come TLS?",
        "options": [
            "Confidenzialità",
            "Integrità",
            "Autenticità",
            "Non ripudio"
        ],
        "section": "http",
        "correctAnswers": [0, 1, 2, 3]
    },
    {
        "id": 38,
        "question": "Cosa rappresenta un reverse proxy (o gateway)?",
        "options": [
            "Un server che funge da intermediario per altri server",
            "Un client che si connette direttamente al server",
            "Un'applicazione che funge da blind relay",
            "Un'architettura utilizzata solo nei tunnel HTTP"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 39,
        "question": "Quali sono i due tipi principali di cache web?",
        "options": [
            "User Agent Cache",
            "Proxy Cache",
            "Server Cache",
            "Browser Cache"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 40,
        "question": "Come è definita la freschezza di un documento in cache?",
        "options": [
            "Dalla direttiva Cache-Control: max-age",
            "Dall'attributo Secure",
            "Dal dominio specificato nel cookie",
            "Dal campo Authorization"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 41,
        "question": "Qual è lo scopo dell'header Cache-Control in HTTP?",
        "options": [
            "Impostare regole di caching per richieste e risposte",
            "Definire la validità del certificato TLS",
            "Assicurare l'integrità dei dati",
            "Indicare il tipo di risorsa richiesta"
        ],
        "section": "http",
        "correctAnswers": [0]
    },
    {
        "id": 42,
        "question": "Quali protocolli sono utilizzati per garantire la sicurezza delle connessioni web?",
        "options": [
            "SSL",
            "TLS",
            "QUIC",
            "HTTP Basic"
        ],
        "section": "http",
        "correctAnswers": [0, 1]
    },
    {
        "id": 43,
        "question": "Cosa significa che HTTP è stateless?",
        "options": [
            "Ogni richiesta è indipendente dalle altre",
            "Lo stato delle sessioni è mantenuto dai cookie",
            "Il protocollo non supporta connessioni sicure",
            "Il server non conserva informazioni tra richieste successive"
        ],
        "section": "http",
        "correctAnswers": [0, 3]
    },
    {
        "id": 44,
        "question": "Qual è il ruolo di un certificato digitale in TLS?",
        "options": [
            "Garantire l'autenticità del server",
            "Fornire una chiave privata al client",
            "Velocizzare la connessione tra client e server",
            "Eliminare la necessità di una chiave pubblica"
        ],
        "section": "http",
        "correctAnswers": [0]
    }
];

export default http;