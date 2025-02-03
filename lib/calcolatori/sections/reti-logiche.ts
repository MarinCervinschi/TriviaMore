import QuizQuestion from "@/types/QuizQuestion";

const retiLogiche: QuizQuestion[] =[
    {
        "id": 1,
        "question": "Semplificare l'espressione Y = (A B + C)' + (A + B')'",
        "options": [
            "A' B + B' C",
            "A B + C'",
            "A' B + B' C'",
            "A + B C"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 2,
        "question": "La forma canonica PS",
        "options": [
            "Si deriva in modo deterministico dalla tabella di verità prendendo in AND tutti i maxtermini corrispondenti alle righe in cui l'uscita vale 0. Ogni variabile è in forma diretta se nella colonna appare il valore 0 ed in forma negata se appare il valore 1, permettendo così una rappresentazione strutturata della funzione logica.",
            "Si ottiene applicando direttamente il teorema di De Morgan alle espressioni booleane, trasformando ogni operazione logica in una forma equivalente che facilita l'analisi e la manipolazione delle funzioni.",
            "È l'unico metodo per semplificare un'espressione booleana, garantendo una rappresentazione unica e ottimizzata della funzione, indipendentemente dal numero di variabili coinvolte nel sistema.",
            "Si basa sulla rappresentazione binaria di una funzione logica, utilizzando i valori binari delle variabili per costruire un modello matematico che consente di analizzare il comportamento della rete logica."
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },    
    {
        "id": 3,
        "question": "Una funzione combinatoria di n ingressi sintetizzata in forma canonica PS contiene al più:",
        "options": [
            "n gate NOT, 2^n OR a n ingressi e 1 AND a n ingressi",
            "n gate NOT, 2^n OR a n ingressi e 1 XOR al più a 2^n ingressi",
            "n gate NOT, 2^n AND a n ingressi e 1 OR al più a 2^n ingressi",
            "n gate NOT, 2^n OR a n ingressi e 1 AND al più a 2^n ingressi"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 4,
        "question": "Fornire la tabella di verità per la funzione F = a'b'c' + a'bc + ab'c' + ab'c + abc' + abc.",
        "options": [
            "F(a,b,c) = (0110 1010)",
            "F(a,b,c) = (1100 1001)",
            "F(a,b,c) = (0101 1100)",
            "F(a,b,c) = (1001 1111)"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 5,
        "question": "L'espressione AB + A'C è equivalente a:",
        "options": [
            "AB + A'C",
            "AB + A'B",
            "AB + A'C + BC",
            "A'B + BC"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 6,
        "question": "Con 'rete logica' si intende:",
        "options": [
            "Un livello di astrazione nello studio dei sistemi digitali che fornisce una descrizione a livello di componenti logici elementari, senza dipendere dalla tecnologia utilizzata per la realizzazione del sistema.",
            "Un insieme di circuiti elettronici progettati per eseguire operazioni aritmetiche e logiche complesse, destinate a determinati tipi di calcoli.",
            "Un tipo di connessione tra microprocessori o nodi in una rete per facilitare le elaborazioni distribuite, migliorando l'efficienza del sistema.",
            "Un livello software che si occupa dell'ottimizzazione dei calcoli logici attraverso algoritmi specifici per l'elaborazione dei dati."
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },    
    {
        "id": 7,
        "question": "Se X e Y sono espressioni dell'algebra di Boole, quale delle seguenti espressioni NON È VERA?",
        "options": [
            "La differenza logica di X e Y è un’espressione",
            "X + X' = 1",
            "X · X' = 0",
            "X + 0 = X"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 8,
        "question": "Nell'algebra di Boole, il teorema di identità prevede che:",
        "options": [
            "X + X = 2X",
            "X + 0 = X",
            "X · X' = 1",
            "X + 1 = X"
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },
    {
        "id": 9,
        "question": "Esprimere la funzione F(a,b,c) = (0011 1100) in forma minima SP.",
        "options": [
            "F = a'b + ab'",
            "F = a + b'c",
            "F = ab + a'c",
            "F = a' + bc"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 10,
        "question": "Esprimere la funzione F(a,b,c) (0011 1100) in forma canonica SP.",
        "options": [
            "F = a'b + ab'",
            "F = a'bc' + a'bc + ab'c' + ab'c",
            "F = ab + a'c",
            "F = a' + bc"
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
},
    {
        "id": 11,
        "question": "Esprimere la funzione F(a,b,c) = (1001 1111) in forma canonica SP.",
        "options": [
            "F = a'bc' + ab'c + abc",
            "F = a'b'c + ab'c' + abc",
            "F = ab + a'c",
            "F = a'b'c' + a’bc + ab’c’ + ab’c + abc' + abc"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 12,
        "question": "Semplificare l'espressione Y = A' C + A B D + B C' D + B C + A' C' D + A B D'.",
        "options": [
            "A B + A' D + A' C",
            "A B C + A' B",
            "A' B C + A D",
            "A C + B D + A' C'"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 13,
        "question": "Nelle reti logiche, FSM è l'acronimo di",
        "options": [
            "Function State Module",
            "Fast Switching Mechanism",
            "Fully Synchronous Memory",
            "Finite State Machine"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 14,
        "question": "Quale delle seguenti espressioni logiche è equivalente a F = A B' + (A + C' D + A D') B + A' C' D?",
        "options": [
            "F = A B + A' C D",
            "F = A + C' D",
            "F = A C + B D",
            "F = A + B' D"
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },
    {
        "id": 15,
        "question": "Quale delle seguenti espressioni logiche è equivalente a F = (A' B C' + D')' (D + C' A + 1) + A B + A' B?",
        "options": [
            "F = A B + C D",
            "F = A + B C",
            "F = A' C + B D",
            "F = B + D"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 16,
        "question": "Semplificare la seguente espressione utilizzando i teoremi dell'algebra di Boole: A'BC + BCD + ABC' + A'BC' + B'CD.",
        "options": [
            "A B + C D",
            "A C + B D",
            "A'B + BC + CD",
            "A B C + A' B C'"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 17,
        "question": "Il teorema di De Morgan prevede che:",
        "options": [
            "(X + Y)' = (X' · Y')",
            "(X · Y)' = (X' + Y')",
            "(X + Y) = (X' · Y')",
            "(X + Y)' = (X + Y')"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 18,
        "question": "Il teorema di complementarietà prevede che",
        "options": [
            "X · X' = 1",
            "X + X = X",
            "X + X' = 1",
            "X · X' = 0"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 19,
        "question": "Quale di queste affermazioni è vera?",
        "options": [
            "Una tabella di verità è un tipo di strumento utilizzato esclusivamente per analizzare funzioni booleane che coinvolgono solo due variabili, non applicabile a funzioni con più ingressi.",
            "Una tabella di verità è una tabella che associa tutte le possibili combinazioni degli ingressi alle corrispondenti configurazioni delle uscite e indica in modo esaustivo il comportamento della rete logica.",
            "Una tabella di verità è una tecnica utilizzata solo per rappresentare circuiti combinatori, senza applicazione in circuiti sequenziali o in altre tipologie di reti logiche complesse.",
            "Le tabelle di verità, sebbene siano fondamentali nella progettazione dei sistemi logici, non sono più utilizzate nei moderni sistemi digitali a causa della crescente complessità dei circuiti."
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },    
    {
        "id": 20,
        "question": "Semplificare l'espressione Y = (A B + C)' + (A + B')'.",
        "options": [
            "A' B + B' C'",
            "A B + C",
            "A' B + B C",
            "A B + B' C"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 21,
        "question": "Un mintermine è:",
        "options": [
            "Il prodotto logico di n letterali ognuno dei quali compare in forma vera o complementata, ma mai in entrambe.",
            "La somma logica di n variabili indipendenti.",
            "Una combinazione di AND e OR tra n variabili booleane.",
            "Un termine dell'algebra di Boole che assume sempre valore 1."
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 22,
        "question": "Fornire la tabella di verità per la funzione F = a + b'c' + bc.",
        "options": [
            "F(a,b,c) = (0110 1101)",
            "F(a,b,c) = (1010 1001)",
            "F(a,b,c) = (1101 1010)",
            "F(a,b,c) = (1001 1111)"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 23,
        "question": "L'espressione B + B'C è equivalente a:",
        "options": [
            "B + B'",
            "B C",
            "B' + C",
            "B + C"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 24,
        "question": "Detto B l'insieme dei simboli dell'algebra di Boole, una funzione completamente specificata di n variabili",
        "options": [
            "Ha come dominio B alla n e come codominio B alla n.",
            "Ha come dominio B alla n e come codominio B.",
            "Ha come dominio B e come codominio B alla n.",
            "Non ha un dominio specifico."
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },
    {
        "id": 25,
        "question": "La proprietà del consenso prevede che",
        "options": [
            "(X + Y) · (X + Z) = (X + Y) · Z",
            "(X · Y) + (X' · Z) = (X + Y) · (X' + Z)",
            "(X + Y) · Z = X · Z + Y · Z",
            "(X + Y) · (X' + Z) · (Y + Z) = (X + Y) · (X' + Z)"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 26,
        "question": "Una funzione logica si dice non completamente specificata se:",
        "options": [
            "Le uscite hanno valori sempre deterministici.",
            "È rappresentata con una sola equazione booleana.",
            "Non contiene condizioni di indifferenza.",
            "Le uscite hanno condizioni di indifferenza."
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 27,
        "question": "Il teorema degli elementi nulli prevede che",
        "options": [
            "X + 0 = X",
            "X · 1 = X",
            "X · 0 = 0",
            "X + 1 = 1"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 28,
        "question": "La proprietà di interconnessione delle reti logiche prevede che:",
        "options": [
            "L'interconnessione di più reti logiche, aventi per ingresso segnali esterni o uscite di altre reti logiche e per uscite segnali di uscita esterni o ingressi di altre reti logiche, è ancora una rete logica",
            "Una rete logica interconnessa è un sistema che può essere utilizzato solo per funzioni combinatorie, senza la possibilità di implementare circuiti sequenziali o sistemi con feedback.",
            "Le reti logiche interconnesse, sebbene siano progettate per eseguire funzioni specifiche, perdono completamente la loro funzionalità iniziale quando vengono collegate ad altri circuiti o reti, in quanto il comportamento diventa imprevedibile.",
            "L'interconnessione tra diverse reti logiche è applicabile esclusivamente a sistemi digitali di grandi dimensioni, dove la complessità del sistema richiede una gestione di segnali provenienti da diverse reti o moduli."
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },    
    {
        "id": 29,
        "question": "Le funzioni logiche di una sola variabile indipendente sono",
        "options": [
            "Due: buffer e not",
            "Quattro: massa, buffer, not e Vcc",
            "Tre: and, or, not",
            "Cinque: xor, buffer, not, massa e Vcc"
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },
    {
        "id": 30,
        "question": "Sia data la funzione logica F(x3,x2,x1,x0) = (1010 1100 1010 0000). Quale delle seguenti è la sua corrispondente sintesi minima PS?",
        "options": [
            "F = (x2 + x1') (x3 + x0)",
            "F = (x3 + x1) (x2' + x0')",
            "F = (x2 + x0') (x1 + x3')",
            "F = (x2 + x0') (x2' + x1') (x3' + x2')"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 31,
        "question": "Quale delle seguenti espressioni logiche è equivalente a F = A'B C' D+AB C D' + A B' C' D + (A' B' C'D’)’?",
        "options": [
            "F = A B + C D",
            "F = A + B C",
            "F = A + B + C + D",
            "F = B + D"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },

    {
        "id": 32,
        "question": "Nell’algebra di Boole il teorema dell’idempotenza prevede che:",
        "options": [
            "X · X = 0",
            "X + X = 2X",
            "X + X = X",
            "X · X' = 1"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 33,
        "question": "Semplificare la seguente espressione utilizzando i teoremi dell'algebra di Boole: X'Y'Z'W' + XYZ'W' + X'Y'W + YZ + X'Y'ZW' + 'ZW' + Y'ZW",
        "options": [
            "X + Y + ZW",
            "X'Y'Z' + XW + Z",
            "X'Y' + XYZ'W' + Z",
            "X' + Y + Z'W"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 34,
        "question": "Sia data la funzione logica F(x3,x2,x1 ,x0)= (1000 -100 ---1 -01-). Quale delle seguenti è la sua corrispondente sintesi minima PS?",
        "options": [
            "F = (x2 + x1') (x3 + x0)",
            "F = (x1' + x3') (x2 + x0)",
            "F = (x3' + x2) (x1 + x0')",
            "F = (x3' + x1) (x3 + x2 + x0’) (x3 + x1’)"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 35,
        "question": "Nell'algebra di Boole, l'espressione AC + A’D è equivalente a:",
        "options": [
            "AC + A’D + CD",
            "ACD + A’D",
            "AC + A’C + D",
            "ACD + A’C"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    },
    {
        "id": 36,
        "question": "Semplificare la seguente espressione utilizzando i teoremi dell'algebra di Boole: XYZ' + XYW + X'ZW + XYW' + X'Z'W.",
        "options": [
            "XY + XW + Z",
            "X'Z + XY + W",
            "XY + X'W",
            "X'W + XYZ"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 37,
        "question": "Le funzioni logiche di 2 variabili indipendenti sono:",
        "options": [
            "2^2, cioè 4",
            "2^4, cioè 16",
            "2^3, cioè 8",
            "2^5, cioè 32"
        ],
        "correctAnswers": [1],
        "section": "reti_logiche"
    },
    {
        "id": 38,
        "question": "Sia data la funzione logica F(x3,x2,x1,x0) = (100- -100 10-0 101-). Quale delle seguenti è la sua corrispondente sintesi minima SP?",
        "options": [
            "F = x1 x0 + x3 x2' x1 + x3' x0",
            "F = x1' x0' + x3 x2 x1 + x3' x0",
            "F = x1' x0' + x3' x2 x1' + x3 x0’",
            "F = x2 x1 + x3' x0' + x3 x1'"
        ],
        "correctAnswers": [2],
        "section": "reti_logiche"
    },
    {
        "id": 39,
        "question": "Sia data la funzione logica F(x3,x2,x1,x0) = (1000 -100 ---1 -01-). Quale delle seguenti è la sua corrispondente sintesi minima PS?",
        "options": [
            "F = (x2 + x1') (x3 + x0)",
            "F = (x3 + x1) (x2' + x0')",
            "F = (x2 + x0') (x1 + x3')",
            "F = (x3' + x1) (x3 + x2 + x0') (x3 + x1')"
        ],
        "correctAnswers": [3],
        "section": "reti_logiche"
    },
    {
        "id": 40,
        "question": "Qual è la forma semplificata dell'espressione booleana Y = B C' D + A B D' + B C + A' C + A' C' D + A B D?",
        "options": [
            "A' D + A B + A' C",
            "B C' D + A B D' + A' C' D + A B D",
            "A B C' + A' B D' + A' C",
            "A B C + A' D' + B C"
        ],
        "correctAnswers": [0],
        "section": "reti_logiche"
    }   
]

export default retiLogiche;