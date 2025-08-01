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

## Visit the app [here](https://trivia-more.vercel.app/) 🌐

### Get Started 🚀

1. Clone the repository
```bash
git clone ...
```
2. Install dependencies
```bash
npm install
```
3. Start the server
```bash
npm run dev
```
4. Open the browser and go to http://localhost:3000

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

# Seed the database (if seed script is configured)
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