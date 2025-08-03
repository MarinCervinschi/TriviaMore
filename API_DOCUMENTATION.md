# API Documentation

## Panoramica

Le API di TriviaMore supportano diverse funzionalità:

1. **Browse API** - Navigazione gerarchica dei contenuti
2. **Quiz API** - Generazione e gestione quiz
3. **Auth API** - Autenticazione e autorizzazione (futuro)

---

## 1. Browse API - `/api/browse`

La Browse API implementa una strategia di **lazy loading gerarchico** per ottimizzare la navigazione dei contenuti educativi.

### Struttura Gerarchica

```
Department (Dipartimento)
├── Course (Corso di Laurea)
│   ├── Class (Materia/Corso)
│   │   └── Section (Sezione/Argomento)
│   │       └── Questions (Domande)
```

### 1.1 GET /api/browse - Caricamento Iniziale

Restituisce la struttura base: Departments → Courses (senza classes e sections).

#### Risposta

```json
{
  "departments": [
    {
      "id": "dept-1",
      "name": "Department of Engineering",
      "code": "DIEF",
      "description": "Engineering and technical sciences",
      "position": 0,
      "_count": {
        "courses": 2
      },
      "courses": [
        {
          "id": "course-1",
          "name": "Computer Engineering",
          "code": "CE",
          "description": "Computer systems and software engineering",
          "courseType": "BACHELOR",
          "position": 0,
          "departmentId": "dept-1",
          "_count": {
            "classes": 3
          }
        }
      ]
    }
  ]
}
```

### 1.2 GET /api/browse?action=expand&nodeType=course&nodeId={courseId}

Espande un corso per mostrare le sue classi.

#### Parametri Query

| Parametro  | Tipo   | Obbligatorio | Descrizione                    |
| ---------- | ------ | ------------ | ------------------------------ |
| `action`   | string | ✅           | Deve essere "expand"           |
| `nodeType` | string | ✅           | Deve essere "course"           |
| `nodeId`   | string | ✅           | ID del corso da espandere      |

#### Risposta

```json
{
  "classes": [
    {
      "id": "class-1",
      "name": "Algorithms",
      "code": "ALG101",
      "description": "Data structures and algorithms",
      "classYear": 1,
      "position": 0,
      "courseId": "course-1",
      "_count": {
        "sections": 2
      }
    }
  ]
}
```

### 1.3 GET /api/browse?action=expand&nodeType=class&nodeId={classId}

Espande una classe per mostrare le sue sezioni.

#### Parametri Query

| Parametro  | Tipo   | Obbligatorio | Descrizione                    |
| ---------- | ------ | ------------ | ------------------------------ |
| `action`   | string | ✅           | Deve essere "expand"           |
| `nodeType` | string | ✅           | Deve essere "class"            |
| `nodeId`   | string | ✅           | ID della classe da espandere   |

#### Risposta

```json
{
  "sections": [
    {
      "id": "section-1",
      "name": "Complexity Analysis",
      "description": "Big O notation and algorithm complexity",
      "isPublic": true,
      "position": 0,
      "classId": "class-1",
      "_count": {
        "questions": 25
      }
    }
  ]
}
```

### 1.4 GET /api/browse?q={searchQuery}

Ricerca globale nella struttura (implementazione futura).

#### Parametri Query

| Parametro | Tipo   | Obbligatorio | Descrizione                        |
| --------- | ------ | ------------ | ---------------------------------- |
| `q`       | string | ✅           | Termine di ricerca                 |
| `limit`   | number | ❌           | Limite risultati (default: 50)    |

### Modalità Sviluppo vs Produzione

- **Sviluppo** (`NODE_ENV=development`): Usa dati mock per testing rapido
- **Produzione**: Usa database PostgreSQL tramite Prisma

### Gestione Permessi

- **Utenti Anonimi**: Solo sezioni pubbliche (`isPublic: true`)
- **Utenti Autenticati**: Sezioni pubbliche + sezioni con accesso tramite `SectionAccess`

### Flusso di Caricamento Ottimizzato

#### 1. Caricamento Iniziale della Pagina
```
GET /api/browse
```
- Carica: Departments + Courses
- Payload ridotto: ~2-5KB invece di 50-100KB
- Tempo di risposta: <100ms

#### 2. Espansione Corso (On Click)
```
GET /api/browse?action=expand&nodeType=course&nodeId=course-1
```
- Carica: Classes del corso selezionato
- Payload: ~1-3KB per corso
- Cache locale: Evita richieste duplicate

#### 3. Espansione Classe (On Click)
```
GET /api/browse?action=expand&nodeType=class&nodeId=class-1
```
- Carica: Sections della classe selezionata
- Payload: ~0.5-2KB per classe
- Filtraggio: Solo sezioni accessibili all'utente

### Ottimizzazioni Implementate

1. **Lazy Loading**: Caricamento progressivo su richiesta
2. **Conteggi Intelligenti**: `_count` per feedback visivo
3. **Cache Frontend**: Evita richieste duplicate
4. **Filtri Backend**: Solo dati accessibili
5. **Skeleton Loading**: UX fluida durante il caricamento

### Codici di Errore

| Codice | Descrizione                          |
| ------ | ------------------------------------ |
| 200    | Successo                             |
| 400    | Parametri non validi                 |
| 404    | Risorsa non trovata                  |
| 500    | Errore interno del server            |

---

## 2. Quiz API - `/api/quiz`

Le API per la gestione dei quiz supportano diverse modalità di utilizzo.

### 2.1 GET /api/quiz/guest - Quiz per Ospiti

Genera un quiz per utenti anonimi.

---

## 1. GET /api/quiz/guest

Genera un quiz per utenti anonimi.

### Parametri Query

| Parametro       | Tipo             | Obbligatorio | Descrizione      |
| --------------- | ---------------- | ------------ | ---------------- |
| `sectionId`     | string           | ✅           | ID della sezione |
| `questionCount` | (default: 30)    |
| `quizMode`      | (default: STUDY) |

### Esempio di richiesta

```
GET /api/quiz/guest?sectionId=section-id
```

### Risposta

```json
{
  "quiz": {
    "id": "guest-1722691200000",
    "timeLimit": null,
    "sectionId": "section-id",
    "evaluationModeId": "eval-mode-id",
    "quizMode": "STUDY",
    "questions": [
      {
        "id": "question-1",
        "content": "Quanto fa 2+2?",
        "questionType": "MULTIPLE_CHOICE",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": ["4"],
        "explanation": "La somma di 2+2 è 4",
        "difficulty": "EASY",
        "order": 1
      }
    ]
  },
  "tempId": "guest-1722691200000"
}
```
