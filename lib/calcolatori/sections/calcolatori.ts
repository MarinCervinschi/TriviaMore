import QuizQuestion from "@/types/QuizQuestion";

const calcolatoriElettronici: QuizQuestion[] = [
    {
        "id": 1,
        "question": "La modularità nei calcolatori",
        "options": [
            "È la capacità del sistema di essere progettato per parti anche indipendenti per aumentare o modificare le prestazioni in base alle esigenze",
            "È la capacità del sistema di eseguire più operazioni contemporaneamente",
            "Indica l'utilizzo di diversi linguaggi di programmazione in un unico sistema",
            "Si riferisce alla separazione tra hardware e software"
        ],
        "correctAnswers": [0],
        "section": "calcolatore"
    },
    {
        "id": 2,
        "question": "Una memoria è volatile se",
        "options": [
            "I dati sono permanentemente memorizzati anche senza alimentazione",
            "I dati nelle celle di memoria possono modificare il loro valore in assenza di alimentazione",
            "Richiede una batteria tampone per mantenere i dati",
            "Non può essere scritta dall'utente"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 3,
        "question": "Un Giga, un Tera, un Mega byte significano:",
        "options": [
            "2^10, 2^20, 2^30 byte",
            "2^20, 2^30, 2^40 byte",
            "2^30, 2^40, 2^20 byte",
            "10^9, 10^12, 10^6 byte"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 4,
        "question": "Considerando l'architettura di Von Neumann e di Harvard",
        "options": [
            "La seconda utilizza una sola memoria per dati e istruzioni",
            "La seconda permette di realizzare calcolatori più veloci perché si possono prelevare assieme dati ed istruzioni da due memorie diverse",
            "La prima è più efficiente della seconda",
            "Non esiste una differenza significativa tra le due"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 5,
        "question": "Il tempo di accesso per le memorie ad accesso casuale come la memoria centrale",
        "options": [
            "È il tempo necessario per trasferire i dati al processore",
            "È il tempo di risposta del processore alla memoria",
            "È il tempo che intercorre da quando sono forniti gli indirizzi a quando sono pronti i dati",
            "Dipende esclusivamente dalla capacità della memoria"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 6,
        "question": "MDR significa",
        "options": [
            "Memory Device Register",
            "Main Data Register",
            "Memory Data Register",
            "Memory Drive Register"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 7,
        "question": "Se dopo la fase di fetch il program counter viene incrementato di n, qual è il motivo?",
        "options": [
            "n è la dimensione del bus dati",
            "n è il numero di registri utilizzati",
            "n è il numero di byte dell'istruzione",
            "n dipende dal tipo di pipeline"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 8,
        "question": "L'architettura di Harvard prevede",
        "options": [
            "Un'unica memoria per dati e istruzioni",
            "Una cache separata per dati e istruzioni",
            "Un'architettura parallela con due CPU",
            "Memorie separate per dati e per istruzioni"
        ],
        "correctAnswers": [3],
        "section": "calcolatore"
    },
    {
        "id": 9,
        "question": "Se una CPU esegue una sequenza di 100 istruzioni con CPI=5 in media, per impiegare meno di 500 cicli di clock, devo scegliere una CPU con",
        "options": [
            "Un clock più basso",
            "Un throughput maggiore",
            "Un numero maggiore di registri",
            "Un'architettura CISC"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 10,
        "question": "Cosa è un modello",
        "options": [
            "Una rappresentazione fisica del calcolatore",
            "Un'unità logica all'interno della CPU",
            "Un framework per la gestione dei dati",
            "È una astrazione della realtà che descrive solo i dettagli di interesse"
        ],
        "correctAnswers": [3],
        "section": "calcolatore"
    }, 
    {
        "id": 11,
        "question": "Nelle macchine RISC il CPI diminuisce rispetto alle CISC",
        "options": [
            "Perché le istruzioni sono tutte semplici e l'implementazione hardware è più efficiente",
            "Perché le istruzioni sono più complesse e ottimizzate",
            "Perché usano una pipeline più lunga",
            "Perché utilizzano meno registri rispetto alle CISC"
        ],
        "correctAnswers": [0],
        "section": "calcolatore"
    },
    {
        "id": 12,
        "question": "I sistemi general-purpose",
        "options": [
            "Sono sistemi digitali a funzione fissa",
            "Sono sistemi digitali la cui funzione è specializzata dal software",
            "Sono sistemi usati solo in ambito industriale",
            "Sono sistemi basati esclusivamente su processori RISC"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 13,
        "question": "Cosa è il IPC?",
        "options": [
            "Instruction Process Control",
            "Integrated Processing Core",
            "Input Processing Cycle",
            "Instruction per Clock: ossia in media 1/CPI"
        ],
        "correctAnswers": [3],
        "section": "calcolatore"
    },
    {
        "id": 14,
        "question": "I registri che contengono l'indirizzo della prossima istruzione e l'istruzione corrente sono rispettivamente",
        "options": [
            "IR e PC",
            "PC e IR",
            "MDR e MAR",
            "ALU e CU"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 15,
        "question": "Nel calcolo delle prestazioni il Tcpu comprende",
        "options": [
            "Solo il tempo utente",
            "Il Tcpu (user) + Tcpu (so)",
            "Solo il tempo del sistema operativo",
            "Il tempo di I/O e il tempo di CPU"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 16,
        "question": "La codifica di un codice ASCII (non esteso) è rappresentata con",
        "options": [
            "6 bit con valori da 0 a 63",
            "8 bit con valori da 0 a 127 per caratteri, numeri e simboli",
            "16 bit per caratteri e numeri",
            "4 bit con valori da 0 a 15"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 17,
        "question": "L'instruction register (IR) è",
        "options": [
            "Un registro di sistema che contiene i dati della memoria",
            "Il registro della CPU che contiene l'istruzione corrente",
            "Un'unità di controllo della memoria",
            "Un buffer per il trasferimento dei dati"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 18,
        "question": "Si mettano in ordine crescente le seguenti grandezze: a) TeraByte b) ExaByte c) ZettaByte d) YottaByte",
        "options": [
            "B A D C",
            "A B C D",
            "D C B A",
            "A C B D"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 19,
        "question": "I sistemi embedded sono:",
        "options": [
            "Computer generici programmabili",
            "Dispositivi di archiviazione dati",
            "Calcolatori per uso specifico",
            "Sistemi operativi per ambienti cloud"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 20,
        "question": "Il termine architettura di un calcolatore fu definito",
        "options": [
            "Dalla Intel per il Pentium",
            "Dall'IBM per la famiglia S/360 negli anni",
            "Dalla AMD per i processori Ryzen",
            "Dalla Apple per i primi Macintosh"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 21,
        "question": "La capacità di un calcolatore di mantenere un adeguato livello di prestazioni e di servizio a fronte di cambiamenti delle normali operazioni di lavoro e di eventuali guasti si dice",
        "options": [
            "Resilienza",
            "Affidabilità",
            "Ridondanza",
            "Fault Tolerance"
        ],
        "correctAnswers": [0],
        "section": "calcolatore"
    },
    {
        "id": 22,
        "question": "La memoria centrale rispetto alla memoria di massa",
        "options": [
            "Ha dimensioni e tempi di accesso maggiori",
            "Ha dimensioni e tempi di accesso minori",
            "Ha capacità illimitata",
            "Non è utilizzata nei moderni calcolatori"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 23,
        "question": "Il simulatore di CPU",
        "options": [
            "È un hardware che velocizza l'esecuzione delle istruzioni",
            "È un algoritmo per ottimizzare le prestazioni della memoria cache",
            "È un framework per la gestione della pipeline",
            "È uno strumento software per modellare e simulare il comportamento della CPU e le prestazioni"
        ],
        "correctAnswers": [3],
        "section": "calcolatore"
    },
    {
        "id": 24,
        "question": "Claude Shannon è:",
        "options": [
            "L'inventore del microprocessore",
            "Un pioniere della crittografia",
            "L'inventore del termine bit nella teoria dell'informazione",
            "Il creatore dell'architettura Harvard"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 25,
        "question": "Che differenza c’è tra un segnale analogico e uno digitale?",
        "options": [
            "Il primo può assumere solo due valori distinti, il secondo una serie continua di valori",
            "Il primo può assumere un numero infinito di valori nell’intervallo di definizione, il secondo un numero finito",
            "Il primo è utilizzato solo nelle telecomunicazioni, il secondo nei computer",
            "Non esiste una differenza significativa tra i due"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 26,
        "question": "Cosa è la descrizione comportamentale di un sistema",
        "options": [
            "È la descrizione fisica della struttura hardware del sistema",
            "È la descrizione funzionale come corrispondenza tra le uscite e gli ingressi del sistema",
            "È l'insieme delle specifiche tecniche di un processore",
            "È la rappresentazione grafica del flusso dei dati nel sistema"
        ],
        "correctAnswers": [1],
        "section": "calcolatore"
    },
    {
        "id": 27,
        "question": "Perché nelle macchine CISC il numero di istruzioni è diventato elevato?",
        "options": [
            "Per ridurre il numero di operazioni aritmetiche necessarie",
            "Per aumentare la velocità di esecuzione delle istruzioni",
            "Per abbattere il gap semantico tra linguaggio di alto livello e linguaggio macchina",
            "Per migliorare la gestione della memoria cache"
        ],
        "correctAnswers": [2],
        "section": "calcolatore"
    },
    {
        "id": 28,
        "question": "1 EB corrisponde in byte a:",
        "options": [
            "2^20",
            "2^30",
            "2^50",
            "2^60"
        ],
        "correctAnswers": [3],
        "section": "calcolatore"
    }
]

export default calcolatoriElettronici;