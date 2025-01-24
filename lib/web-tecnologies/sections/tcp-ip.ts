import QuizQuestion from "@/types/QuizQuestion";

const tcpIp: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Qual è la funzione principale del protocollo IP?",
        "options": [
            "Garantire la consegna affidabile dei dati",
            "Individuare e raggiungere l'indirizzo corretto per i dati",
            "Suddividere i dati in pacchetti",
            "Riassemblare i pacchetti di dati"
        ],
        "correctAnswers": [1],
        "section": "tcp-ip"
    },
    {
        "id": 2,
        "question": "Qual è il ruolo principale del protocollo TCP?",
        "options": [
            "Gestire l'infrastruttura fisica della rete",
            "Indirizzare i pacchetti al server corretto",
            "Garantire una trasmissione affidabile dei dati",
            "Controllare il flusso di traffico in rete"
        ],
        "correctAnswers": [2],
        "section": "tcp-ip"
    },
    {
        "id": 3,
        "question": "Quali sono i quattro livelli dell'architettura TCP/IP?",
        "options": [
            "Accesso alla rete, Trasporto, Internet, Applicazione",
            "Hardware, Rete, Trasporto, Applicazione",
            "Fisico, Logico, Rete, Trasporto",
            "Applicazione, Presentazione, Sessione, Rete"
        ],
        "correctAnswers": [0],
        "section": "tcp-ip"
    },
    {
        "id": 4,
        "question": "Cosa gestisce il livello di accesso alla rete nel modello TCP/IP?",
        "options": [
            "Il controllo del flusso dei dati",
            "L'infrastruttura fisica della comunicazione",
            "La connessione tra applicazioni",
            "Il riassemblaggio dei pacchetti"
        ],
        "correctAnswers": [1],
        "section": "tcp-ip"
    },
    {
        "id": 5,
        "question": "Qual è il compito principale del livello Internet nel modello TCP/IP?",
        "options": [
            "Gestire l'infrastruttura fisica della rete",
            "Suddividere i dati in pacchetti",
            "Controllare il flusso e l'instradamento del traffico",
            "Fornire l'interfaccia utente finale"
        ],
        "correctAnswers": [2],
        "section": "tcp-ip"
    },
    {
        "id": 6,
        "question": "Quali protocolli sono associati al livello di trasporto nel modello TCP/IP?",
        "options": [
            "HTTP e SMTP",
            "Ethernet e Wi-Fi",
            "TCP e UDP",
            "IP e ICMP"
        ],
        "correctAnswers": [2],
        "section": "tcp-ip"
    },
    {
        "id": 7,
        "question": "Qual è il compito principale del livello di applicazione nel modello TCP/IP?",
        "options": [
            "Suddividere i dati in pacchetti",
            "Fornire interfacce utente e servizi di rete",
            "Instradare i dati verso il server corretto",
            "Gestire l'infrastruttura fisica della rete"
        ],
        "correctAnswers": [1],
        "section": "tcp-ip"
    },
    {
        "id": 8,
        "question": "Quale di queste è un'applicazione del livello di applicazione del modello TCP/IP?",
        "options": [
            "Ethernet",
            "SMTP",
            "ICMP",
            "TCP"
        ],
        "correctAnswers": [1],
        "section": "tcp-ip"
    },
    {
        "id": 9,
        "question": "Cosa garantisce il TCP con il processo di Handshake a 3 vie?",
        "options": [
            "La suddivisione dei dati in pacchetti",
            "L'ordine corretto dei pacchetti",
            "Una connessione affidabile tra due dispositivi",
            "Il controllo del flusso di traffico in rete"
        ],
        "correctAnswers": [2],
        "section": "tcp-ip"
    },
    {
        "id": 10,
        "question": "In che modo HTTP utilizza TCP/IP?",
        "options": [
            "Usa il livello Internet per la consegna affidabile dei dati",
            "Utilizza TCP per garantire la consegna affidabile e IP per instradare i pacchetti",
            "Usa il livello di accesso alla rete per l'invio dei pacchetti HTTP",
            "Utilizza UDP per il trasferimento dati e IP per il riassemblaggio"
        ],
        "correctAnswers": [1],
        "section": "tcp-ip"
    }
];

export default tcpIp;