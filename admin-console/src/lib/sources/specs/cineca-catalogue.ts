const PERSONAL_DATA =
	"I campi con nomi di persona (`docenti`, `titolari`, `responsabili`, `ruoli_*`) arrivano nella risposta ma **non si importano mai**: l'art. 52 del CAD li esclude dagli open data.";

const SPA_FALLBACK =
	"Un percorso che non esiste risponde **200 con l'HTML dell'applicazione**: un 200 non dimostra che l'endpoint esista, va guardato il corpo.";

const label = {
	type: "object",
	properties: { label: { type: "string" }, value: { type: "string" } },
};

export const cinecaCatalogue = {
	openapi: "3.1.0",
	info: {
		title: "Catalogo CINECA",
		version: "v1",
		description: [
			"L'API pubblica del Course Catalogue di UniMore: corsi, piani di studio per coorte e schede insegnamento. Nessuna autenticazione e nessuna chiave.",
			"",
			"**Da dove la usiamo:** `pnpm catalog:sync` (corsi, piani, attributi degli insegnamenti) e `pnpm catalog:syllabi` (schede insegnamento), in `scripts/catalog/source.ts`.",
			"",
			SPA_FALLBACK,
			"",
			PERSONAL_DATA,
		].join("\n"),
	},
	servers: [{ url: "https://unimore.coursecatalogue.cineca.it/api/v1" }],
	tags: [
		{
			name: "Anagrafiche",
			description: "Le liste di riferimento: anni dell'offerta e dipartimenti.",
		},
		{
			name: "Corsi e piani",
			description: "I corsi di un anno e il piano di studi di ciascuno, per coorte.",
		},
		{
			name: "Insegnamenti",
			description: "Gli attributi degli insegnamenti e le loro schede.",
		},
	],
	paths: {
		"/anni-offerta": {
			get: {
				tags: ["Anagrafiche"],
				summary: "Anni dell'offerta",
				description:
					"Gli anni accademici per cui esiste un'offerta. Arrivano anche gli anni pianificati (fino al 2031): si importano solo le coorti fino all'anno corrente.",
				responses: {
					"200": {
						description: "Un oggetto indicizzato da `0`, `1`, …, non un array.",
						content: {
							"application/json": {
								schema: { type: "object", additionalProperties: label },
								example: {
									"0": { label: "2025/2026", value: "2025" },
									"1": { label: "2026/2027", value: "2026" },
								},
							},
						},
					},
				},
			},
		},
		"/ricercaDipartimenti": {
			get: {
				tags: ["Anagrafiche"],
				summary: "Dipartimenti",
				description:
					"Codice e nome di ogni dipartimento. Da qui vengono i nomi di `catalog.departments`.",
				responses: {
					"200": {
						description: "La lista dei dipartimenti.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										type: "object",
										properties: {
											dip_cod: { type: "string" },
											dip_des_it: { type: "string" },
											dip_des_en: { type: "string" },
										},
									},
								},
								example: [
									{
										dip_cod: "101",
										dip_des_it: "Dipartimento di Scienze e Metodi dell'Ingegneria",
										dip_des_en: "Department of Sciences and Methods for Engineering",
									},
								],
							},
						},
					},
				},
			},
		},
		"/corsi": {
			get: {
				tags: ["Corsi e piani"],
				summary: "Corsi di un anno",
				description: [
					"Tutti i corsi di studio offerti in un anno, raggruppati per area: `[area] → subgroups → cds → cdsSub[]`. Ogni `cdsSub` è un corso.",
					"",
					"**Campi che importiamo:** `cod` (l'id interno, che serve al piano), `cdsCod`, `codicione`, `des_it`, `crediti`, `tipo_corso_cod`, `classe_cod`, `lingua_cod`, `tipoAccesso` (`P` programmato, `L` libero), `dip_cod`.",
					"",
					"**Attenzione:** `cdsCod` cambia fra un anno e l'altro (nel 2024 `1-210`, nel 2025 `1-310`). Il codice stabile è `codicione`, ed è quello che usiamo per riconoscere un corso fra anni.",
					"",
					"Circa 10 MB per anno.",
				].join("\n"),
				parameters: [
					{
						name: "anno",
						in: "query",
						required: true,
						schema: { type: "string", example: "2026" },
						description: "L'anno accademico, per esempio `2026` per il 2026/27.",
					},
				],
				responses: {
					"200": {
						description: "Le aree, con dentro i corsi.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										type: "object",
										properties: {
											cod: { type: "string", description: "Codice dell'area." },
											des_it: { type: "string" },
											subgroups: {
												type: "array",
												items: {
													type: "object",
													properties: {
														cds: {
															type: "array",
															items: {
																type: "object",
																properties: {
																	cdsSub: {
																		type: "array",
																		items: { $ref: "#/components/schemas/Corso" },
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/corso/{anno}/{cod}": {
			get: {
				tags: ["Corsi e piani"],
				summary: "Piano di studi di un corso",
				description: [
					"Il corso con il suo piano per la coorte `anno`: `percorsi[] → anni[] → insegnamenti[] → attivita[]`. Una chiamata per corso per anno.",
					"",
					"Il path usa **segmenti**: `corso/2025/10968` funziona, `corso?anno=…` no.",
					"",
					"- `percorsi[]` sono i curriculum; `comune: true` è il tronco comune.",
					"- `insegnamenti[]` sono i **gruppi**: `cod = OO` sono gli obbligatori, gli altri codici sono gruppi a scelta. L'obbligatorietà non si ricava dal TAF.",
					"- `attivita[]` sono gli insegnamenti. Per la scheda servono `cod`, `ordinamento_aa`, `corso_percorso_id` e `corso_cod`, più l'`annoOfferta` dell'anno.",
				].join("\n"),
				parameters: [
					{
						name: "anno",
						in: "path",
						required: true,
						schema: { type: "string", example: "2025" },
						description: "La coorte.",
					},
					{
						name: "cod",
						in: "path",
						required: true,
						schema: { type: "string", example: "10968" },
						description: "L'id interno del corso (`cod` di `/corsi`), non il `cdsCod`.",
					},
				],
				responses: {
					"200": {
						description: "Un array con un solo corso.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										allOf: [
											{ $ref: "#/components/schemas/Corso" },
											{
												type: "object",
												properties: {
													percorsi: {
														type: "array",
														items: { $ref: "#/components/schemas/Percorso" },
													},
												},
											},
										],
									},
								},
							},
						},
					},
				},
			},
		},
		"/ricercaInsegnamenti": {
			post: {
				tags: ["Insegnamenti"],
				summary: "Attributi di tutti gli insegnamenti",
				description: [
					"Tutte le attività di **tutti gli anni** in una chiamata: il server ignora l'anno nel corpo. È l'unica fonte di `valutazione_it` (Voto o Giudizio finale, che marca le idoneità) e di `ssd`.",
					"",
					"**Non è il piano di studi:** porta solo le attività offerte in quell'anno. La composizione dei corsi si legge da `corso/{anno}/{cod}`.",
					"",
					"Si importano solo le righe con `isMod: false`: i moduli dei corsi integrati condividono l'`adCod` del padre.",
					"",
					"⚠️ **Circa 190 MB.** Il proxy della console si ferma a 25 MB, quindi da qui risponde 413: questa si prova da terminale.",
				].join("\n"),
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { type: "object", properties: { anno: { type: "string" } } },
							example: { anno: "2025" },
						},
					},
				},
				responses: {
					"200": {
						description: "Una riga per attività e anno.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										type: "object",
										properties: {
											aa: { type: "string", example: "2025" },
											cdsCod: { type: "string", example: "20-373" },
											adCod: { type: "string", example: "AIE-002R" },
											isMod: { type: "boolean", example: false },
											valutazione_it: {
												type: "string",
												examples: ["Voto Finale", "Giudizio Finale"],
											},
											ssd: { type: "string", example: "ING-INF/05" },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/insegnamento-offerta/{annoOfferta}/{cod}/{ordinamento}/{percorso}/{corso}": {
			get: {
				tags: ["Insegnamenti"],
				summary: "Scheda di un insegnamento",
				description: [
					"La scheda ufficiale di un'attività in un'offerta. I testi stanno in `testiTotali[]`: il blocco con `chiave_udCod` nullo è l'intero insegnamento, gli altri sono le unità didattiche.",
					"",
					"**Campi che importiamo** in `catalog.class_syllabi`: `obiettivi_formativi_it`, `contenuti_it`, `prerequisiti_it`, `verifica_apprendimento_it`, `testi_it`, `metodi_didattici_est_it`, `altro_it`.",
					"",
					"- `percorso` è il `corso_percorso_id` dell'attività, **non** l'`af_percorso_id` (con `9999` risponde 404).",
					"- Le schede dell'anno corrente sono spesso vuote: lo script ripiega sulle offerte precedenti.",
					"- Un'offerta che non esiste risponde **404 in testo semplice** (`Not Found`), non JSON.",
				].join("\n"),
				parameters: [
					{
						name: "annoOfferta",
						in: "path",
						required: true,
						schema: { type: "string", example: "2025" },
						description: "L'`annoOfferta` dell'anno del piano.",
					},
					{
						name: "cod",
						in: "path",
						required: true,
						schema: { type: "string", example: "29124" },
						description: "Il `cod` dell'attività nel piano.",
					},
					{
						name: "ordinamento",
						in: "path",
						required: true,
						schema: { type: "string", example: "2025" },
						description: "L'`ordinamento_aa` dell'attività.",
					},
					{
						name: "percorso",
						in: "path",
						required: true,
						schema: { type: "string", example: "10000" },
						description: "Il `corso_percorso_id` dell'attività.",
					},
					{
						name: "corso",
						in: "path",
						required: true,
						schema: { type: "string", example: "10968" },
						description: "Il `corso_cod`: l'id interno del corso.",
					},
				],
				responses: {
					"200": {
						description: "L'attività con i suoi testi.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										des_it: {
											type: "string",
											example: "Machine Learning and Deep Learning",
										},
										adCod: { type: "string", example: "AIE-002R" },
										cdsCod: { type: "string", example: "20-373" },
										crediti: { type: "number", example: 9 },
										ssd: { type: "string", example: "ING-INF/05" },
										valutazione_it: { type: "string", example: "Voto Finale" },
										testiTotali: {
											type: "array",
											items: { $ref: "#/components/schemas/TestoScheda" },
										},
									},
								},
							},
						},
					},
					"404": {
						description: "Nessuna scheda per questa offerta.",
						content: { "text/plain": { example: "Not Found" } },
					},
				},
			},
		},
	},
	components: {
		schemas: {
			Corso: {
				type: "object",
				description:
					"Un corso di studio. Ha molti altri campi, descrittivi e in inglese.",
				properties: {
					cod: {
						type: "string",
						description: "Id interno: indirizza il piano.",
						example: "10968",
					},
					cdsCod: {
						type: "string",
						description:
							"Codice del corso; cambia fra anni. È il nostro `courses.code`.",
						example: "20-373",
					},
					codicione: {
						type: "string",
						description: "Id nazionale, stabile fra anni.",
						example: "0360107303300002",
					},
					des_it: { type: "string", example: "ARTIFICIAL INTELLIGENCE ENGINEERING" },
					aa: { type: "string", example: "2025" },
					crediti: { type: ["number", "null"], example: 120 },
					tipo_corso_cod: {
						type: "string",
						examples: ["L2", "LM", "LM5"],
						example: "LM",
					},
					classe_cod: { type: "string", examples: ["LM-32"], example: "LM-32" },
					lingua_cod: { type: "string", examples: ["ita", "eng"], example: "eng" },
					tipoAccesso: { type: "string", enum: ["P", "L"], example: "L" },
					dip_cod: { type: "string", example: "120" },
					sede_des_it: { type: "string", example: "Modena" },
				},
			},
			Percorso: {
				type: "object",
				description: "Un curriculum della coorte.",
				properties: {
					pdsId: { type: "string", example: "10000" },
					pdsCod: { type: "string", example: "20-373-1" },
					comune: { type: "boolean", description: "Il tronco comune.", example: false },
					des_it: {
						type: "string",
						example: "Piano Automaticamente Approvato - LM AIE curr Applications",
					},
					anni: {
						type: "array",
						items: {
							type: "object",
							properties: {
								anno: { type: "integer" },
								annoOfferta: { type: "integer" },
								insegnamenti: {
									type: "array",
									description: "I gruppi del piano.",
									items: {
										type: "object",
										properties: {
											cod: { type: "string", description: "`OO` per gli obbligatori." },
											label_it: { type: "string" },
											ordine: { type: "integer" },
											attivita: {
												type: "array",
												items: { $ref: "#/components/schemas/Attivita" },
											},
										},
									},
								},
							},
						},
					},
				},
			},
			Attivita: {
				type: "object",
				description: "Un insegnamento del piano.",
				properties: {
					cod: { type: "string", example: "29124" },
					adCod: {
						type: "string",
						description:
							"Il codice dell'insegnamento; quello che colleghiamo ai nostri.",
						example: "AIE-002R",
					},
					des_it: { type: "string", example: "MACHINE LEARNING AND DEEP LEARNING" },
					crediti: { type: "number", example: 9 },
					ordinamento_aa: { type: "integer", example: 2025 },
					corso_cod: { type: "string", example: "10968" },
					corso_percorso_id: { type: "integer", example: 10000 },
					af_percorso_id: { type: "string", example: "10000" },
					tafDes_it: {
						type: "string",
						examples: ["Base", "Caratterizzante"],
						example: "Caratterizzante",
					},
					periodo_didattico_it: { type: "string", example: "Primo Ciclo Semestrale" },
				},
			},
			TestoScheda: {
				type: "object",
				properties: {
					chiave_udCod: {
						type: ["string", "null"],
						description: "Nullo per l'intero insegnamento.",
						example: null,
					},
					obiettivi_formativi_it: {
						type: "string",
						example:
							"L'obiettivo del corso è fornire una conoscenza approfondita delle principali tecniche…",
					},
					contenuti_it: {
						type: "string",
						example: "DEEP LEARNING\nMachine Learning recap…",
					},
					prerequisiti_it: {
						type: "string",
						example: "Conoscenza di base di statistica e algebra lineare…",
					},
					verifica_apprendimento_it: {
						type: "string",
						example: "Esame orale con domande sulle tecniche…",
					},
					testi_it: {
						type: "string",
						example: "The course will use the following textbooks…",
					},
					metodi_didattici_est_it: {
						type: "string",
						example: "Utilizzo di dispense a cura del docente…",
					},
					altro_it: { type: "string", example: "Conoscenza e Comprensione…" },
				},
			},
		},
	},
};
