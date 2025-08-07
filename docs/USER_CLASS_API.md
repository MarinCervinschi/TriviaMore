# User Saved Classes API Documentation

## Endpoints

### GET `/api/protected/userClass`

Ottieni tutte le classi salvate/preferite dell'utente autenticato.

**Autorizzazione**: Richiesta sessione.

**Response**:

```json
{
	"savedClasses": [
		{
			"userId": "user-id",
			"classId": "class-id",
			"createdAt": "2025-08-05T10:00:00.000Z",
			"updatedAt": "2025-08-05T10:00:00.000Z",
			"class": {
				"id": "class-id",
				"name": "Matematica I",
				"code": "MAT101",
				"description": "Corso di matematica di base",
				"classYear": 1,
				"position": 1,
				"course": {
					"id": "course-id",
					"name": "Ingegneria Informatica",
					"code": "INF",
					"courseType": "BACHELOR",
					"department": {
						"id": "dept-id",
						"name": "Dipartimento di Ingegneria",
						"code": "ING"
					}
				}
			}
		}
	]
}
```

### POST `/api/protected/userClass`

Aggiungi una classe alla lista preferiti dell'utente autenticato.

**Autorizzazione**: Richiesta sessione.

**Body**:

```json
{
	"classId": "class-id"
}
```

**Response Success (201)**:

```json
{
	"message": "Class added to your list successfully",
	"savedClass": {
		"userId": "user-id",
		"classId": "class-id",
		"createdAt": "2025-08-05T10:00:00.000Z",
		"updatedAt": "2025-08-05T10:00:00.000Z",
		"class": {
			// ... dati della classe
		}
	}
}
```

**Response Errors**:

- `400` - classId mancante o non valido
- `404` - Classe o utente non trovato
- `409` - Classe già nella lista preferiti

### DELETE `/api/protected/userClass?classId=class-id`

Rimuovi una classe dalla lista preferiti dell'utente autenticato.

**Autorizzazione**: Richiesta sessione.

**Query Parameters**:

- `classId` (required): ID della classe da rimuovere dalla lista

**Response Success (200)**:

```json
{
	"success": true,
	"message": "Classe rimossa dalla tua lista con successo"
}
```

**Response Errors**:

- `400` - classId mancante
- `404` - Classe non nella lista dell'utente

## Concetto

Il modello `UserClass` rappresenta una **lista di classi preferite/salvate** dell'utente, non un'iscrizione effettiva. È simile a:

- ⭐ Preferiti/Bookmark
- 📋 Lista personale
- 💾 Classi salvate per accesso rapido

L'utente può aggiungere e rimuovere classi dalla propria lista personale per organizzare e accedere rapidamente alle classi di interesse.
