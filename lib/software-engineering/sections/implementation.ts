import QuizQuestion from "@/types/QuizQuestion";

const Implementation: QuizQuestion[] = [
    {
        id: 1,
        question: "Quali attività sono incluse nella fase di implementazione?",
        options: [
            "Scrittura del codice sorgente",
            "Compilazione e testing",
            "Progettazione del software",
            "Debugging"
        ],
        correctAnswers: [0, 1, 3],
        section: "Implementation"
    },
    {
        id: 2,
        question: "Quali caratteristiche migliorano la qualità del codice durante l'implementazione?",
        options: [
            "Leggibilità",
            "Manutenibilità",
            "Correttezza",
            "Prestazioni"
        ],
        correctAnswers: [0, 1, 2, 3],
        section: "Implementation"
    },
    {
        id: 3,
        question: "Quali sono i potenziali rischi di un'eccessiva ottimizzazione del codice?",
        options: [
            "Maggiore leggibilità del codice",
            "Compromissione della manutenibilità",
            "Miglioramento delle prestazioni",
            "Aumento della complessità del codice"
        ],
        correctAnswers: [1, 3],
        section: "Implementation"
    },
    {
        id: 4,
        question: "Quali misure possono essere valutate secondo lo standard ISO/IEC 25010?",
        options: [
            "Misure esterne del software",
            "Misure interne del software",
            "Analisi degli stili di programmazione",
            "Conformità alla sicurezza hardware"
        ],
        correctAnswers: [0, 1],
        section: "Implementation"
    },
    {
        id: 5,
        question: "Quali tecniche sono considerate best practice nello sviluppo del codice?",
        options: [
            "Scrivere unità di codice brevi",
            "Mantenere codice duplicato per sicurezza",
            "Limitare il numero di parametri per metodo",
            "Separare le preoccupazioni nei moduli"
        ],
        correctAnswers: [0, 2, 3],
        section: "Implementation"
    },
    {
        id: 6,
        question: "Quali fasi fanno parte del debugging?",
        options: [
            "Stabilizzazione",
            "Localizzazione",
            "Correzione",
            "Progettazione del sistema"
        ],
        correctAnswers: [0, 1, 2],
        section: "Implementation"
    },
    {
        id: 7,
        question: "Quali vantaggi offre il refactoring del codice?",
        options: [
            "Migliora la leggibilità e la manutenibilità",
            "Riduce la duplicazione del codice",
            "Modifica il comportamento funzionale",
            "Facilita il testing del codice"
        ],
        correctAnswers: [0, 1, 3],
        section: "Implementation"
    },
    {
        id: 8,
        question: "Quale tecnica di refactoring consiste nell'estrazione di un metodo dal codice originale?",
        options: [
            "Extract Method",
            "Replace Conditional with Polymorphism",
            "Extract Superclass",
            "Replace Method with Method Object"
        ],
        correctAnswers: [0],
        section: "Implementation"
    },
    {
        id: 9,
        question: "In cosa consiste la tecnica 'Replace Nested Conditional with Guard Clauses'?",
        options: [
            "Ridurre la complessità dei blocchi condizionali",
            "Utilizzare polimorfismo per sostituire switch e if-else",
            "Inserire condizioni di uscita anticipata",
            "Rimuovere tutti i blocchi condizionali dal codice"
        ],
        correctAnswers: [0, 2],
        section: "Implementation"
    },
    {
        id: 10,
        question: "Qual è l'obiettivo della programmazione per asserzioni?",
        options: [
            "Garantire precondizioni e postcondizioni corrette",
            "Rendere il codice più veloce",
            "Prevenire la duplicazione del codice",
            "Rilevare e segnalare violazioni delle condizioni previste"
        ],
        correctAnswers: [0, 3],
        section: "Implementation"
    },
    {
        id: 11,
        question: "Quali caratteristiche definiscono un buon stile di programmazione?",
        options: [
            "Denominazione chiara e coerente delle entità",
            "Utilizzo eccessivo di commenti",
            "Separazione delle parole e uso corretto della capitalizzazione",
            "Dimensioni ridotte dei metodi"
        ],
        correctAnswers: [0, 2, 3],
        section: "Implementation"
    },
    {
        id: 12,
        question: "Quali vantaggi offre il mantenimento di una base di codice piccola?",
        options: [
            "Facilità di analisi e manutenzione",
            "Riduzione dei test necessari",
            "Migliore produttività nella manutenzione",
            "Rimozione completa dei bug"
        ],
        correctAnswers: [0, 2],
        section: "Implementation"
    },
    {
        id: 13,
        question: "In che modo la leggibilità del codice influisce sulla sua qualità?",
        options: [
            "Rende più facile la verifica e la correzione degli errori",
            "Complica la manutenibilità del software",
            "Facilita il lavoro di team di sviluppo",
            "Migliora automaticamente le prestazioni del codice"
        ],
        correctAnswers: [0, 2],
        section: "Implementation"
    },
    {
        id: 14,
        question: "Quali sono le funzionalità offerte da JUnit per il debugging del software?",
        options: [
            "Supporto per test automatici",
            "Esecuzione di test con configurazioni diverse",
            "Identificazione rapida dei punti critici del codice",
            "Compilazione del codice sorgente"
        ],
        correctAnswers: [0, 1, 2],
        section: "Implementation"
    },
    {
        id: 15,
        question: "Quali caratteristiche ha il debugging?",
        options: [
            "È un processo strutturato con fasi definite",
            "Si basa solo sull'intuito del programmatore",
            "Comprende la correzione e la verifica degli errori",
            "Può essere completamente automatizzato"
        ],
        correctAnswers: [0, 2],
        section: "Implementation"
    },
    {
        id: 16,
        question: "Quali condizioni devono essere sempre verificate nella programmazione per asserzioni?",
        options: [
            "Precondizioni",
            "Postcondizioni",
            "Invarianti",
            "Ordine alfabetico delle classi"
        ],
        correctAnswers: [0, 1, 2],
        section: "Implementation"
    },
    {
        id: 17,
        question: "Quali tecniche sono associate alla programmazione difensiva?",
        options: [
            "Validazione degli input",
            "Utilizzo di asserzioni per verificare condizioni",
            "Analisi dello stile di programmazione personale",
            "Ignorare gli errori di input"
        ],
        correctAnswers: [0, 1, 2],
        section: "Implementation"
    },
    {
        id: 18,
        question: "Qual è l'obiettivo principale del refactoring del codice?",
        options: [
            "Aumentare la complessità del codice",
            "Rendere il codice più leggibile e manutenibile",
            "Modificare il comportamento funzionale",
            "Eliminare tutte le dipendenze esterne"
        ],
        correctAnswers: [1],
        section: "Implementation"
    },
    {
        id: 19,
        question: "Quando è opportuno applicare il 'Extract Method' nel refactoring?",
        options: [
            "Quando un metodo è troppo complesso",
            "Quando il codice non ha blocchi condizionali",
            "Per separare le responsabilità in unità più semplici",
            "Solo se il progetto è completato"
        ],
        correctAnswers: [0, 2],
        section: "Implementation"
    },
    {
        id: 20,
        question: "Cosa si intende per 'Replace Method with Method Object' nel refactoring?",
        options: [
            "Isolare un metodo complesso in una classe separata",
            "Trasformare variabili locali in campi della classe",
            "Eliminare il metodo complesso",
            "Sostituire il metodo con un'interfaccia esterna"
        ],
        correctAnswers: [0, 1],
        section: "Implementation"
    }
];
export default Implementation;