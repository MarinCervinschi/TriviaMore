import QuizQuestion from "@/types/QuizQuestion"

const quizQuestions: QuizQuestion[] = [
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Nelle pipeline di K stadi in cui si può eseguire una sequenza di n istruzioni infinitamente grande, sapendo\n" +
            "che il tempo di uno stadio Ts è assimilabile ad un ciclo di clock Tck:",
        options: [
            "lo speedup rispetto ad una CPU uguale, ma sequenziale e senza pipeline, tende a K solo se\n" +
            "non ci sono alee strutturali, di dato e di controllo.",
            "lo speedup rispetto ad una CPU uguale, ma sequenziale e senza pipeline, tende a K a prescindere da eventuali alee.",
            "lo speedup rispetto ad una CPU uguale, ma sequenziale e senza pipeline, non è influenzato dal numero di stadi K.",
            "lo speedup rispetto ad una CPU uguale, ma sequenziale e senza pipeline, è sempre inferiore a K a causa delle alee."
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle pipeline le alee di controllo",
        options: [
            "Sono alee che si verificano perché in una architettura pipeline viene fatto un salto e la\n" +
            "pipeline deve essere svuotata",
            "Sono alee che si verificano perché in una architettura pipeline si esegue una divisione in virgola mobile",
            "Sono alee che si verificano perché in una architettura pipeline si verifica un errore di pagina",
            "Sono alee che si verificano perché in una architettura pipeline si accede a periferiche esterne lente"
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle pipeline avere carico bilanciato significa che",
        options: [
            "tutte le operazioni di ogni stadio vengono eseguite più o meno con la stessa velocità.",
            "il numero di istruzioni in esecuzione nella pipeline è costante nel tempo.",
            "la pipeline è sempre piena di istruzioni in esecuzione.",
            "il tempo di esecuzione di ogni istruzione è lo stesso."
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle CPU moderne l'acronimo ILP indica",
        options: [
            "Interrupt Level Protocol: il protocollo di gestione delle interruzioni.",
            "Internal Latency Period: il periodo di latenza interna della CPU.",
            "Instruction level parallelism: il modello architetturale per gestire un alto grado di\n" +
            "parallelismo a livello di istruzione.",
            "Input-Output Link Protocol: il protocollo di comunicazione tra CPU e periferiche."
        ],
        answer: [2]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle pipeline le write-after-read",
        options: [
            "Sono alee di dati che si verificano perché in una architettura a più pipeline una istruzione\n" +
            "successiva scrive dei dati che non sono ancora stati letti",
            "Sono alee di controllo che si verificano quando una istruzione di salto condizionato modifica il flusso di esecuzione",
            "Sono alee strutturali che si verificano quando due istruzioni tentano di accedere alla stessa risorsa hardware",
            "Sono alee di sincronizzazione che si verificano quando due thread tentano di accedere alla stessa variabile condivisa"
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle pipeline read-after-write",
        options: [
            "Sono alee dl dati che si verificano perché in una pipeline vengono letti dati che non sono\n" +
            "ancora stati scritti nel registri al termine della pipeline",
            "Sono alee di controllo che si verificano quando una istruzione di salto condizionato legge un valore non ancora aggiornato",
            "Sono alee strutturali che si verificano quando due istruzioni tentano di scrivere nello stesso registro contemporaneamente",
            "Sono alee di sincronizzazione che si verificano quando un thread legge un valore non ancora scritto da un altro thread"
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "La pipeline di un semplice processore RISC (come il MIPS) è composta dai seguenti stadi (nell'ordine):",
        options: [
            "Instruction Fetch, Execution, Instruction Decode, Memory, Write Back.",
            "Instruction Fetch, Instruction Decode, Execution, Memory, Write Back.",
            "Instruction Decode, Instruction Fetch, Execution, Write Back, Memory.",
            "Instruction Fetch, Instruction Decode, Memory, Execution, Write Back."
        ],
        answer: [1]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nel branch target buffer",
        options: [
            "sono memorizzati gli indirizzi delle istruzioni di salto, gli indirizzi destinazione del salto e la\n" +
            "predizione.",
            "sono memorizzati i valori dei registri utilizzati nelle istruzioni di salto condizionato.",
            "sono memorizzate le istruzioni di salto più frequenti.",
            "è memorizzato lo storico delle predizioni di salto."
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Una CPU A ha una pipeline di 5 stadi e nelle istruzioni di salto condizionato, che sono il 30% delle istruzioni,\n" +
            "si ha uno stallo nella fase di Write Back a causa di una alea strutturale nel Program Counter. Qual è lo\n" +
            "speedup di A su una CPU B ideale e senza stalli?",
        options: ["Circa 0.5", "Circa 0.6", "Circa 0.8", "Circa 1"],
        answer: [2]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Si deve eseguire un programma con un ciclo di 10 iterazioni; in ogni ciclo si devono leggere le variabili var1,\n" +
            "var2, var3 e var4 che sono allocate in memoria agli indirizzi rispettivamente FOOOA023, FOOOA021 ,\n" +
            "A000A022, F000A025. Con uno spazio di indirizzamento a 32 bit ed una cache 2-way associative con linee di\n" +
            "163 di dati e di capacità di 1 Mbyte, quante miss si verificano?",
        options: ["Meno di 15 miss", "Tra 15 e 20 miss", "Tra 20 e 30 miss", "Più di 30 miss"],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Organizzare memorie in serie significa",
        options: [
            "usare più dispositivi per aumentare la velocità di accesso ai dati.",
            "usare più dispositivi per aumentare lo spazio di indirizzamento",
            "usare più dispositivi per aumentare l'affidabilità del sistema.",
            "usare più dispositivi per diminuire il costo della memoria."
        ],
        answer: [1]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "La differenza tra il branch prediction buffer e il branch target buffer è che",
        options: [
            "Il primo è un meccanismo per suggerire la predizione e il secondo per suggerire predizione\n" +
            "ed indirizzo dove saltare",
            "Il primo è un meccanismo per suggerire l'indirizzo dove saltare e il secondo per suggerire la predizione.",
            "Il primo è un meccanismo per memorizzare lo storico delle predizioni e il secondo per memorizzare gli indirizzi di salto.",
            "Non c'è differenza, sono sinonimi."
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "Nelle pipeline avere registri doppia porta è necessario per",
        options: [
            "aumentare la velocità di accesso ai registri.",
            "memorizzare più dati nei registri.",
            "implementare il parallelismo a livello di istruzione.",
            "non avere alee strutturali."
        ],
        answer: [3]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Sia dato un processore a 24 bit di indirizzo e bus di dati a 16 bit con spazio di indirizzamento allineato; deve\n" +
            "indirizzare 1Mbyte di RAM a partire dagli indirizzi bassi.",
        options: [
            "Utilizza un blocco con due dispositivi in parallelo CS0#= /(/A23 x /A22 x /A21 x /A20) CS1#=\n" +
            "/(/A23 x /A22 x /A21 x /A20)",
            "Utilizza un blocco con due dispositivi in parallelo CS0#= /(/A23 x /A22 x /A21 x A20) CS1#=\n" +
            "/(/A23 x /A22 x /A21 x A20)",
            "Utilizza un blocco con quattro dispositivi in parallelo CS0#= /(/A23 x /A22 x /A21 x /A20) CS1#=\n" +
            "/(/A23 x /A22 x /A21 x A20) CS2#= /(/A23 x /A22 x A21 x /A20) CS3#= /(/A23 x /A22 x A21 x A20)",
            "Utilizza un blocco con quattro dispositivi in parallelo CS0#= /(/A23 x /A22 x A21 x A20) CS1#=\n" +
            "/(/A23 x /A22 x A21 x /A20) CS2#= /(/A23 x A22 x /A21 x A20) CS3#= /(/A23 x A22 x /A21 x /A20)"
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Si deve eseguire un programma con un ciclo di 10 iterazioni; in ogni ciclo si devono leggere le variabili var1,\n" +
            "var2, var3, var4 che sono allocate in memoria agli indirizzi rispettivamente F000A023, FOOOA021,\n" +
            "AOOOA022, FOOOA025. Con uno spazio di indirizzamento a 32 bit ed una cache direct mapped con linee di\n" +
            "16B i dati e di capacità di 1 Mbyte, quante miss si verificano?",
        options: ["Meno di 10 miss", "Tra 10 e 20 miss", "Tra 20 e 30 miss", "Più di 30 miss"],
        answer: [3]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "La sequenza MAR <- PC MDR <- M[MAR] IR <- MDR PC <- PC+N ; DECODE (IR) A <- R[IR(r2)] ; B <- IR(immed)\n" +
            "Aluout <- A + B MAR <- Aluout MDR <- M[MAR] R[IR(r1)] <- MDR è",
        options: [
            "un'istruzione di Load su un registro r1 di una variabile all'indirizzo contenuto in r2 + un\n" +
            "valore immed.",
            "un'istruzione di Store in una variabile in memoria all’indirizzo contenuto in r2 + un valore immed del valore di r1",
            "un'istruzione di somma tra un registro r1 e un valore in memoria con scrittura in memoria del risultato",
            "un'istruzione di somma tra due registri con scrittura in memoria del risultato"
        ],
        answer: [0]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question: "La sequenza MAR <- IR(var1) MDR <- M[MAR] R[IR(r1)] <- MDR esegue",
        options: [
            "un'istruzione di Store in una variabile in memoria var1 del valore di un registro r1",
            "un'istruzione di somma tra un registro r1 e un valore in memoria var1 con scrittura in r1 del risultato",
            "un'istruzione di somma tra un registro r1 e un valore in memoria var1 con scrittura in memoria del risultato",
            "un'istruzione di Load su un registro r1 di una variabile in memoria var1"
        ],
        answer: [3]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "Sia data una istruzione eseguita con le seguenti microoperazioni. Usando la sintassi destinazione sorgente,\n" +
            "registri A e B per operazioni di ALU e le parentesi quadre come puntatore a che istruzione corrisponde: MAR\n" +
            "<- PC MDR <- M[MAR] IR <- MDR PC <- PC+4 ; DECODE; MAR <- R[IR(r2)] MDR <- M[MAR] A <- MDR B <-\n" +
            "R[IR(r3)] ALUout <- A+B MDR <- ALUout M[MAR] <- MDR",
        options: [
            "E’ una somma tra due registri con scrittura in memoria del risultato",
            "E’ una somma tra una registro e un valore in memoria con scrittura in memoria del\n" +
            "risultato",
            "E’ una somma tra due valori in memoria con scrittura in memoria del risultato",
            "E’ una somma tra due registri con scrittura in un registro del risultato"
        ],
        answer: [1]
    },
    {
        classId: "calcolatori",
        sectionId: "Pipeline",
        question:
            "La sequenza MAR<-PC MDR<-M[MAR] IR<-MDR PC<-PC+N ; DECODE (IR) MAR<-IR(opadr) MDR<-R[IR(reg)]\n" +
            "M[MAR]<-MDR è",
        options: [
            "Un'istruzione di Store in una variabile in memoria all’indirizzo opadr del valore di un registro reg",
            "Un'istruzione di Load in un registro reg di una variabile in memoria all’indirizzo opadr",
            "Un'istruzione di somma tra un registro reg e un valore in memoria all’indirizzo opadr con scrittura in memoria del risultato",
            "Un'istruzione di somma tra un registro reg e un valore in memoria all’indirizzo opadr con scrittura nel registro del risultato"
        ],
        answer: [0]
    }
];

export default quizQuestions