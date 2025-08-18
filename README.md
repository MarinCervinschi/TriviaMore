[![GitHub license](https://img.shields.io/github/license/MarinCervinschi/TriviaMore)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MarinCervinschi/TriviaMore)]()
[![GitHub forks](https://img.shields.io/github/forks/MarinCervinschi/TriviaMore)]()
[![GitHub issues](https://img.shields.io/github/issues/MarinCervinschi/TriviaMore)]()
[![GitHub visitors](https://visitor-badge.laobi.icu/badge?page_id=MarinCervinschi.TriviaMore&)]()

# Trivia MORE 🎓🧠

Prepare. Practice. Succeed.

Trivia MORE is a comprehensive quiz app designed to test and enhance your knowledge while preparing you for university exams. The app offers:

- 📚 Structured Learning: Multiple classes, divided into sections that cover specific course topics.
- ❓ Challenging Questions: Multiple-choice questions with single or multiple answer options.
- 📝 Instant Feedback: View correct answers and get detailed scoring at the end of each quiz.
- ⏱️ Time Management: Track your quiz duration to improve your speed and efficiency.

Whether you’re revising for exams or just testing your knowledge, Trivia MORE is the perfect companion for academic success.

## Visit the app [here](https://www.trivia-more.it/) 🌐

### Get Started 🚀

1. Clone the repository

```bash
git clone ...
```

2. Install dependencies

```bash
npm install
```

3. Set up the database (copy `.env.example` to `.env` first)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

4. Start the server

```bash
npm run dev
```

5. Open the browser and go to http://localhost:3000

### 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database and apply migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (visual database browser)
```

## Prisma Database Management 🗄️

This project uses Prisma as the ORM for database management. Here are the most commonly used commands:

### Local Database Setup with Docker 🐳

For local development, you can use Docker to run a PostgreSQL database:

```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Stop the database
docker-compose down

# View logs
docker-compose logs postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d triviamore
```

**Database Connection Details:**

- **Host**: localhost
- **Port**: 5432
- **Database**: triviamore
- **Username**: postgres
- **Password**: password123
- **Connection String**: `postgresql://postgres:password123@localhost:5432/triviamore?schema=public`

> **Note**: Copy `.env.example` to `.env` and update the `DATABASE_URL` before running Prisma commands.

### Setup & Development

```bash
# Install Prisma CLI (if not already installed)
npm install prisma --save-dev

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (for development)
npx prisma db push

# Create and apply migrations (for production)
npx prisma migrate dev --name "your_migration_name"

# Apply pending migrations
npx prisma migrate deploy
```

### Database Inspection

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio

# Check migration status
npx prisma migrate status

# View database schema
npx prisma db pull
```

### Database Reset & Seeding

```bash
# Reset database and apply all migrations
npx prisma migrate reset

# Seed the database with sample data
npx prisma db seed

# Alternative: Reset database and seed in one command
npm run db:reset
```

### 🌱 Database Seeding

Il progetto include un file di seed completo che popola il database con dati di esempio per testare tutte le funzionalità dell'applicazione. Il seed crea:

**👥 Utenti di test:**

- `superadmin` / `password123` (SUPERADMIN)
- `admin` / `password123` (ADMIN)
- `maintainer` / `password123` (MAINTAINER)
- `mario.rossi` / `password123` (STUDENT)
- `giulia.bianchi` / `password123` (STUDENT)

**📚 Struttura accademica:**

- 2 Dipartimenti (Informatica, Matematica)
- 3 Corsi (Ingegneria del Software, Basi di Dati, Algebra Lineare)
- 3 Classi per l'anno accademico 2024/25
- 5 Sezioni con contenuti specifici

**❓ Contenuti didattici:**

- 15+ domande su vari argomenti (UML, Design Patterns, SQL, Normalizzazione, Algebra)
- Quiz configurati con diverse modalità di valutazione
- Tentativi di quiz con risposte e punteggi
- Dati di progresso per gli studenti

**📊 Modalità di valutazione:**

- Standard (1 punto per risposta corretta, 0 per sbagliata)
- Con Penalità (1 punto per corretta, -0.25 per sbagliata)
- Credito Parziale (per domande a risposta multipla)

Per popolare il database con questi dati di esempio:

```bash
npx prisma db seed
```

### Schema Management

```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

> **Note**: Make sure to set up your `DATABASE_URL` environment variable in `.env` file before running any Prisma commands.

---
