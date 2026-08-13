import type { FlashcardQuestion } from "@/lib/flashcard/types";
import type { QuizQuestion } from "@/lib/quiz/types";

// Fixed content, no randomness: a story that reshuffles stops being a comparison. One question per
// type and per difficulty, plus the long ones — that is where wrapping and truncation go wrong.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: "q-multi",
		order: 1,
		content:
			"Quale struttura garantisce ricerca, inserimento e cancellazione in O(log n)?",
		questionType: "MULTIPLE_CHOICE",
		options: ["Lista concatenata", "Albero AVL", "Array non ordinato", "Tabella hash"],
		correctAnswer: ["Albero AVL"],
		explanation:
			"Un AVL è un albero binario di ricerca bilanciato in altezza: il ribilanciamento dopo ogni operazione mantiene l'altezza logaritmica.",
		difficulty: "MEDIUM",
	},
	{
		id: "q-truefalse",
		order: 2,
		content:
			"In un albero binario di ricerca la visita in-order restituisce le chiavi ordinate.",
		questionType: "TRUE_FALSE",
		options: ["Vero", "Falso"],
		correctAnswer: ["Vero"],
		explanation: null,
		difficulty: "EASY",
	},
	{
		id: "q-short",
		order: 3,
		content: "Come si chiama la complessità del merge sort nel caso peggiore?",
		questionType: "SHORT_ANSWER",
		options: null,
		correctAnswer: ["O(n log n)"],
		explanation: "Il merge sort divide sempre a metà, indipendentemente dall'input.",
		difficulty: "EASY",
	},
	{
		id: "q-multiple-correct",
		order: 4,
		content:
			"Quali fra le seguenti sono strutture dati ad accesso sequenziale? Seleziona tutte le risposte corrette, e considera che più di una può esserlo.",
		questionType: "MULTIPLE_CHOICE",
		options: ["Coda", "Pila", "Albero rosso-nero", "Lista concatenata", "Tabella hash"],
		correctAnswer: ["Coda", "Pila", "Lista concatenata"],
		explanation:
			"Coda, pila e lista concatenata si attraversano un elemento alla volta; albero e tabella hash offrono accesso diretto.",
		difficulty: "HARD",
	},
];

export const FLASHCARD_QUESTIONS: FlashcardQuestion[] = [
	{
		id: "f-1",
		order: 1,
		content: "Che cosa garantisce il bilanciamento in un albero AVL?",
		correctAnswer: ["Il fattore di bilanciamento di ogni nodo resta in {-1, 0, 1}."],
		explanation:
			"Dopo ogni inserimento o cancellazione una rotazione ripristina il vincolo, mantenendo l'altezza in O(log n).",
		difficulty: "MEDIUM",
	},
	{
		id: "f-2",
		order: 2,
		content: "Complessità del merge sort?",
		correctAnswer: ["O(n log n) in ogni caso."],
		explanation: null,
		difficulty: "EASY",
	},
	{
		id: "f-3",
		order: 3,
		content:
			"Enuncia la differenza fra un attraversamento in ampiezza e uno in profondità, e di' quale dei due trova il cammino minimo in un grafo non pesato.",
		correctAnswer: [
			"L'ampiezza visita per livelli e trova il cammino minimo in un grafo non pesato; la profondità scende fino in fondo a un ramo prima di tornare.",
		],
		explanation:
			"Il BFS raggiunge ogni nodo al suo livello minimo, che in un grafo non pesato coincide col cammino più corto.",
		difficulty: "HARD",
	},
];
