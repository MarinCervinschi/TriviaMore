const formBody = (properties: Record<string, unknown>, required: string[]) => ({
	required: true,
	content: {
		"application/x-www-form-urlencoded": {
			schema: { type: "object", properties, required },
		},
	},
});

export const easyAcademy = {
	openapi: "3.1.0",
	info: {
		title: "EasyAcademy",
		version: "portale studenti",
		description: [
			"Il portale orari di UniMore (EasyStaff): lezioni con EasyCourse, appelli con EasyTest. Risponde senza login.",
			"",
			"**Stato:** spike, non importiamo ancora niente. Orari in [#191](https://github.com/MarinCervinschi/TriviaMore/issues/191), appelli in [#192](https://github.com/MarinCervinschi/TriviaMore/issues/192).",
			"",
			"Non è un'API pensata per terzi: sono le chiamate che fa la pagina del portale. `combo.php` dichiara `application/json` ma restituisce **JavaScript** (`var elenco_corsi = [...]`), da cui si estrae l'array.",
			"",
			"Ogni evento ha `docente` e `codice_docente`: **non si importano**.",
		].join("\n"),
	},
	servers: [{ url: "https://www.aule.unimore.it/PortaleStudentiUnimore" }],
	tags: [
		{ name: "Orari", description: "Le lezioni di un corso, per anno e curriculum." },
		{ name: "Appelli", description: "Le sessioni d'esame di EasyTest." },
	],
	paths: {
		"/combo.php": {
			get: {
				tags: ["Orari", "Appelli"],
				summary: "Elenco dei corsi",
				description: [
					"I corsi con i loro anni e curriculum, per costruire la chiamata della griglia.",
					"",
					"- `sw=ec_` (lezioni) → `var elenco_corsi`: per corso `valore` (quasi sempre il `cdsCod`), `elenco_anni[]` con `valore` nella forma `pdsCod|anno` (per esempio `PDS0-2026|1`), `pub_type` (`cal`, `both`, `std`), `periodi`. 119 corsi nel 2026.",
					"- `sw=et_` (esami) → `var et_elenco_cdl`: per anno, i corsi con le sessioni e le loro date.",
				].join("\n"),
				parameters: [
					{
						name: "sw",
						in: "query",
						required: true,
						schema: { type: "string", enum: ["ec_", "et_"], default: "ec_" },
						description: "`ec_` per le lezioni, `et_` per gli esami.",
					},
					{
						name: "aa",
						in: "query",
						required: true,
						schema: { type: "string", example: "2026" },
						description: "L'anno accademico.",
					},
					{
						name: "page",
						in: "query",
						required: true,
						schema: { type: "string", enum: ["corsi"], default: "corsi" },
					},
				],
				responses: {
					"200": {
						description: "Uno script con gli elenchi assegnati a variabili.",
						content: {
							"text/javascript": {
								example:
									'var elenco_corsi = [{"label":"Ingegneria meccatronica","valore":"1-361","elenco_anni":[{"label":"1 - Comune","valore":"PDS0-2026|1","elenco_insegnamenti":[{"label":"Controllo di Sistemi Meccatronici","valore":"ECIMM-0151-361-1","id":"136065","id_periodo":584}]}]}];',
							},
						},
					},
				},
			},
		},
		"/grid_call.php": {
			post: {
				tags: ["Orari"],
				summary: "Lezioni di un corso",
				description: [
					"La griglia delle lezioni di un corso e di un anno. Con `all_events=1` restituisce l'intero semestre: per Ingegneria meccatronica, primo anno, 94 eventi dal 14/09 al 18/12/2026, circa 470 KB.",
					"",
					"Ogni evento di `celle[]` ha `CodiceGenerale`, uguale all'`adCod` del piano, quindi si collega ai nostri insegnamenti. Poi `data`, `ora_inizio`, `ora_fine`, `aula`, `codice_aula`, `codice_sede`, `tipo` (`Lezione`, o `chiusura_type` per le sospensioni) e `Annullato`.",
				].join("\n"),
				requestBody: formBody(
					{
						view: { type: "string", default: "easycourse" },
						"form-type": { type: "string", default: "corso" },
						include: { type: "string", default: "corso" },
						anno: { type: "string", default: "2026" },
						corso: {
							type: "string",
							default: "1-361",
							description: "Il `valore` del corso in `combo.php`.",
						},
						"anno2[]": {
							type: "string",
							default: "PDS0-2026|1",
							description: "Curriculum e anno, `pdsCod|anno`.",
						},
						date: {
							type: "string",
							default: "07-10-2026",
							description: "Un giorno della settimana da mostrare, `gg-mm-aaaa`.",
						},
						_lang: { type: "string", default: "it" },
						all_events: {
							type: "string",
							default: "1",
							description: "`1` per l'intero semestre invece della sola settimana.",
						},
					},
					[
						"view",
						"form-type",
						"include",
						"anno",
						"corso",
						"anno2[]",
						"date",
						"all_events",
					]
				),
				responses: {
					"200": {
						description: "La griglia, con gli eventi in `celle`.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										first_day: { type: "string", example: "14-09-2026" },
										last_day: { type: "string", example: "18-12-2026" },
										anno_accademico: { type: "string", example: "2026/2027" },
										celle: {
											type: "array",
											items: { $ref: "#/components/schemas/Lezione" },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/test_call.php": {
			post: {
				tags: ["Appelli"],
				summary: "Appelli di un corso",
				description:
					"Gli appelli di un corso in EasyTest. **Nelle prove la lista `Insegnamenti` è sempre vuota**, anche per il 2025/26: la copertura è ancora da dimostrare (#192).",
				requestBody: formBody(
					{
						et_er: { type: "string", default: "1" },
						esami_cdl: { type: "string", default: "1-361" },
						aa: { type: "string", default: "2026" },
						_lang: { type: "string", default: "it" },
					},
					["esami_cdl", "aa"]
				),
				responses: {
					"200": {
						description: "Gli appelli, per insegnamento.",
						content: {
							"application/json": {
								example: {
									Type: "etTypeCdl",
									Insegnamenti: [],
									legenda: [],
									first_event_date: "",
									last_event_date: "",
								},
							},
						},
					},
				},
			},
		},
	},
	components: {
		schemas: {
			Lezione: {
				type: "object",
				description:
					"Un evento della griglia. Ha anche `docente` e `codice_docente`, che non si importano.",
				properties: {
					CodiceGenerale: {
						type: "string",
						description: "L'`adCod` dell'insegnamento.",
						example: "1-361-001",
					},
					nome_insegnamento: {
						type: "string",
						example: "Cinematica dei robot e modellazione dinamica vibrazionale",
					},
					data: { type: "string", example: "14-09-2026" },
					ora_inizio: { type: "string", example: "10:00" },
					ora_fine: { type: "string", example: "13:00" },
					aula: {
						type: "string",
						example: "Aula F1.5 [[RE 07] - Padiglione Buccola-Bisi]",
					},
					codice_aula: { type: "string", example: "RE-07-01-001" },
					codice_sede: { type: "string", example: "RE-07" },
					tipo: {
						type: "string",
						enum: ["Lezione", "chiusura_type"],
						example: "Lezione",
					},
					Annullato: { type: "string", enum: ["0", "1"], example: "0" },
					percorso_didattico: {
						type: "string",
						example: "Ingegneria meccatronica [1-361] LM - 1 - Smart Production",
					},
				},
			},
		},
	},
};
