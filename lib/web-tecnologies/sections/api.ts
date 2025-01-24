import QuizQuestion from "@/types/QuizQuestion";

const api: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Cos'è un'API?",
        "options": [
            "Un insieme di regole che permette la comunicazione tra applicazioni software",
            "Un tipo di linguaggio di programmazione",
            "Un sistema di gestione del database",
            "Un protocollo di comunicazione via email"
        ],
        "correctAnswers": [0],
        "section": "api"
    },
    {
        "id": 2,
        "question": "Quale metodo HTTP viene comunemente utilizzato per ottenere dati da un server?",
        "options": [
            "POST",
            "GET",
            "PUT",
            "DELETE"
        ],
        "correctAnswers": [1],
        "section": "api"
    },
    {
        "id": 3,
        "question": "Quale di queste pratiche è fondamentale per garantire la sicurezza di un'API?",
        "options": [
            "L'uso di HTTPS",
            "L'implementazione di rate limiting",
            "La validazione degli input",
            "L'uso di linguaggi di programmazione compilati"
        ],
        "correctAnswers": [0, 1, 2],
        "section": "api"
    },
    {
        "id": 4,
        "question": "Qual è la funzione principale di un server in una comunicazione API?",
        "options": [
            "Inviare richieste al client",
            "Restituire dati o risultati di operazioni al client",
            "Creare nuove API",
            "Autenticare il client"
        ],
        "correctAnswers": [1],
        "section": "api"
    },
    {
        "id": 5,
        "question": "Cosa sono le API REST?",
        "options": [
            "Interfacce che seguono i principi dell'architettura REST",
            "API che utilizzano il protocollo FTP",
            "Interfacce che comunicano solo tramite WebSocket",
            "Un tipo di API che si basa su una struttura di database"
        ],
        "correctAnswers": [0],
        "section": "api"
    },
    {
        "id": 6,
        "question": "Quale di queste è una pratica corretta nella gestione delle credenziali di accesso per le API?",
        "options": [
            "Inserirle direttamente nel codice sorgente",
            "Memorizzarle in variabili di ambiente",
            "Condividerle pubblicamente per scopi di debugging",
            "Utilizzare credenziali deboli per testare"
        ],
        "correctAnswers": [1],
        "section": "api"
    },
    {
        "id": 7,
        "question": "Qual è il significato di 'Rate Limiting' in relazione alla sicurezza delle API?",
        "options": [
            "Limitare il numero di richieste che un client può fare in un determinato periodo di tempo",
            "Bloccare tutte le richieste provenienti da IP sconosciuti",
            "Aumentare il numero di richieste che un client può fare",
            "Bloccare il traffico HTTPS"
        ],
        "correctAnswers": [0],
        "section": "api"
    },
    {
        "id": 8,
        "question": "Cosa significa 'Autenticazione a due fattori' per le API?",
        "options": [
            "Richiedere due passaggi di autenticazione per accedere a risorse protette",
            "Consentire solo accesso tramite due dispositivi diversi",
            "Autenticare un client e un server tramite due metodi di crittografia",
            "Consentire accesso solo a due utenti simultaneamente"
        ],
        "correctAnswers": [0],
        "section": "api"
    },
    {
        "id": 9,
        "question": "Quali sono i metodi HTTP principali utilizzati nelle API REST?",
        "options": [
            "GET, POST, PUT, PATCH, DELETE",
            "FETCH, PUT, REMOVE",
            "POST, SELECT, INSERT",
            "GET, SEND, DELETE"
        ],
        "correctAnswers": [0],
        "section": "api"
    },
    {
        "id": 10,
        "question": "Cos'è un token JWT (JSON Web Token) in relazione alla sicurezza delle API?",
        "options": [
            "Un metodo di autenticazione sicuro basato su token",
            "Un metodo di crittografia delle richieste",
            "Un formato per il trasferimento di dati tra server",
            "Un tipo di database utilizzato per memorizzare le credenziali"
        ],
        "correctAnswers": [0],
        "section": "api"
    }
];

export default api;