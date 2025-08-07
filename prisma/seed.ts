import {
	CourseType,
	Difficulty,
	PrismaClient,
	QuestionType,
	QuizMode,
	Role,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Iniziando il seeding del database...");

	// Pulizia del database (solo se le tabelle esistono)
	console.log("🧹 Pulizia del database...");
	try {
		await prisma.answerAttempt.deleteMany();
		await prisma.quizAttempt.deleteMany();
		await prisma.quizQuestion.deleteMany();
		await prisma.quiz.deleteMany();
		await prisma.bookmark.deleteMany();
		await prisma.question.deleteMany();
		await prisma.progress.deleteMany();
		await prisma.sectionAccess.deleteMany();
		await prisma.section.deleteMany();
		await prisma.userClass.deleteMany();
		await prisma.class.deleteMany();
		await prisma.courseMaintainer.deleteMany();
		await prisma.course.deleteMany();
		await prisma.departmentAdmin.deleteMany();
		await prisma.department.deleteMany();
		await prisma.evaluationMode.deleteMany();
		await prisma.user.deleteMany();
		await prisma.session.deleteMany();
		await prisma.verificationToken.deleteMany();
		await prisma.account.deleteMany();
		console.log("✅ Database pulito con successo");
	} catch (error) {
		console.log(
			"⚠️  Database vuoto o tabelle non esistenti, continuando con la creazione..."
		);
	}

	// Creazione modalità di valutazione
	console.log("📊 Creando modalità di valutazione...");
	const standardMode = await prisma.evaluationMode.create({
		data: {
			name: "Standard",
			description:
				"Modalità di valutazione standard: 1 punto per risposta corretta, 0 per sbagliata",
			correctAnswerPoints: 1.0,
			incorrectAnswerPoints: 0.0,
			partialCreditEnabled: false,
		},
	});

	const penaltyMode = await prisma.evaluationMode.create({
		data: {
			name: "Con Penalità",
			description:
				"Modalità con penalità: 1 punto per risposta corretta, -0.25 per sbagliata",
			correctAnswerPoints: 1.0,
			incorrectAnswerPoints: -0.25,
			partialCreditEnabled: false,
		},
	});

	const partialCreditMode = await prisma.evaluationMode.create({
		data: {
			name: "Credito Parziale",
			description: "Modalità con credito parziale per domande a risposta multipla",
			correctAnswerPoints: 1.0,
			incorrectAnswerPoints: 0.0,
			partialCreditEnabled: true,
		},
	});

	// Creazione utenti
	console.log("👥 Creando utenti...");
	const hashedPassword = await bcrypt.hash("password123", 10);

	const superAdmin = await prisma.user.create({
		data: {
			name: "superadmin",
			email: "superadmin@example.com",
			password: hashedPassword,
			role: Role.SUPERADMIN,
		},
	});

	const admin = await prisma.user.create({
		data: {
			name: "admin",
			email: "admin@example.com",
			password: hashedPassword,
			role: Role.ADMIN,
		},
	});

	const maintainer = await prisma.user.create({
		data: {
			name: "maintainer",
			email: "maintainer@example.com",
			password: hashedPassword,
			role: Role.MAINTAINER,
		},
	});

	const student1 = await prisma.user.create({
		data: {
			name: "Mario Rossi",
			email: "mario.rossi@example.com",
			password: hashedPassword,
			role: Role.STUDENT,
		},
	});

	const student2 = await prisma.user.create({
		data: {
			name: "Giulia Bianchi",
			email: "giulia.bianchi@example.com",
			password: hashedPassword,
			role: Role.STUDENT,
		},
	});

	// Creazione dipartimenti
	console.log("🏢 Creando dipartimenti...");
	const department1 = await prisma.department.create({
		data: {
			name: 'Dipartimento di Ingegneria "Enzo Ferrari"',
			code: "DIEF",
			description: "Dipartimento di Ingegneria",
			position: 1,
		},
	});

	const department2 = await prisma.department.create({
		data: {
			name: 'Dipartimento di Economia "Marco Biagi"',
			code: "DEMB",
			description: "Dipartimento di Economia",
			position: 2,
		},
	});

	// Assegnazione admin ai dipartimenti
	await prisma.departmentAdmin.create({
		data: {
			userId: admin.id,
			departmentId: department1.id,
		},
	});

	await prisma.departmentAdmin.create({
		data: {
			userId: admin.id,
			departmentId: department2.id,
		},
	});

	// Creazione corsi
	console.log("📚 Creando corsi...");

	const informaticEngineering = await prisma.course.create({
		data: {
			name: "Ingegneria Informatica",
			code: "20-312",
			description: "Corso di Laurea in Ingegneria Informatica",
			departmentId: department1.id,
			courseType: CourseType.BACHELOR,
			position: 1,
		},
	});

	const mechanicalEngineering = await prisma.course.create({
		data: {
			name: "Ingegneria Meccanica",
			code: "20-313",
			description: "Corso di Laurea in Ingegneria Meccanica",
			departmentId: department1.id,
			courseType: CourseType.BACHELOR,
			position: 2,
		},
	});

	const businessAndFinance = await prisma.course.create({
		data: {
			name: "Economia e Finanza",
			code: "50-312",
			description: "Corso di Laurea in Economia e Finanza",
			departmentId: department2.id,
			courseType: CourseType.BACHELOR,
			position: 1,
		},
	});

	// Assegnazione maintainer ai corsi
	await prisma.courseMaintainer.create({
		data: {
			userId: maintainer.id,
			courseId: informaticEngineering.id,
		},
	});

	await prisma.courseMaintainer.create({
		data: {
			userId: maintainer.id,
			courseId: businessAndFinance.id,
		},
	});

	// Creazione classi
	console.log("🎓 Creando classi...");

	const informaticFoundations = await prisma.class.create({
		data: {
			name: "Fondamenti di Informatica",
			code: "INF-002R",
			description: "Corso di Fondamenti di Informatica 1",
			classYear: 1,
			courseId: informaticEngineering.id,
			position: 1,
		},
	});

	const databaseClass = await prisma.class.create({
		data: {
			name: "Basi di Dati",
			code: "INF-009R",
			description: "Corso di Basi di Dati",
			classYear: 2,
			courseId: informaticEngineering.id,
			position: 3,
		},
	});

	const softwareEngClass = await prisma.class.create({
		data: {
			name: "Ingegneria del Software",
			code: "INF-010R",
			description: "Corso di Ingegneria del Software",
			classYear: 2,
			courseId: informaticEngineering.id,
			position: 2,
		},
	});

	const algebraClass = await prisma.class.create({
		data: {
			name: "Algebra Lineare",
			code: "MAT-001R",
			description: "Corso di Algebra Lineare",
			classYear: 1,
			courseId: informaticEngineering.id,
			position: 4,
		},
	});

	const businessClass = await prisma.class.create({
		data: {
			name: "Economia Aziendale",
			code: "CLEF-02",
			description: "Corso di Economia Aziendale",
			classYear: 1,
			courseId: businessAndFinance.id,
			position: 0,
		},
	});

	// Iscrizione studenti alle classi
	await prisma.userClass.createMany({
		data: [
			{ userId: student1.id, classId: informaticFoundations.id },
			{ userId: student1.id, classId: softwareEngClass.id },
			{ userId: student1.id, classId: databaseClass.id },
			{ userId: student2.id, classId: businessClass.id },
			{ userId: student2.id, classId: algebraClass.id },
		],
	});

	// Creazione sezioni
	console.log("📂 Creando sezioni...");

	// Sezioni per Fondamenti di Informatica
	const programmingBasicsSection = await prisma.section.create({
		data: {
			name: "Basi della Programmazione",
			description: "Concetti fondamentali della programmazione in C",
			isPublic: true,
			classId: informaticFoundations.id,
			position: 1,
		},
	});

	const algorithmsSection = await prisma.section.create({
		data: {
			name: "Algoritmi e Strutture Dati",
			description: "Algoritmi di base e strutture dati fondamentali",
			isPublic: true,
			classId: informaticFoundations.id,
			position: 2,
		},
	});

	// Sezioni per Ingegneria del Software
	const umlSection = await prisma.section.create({
		data: {
			name: "UML e Modellazione",
			description: "Unified Modeling Language e tecniche di modellazione",
			isPublic: true,
			classId: softwareEngClass.id,
			position: 1,
		},
	});

	const designPatternsSection = await prisma.section.create({
		data: {
			name: "Design Patterns",
			description: "Pattern di progettazione software",
			isPublic: true,
			classId: softwareEngClass.id,
			position: 2,
		},
	});

	// Sezioni per Basi di Dati
	const sqlSection = await prisma.section.create({
		data: {
			name: "SQL Base",
			description: "Concetti fondamentali di SQL e query di base",
			isPublic: true,
			classId: databaseClass.id,
			position: 1,
		},
	});

	const normalizationSection = await prisma.section.create({
		data: {
			name: "Normalizzazione",
			description: "Forme normali e normalizzazione di database",
			isPublic: false,
			classId: databaseClass.id,
			position: 2,
		},
	});

	// Sezioni per Algebra Lineare
	const vectorsSection = await prisma.section.create({
		data: {
			name: "Vettori e Spazi Vettoriali",
			description: "Concetti base sui vettori e spazi vettoriali",
			isPublic: true,
			classId: algebraClass.id,
			position: 1,
		},
	});

	const matricesSection = await prisma.section.create({
		data: {
			name: "Matrici e Determinanti",
			description: "Operazioni con matrici e calcolo dei determinanti",
			isPublic: true,
			classId: algebraClass.id,
			position: 2,
		},
	});

	// Sezioni per Economia Aziendale
	const businessFundamentalsSection = await prisma.section.create({
		data: {
			name: "Fondamenti di Economia",
			description: "Concetti base di economia aziendale",
			isPublic: true,
			classId: businessClass.id,
			position: 1,
		},
	});

	const marketingSection = await prisma.section.create({
		data: {
			name: "Marketing e Vendite",
			description: "Principi di marketing e strategie di vendita",
			isPublic: false,
			classId: businessClass.id,
			position: 2,
		},
	});

	// Accesso alle sezioni private
	await prisma.sectionAccess.createMany({
		data: [
			{ userId: student1.id, sectionId: normalizationSection.id },
			{ userId: student2.id, sectionId: marketingSection.id },
		],
	});

	// Creazione domande
	console.log("❓ Creando domande...");

	// Domande Fondamenti di Informatica - Programmazione
	await prisma.question.createMany({
		data: [
			{
				content:
					"Quale tipo di dato viene utilizzato per memorizzare numeri interi in C?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["float", "int", "char", "double"],
				correctAnswer: ["int"],
				explanation:
					'Il tipo di dato "int" è utilizzato per memorizzare numeri interi in C.',
				difficulty: Difficulty.EASY,
				sectionId: programmingBasicsSection.id,
			},
			{
				content: "Il linguaggio C è un linguaggio di programmazione ad alto livello.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["false"],
				explanation:
					"Il C è considerato un linguaggio di medio livello, non ad alto livello.",
				difficulty: Difficulty.MEDIUM,
				sectionId: programmingBasicsSection.id,
			},
			{
				content: "Qual è la funzione utilizzata per stampare output in C?",
				questionType: QuestionType.SHORT_ANSWER,
				correctAnswer: ["printf", "printf()", "printf function"],
				explanation:
					"La funzione printf() è utilizzata per stampare output formattato in C.",
				difficulty: Difficulty.EASY,
				sectionId: programmingBasicsSection.id,
			},
		],
	});

	// Domande Algoritmi
	await prisma.question.createMany({
		data: [
			{
				content: "Quale struttura dati segue il principio LIFO (Last In, First Out)?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["Queue", "Stack", "Array", "Linked List"],
				correctAnswer: ["Stack"],
				explanation:
					"Lo Stack segue il principio LIFO: l'ultimo elemento inserito è il primo ad essere rimosso.",
				difficulty: Difficulty.MEDIUM,
				sectionId: algorithmsSection.id,
			},
			{
				content:
					"L'algoritmo di ordinamento Bubble Sort ha complessità O(n²) nel caso peggiore.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation: "Il Bubble Sort ha infatti complessità O(n²) nel caso peggiore.",
				difficulty: Difficulty.MEDIUM,
				sectionId: algorithmsSection.id,
			},
		],
	});

	// Domande UML
	await prisma.question.createMany({
		data: [
			{
				content:
					"Quale diagramma UML è utilizzato per modellare il comportamento dinamico di un sistema?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: [
					"Diagramma delle classi",
					"Diagramma di sequenza",
					"Diagramma dei casi d'uso",
					"Diagramma dei componenti",
				],
				correctAnswer: ["Diagramma di sequenza"],
				explanation:
					"I diagrammi di sequenza mostrano l'interazione tra oggetti nel tempo, modellando il comportamento dinamico.",
				difficulty: Difficulty.MEDIUM,
				sectionId: umlSection.id,
			},
			{
				content: "In UML, la composizione è un tipo di associazione forte.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					'La composizione rappresenta una relazione "parte-di" forte dove le parti non possono esistere senza il tutto.',
				difficulty: Difficulty.EASY,
				sectionId: umlSection.id,
			},
		],
	});

	// Domande Design Patterns
	await prisma.question.createMany({
		data: [
			{
				content: "Quale pattern garantisce che una classe abbia una sola istanza?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["Factory", "Observer", "Singleton", "Strategy"],
				correctAnswer: ["Singleton"],
				explanation:
					"Il pattern Singleton garantisce che una classe abbia una sola istanza e fornisce un punto di accesso globale.",
				difficulty: Difficulty.EASY,
				sectionId: designPatternsSection.id,
			},
			{
				content:
					"Il pattern Observer implementa una relazione uno-a-molti tra oggetti.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					"L'Observer pattern definisce una relazione uno-a-molti: quando un oggetto cambia stato, tutti i suoi dipendenti vengono notificati.",
				difficulty: Difficulty.MEDIUM,
				sectionId: designPatternsSection.id,
			},
		],
	});

	// Domande SQL
	await prisma.question.createMany({
		data: [
			{
				content:
					"Quale comando SQL viene utilizzato per recuperare dati da una tabella?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
				correctAnswer: ["SELECT"],
				explanation:
					"Il comando SELECT è utilizzato per interrogare e recuperare dati da una o più tabelle.",
				difficulty: Difficulty.EASY,
				sectionId: sqlSection.id,
			},
			{
				content: "La clausola WHERE in SQL serve per filtrare i record.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					"La clausola WHERE specifica le condizioni che i record devono soddisfare per essere inclusi nel risultato.",
				difficulty: Difficulty.EASY,
				sectionId: sqlSection.id,
			},
			{
				content: "Scrivi la sintassi base di una query SELECT in SQL.",
				questionType: QuestionType.SHORT_ANSWER,
				correctAnswer: [
					"SELECT colonne FROM tabella",
					"SELECT * FROM tabella",
					"SELECT campo FROM tabella",
				],
				explanation:
					"La sintassi base è: SELECT colonne FROM nome_tabella [WHERE condizioni]",
				difficulty: Difficulty.MEDIUM,
				sectionId: sqlSection.id,
			},
		],
	});

	// Domande Normalizzazione
	await prisma.question.createMany({
		data: [
			{
				content: "Quale forma normale elimina le dipendenze parziali?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["1NF", "2NF", "3NF", "BCNF"],
				correctAnswer: ["2NF"],
				explanation:
					"La seconda forma normale (2NF) elimina le dipendenze parziali dalla chiave primaria.",
				difficulty: Difficulty.MEDIUM,
				sectionId: normalizationSection.id,
			},
			{
				content: "Una tabella in 3NF è automaticamente anche in 2NF.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					"Le forme normali sono progressive: per essere in 3NF, una tabella deve essere anche in 2NF e 1NF.",
				difficulty: Difficulty.MEDIUM,
				sectionId: normalizationSection.id,
			},
		],
	});

	// Domande Algebra
	await prisma.question.createMany({
		data: [
			{
				content:
					"Qual è il risultato del prodotto scalare di due vettori perpendicolari?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["1", "0", "-1", "Infinito"],
				correctAnswer: ["0"],
				explanation: "Il prodotto scalare di due vettori perpendicolari è sempre zero.",
				difficulty: Difficulty.MEDIUM,
				sectionId: vectorsSection.id,
			},
			{
				content: "Un vettore può essere rappresentato come una matrice colonna.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					"Un vettore può essere rappresentato come una matrice colonna con n righe e 1 colonna.",
				difficulty: Difficulty.EASY,
				sectionId: vectorsSection.id,
			},
		],
	});

	// Domande Matrici
	await prisma.question.createMany({
		data: [
			{
				content: "Il determinante di una matrice 2x2 con elementi a, b, c, d è:",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["a*d + b*c", "a*d - b*c", "a*c - b*d", "a*b - c*d"],
				correctAnswer: ["a*d - b*c"],
				explanation: "Il determinante di una matrice 2x2 è calcolato come ad - bc.",
				difficulty: Difficulty.MEDIUM,
				sectionId: matricesSection.id,
			},
		],
	});

	// Domande Economia
	await prisma.question.createMany({
		data: [
			{
				content: "Cosa rappresenta il ROI in economia aziendale?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: [
					"Return on Investment",
					"Rate of Interest",
					"Risk of Investment",
					"Revenue on Income",
				],
				correctAnswer: ["Return on Investment"],
				explanation:
					"ROI sta per Return on Investment, ovvero il ritorno sull'investimento.",
				difficulty: Difficulty.EASY,
				sectionId: businessFundamentalsSection.id,
			},
			{
				content: "Il bilancio di un'azienda deve sempre essere in pareggio.",
				questionType: QuestionType.TRUE_FALSE,
				correctAnswer: ["true"],
				explanation:
					"Il bilancio deve sempre rispettare l'equazione fondamentale: Attivo = Passivo + Patrimonio Netto.",
				difficulty: Difficulty.MEDIUM,
				sectionId: businessFundamentalsSection.id,
			},
		],
	});

	// Domande Marketing
	await prisma.question.createMany({
		data: [
			{
				content: "Quale delle seguenti non è una delle 4P del marketing mix?",
				questionType: QuestionType.MULTIPLE_CHOICE,
				options: ["Product", "Price", "Place", "People"],
				correctAnswer: ["People"],
				explanation:
					"Le 4P del marketing mix sono: Product, Price, Place, Promotion. People non è tra queste.",
				difficulty: Difficulty.MEDIUM,
				sectionId: marketingSection.id,
			},
		],
	});

	// Ottieni le domande create per creare quiz
	const allQuestions = await prisma.question.findMany();
	const programmingQuestions = allQuestions.filter(
		q => q.sectionId === programmingBasicsSection.id
	);
	const umlQuestionsList = allQuestions.filter(q => q.sectionId === umlSection.id);
	const sqlQuestionsList = allQuestions.filter(q => q.sectionId === sqlSection.id);
	const algebraQuestionsList = allQuestions.filter(
		q => q.sectionId === vectorsSection.id
	);
	const businessQuestionsList = allQuestions.filter(
		q => q.sectionId === businessFundamentalsSection.id
	);

	// Creazione quiz
	console.log("📝 Creando quiz...");

	const programmingQuiz = await prisma.quiz.create({
		data: {
			timeLimit: 30,
			sectionId: programmingBasicsSection.id,
			evaluationModeId: standardMode.id,
			quizMode: QuizMode.STUDY,
		},
	});

	const umlQuiz = await prisma.quiz.create({
		data: {
			timeLimit: 25,
			sectionId: umlSection.id,
			evaluationModeId: standardMode.id,
			quizMode: QuizMode.STUDY,
		},
	});

	const sqlQuiz = await prisma.quiz.create({
		data: {
			timeLimit: 45,
			sectionId: sqlSection.id,
			evaluationModeId: penaltyMode.id,
			quizMode: QuizMode.EXAM_SIMULATION,
		},
	});

	const algebraQuiz = await prisma.quiz.create({
		data: {
			timeLimit: 40,
			sectionId: vectorsSection.id,
			evaluationModeId: partialCreditMode.id,
			quizMode: QuizMode.STUDY,
		},
	});

	const businessQuiz = await prisma.quiz.create({
		data: {
			timeLimit: 35,
			sectionId: businessFundamentalsSection.id,
			evaluationModeId: standardMode.id,
			quizMode: QuizMode.EXAM_SIMULATION,
		},
	});

	// Associazione domande ai quiz
	for (let i = 0; i < programmingQuestions.length; i++) {
		await prisma.quizQuestion.create({
			data: {
				quizId: programmingQuiz.id,
				questionId: programmingQuestions[i].id,
				order: i + 1,
			},
		});
	}

	for (let i = 0; i < umlQuestionsList.length; i++) {
		await prisma.quizQuestion.create({
			data: {
				quizId: umlQuiz.id,
				questionId: umlQuestionsList[i].id,
				order: i + 1,
			},
		});
	}

	for (let i = 0; i < sqlQuestionsList.length; i++) {
		await prisma.quizQuestion.create({
			data: {
				quizId: sqlQuiz.id,
				questionId: sqlQuestionsList[i].id,
				order: i + 1,
			},
		});
	}

	for (let i = 0; i < algebraQuestionsList.length; i++) {
		await prisma.quizQuestion.create({
			data: {
				quizId: algebraQuiz.id,
				questionId: algebraQuestionsList[i].id,
				order: i + 1,
			},
		});
	}

	for (let i = 0; i < businessQuestionsList.length; i++) {
		await prisma.quizQuestion.create({
			data: {
				quizId: businessQuiz.id,
				questionId: businessQuestionsList[i].id,
				order: i + 1,
			},
		});
	}

	// Creazione tentativi di quiz e risposte
	console.log("🎯 Creando tentativi di quiz...");

	const quizAttempt1 = await prisma.quizAttempt.create({
		data: {
			userId: student1.id,
			quizId: programmingQuiz.id,
			score: 85.5,
			timeSpent: 1200, // 20 minuti
		},
	});

	const quizAttempt2 = await prisma.quizAttempt.create({
		data: {
			userId: student1.id,
			quizId: umlQuiz.id,
			score: 78.0,
			timeSpent: 1500, // 25 minuti
		},
	});

	const quizAttempt3 = await prisma.quizAttempt.create({
		data: {
			userId: student2.id,
			quizId: businessQuiz.id,
			score: 92.0,
			timeSpent: 1800, // 30 minuti
		},
	});

	const quizAttempt4 = await prisma.quizAttempt.create({
		data: {
			userId: student2.id,
			quizId: algebraQuiz.id,
			score: 88.5,
			timeSpent: 2100, // 35 minuti
		},
	});

	// Risposte per i tentativi
	if (programmingQuestions.length > 0) {
		await prisma.answerAttempt.create({
			data: {
				quizAttemptId: quizAttempt1.id,
				questionId: programmingQuestions[0].id,
				userAnswer: ["int"],
				score: 1.0,
			},
		});
	}

	if (umlQuestionsList.length > 0) {
		await prisma.answerAttempt.create({
			data: {
				quizAttemptId: quizAttempt2.id,
				questionId: umlQuestionsList[0].id,
				userAnswer: ["Diagramma di sequenza"],
				score: 1.0,
			},
		});
	}

	if (businessQuestionsList.length > 0) {
		await prisma.answerAttempt.create({
			data: {
				quizAttemptId: quizAttempt3.id,
				questionId: businessQuestionsList[0].id,
				userAnswer: ["Return on Investment"],
				score: 1.0,
			},
		});
	}

	if (algebraQuestionsList.length > 0) {
		await prisma.answerAttempt.create({
			data: {
				quizAttemptId: quizAttempt4.id,
				questionId: algebraQuestionsList[0].id,
				userAnswer: ["0"],
				score: 1.0,
			},
		});
	}

	// Creazione bookmark
	if (programmingQuestions.length > 0) {
		await prisma.bookmark.create({
			data: {
				userId: student1.id,
				questionId: programmingQuestions[0].id,
			},
		});
	}

	if (businessQuestionsList.length > 0) {
		await prisma.bookmark.create({
			data: {
				userId: student2.id,
				questionId: businessQuestionsList[0].id,
			},
		});
	}

	// Creazione progresso
	console.log("📈 Creando dati di progresso...");

	await prisma.progress.createMany({
		data: [
			{
				userId: student1.id,
				sectionId: programmingBasicsSection.id,
				totalQuestionsStudied: 8,
				studyQuizzesTaken: 3,
				studyAverageScore: 85.5,
				studyBestScore: 92.0,
				studyTotalTimeSpent: 3600,
				examQuizzesTaken: 0,
				improvementRate: 18.5,
				consistencyScore: 82.3,
			},
			{
				userId: student1.id,
				sectionId: umlSection.id,
				totalQuestionsStudied: 5,
				studyQuizzesTaken: 2,
				studyAverageScore: 78.0,
				studyBestScore: 85.0,
				studyTotalTimeSpent: 2400,
				examQuizzesTaken: 1,
				examAverageScore: 75.0,
				examBestScore: 75.0,
				examTotalTimeSpent: 1500,
				improvementRate: 12.1,
				consistencyScore: 76.8,
			},
			{
				userId: student1.id,
				sectionId: sqlSection.id,
				totalQuestionsStudied: 6,
				studyQuizzesTaken: 1,
				studyAverageScore: 80.0,
				studyBestScore: 80.0,
				studyTotalTimeSpent: 1800,
				examQuizzesTaken: 2,
				examAverageScore: 82.5,
				examBestScore: 88.0,
				examTotalTimeSpent: 2700,
				improvementRate: 15.3,
				consistencyScore: 79.4,
			},
			{
				userId: student2.id,
				sectionId: businessFundamentalsSection.id,
				totalQuestionsStudied: 7,
				studyQuizzesTaken: 2,
				studyAverageScore: 90.0,
				studyBestScore: 95.0,
				studyTotalTimeSpent: 2100,
				examQuizzesTaken: 1,
				examAverageScore: 92.0,
				examBestScore: 92.0,
				examTotalTimeSpent: 1800,
				improvementRate: 22.8,
				consistencyScore: 91.2,
			},
			{
				userId: student2.id,
				sectionId: vectorsSection.id,
				totalQuestionsStudied: 4,
				studyQuizzesTaken: 1,
				studyAverageScore: 88.5,
				studyBestScore: 88.5,
				studyTotalTimeSpent: 2100,
				examQuizzesTaken: 0,
				improvementRate: 16.7,
				consistencyScore: 87.1,
			},
		],
	});

	console.log("✅ Seeding completato con successo!");
	console.log("\n📊 Riepilogo dati creati:");
	console.log(`• ${await prisma.user.count()} utenti`);
	console.log(`• ${await prisma.department.count()} dipartimenti`);
	console.log(`• ${await prisma.course.count()} corsi`);
	console.log(`• ${await prisma.class.count()} classi`);
	console.log(`• ${await prisma.section.count()} sezioni`);
	console.log(`• ${await prisma.question.count()} domande`);
	console.log(`• ${await prisma.quiz.count()} quiz`);
	console.log(`• ${await prisma.quizAttempt.count()} tentativi di quiz`);
	console.log(`• ${await prisma.evaluationMode.count()} modalità di valutazione`);

	console.log("\n👥 Credenziali utenti di test:");
	console.log("• superadmin / password123 (SUPERADMIN)");
	console.log("• admin / password123 (ADMIN)");
	console.log("• maintainer / password123 (MAINTAINER)");
	console.log("• mario.rossi / password123 (STUDENT)");
	console.log("• giulia.bianchi / password123 (STUDENT)");
}

main()
	.catch(e => {
		console.error("❌ Errore durante il seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
