import type { ClassSyllabus } from "@/lib/browse/types";

/** The syllabus of Deep Learning Principles and Architectures, as the catalogue published it for 2026/27. */
export const FULL_SYLLABUS: ClassSyllabus = {
	academicYear: 2026,
	catalogueUrl:
		"https://unimore.coursecatalogue.cineca.it/af/2026?corso=20-373&annoOrdinamento=2026&pds=20-373-1&coorte=2026&ad=20-373-002",
	objectives:
		"L'obiettivo del corso e' fornire una conoscenza approfondita delle principali tecniche di deep learning per l'analisi di dati di natura eterogenea. In particolare, verranno presentati e approfonditi i principali algoritmi di classificazione di dati, di sequenze temporali di informazioni e di pattern complessi quali ad esempio le immagini, dati strutturati, grafi e modelli generativi. Saranno inoltre presentate tecniche di apprendimento in contesti non standard come l’apprendimento online e distribuito. Verranno presentate le principali tecniche di apprendimento automatico sia di tipo supervisionato che non supervisionato. Verranno inoltre forniti i rudimenti dell’apprendimento con rinforzo.",
	contents:
		"DEEP LEARNING Principles Machine Learning recap: General structure of a learning system Logistic regression Neural Networks Introduction: -Gradient descent -Perceptron and MLE Advanced NN: -Convolutional network -RNN and sequential data processing -Temporal analysis: ARIMA, Exponential smoothing, Conv1D -Transformer architecture UNSUPERVISED DEEP LEARNING -Autoencoders -Generative NN VAE -Generative NN GAN -diffusion models -Autoregressive models ADVANCED DEEP LEARNING: - Deep learning on graph - Self supervised learning - Continual Learning - Federated distributed learning REINFORCEMENT LEARNING: -Function approximation and RL -Deep reinforcement Learning Most lessons are coupled with a laboratory lesson on the topic. Each module comprise approx 2 hrs frontal lesson and 2 hrs laboratory",
	prerequisites:
		"Conoscenza di base di statistica e algebra lineare Calcolo Conoscenza del linguaggio Python conoscenze dei fondamenti di machine learning",
	assessment:
		"Esame orale con domande sulle tecniche la teoria e la formalizzazione matematica dei classificatori. 3 Domande di cui una puramente teorica una con implicazioni matematiche una con implicazioni tecniche sulla scelta le proprietà e le capacità di un classificatore",
	readings:
		"Machine Learning: [ISL]: An Introduction to Statistical Learning. James, Witten, Hastie and Tibshirani. [ESL]: The Elements of Statistical Learning, Second Edition. Hastie, Tibshirani and Friedman. Deep Learning: [DLB]: Deep Learning. Ian Goodfellow and Yoshua Bengio and Aaron Courville. Suggested further readings: [RL]: Reinforcement Learning Sutton, Barto. [PRML]:Pattern Recognition and Machine Learning. Bishop Christopher. Readings are intended to be completed after classes.",
	teachingMethods:
		"Utilizzo di dispense a cura del docente. Si prevede un ciclo di lezioni frontali e l'implementazione in laboratorio di tutte le tecniche presentate in linguaggio Python e utilizzando Pytorch.",
	outcomes:
		"Conoscenza e Comprensione: Conoscere e comprendere le principali tecniche di pattern recognition e machine learning per l'analisi di dati di natura eterogenea. Capacità di applicare conoscenza e comprensione: Sapere applicare i principali algoritmi di classificazione di dati, di sequenze temporali di informazioni e di pattern complessi quali ad esempio le immagini e sapere applicare le principali tecniche di apprendimento automatico sia di tipo supervisionato che non supervisionato. Autonomia di Giudizio autonomia di giudizio nell'analizzare e progettare sistemi complessi, valutando l'impatto delle soluzioni informatiche nel contesto applicativo, sia relativamente agli aspetti tecnici che agli aspetti organizzativi e dimostrando di partecipare attivamente al processo decisionale in contesti anche interdisciplinari. Abilità comunicative: descrivere a interlocutori eterogenei in modo chiaro e comprensibile informazioni, idee, problemi e soluzioni oltre che aspetti tecnici; Capacità di apprendimento: -capacità di riconoscere la necessità di apprendimento autonomo durante tutto l'arco della vita, dato l'elevato tasso di innovazione tecnologica e metodologica nell'area dell'Ingegneria Informatica; - capacità di acquisire in modo autonomo nuove conoscenze specialistiche dalla letteratura",
};

export const PARTIAL_SYLLABUS: ClassSyllabus = {
	...FULL_SYLLABUS,
	prerequisites: null,
	assessment: null,
	teachingMethods: null,
	outcomes: null,
};
