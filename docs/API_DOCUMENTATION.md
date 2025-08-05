# API Documentation - TriviaMore

## Panoramica

Le API di TriviaMore supportano due funzionalità principali:
1. **Browse API** - Navigazione della struttura gerarchica dipartimenti → corsi → classi → sezioni
2. **Quiz API** - Gestione dei quiz per utenti anonimi e registrati

---

## 📁 Browse API

### 1. GET /api/browse

Ottiene la struttura iniziale dell'albero di navigazione (dipartimenti e corsi).

#### Esempi di richiesta

```
GET /api/browse
```

#### Risposta

```json
{
  "departments": [
    {
      "id": "dept-1",
      "name": "Department of Engineering",
      "code": "ENG",
      "description": "Engineering courses and programs",
      "position": 1,
      "_count": {
        "courses": 5
      },
      "courses": [
        {
          "id": "course-1",
          "name": "Computer Engineering",
          "code": "CE101",
          "description": "Computer science fundamentals",
          "courseType": "BACHELOR",
          "position": 1,
          "departmentId": "dept-1",
          "_count": {
            "classes": 8
          }
        }
      ]
    }
  ]
}
```

### 2. GET /api/browse?action=expand&nodeType=course&nodeId={courseId}

Espande un corso per mostrare le sue classi.

#### Parametri Query

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `action` | string | ✅ | Deve essere "expand" |
| `nodeType` | string | ✅ | Deve essere "course" |
| `nodeId` | string | ✅ | ID del corso da espandere |

#### Esempio di richiesta

```
GET /api/browse?action=expand&nodeType=course&nodeId=course-123
```

#### Risposta

```json
{
  "classes": [
    {
      "id": "class-1",
      "name": "Algorithms",
      "code": "ALG101",
      "description": "Basic algorithms and data structures",
      "classYear": 2024,
      "position": 1,
      "courseId": "course-123",
      "_count": {
        "sections": 4
      }
    }
  ]
}
```

### 3. GET /api/browse?action=expand&nodeType=class&nodeId={classId}

Espande una classe per mostrare le sue sezioni.

#### Parametri Query

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `action` | string | ✅ | Deve essere "expand" |
| `nodeType` | string | ✅ | Deve essere "class" |
| `nodeId` | string | ✅ | ID della classe da espandere |

#### Esempio di richiesta

```
GET /api/browse?action=expand&nodeType=class&nodeId=class-456
```

#### Risposta

```json
{
  "sections": [
    {
      "id": "section-1",
      "name": "Complexity Analysis",
      "description": "Time and space complexity",
      "isPublic": true,
      "position": 1,
      "classId": "class-456",
      "_count": {
        "questions": 25
      }
    }
  ]
}
```

### 4. GET /api/browse?q={searchTerm}&limit={limit}

Cerca nella struttura dell'albero.

#### Parametri Query

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `q` | string | ✅ | Termine di ricerca |
| `limit` | number | ❌ | Limite risultati (default: 50) |

#### Esempio di richiesta

```
GET /api/browse?q=algorithm&limit=10
```

#### Risposta

```json
{
  "departments": [
    {
      "id": "dept-1",
      "name": "Computer Science Department",
      "code": "CS",
      "description": "Computer science and algorithms"
    }
  ],
  "courses": [...],
  "classes": [...],
  "sections": [...]
}
```

---

## 🎯 Quiz API

### 1. GET /api/quiz/guest

Genera un quiz per utenti anonimi.

#### Parametri Query

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `sectionId` | string | ✅ | ID della sezione |

#### Esempio di richiesta

```
GET /api/quiz/guest?sectionId=section-123
```

#### Risposta

```json
{
  "quiz": {
    "id": "guest-1722691200000",
    "quizMode": "STUDY",
    "section": {
      "id": "section-123",
      "name": "Complexity Analysis",
      "class": {
        "name": "Algorithms",
        "course": {
          "name": "Computer Engineering",
          "department": {
            "name": "Department of Engineering"
          }
        }
      }
    },
    "evaluationMode": {
      "name": "Standard",
      "description": "Standard evaluation mode",
      "correctAnswerPoints": 1.0,
      "incorrectAnswerPoints": 0.0,
      "partialCreditEnabled": false
    },
    "questions": [
      {
        "id": "question-1",
        "content": "What is the time complexity of binary search?",
        "questionType": "MULTIPLE_CHOICE",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        "correctAnswer": ["O(log n)"],
        "explanation": "Binary search divides the search space in half each iteration",
        "difficulty": "MEDIUM",
        "order": 1
      }
    ]
  }
}
```

### 2. POST /api/quiz/start

Avvia un quiz per un utente registrato.

#### Headers richiesti

```
Authorization: Bearer <jwt-token>
```

#### Body della richiesta

```json
{
  "sectionId": "section-123",
  "difficulty": "MEDIUM",
  "questionCount": 20,
  "timeLimit": 30,
  "quizMode": "EXAM_SIMULATION",
  "evaluationModeId": "eval-mode-123"
}
```

#### Campi del body

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `sectionId` | string | ✅ | ID della sezione |
| `quizMode` | enum | ✅ | `STUDY`, `EXAM_SIMULATION` |
| `evaluationModeId` | string | ✅ | ID della modalità di valutazione |
| `difficulty` | enum | ❌ | `EASY`, `MEDIUM`, `HARD` |
| `questionCount` | number | ❌ | Numero di domande (default: 10) |
| `timeLimit` | number | ❌ | Limite di tempo in minuti |

#### Risposta

```json
{
  "attemptId": "attempt-123",
  "quiz": {
    "id": "quiz-123",
    "timeLimit": 30,
    "quizMode": "EXAM_SIMULATION",
    "section": {
      "id": "section-123",
      "name": "Complexity Analysis",
      "class": {
        "name": "Algorithms",
        "course": {
          "name": "Computer Engineering",
          "department": {
            "name": "Department of Engineering"
          }
        }
      }
    },
    "evaluationMode": {
      "name": "Standard",
      "correctAnswerPoints": 1.0,
      "incorrectAnswerPoints": 0.0,
      "partialCreditEnabled": false
    },
    "questions": [...]
  }
}
```

### 3. POST /api/quiz/complete

Completa un quiz e salva i progressi.

#### Headers richiesti

```
Authorization: Bearer <jwt-token>
```

#### Body della richiesta

```json
{
  "quizAttemptId": "attempt-123",
  "timeSpent": 1800,
  "answers": [
    {
      "questionId": "question-1",
      "userAnswer": ["O(log n)"],
      "score": 1.0
    }
  ]
}
```

#### Risposta

```json
{
  "id": "attempt-123",
  "score": 15.5,
  "totalQuestions": 20,
  "correctAnswers": 16,
  "timeSpent": 1800,
  "answers": [
    {
      "questionId": "question-1",
      "userAnswer": ["O(log n)"],
      "score": 1.0
    }
  ]
}
```

---

## 🚨 Codici di errore

| Codice | Descrizione |
|--------|-------------|
| `400` | Bad Request - Parametri mancanti o non validi |
| `401` | Unauthorized - Autenticazione richiesta |
| `404` | Not Found - Risorsa non trovata |
| `500` | Internal Server Error - Errore del server |

---

## 🔧 Caratteristiche Tecniche

### Browse API
- **Caricamento Lazy**: Solo dipartimenti e corsi nella chiamata iniziale
- **Espansione On-Demand**: Classi e sezioni caricate quando necessario
- **Controllo Accessi**: Sezioni private visibili solo agli utenti autorizzati
- **Ricerca Full-Text**: Cerca in nomi, codici e descrizioni

### Quiz API
- **Selezione Casuale**: Domande mescolate casualmente ad ogni quiz (30 domande default)
- **Quiz Anonimi**: Nessuna autenticazione richiesta per `/guest`
- **Tracking Progressi**: Salvataggio automatico per utenti registrati
- **Informazioni Complete**: Include gerarchia completa della sezione (section → class → course → department)

### Autenticazione
- `/api/quiz/start` e `/api/quiz/complete` richiedono JWT token
- `/api/quiz/guest` e `/api/browse` sono pubbliche
- Token JWT nell'header: `Authorization: Bearer <token>`

### Algoritmi di Selezione Domande
- **Efficienza**: Usa `selectRandomItems()` invece di shuffle completo
- **Casualità**: Algoritmo Fisher-Yates per distribuzione uniforme
- **Scalabilità**: Performance O(n) per selezione casuale

---

## 📋 Note Implementative

### Struttura Dati Quiz
```typescript
interface Quiz {
  id: string;
  quizMode: 'STUDY' | 'EXAM_SIMULATION';
  section: {
    id: string;
    name: string;
    class: {
      name: string;
      course: {
        name: string;
        department: { name: string };
      };
    };
  };
  evaluationMode: {
    name: string;
    description?: string;
    correctAnswerPoints: number;
    incorrectAnswerPoints: number;
    partialCreditEnabled: boolean;
  };
  questions: QuizQuestion[];
}
```

### Flusso Tipico Browse API
1. **Caricamento iniziale**: `GET /api/browse`
2. **Espansione corso**: `GET /api/browse?action=expand&nodeType=course&nodeId=X`
3. **Espansione classe**: `GET /api/browse?action=expand&nodeType=class&nodeId=Y`
4. **Avvio quiz**: `GET /api/quiz/guest?sectionId=Z`

### Flusso Tipico Quiz
1. **Generazione**: `GET /api/quiz/guest?sectionId=section-123`
2. **Raccolta risposte** (lato client)
3. **Valutazione** (lato client per quiz anonimi)
