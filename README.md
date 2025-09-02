# Trivia MORE 🎓🧠

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-enabled-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![GitHub license](https://img.shields.io/github/license/MarinCervinschi/TriviaMore?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MarinCervinschi/TriviaMore?style=for-the-badge)]()
[![GitHub forks](https://img.shields.io/github/forks/MarinCervinschi/TriviaMore?style=for-the-badge)]()
[![GitHub issues](https://img.shields.io/github/issues/MarinCervinschi/TriviaMore?style=for-the-badge)]()

**Prepare. Practice. Succeed.**

Trivia MORE is a comprehensive quiz application designed to enhance learning and prepare students for university exams through structured practice and assessment.

## 🌐 Live Demo

Visit the application at [trivia-more.it](https://www.trivia-more.it/)

## 📖 About

Trivia MORE transforms the way students prepare for university exams by providing an interactive, structured learning environment. Built with modern web technologies, it offers a comprehensive quiz platform that adapts to different learning styles and academic needs.

The application serves as a bridge between traditional study methods and digital learning, offering features like real-time progress tracking, adaptive questioning, and collaborative learning tools. Whether you're a student looking to test your knowledge, an educator wanting to create engaging content, or an administrator managing academic programs, Trivia MORE provides the tools you need to succeed.

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Tech Stack](#️-tech-stack)
- [🐳 Docker Commands](#-docker-commands)
- [🗄️ Database Management](#️-database-management)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [🐛 Issue Reporting](#-issue-reporting)
- [📄 License](#-license)

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** (recommended for local development)
- **Node.js** (18+ recommended)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/MarinCervinschi/TriviaMore.git
   cd TriviaMore
   ```

2. **Configure environment variables**

   Copy the example environment file and configure it:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your specific configuration. The default database URL for local Docker development is already set up.

3. **Install dependencies**
   ```bash
   npm install
   ```

### Local Development with Docker

The easiest way to run the application locally is using Docker for the database:

1. **Start the PostgreSQL database**

   ```bash
   docker-compose up -d postgres
   ```

2. **Set up the database**

   ```bash
   # Generate Prisma client and push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Latest-1C1C1C?style=for-the-badge&logo=radix-ui)](https://www.radix-ui.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/query)

### Backend

[![Next.js API](https://img.shields.io/badge/Next.js_API-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/docs/api-routes/introduction)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5-7C3AED?style=for-the-badge&logo=nextauth)](https://next-auth.js.org/)
[![Zod](https://img.shields.io/badge/Zod-4-3E67B1?style=for-the-badge&logo=zod)](https://zod.dev/)

### Development & DevOps

[![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8-4B32C3?style=for-the-badge&logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=for-the-badge&logo=prettier)](https://prettier.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Latest-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 🐳 Docker Commands

```bash
# Start the database
docker-compose up -d postgres

# Stop the database
docker-compose down

# View database logs
docker-compose logs postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d triviamore

# Restart the database
docker-compose restart postgres
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create and apply migrations (production)
npx prisma migrate dev --name "migration_name"

# Apply pending migrations
npx prisma migrate deploy

# Reset database and apply all migrations
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Check migration status
npx prisma migrate status
```

## 📚 Documentation

For detailed information about specific aspects of the application:

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Authentication](./docs/AUTH.md)** - Authentication system overview

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run format:check
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation when necessary
- Ensure all linting and formatting checks pass

## 🐛 Issue Reporting

Found a bug or have a feature request? Please use our issue templates:

- **[Bug Report](https://github.com/MarinCervinschi/TriviaMore/issues/new?template=bug_report.md)** - Report bugs or unexpected behavior
- **[Feature Request](https://github.com/MarinCervinschi/TriviaMore/issues/new?template=feature_request.md)** - Suggest new features or improvements

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Marin Cervinschi** - [@MarinCervinschi](https://github.com/MarinCervinschi)

---

⭐ If you find this project helpful, please consider giving it a star!
