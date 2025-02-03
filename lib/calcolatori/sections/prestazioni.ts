import QuizQuestion from "@/types/QuizQuestion";

const prestazioni: QuizQuestion[] = [
    {
        "id": 1,
        "question": "I calcolatori A,B comprati in due anni successivi hanno la CPU che migliora ogni anno di 4 volte il Tcpu (comprendente operazioni in memoria e operazioni interne nella CPU) ma hanno sempre lo stesso sottosistema di I/O per cui il tempo Tio per le operazioni di I/O rimane inalterato. Consideriamo due tipi di applicazioni - CPU bound in cui il 80% Tcpu e 20% Tio - I/O bound in cui il 40% Tcpu e 60% Tio Lo speedup di B rispetto ad A nei due casi è rispettivamente:",
        "options": [
            "1,8 e 1,2",
            "2,0 e 1,5",
            "2,5 e 1,43",
            "3,0 e 1,8"
        ],
        "correctAnswers": [2],
        "section": "prestazioni"
    },
    {
        "id": 2,
        "question": "I calcolatori A,B comprati in due anni successivi hanno la CPU che migliora ogni anno di 2 volte il Tcpu (comprendente operazioni in memoria e operazioni interne nella CPU) ma hanno sempre lo stesso sottosistema di I/O per cui il tempo Tio per le operazioni di I/O rimane inalterato. Consideriamo due tipi di applicazioni 1) CPU bound in cui il 80% Tcpu e 20% Tio 2) I/O bound in cui il 20% Tcpu e 80% Tio Lo speedup di B rispetto ad A nei due casi è rispettivamente:",
        "options": [
            "1,54 e 1,20",
            "1,63 e 1,15",
            "1,81 e 1,05",
            "1,67 e 1,11"
        ],
        "correctAnswers": [3],
        "section": "prestazioni"
    },
    {
        "id": 3,
        "question": "I calcolatori A,B comprati in due anni successivi hanno la CPU che migliora ogni anno di 3 volte il Tcpu (comprendente operazioni in memoria e operazioni interne nella CPU) ma hanno sempre lo stesso sottosistema di I/0 per cui il tempo Tio per le operazioni di I/0 rimane inalterato. Consideriamo due tipi di applicazioni - CPU bound in cui il 60% Tcpu e 40% Tio - I/0 bound in cui il 30% Tcpu e 70% Tio Lo speedup di B rispetto ad A nei due casi è rispettivamente:",
        "options": [
            "1,67 e 1,25",
            "2,00 e 1,42",
            "2,50 e 1,63",
            "3,00 e 1,84"
        ],
        "correctAnswers": [0],
        "section": "prestazioni"
    },
    {
        "id": 4,
        "question": "La CPU A impiega 100 cicli di clock per eseguire 10 istruzioni; La CPU B impiega 120 cicli di clock per eseguire le stesse 10 istruzioni.",
        "options": [
            "A ha prestazioni minori di B indipendentemente dalla frequenza di clock",
            "A ha prestazioni sempre maggiori di B se A ha una frequenza di clock maggiore o uguale a quella di B",
            "Le due CPU hanno prestazioni identiche",
            "B ha prestazioni sempre migliori di A"
        ],
        "correctAnswers": [1],
        "section": "prestazioni"
    },
    {
        "id": 5,
        "question": "Un programma necessita 66 milioni di istruzioni e mediamente processa istruzioni a 4 cicli di clock per istruzione con una frequenza di clock di 3GHz. Qual è il tempo di CPU?",
        "options": [
            "70 ms",
            "80 ms",
            "88 ms",
            "90 ms"
        ],
        "correctAnswers": [2],
        "section": "prestazioni"
    },
    {
        "id": 6,
        "question": "Siano dati 2 diversi processori P1,P2,P3 che hanno lo stesso set di istruzioni con frequenza di clock rispettivamente di 3 e 2,5 e 4 GHz e con CPI medio di 1,5 ed 1,8 e 2 rispettivamente. Quale è il processore che ha prestazioni migliori in termini di MIPS?",
        "options": [
            "P2 e P1 a pari merito",
            "P1 e P3 a pari merito",
            "P3",
            "P1"
        ],
        "correctAnswers": [1],
        "section": "prestazioni"
    },
    {
        "id": 7,
        "question": "Un nuovo compilatore impiega anche istruzioni complesse che aumentano del 10% il numero di clock medio per istruzione, ma essendo efficiente permette di diminuire del 90% il numero di istruzioni in linguaggio macchina di una applicazione. Una applicazione che prima impiegava 20 s ora quanti secondi impiega nella sua esecuzione?",
        "options": [
            "18,5 s",
            "19,8 s",
            "20,2 s",
            "21,0 s"
        ],
        "correctAnswers": [1],
        "section": "prestazioni"
    },
    {
        "id": 8,
        "question": "Due processori A e B differiscono solo dell’accesso in memoria che in A è due volte più veloce. Sapendo che per il processore B l’accesso in memoria richiede il 60% del tempo, quant’è lo speedup di A su B?",
        "options": [
            "1,2",
            "1,3",
            "1,5",
            "1,43"
        ],
        "correctAnswers": [3],
        "section": "prestazioni"
    },
    {
        "id": 9,
        "question": "L’elapsed time Telapsed è il tempo",
        "options": [
            "Impiegato dalla CPU per eseguire un'istruzione",
            "Complessivo per eseguire un task da parte dell’intero calcolatore",
            "Dedicato all'I/O del sistema",
            "Di esecuzione di una singola operazione aritmetica"
        ],
        "correctAnswers": [1],
        "section": "prestazioni"
    },
    {
        "id": 10,
        "question": "Un programma necessita 66 milioni di istruzioni e mediamente processa istruzioni a 2 cicli di clock per istruzione con una frequenza di clock di 3GHz. Qual è il tempo di CPU?",
        "options": [
            "70 ms",
            "40 ms",
            "44 ms",
            "65 ms"
        ],
        "correctAnswers": [2],
        "section": "prestazioni"
    },
    {
        "id": 11,
        "question": "Siano dati 3 diversi processori P1,P2,P3 che hanno lo stesso set di istruzioni con frequenza di clock rispettivamente di 3 e 2,5 e 4 GHz e con CPI medio di 1,5 ed 1 e 2,2 rispettivamente. Quale è il processore che ha prestazioni migliori in termini di MIPS?",
        "options": [
            "P2",
            "P1 e P3 a pari merito",
            "P3",
            "P1"
        ],
        "correctAnswers": [0],
        "section": "prestazioni"
    },
    {
        "id": 12,
        "question": "La durata dell'esecuzione di una applicazione scritta in C++ è di 20s su un processore di un desktop. Con nuovo compilatore efficiente, il nuovo eseguibile richiede solo il 70% delle istruzioni del vecchio programma. Sfortunatamente però usa istruzioni più complesse che aumentano del 10% il numero di clock medio per istruzione. È più veloce la nuova applicazione? E se sì, di quanto?",
        "options": [
            "No, impiega 20 s",
            "Sì, 15,4 s",
            "Sì, 18 s",
            "No, impiega 22 s"
        ],
        "correctAnswers": [1],
        "section": "prestazioni"
    },
    {
        "id": 13,
        "question": "Due processori A e B differiscono solo dell’accesso in memoria che in A è due volte più veloce. Sapendo che per il processore B l’accesso in memoria richiede il 60% del tempo, quant’è lo speedup di A su B?",
        "options": [
            "1,21",
            "1,33",
            "1,54",
            "1,43"
        ],
        "correctAnswers": [3],
        "section": "prestazioni"
    },
    {
        "id": 14,
        "question": "Se una CPU esegue una sequenza di 100 istruzioni con CPI=5 in media, per impiegare meno di 500 cicli di clock, devo scegliere una CPU con",
        "options": [
            "Una frequenza di clock più bassa",
            "Un'architettura CISC",
            "Un throughput maggiore",
            "Un minor numero di pipeline"
        ],
        "correctAnswers": [2],
        "section": "prestazioni"
    },
    {
        "id": 15,
        "question": "Un Processore lavora a 2GHz con due compilatori C1 e C2 che producono codice eseguibile di lunghezza diversa: il primo genera un codice con 1 miliardo di istruzioni che impiega 1,1 s di esecuzione e il secondo con 1,2 miliardi che impiega 1,5 s. Quali sono i CPI medi che ne derivano per C1 e C2 rispettivamente?",
        "options": [
            "2 e 2,5",
            "1,5 e 2",
            "2,2 e 2,8",
            "3 e 3,5"
        ],
        "correctAnswers": [0],
        "section": "prestazioni"
    },
    {
        "id": 16,
        "question": "I calcolatori A,B comprati in due anni successivi hanno la CPU che migliora ogni anno di 3 volte il Tcpu (comprendente operazioni in memoria e operazioni interne nella CPU) ma hanno sempre lo stesso sottosistema di I/O per cui il tempo Tio per le operazioni di I/O rimane inalterato. Consideriamo due tipi di applicazioni - CPU bound in cui il 90% Tcpu e 10% Tio - I/O bound in cui il 30% Tcpu e 70% Tio Lo speedup di B rispetto ad A nei due casi è rispettivamente:",
        "options": [
            "2,5 e 1,25",
            "3,0 e 1,5",
            "1,8 e 1,2",
            "2,0 e 1,4"
        ],
        "correctAnswers": [0],
        "section": "prestazioni"
    },
    {
        "id": 17,
        "question": "La durata dell'esecuzione di una applicazione scritta in C++ è di 15 s su un processore di un desktop. Con nuovo compilatore efficiente, il nuovo eseguibile richiede solo il 60% delle istruzioni del vecchio programma. Sfortunatamente però usa istruzioni più complesse che aumentano del 10% il numero di clock medio per istruzione. È più veloce la nuova applicazione? E se sì, di quanto?",
        "options": [
            "No, impiega 15 s",
            "Sì, 10,5 s",
            "Sì, 9,9 s",
            "No, impiega 16 s"
        ],
        "correctAnswers": [2],
        "section": "prestazioni"
    }
    
]


export default prestazioni;