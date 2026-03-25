/**
 * Seed script — populates local Supabase with sample public data.
 *
 * Run with:
 *   infisical run -- pnpm tsx supabase/scripts/seed.ts
 *
 * Safe to run multiple times: uses upsert (ON CONFLICT DO NOTHING style)
 * by deleting + reinserting to keep data fresh.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY.\nRun with: infisical run -- pnpm tsx supabase/scripts/seed.ts",
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── IDs (stable CUIDs so re-runs are idempotent) ────────────────────

const ids = {
  // Departments
  dief: "clseed_dept_dief",
  dsv: "clseed_dept_dsv",
  dem: "clseed_dept_dem",

  // Courses
  ingInf: "clseed_course_ing_inf",
  ingMecc: "clseed_course_ing_mecc",
  ingInfMag: "clseed_course_ing_inf_mag",
  sciBio: "clseed_course_sci_bio",
  ecoComm: "clseed_course_eco_comm",

  // Classes
  prog1: "clseed_class_prog1",
  analisi1: "clseed_class_analisi1",
  basi_dati: "clseed_class_basi_dati",
  sistemi_op: "clseed_class_sistemi_op",
  meccanica: "clseed_class_meccanica",
  ml: "clseed_class_ml",
  bioCellulare: "clseed_class_bio_cellulare",
  microEco: "clseed_class_micro_eco",

  // Sections
  prog1_java: "clseed_sec_prog1_java",
  prog1_oop: "clseed_sec_prog1_oop",
  prog1_strutture: "clseed_sec_prog1_strutture",
  analisi1_limiti: "clseed_sec_analisi1_limiti",
  analisi1_derivate: "clseed_sec_analisi1_derivate",
  basi_dati_sql: "clseed_sec_basi_dati_sql",
  basi_dati_er: "clseed_sec_basi_dati_er",
  sistemi_processi: "clseed_sec_sistemi_processi",
  ml_supervisioned: "clseed_sec_ml_supervisioned",
  meccanica_statica: "clseed_sec_meccanica_statica",
  bio_membrana: "clseed_sec_bio_membrana",
  micro_domanda: "clseed_sec_micro_domanda",

  // Evaluation modes
  evalStandard: "clseed_eval_standard",
  evalStrict: "clseed_eval_strict",
} as const

// ── Data ─────────────────────────────────────────────────────────────

const departments = [
  {
    id: ids.dief,
    name: "Dipartimento di Ingegneria Enzo Ferrari",
    code: "DIEF",
    description:
      "Ingegneria informatica, meccanica, elettronica e dei veicoli",
    position: 0,
  },
  {
    id: ids.dsv,
    name: "Dipartimento di Scienze della Vita",
    code: "DSV",
    description: "Biologia, biotecnologie e scienze naturali",
    position: 1,
  },
  {
    id: ids.dem,
    name: "Dipartimento di Economia Marco Biagi",
    code: "DEM",
    description: "Economia, management e comunicazione d'impresa",
    position: 2,
  },
]

const courses = [
  {
    id: ids.ingInf,
    name: "Ingegneria Informatica",
    code: "INF",
    description: "Corso di laurea triennale in Ingegneria Informatica",
    department_id: ids.dief,
    course_type: "BACHELOR" as const,
    position: 0,
  },
  {
    id: ids.ingMecc,
    name: "Ingegneria Meccanica",
    code: "MECC",
    description: "Corso di laurea triennale in Ingegneria Meccanica",
    department_id: ids.dief,
    course_type: "BACHELOR" as const,
    position: 1,
  },
  {
    id: ids.ingInfMag,
    name: "Ingegneria Informatica Magistrale",
    code: "INF-MAG",
    description:
      "Corso di laurea magistrale in Ingegneria Informatica",
    department_id: ids.dief,
    course_type: "MASTER" as const,
    position: 2,
  },
  {
    id: ids.sciBio,
    name: "Scienze Biologiche",
    code: "BIO",
    description: "Corso di laurea triennale in Scienze Biologiche",
    department_id: ids.dsv,
    course_type: "BACHELOR" as const,
    position: 0,
  },
  {
    id: ids.ecoComm,
    name: "Economia e Commercio",
    code: "ECOMM",
    description: "Corso di laurea triennale in Economia e Commercio",
    department_id: ids.dem,
    course_type: "BACHELOR" as const,
    position: 0,
  },
]

const classes = [
  {
    id: ids.prog1,
    name: "Programmazione I",
    code: "PROG1",
    description:
      "Fondamenti di programmazione in Java: variabili, controllo di flusso, OOP",
    course_id: ids.ingInf,
    class_year: 1,
    position: 0,
  },
  {
    id: ids.analisi1,
    name: "Analisi Matematica I",
    code: "AM1",
    description: "Limiti, derivate, integrali, serie numeriche",
    course_id: ids.ingInf,
    class_year: 1,
    position: 1,
  },
  {
    id: ids.basi_dati,
    name: "Basi di Dati",
    code: "BDD",
    description:
      "Progettazione e interrogazione di database relazionali",
    course_id: ids.ingInf,
    class_year: 2,
    position: 0,
  },
  {
    id: ids.sistemi_op,
    name: "Sistemi Operativi",
    code: "SO",
    description: "Processi, thread, scheduling, memoria virtuale",
    course_id: ids.ingInf,
    class_year: 2,
    position: 1,
  },
  {
    id: ids.meccanica,
    name: "Meccanica Razionale",
    code: "MECRAZ",
    description: "Statica, cinematica e dinamica dei corpi rigidi",
    course_id: ids.ingMecc,
    class_year: 2,
    position: 0,
  },
  {
    id: ids.ml,
    name: "Machine Learning",
    code: "ML",
    description:
      "Apprendimento supervisionato, non supervisionato, reti neurali",
    course_id: ids.ingInfMag,
    class_year: 1,
    position: 0,
  },
  {
    id: ids.bioCellulare,
    name: "Biologia Cellulare",
    code: "BIOCELL",
    description: "Struttura e funzione della cellula eucariotica",
    course_id: ids.sciBio,
    class_year: 1,
    position: 0,
  },
  {
    id: ids.microEco,
    name: "Microeconomia",
    code: "MICRO",
    description: "Teoria del consumatore, produzione, mercati",
    course_id: ids.ecoComm,
    class_year: 1,
    position: 0,
  },
]

const sections = [
  // Programmazione I
  {
    id: ids.prog1_java,
    name: "Fondamenti Java",
    description: "Variabili, tipi primitivi, operatori, controllo di flusso",
    is_public: true,
    class_id: ids.prog1,
    position: 0,
  },
  {
    id: ids.prog1_oop,
    name: "Programmazione ad Oggetti",
    description: "Classi, ereditarietà, polimorfismo, interfacce",
    is_public: true,
    class_id: ids.prog1,
    position: 1,
  },
  {
    id: ids.prog1_strutture,
    name: "Strutture Dati",
    description: "Array, liste, stack, code, alberi",
    is_public: true,
    class_id: ids.prog1,
    position: 2,
  },
  // Analisi I
  {
    id: ids.analisi1_limiti,
    name: "Limiti e Continuita",
    description: "Definizione di limite, teoremi fondamentali, continuità",
    is_public: true,
    class_id: ids.analisi1,
    position: 0,
  },
  {
    id: ids.analisi1_derivate,
    name: "Derivate",
    description: "Regole di derivazione, teoremi di Rolle e Lagrange",
    is_public: true,
    class_id: ids.analisi1,
    position: 1,
  },
  // Basi di Dati
  {
    id: ids.basi_dati_sql,
    name: "SQL",
    description: "SELECT, JOIN, subquery, aggregazioni",
    is_public: true,
    class_id: ids.basi_dati,
    position: 0,
  },
  {
    id: ids.basi_dati_er,
    name: "Modello ER",
    description: "Entità, relazioni, cardinalità, traduzione in relazionale",
    is_public: true,
    class_id: ids.basi_dati,
    position: 1,
  },
  // Sistemi Operativi
  {
    id: ids.sistemi_processi,
    name: "Processi e Thread",
    description: "Creazione, scheduling, sincronizzazione, deadlock",
    is_public: true,
    class_id: ids.sistemi_op,
    position: 0,
  },
  // Machine Learning
  {
    id: ids.ml_supervisioned,
    name: "Apprendimento Supervisionato",
    description: "Regressione, classificazione, SVM, alberi decisionali",
    is_public: true,
    class_id: ids.ml,
    position: 0,
  },
  // Meccanica
  {
    id: ids.meccanica_statica,
    name: "Statica",
    description: "Equilibrio di corpi rigidi, vincoli, reazioni vincolari",
    is_public: true,
    class_id: ids.meccanica,
    position: 0,
  },
  // Biologia
  {
    id: ids.bio_membrana,
    name: "Membrana Cellulare",
    description: "Struttura, trasporto, segnalazione cellulare",
    is_public: true,
    class_id: ids.bioCellulare,
    position: 0,
  },
  // Microeconomia
  {
    id: ids.micro_domanda,
    name: "Teoria della Domanda",
    description: "Utilità, vincolo di bilancio, curve di indifferenza",
    is_public: true,
    class_id: ids.microEco,
    position: 0,
  },
]

// Sample questions for Programmazione I - Fondamenti Java
const questions = [
  {
    id: "clseed_q_java_01",
    content: "Quale parola chiave si usa per dichiarare una costante in Java?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      { id: "a", text: "const" },
      { id: "b", text: "final" },
      { id: "c", text: "static" },
      { id: "d", text: "immutable" },
    ],
    correct_answer: ["b"],
    explanation:
      "In Java, la parola chiave `final` viene usata per dichiarare costanti. `const` è riservata ma non utilizzata.",
    difficulty: "EASY" as const,
    section_id: ids.prog1_java,
  },
  {
    id: "clseed_q_java_02",
    content: "Qual è il valore di default di una variabile `int` in Java?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      { id: "a", text: "null" },
      { id: "b", text: "undefined" },
      { id: "c", text: "0" },
      { id: "d", text: "-1" },
    ],
    correct_answer: ["c"],
    explanation:
      "Le variabili int di istanza vengono inizializzate a 0 per default in Java.",
    difficulty: "EASY" as const,
    section_id: ids.prog1_java,
  },
  {
    id: "clseed_q_java_03",
    content:
      "Quale di queste affermazioni sul tipo `String` in Java è corretta?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      { id: "a", text: "String è un tipo primitivo" },
      { id: "b", text: "Le stringhe sono mutabili" },
      { id: "c", text: "String è una classe immutabile" },
      { id: "d", text: "Le stringhe non supportano il metodo equals()" },
    ],
    correct_answer: ["c"],
    explanation:
      "String in Java è una classe immutabile: una volta creata, non può essere modificata.",
    difficulty: "MEDIUM" as const,
    section_id: ids.prog1_java,
  },
  {
    id: "clseed_q_oop_01",
    content: "Cosa si intende per polimorfismo in Java?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      { id: "a", text: "La possibilità di creare più costruttori" },
      {
        id: "b",
        text: "La capacità di un oggetto di assumere più forme",
      },
      { id: "c", text: "L'ereditarietà multipla" },
      { id: "d", text: "L'incapsulamento dei dati" },
    ],
    correct_answer: ["b"],
    explanation:
      "Il polimorfismo permette a un oggetto di essere trattato come istanza della sua classe o di una superclasse/interfaccia.",
    difficulty: "MEDIUM" as const,
    section_id: ids.prog1_oop,
  },
  {
    id: "clseed_q_oop_02",
    content:
      "Qual è la differenza tra una classe astratta e un'interfaccia in Java?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      {
        id: "a",
        text: "Non c'è differenza",
      },
      {
        id: "b",
        text: "Una classe astratta può avere metodi implementati, un'interfaccia no (prima di Java 8)",
      },
      {
        id: "c",
        text: "Un'interfaccia può avere variabili di istanza",
      },
      {
        id: "d",
        text: "Una classe astratta supporta l'ereditarietà multipla",
      },
    ],
    correct_answer: ["b"],
    explanation:
      "Prima di Java 8, le interfacce potevano avere solo metodi astratti. Le classi astratte possono avere sia metodi astratti che implementati.",
    difficulty: "HARD" as const,
    section_id: ids.prog1_oop,
  },
  // Flashcard questions (SHORT_ANSWER)
  {
    id: "clseed_q_sql_01",
    content: "Spiega la differenza tra INNER JOIN e LEFT JOIN.",
    question_type: "SHORT_ANSWER" as const,
    options: null,
    correct_answer: [
      "INNER JOIN restituisce solo le righe con corrispondenza in entrambe le tabelle, LEFT JOIN restituisce tutte le righe della tabella sinistra anche senza corrispondenza.",
    ],
    explanation:
      "INNER JOIN: intersezione. LEFT JOIN: tutte le righe della tabella sinistra + corrispondenze dalla destra (NULL se assenti).",
    difficulty: "MEDIUM" as const,
    section_id: ids.basi_dati_sql,
  },
  {
    id: "clseed_q_sql_02",
    content: "A cosa serve la clausola GROUP BY in SQL?",
    question_type: "SHORT_ANSWER" as const,
    options: null,
    correct_answer: [
      "GROUP BY raggruppa le righe che hanno gli stessi valori in colonne specificate, permettendo di applicare funzioni di aggregazione come COUNT, SUM, AVG.",
    ],
    explanation:
      "GROUP BY viene usato con funzioni aggregate per raggruppare il risultato per una o più colonne.",
    difficulty: "EASY" as const,
    section_id: ids.basi_dati_sql,
  },
  // TRUE_FALSE
  {
    id: "clseed_q_limiti_01",
    content:
      "Vero o Falso: Il limite di una funzione in un punto esiste sempre se la funzione è definita in quel punto.",
    question_type: "TRUE_FALSE" as const,
    options: [
      { id: "true", text: "Vero" },
      { id: "false", text: "Falso" },
    ],
    correct_answer: ["false"],
    explanation:
      "Una funzione può essere definita in un punto senza che il limite esista (es. funzione con discontinuità di seconda specie).",
    difficulty: "MEDIUM" as const,
    section_id: ids.analisi1_limiti,
  },
  {
    id: "clseed_q_limiti_02",
    content: "Quale è il limite di sin(x)/x per x che tende a 0?",
    question_type: "MULTIPLE_CHOICE" as const,
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "1" },
      { id: "c", text: "∞" },
      { id: "d", text: "Non esiste" },
    ],
    correct_answer: ["b"],
    explanation:
      "È un limite notevole fondamentale: lim(x→0) sin(x)/x = 1.",
    difficulty: "EASY" as const,
    section_id: ids.analisi1_limiti,
  },
]

const evaluationModes = [
  {
    id: ids.evalStandard,
    name: "Standard",
    description: "1 punto per risposta corretta, 0 per errata",
    correct_answer_points: 1.0,
    incorrect_answer_points: 0.0,
    partial_credit_enabled: false,
  },
  {
    id: ids.evalStrict,
    name: "Penalità",
    description:
      "1 punto per risposta corretta, -0.25 per errata",
    correct_answer_points: 1.0,
    incorrect_answer_points: -0.25,
    partial_credit_enabled: false,
  },
]

// ── Seed logic ───────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...\n")

  // Clean existing seed data (reverse FK order)
  console.log("Cleaning old seed data...")
  const seedPrefix = "clseed_%"
  await supabase.from("questions").delete().like("id", seedPrefix)
  await supabase.from("sections").delete().like("id", seedPrefix)
  await supabase.from("classes").delete().like("id", seedPrefix)
  await supabase.from("courses").delete().like("id", seedPrefix)
  await supabase.from("departments").delete().like("id", seedPrefix)
  await supabase.from("evaluation_modes").delete().like("id", seedPrefix)

  // Insert in FK order
  console.log("Inserting departments...")
  const { error: deptErr } = await supabase
    .from("departments")
    .insert(departments)
  if (deptErr) throw deptErr
  console.log(`  ✓ ${departments.length} departments`)

  console.log("Inserting courses...")
  const { error: courseErr } = await supabase
    .from("courses")
    .insert(courses)
  if (courseErr) throw courseErr
  console.log(`  ✓ ${courses.length} courses`)

  console.log("Inserting classes...")
  const { error: classErr } = await supabase
    .from("classes")
    .insert(classes)
  if (classErr) throw classErr
  console.log(`  ✓ ${classes.length} classes`)

  console.log("Inserting sections...")
  const { error: secErr } = await supabase
    .from("sections")
    .insert(sections)
  if (secErr) throw secErr
  console.log(`  ✓ ${sections.length} sections`)

  console.log("Inserting questions...")
  const { error: qErr } = await supabase
    .from("questions")
    .insert(questions)
  if (qErr) throw qErr
  console.log(`  ✓ ${questions.length} questions`)

  console.log("Inserting evaluation modes...")
  const { error: evalErr } = await supabase
    .from("evaluation_modes")
    .insert(evaluationModes)
  if (evalErr) throw evalErr
  console.log(`  ✓ ${evaluationModes.length} evaluation modes`)

  console.log("\n✅ Seed complete!")
  console.log(
    `   ${departments.length} departments, ${courses.length} courses, ${classes.length} classes`,
  )
  console.log(
    `   ${sections.length} sections, ${questions.length} questions, ${evaluationModes.length} evaluation modes`,
  )
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err)
  process.exit(1)
})
