# Architecture Documentation - TriviaMore

[← Back to README](../README.md) | [📚 All Documentation](./README.md)

## Overview

TriviaMore is built with a modern, scalable architecture that prioritizes performance, type safety, and developer experience. The application follows a full-stack approach with Next.js, leveraging both server and client capabilities.

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[React Server Components]
        C[Client Components]
        D[Tailwind CSS + Radix UI]
    end

    subgraph "API Layer"
        E[Next.js API Routes]
        F[NextAuth.js v5]
        G[Middleware]
    end

    subgraph "Data Layer"
        H[Prisma ORM]
        I[PostgreSQL Database]
        J[TanStack Query Cache]
    end

    subgraph "External Services"
        K[Vercel Edge Runtime]
        L[Neon PostgreSQL]
        M[OAuth Providers]
    end

    A --> E
    B --> E
    C --> J
    E --> F
    E --> H
    F --> M
    H --> I
    K --> A
    L --> I
```

## 🔄 Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Middleware
    participant A as API Route
    participant D as Database
    participant N as NextAuth

    U->>M: Request to protected route
    M->>M: Check session cookie
    alt Cookie exists
        M->>A: Forward request
        A->>N: Validate session
        N->>D: Query session
        D->>N: Return session data
        N->>A: Validated session
        A->>U: Protected content
    else No cookie
        M->>U: Redirect to login
    end
```

### Quiz Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant D as Database

    U->>C: Start Quiz
    C->>A: POST /api/protected/quiz/start
    A->>D: Create quiz session
    D->>A: Session ID
    A->>C: Quiz questions

    loop For each question
        U->>C: Answer question
        C->>C: Store locally
    end

    U->>C: Submit quiz
    C->>A: POST /api/protected/quiz/complete
    A->>D: Save results & update progress
    D->>A: Final score
    A->>C: Quiz results
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── protected/     # Authenticated routes
│   │   └── guest/         # Anonymous routes
│   ├── (pages)/           # Page components
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (Radix)
│   ├── forms/            # Form components
│   └── pages/            # Page-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── providers/            # React context providers
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware
```

## 🔐 Authentication Architecture

### Hybrid Authentication Approach

TriviaMore uses a two-layer authentication system optimized for Vercel Edge runtime:

#### Layer 1: Edge Middleware

- **Purpose**: Fast routing decisions
- **Technology**: Cookie presence validation
- **Runtime**: Vercel Edge (fast, limited)
- **Scope**: Redirects unauthenticated users

```typescript
// Lightweight edge-compatible check
const sessionCookie = request.cookies.get("authjs.session-token");
if (!sessionCookie && isProtectedRoute) {
    return redirect("/auth/login");
}
```

#### Layer 2: Route-Level Validation

- **Purpose**: Full session validation
- **Technology**: NextAuth.js with database lookup
- **Runtime**: Node.js (full capabilities)
- **Scope**: Validates session integrity and permissions

```typescript
export const GET = auth(async function (request: NextAuthRequest) {
	if (!request.auth) {
		return unauthorized();
	}
	// Full database access available
});
```

### Session Management

- **Strategy**: Database-backed sessions (not JWT)
- **Storage**: PostgreSQL via Prisma
- **Providers**: Google, GitHub, Credentials
- **Security**: Secure cookies, CSRF protection

## 🗄️ Database Design

### Core Entities

```mermaid
erDiagram
    User ||--o{ Progress : tracks
    User ||--o{ QuizSession : takes
    User ||--o{ Bookmark : saves

    Department ||--o{ Course : contains
    Course ||--o{ Classs : contains
    Classs ||--o{ Section : contains
    Section ||--o{ Question : contains

    Question ||--o{ QuizSession : includes
    Question ||--o{ Bookmark : references

    User {
        string id PK
        string email UK
        string name
        enum role
        datetime createdAt
    }

    Question {
        string id PK
        string text
        json options
        string correctAnswer
        string sectionId FK
    }

    Progress {
        string id PK
        string userId FK
        string sectionId FK
        int completedQuestions
        float averageScore
        datetime lastActivity
    }
```

### Data Relationships

- **Hierarchical Content**: Department → Course → Class → Section → Questions
- **User Progress**: Tracked per section with detailed analytics
- **Access Control**: Role-based permissions (USER, ADMIN, SUPERADMIN)
- **Bookmarks**: Many-to-many relationship between users and questions

## ⚡ Performance Optimizations

### Frontend

- **React Server Components**: Reduced JavaScript bundle
- **Streaming**: Progressive page loading
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Route-based chunking

### Backend

- **Edge Functions**: Fast global distribution
- **Database Connection Pooling**: Prisma connection management
- **Query Optimization**: Selective field loading
- **Caching**: TanStack Query for client-side caching

### Database

- **Indexing**: Strategic indexes on frequently queried fields
- **Connection Pooling**: Neon's built-in pooling
- **Query Optimization**: Prisma's query optimization
- **Read Replicas**: Future consideration for scaling

## 🚀 Deployment Architecture

### Vercel Platform

- **Edge Functions**: Middleware and routing
- **Serverless Functions**: API routes
- **Static Generation**: Public pages
- **CDN**: Global content delivery

### Database

- **Neon PostgreSQL**: Managed database service
- **Automatic Backups**: Point-in-time recovery
- **Connection Pooling**: Built-in optimization
- **Global Distribution**: Edge database access

## 🔄 State Management

### Client State

- **React State**: Local component state
- **Context API**: Theme, user preferences
- **TanStack Query**: Server state caching

### Server State

- **Database**: Persistent application data
- **Sessions**: User authentication state
- **Cache**: Redis consideration for future scaling

## 🛡️ Security Considerations

### Authentication

- **Session-based**: Database-backed sessions
- **CSRF Protection**: Built-in NextAuth protection
- **Secure Cookies**: HttpOnly, Secure, SameSite

### API Security

- **Route Protection**: Middleware + route-level checks
- **Input Validation**: Zod schemas
- **Rate Limiting**: Future implementation planned

### Data Protection

- **Environment Variables**: Sensitive data protection
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Prevention**: React's built-in protection

## 📈 Scalability Considerations

### Current Scale

- **Users**: Designed for university-level usage
- **Content**: Hierarchical course structure
- **Performance**: Edge-optimized for global access

### Future Scaling

- **Database Sharding**: Potential for multi-region
- **Microservices**: API modularization
- **Caching Layer**: Redis for high-traffic scenarios
- **CDN Optimization**: Static asset distribution

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Authentication Guide](./AUTH.md) - Detailed auth implementation

[← Back to README](../README.md) | [📚 All Documentation](./README.md)
