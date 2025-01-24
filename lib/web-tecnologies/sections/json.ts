import QuizQuestion from "@/types/QuizQuestion";

const json: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Quali sono i vantaggi principali del formato JSON rispetto a XML?",
        "options": [
            "Leggerezza",
            "Maggiore sicurezza",
            "Facilità di lettura",
            "Migliore modularità"
        ],
        "correctAnswers": [0, 2],
        "section": "json"
    },
    {
        "id": 2,
        "question": "Quale dei seguenti esempi rappresenta una dichiarazione corretta di un oggetto JSON?",
        "options": [
            "{'Nome': 'Paul', 'Età': 30}",
            "{\"Nome\": \"Paul\", \"Età\": 30}",
            "var person = {Nome: 'Paul', Età: 30};",
            "{Nome: 'Paul', Età: 30}"
        ],
        "correctAnswers": [1],
        "section": "json"
    },
    {
        "id": 3,
        "question": "Quale metodo JavaScript consente di convertire una stringa JSON in un oggetto JavaScript in modo sicuro?",
        "options": [
            "eval()",
            "JSON.parse()",
            "toJson()",
            "fromJson()"
        ],
        "correctAnswers": [1],
        "section": "json"
    },
    {
        "id": 4,
        "question": "Quale libreria Java è comunemente utilizzata per il parsing JSON?",
        "options": [
            "Jackson",
            "Jabsorb",
            "Gson",
            "JQuery"
        ],
        "correctAnswers": [2],
        "section": "json"
    },
    {
        "id": 5,
        "question": "Quali delle seguenti istruzioni creano correttamente un array di oggetti JSON?",
        "options": [
            "var bands = [{'Nome': 'Queen', 'Anno': 1970}, {'Nome': 'Beatles', 'Anno': 1960}];",
            "var bands = {['Nome': 'Queen', 'Anno': 1970], ['Nome': 'Beatles', 'Anno': 1960]};",
            "var bands = [{\"Nome\": \"Queen\", \"Anno\": 1970}, {\"Nome\": \"Beatles\", \"Anno\": 1960}];",
            "var bands = {Nome: \"Queen\", Anno: 1970, Nome: \"Beatles\", Anno: 1960};"
        ],
        "correctAnswers": [0, 2],
        "section": "json"
    },
    {
        "id": 6,
        "question": "Quali metodi fornisce la libreria Gson per la gestione di JSON in Java?",
        "options": [
            "JSON.parse()",
            "toJson()",
            "fromJson()",
            "JSON.stringify()"
        ],
        "correctAnswers": [1, 2],
        "section": "json"
    },
    {
        "id": 7,
        "question": "Quale dei seguenti è un formato di dati valido per JSON?",
        "options": [
            "Array",
            "Oggetto",
            "Funzione",
            "Stringa"
        ],
        "correctAnswers": [0, 1, 3],
        "section": "json"
    },
    {
        "id": 8,
        "question": "Quali sono i metodi per convertire un oggetto JavaScript in una stringa JSON?",
        "options": [
            "JSON.stringify()",
            "JSON.parse()",
            "eval()",
            "toJson()"
        ],
        "correctAnswers": [0],
        "section": "json"
    },
    {
        "id": 9,
        "question": "In JavaScript, come si accede alla proprietà 'Paese' di un oggetto JSON?",
        "options": [
            "obj.getPaese()",
            "obj['Paese']",
            "obj.Paese",
            "obj->Paese"
        ],
        "correctAnswers": [1, 2],
        "section": "json"
    },
    {
        "id": 10,
        "question": "Quale vantaggio offre JSON rispetto ad altri formati di scambio dati?",
        "options": [
            "Maggiore sicurezza",
            "Maggiore leggibilità",
            "Facilità di parsing",
            "Minor consumo di banda"
        ],
        "correctAnswers": [1, 2, 3],
        "section": "json"
    }
];

export default json;