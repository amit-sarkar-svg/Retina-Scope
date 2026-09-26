# RetinaScope Backend — Milestone 2

> **Explainable AI-Assisted Diabetic Retinopathy Screening Platform — Backend Foundation & Mock AI Contract**

---

## 1. Overview & Architecture

RetinaScope is an explainable AI-assisted diabetic retinopathy (DR) screening platform designed for early detection, triage, lesion quantification, and specialist clinical validation.

Milestone 2 delivers the complete backend foundation, PostgreSQL database with Prisma ORM, JWT authentication, multipart retinal scan upload pipeline, clinical queue/results/report APIs, and a decoupled Mock AI architecture with a standardized AI output contract.

```
+-------------------------------------------------------------+
|                     Next.js Frontend                        |
|            (Completed in Milestone 1 - Unaltered)           |
+-------------------------------------------------------------+
                              |
                              | REST APIs (JSON / Multipart)
                              v
+-------------------------------------------------------------+
|                   Express REST API Backend                  |
|  - Auth Middleware (JWT + bcrypt)                           |
|  - Request Validation (Zod schemas)                         |
|  - Retinal Scan Upload Middleware (Multer, 15MB, PNG/JPEG)  |
|  - Controllers & Services (Auth, Patient, Screening, Queue) |
+-------------------------------------------------------------+
        |                                             |
        v                                             v
+-------------------------------+             +-------------------------------+
|      Prisma ORM (Client)      |             |         ModelService          |
+-------------------------------+             +-------------------------------+
        |                                             |
        v                                             v
+-------------------------------+             +-------------------------------+
|      PostgreSQL Database      |             |       ModelAdapter Interface  |
|  - users                      |             +-------------------------------+
|  - patients                   |                             |
|  - screenings                 |              +--------------+--------------+
|  - ai_results                 |              |                             |
|  - lesions                    |              v                             v
|  - specialist_reviews         |     +------------------+          +-------------------+
+-------------------------------+     |    MockModel     |          | Real AI Service   |
                                      | (Milestone 2)    |          | (Future / Python) |
                                      +------------------+          +-------------------+
```

---

## 2. Technology Stack

- **Runtime & Framework**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS, Zod validation
- **File Uploads**: Multer with strict MIME type & extension checks
- **Testing**: Jest, Supertest, ts-jest
- **Code Quality**: ESLint (v9 flat config), Prettier

---

## 3. Project Structure

```
backend/
├── src/
│   ├── app.ts                         # Express app configuration & middleware setup
│   ├── server.ts                      # HTTP server listener & graceful shutdown
│   │
│   ├── config/
│   │   ├── env.ts                     # Environment variable validation & constants
│   │   └── constants.ts               # HTTP status codes, upload limits, mime types
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts         # User registration, login, and /me profile
│   │   ├── patient.controller.ts      # Patient CRUD and search controllers
│   │   ├── screening.controller.ts    # Screening creation, upload & trigger analysis
│   │   ├── result.controller.ts       # Detailed screening result payload
│   │   ├── queue.controller.ts        # Clinical triage queue queries
│   │   ├── review.controller.ts       # Specialist review submissions
│   │   └── report.controller.ts       # Consolidated report dataset endpoint
│   │
│   ├── routes/
│   │   ├── auth.routes.ts             # /api/auth routes
│   │   ├── patient.routes.ts          # /api/patients routes
│   │   ├── screening.routes.ts        # /api/screenings routes
│   │   ├── result.routes.ts           # /api/results routes
│   │   ├── queue.routes.ts            # /api/queue routes
│   │   ├── review.routes.ts           # /api/reviews routes
│   │   └── report.routes.ts           # /api/reports routes
│   │
│   ├── services/
│   │   ├── auth.service.ts            # Password hashing, JWT signing & user logic
│   │   ├── patient.service.ts         # Patient persistence and pagination
│   │   ├── screening.service.ts       # Screening pipeline & AI orchestrator
│   │   ├── result.service.ts          # Result mapping for frontend
│   │   ├── queue.service.ts           # Queue filtering & prioritization
│   │   ├── review.service.ts          # Review persistence & status updates
│   │   ├── report.service.ts          # Report compilation service
│   │   └── model/
│   │       ├── model.adapter.ts       # ModelAdapter interface contract
│   │       ├── mock-model.ts          # Realistic synthetic AI generator
│   │       └── model.service.ts       # AI Model abstraction service layer
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts         # JWT validation & role-based access control
│   │   ├── error.middleware.ts        # Centralized AppError/Zod/Prisma handler
│   │   ├── upload.middleware.ts       # Safe multer upload for fundus images
│   │   └── not-found.middleware.ts    # 404 JSON response handler
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts             # Zod schema for registration & login
│   │   ├── patient.schema.ts          # Zod schema for patient creation & queries
│   │   ├── screening.schema.ts        # Zod schema for screening uploads & queries
│   │   ├── result.schema.ts           # Screening param validation schema
│   │   └── review.schema.ts           # Zod schema for specialist review submission
│   │
│   ├── types/
│   │   ├── auth.types.ts              # Auth, JWT, and user response types
│   │   ├── patient.types.ts           # Patient entity input & query types
│   │   ├── screening.types.ts         # Screening and queue parameter types
│   │   └── ai.types.ts                # Standardized AI contract type definitions
│   │
│   ├── utils/
│   │   ├── api-response.ts            # Standardized API response builder
│   │   ├── async-handler.ts           # Express async try/catch wrapper
│   │   └── file.utils.ts              # Upload directory & path utilities
│   │
│   └── prisma/
│       └── client.ts                  # Singleton PrismaClient instance
│
├── prisma/
│   ├── schema.prisma                  # PostgreSQL models, enums & relations
│   └── seed.ts                        # Synthetic clinical test dataset generator
│
├── uploads/                           # Local fundus image storage directory
│   └── .gitkeep
│
├── tests/
│   ├── helpers.ts                     # Test tokens & test utilities
│   ├── health.test.ts                 # Health & 404 endpoint tests
│   ├── auth.test.ts                   # Registration, login & profile tests
│   ├── patient.test.ts                # Patient CRUD & search tests
│   ├── screening.test.ts              # Multipart upload & screening tests
│   ├── ai-model.test.ts               # ModelAdapter & analysis pipeline tests
│   └── queue-result-review.test.ts    # Queue, results, reviews & report tests
│
├── docker-compose.yml                 # Local PostgreSQL container definition
├── .env.example                       # Template for environment variables
├── .gitignore                         # Git exclusion rules
├── package.json                       # Scripts and project dependencies
├── tsconfig.json                      # TypeScript configuration
├── eslint.config.mjs                  # ESLint configuration
├── prettier.config.cjs                # Prettier code formatting rules
└── jest.config.ts                     # Jest test runner configuration
```

---

## 4. Database Models & Schema

The PostgreSQL schema managed by Prisma contains the following relational entities:

### 1. `User` (`users`)
- Roles: `ADMIN`, `SCREENING_OPERATOR`, `SPECIALIST`
- Stores secure `passwordHash` (bcrypt).

### 2. `Patient` (`patients`)
- Unique `patientCode` (indexed), `name` (indexed), `age`, `gender`, `phone`.

### 3. `Screening` (`screenings`)
- Relates to `Patient` (`1 : N`).
- `status`: `UPLOADED`, `PROCESSING`, `COMPLETED`, `REVIEW_PENDING`, `REVIEWED`, `FAILED`.
- `imagePath`: Server-side path of uploaded fundus scan.

### 4. `AIResult` (`ai_results`)
- Relates to `Screening` (`1 : 1`).
- Fields: `drGrade` (0–4), `severity` (`NO_DR`, `MILD`, `MODERATE`, `SEVERE`, `PROLIFERATIVE`), `drConfidence`, `dmeRisk` (`LOW`, `MODERATE`, `HIGH`), `dmeConfidence`, `imageQualityStatus` (`ACCEPTED`, `POOR`), `imageQualityScore`, `uncertaintyLevel` (`LOW`, `MEDIUM`, `HIGH`), `abstain` (boolean), `referralPriority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `referralRecommendation`, `segmentationMaskPath`, `gradcamPath`.

### 5. `Lesion` (`lesions`)
- Relates to `Screening` (`1 : N`).
- Fields: `type` (`MICROANEURYSM`, `HEMORRHAGE`, `EXUDATE`, `OTHER`), `count`.

### 6. `SpecialistReview` (`specialist_reviews`)
- Relates to `Screening` (`1 : 1`) and `User` (Reviewer).
- `decision`: `AGREE`, `MODIFY`, `REQUEST_RESUBMISSION`, `REJECT`.
- `notes`: Clinical assessment text.

---

## 5. Mock AI Architecture & Contract

The backend decouples AI inference using the **Adapter Pattern**:

```ts
export interface ModelAdapter {
  analyze(imagePath: string): Promise<NormalizedAIOutput>;
}
```

### Standardized AI Output Contract
```json
{
  "dr": {
    "grade": 2,
    "severity": "MODERATE",
    "confidence": 0.91
  },
  "dme": {
    "risk": "HIGH",
    "confidence": 0.87
  },
  "imageQuality": {
    "status": "ACCEPTED",
    "score": 0.94
  },
  "lesions": [
    { "type": "MICROANEURYSM", "count": 12 },
    { "type": "HEMORRHAGE", "count": 4 },
    { "type": "EXUDATE", "count": 7 },
    { "type": "OTHER", "count": 2 }
  ],
  "uncertainty": {
    "level": "LOW",
    "abstain": false
  },
  "action": {
    "priority": "HIGH",
    "recommendation": "Specialist ophthalmology referral within 2-4 weeks."
  },
  "visualizations": {
    "segmentationMaskPath": null,
    "gradcamPath": null
  }
}
```

### Transitioning to Future Real AI Model
To integrate a real Python/PyTorch AI service later:
1. Implement `RealModelAdapter` satisfying `ModelAdapter` that calls the Python microservice over HTTP/gRPC.
2. Inject `RealModelAdapter` into `modelService.setAdapter(new RealModelAdapter())`.
3. **No frontend or database schema changes required.**

---

## 6. Complete REST API Specification

All successful responses follow the envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional description",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

All error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### Summary of Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Service health check |
| `POST` | `/api/auth/register` | No | Register new user account |
| `POST` | `/api/auth/login` | No | Login with email & password, returns JWT |
| `GET` | `/api/auth/me` | Yes (Bearer) | Get authenticated user profile |
| `POST` | `/api/patients` | Yes (Bearer) | Register a new patient |
| `GET` | `/api/patients` | Yes (Bearer) | Search & list paginated patients |
| `GET` | `/api/patients/:id` | Yes (Bearer) | Get patient details & screening history |
| `PATCH` | `/api/patients/:id` | Yes (Bearer) | Update patient details |
| `POST` | `/api/screenings` | Yes (Bearer) | Upload retinal fundus scan (multipart/form-data) |
| `GET` | `/api/screenings` | Yes (Bearer) | List screenings with status & priority filters |
| `GET` | `/api/screenings/:id` | Yes (Bearer) | Get individual screening details |
| `POST` | `/api/screenings/:id/analyze`| Yes (Bearer) | Trigger AI screening analysis |
| `GET` | `/api/screenings/:id/result` | Yes (Bearer) | Full UI-mapped screening result view |
| `GET` | `/api/queue` | Yes (Bearer) | Clinical queue for specialist triage |
| `POST` | `/api/screenings/:id/review` | Yes (Specialist/Admin)| Submit specialist review decision |
| `GET` | `/api/reports/:screeningId` | Yes (Bearer) | Consolidated report data compilation |

---

## 7. Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm
- Docker (optional for PostgreSQL container) or a local PostgreSQL instance

### 1. Installation
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` based on `.env.example`:
```bash
cp .env.example .env
```

### 3. Start Local PostgreSQL (via Docker)
```bash
docker compose up -d
```

### 4. Run Prisma Migrations & Seed Data
```bash
# Push schema to PostgreSQL
npx prisma db push

# Or run migrations
npm run prisma:migrate

# Seed the database with synthetic clinical test data
npm run prisma:seed
```

### 5. Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@retinascope.health` | `Password123!` |
| **Specialist** | `specialist@retinascope.health` | `Password123!` |
| **Operator** | `operator@retinascope.health` | `Password123!` |

### 6. Running the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### 7. Running Tests & Code Quality
```bash
# Run unit & integration test suite
npm test

# Run ESLint
npm run lint

# Build TypeScript
npm run build
```

---

## 8. Git Milestones (Completed in Milestone 2)
- `feat: initialize express backend`
- `feat: add postgres prisma schema`
- `feat: add authentication`
- `feat: add patient APIs`
- `feat: add screening upload API`
- `feat: add mock AI adapter`
- `feat: add screening analysis API`
- `feat: add specialist review API`
- `test: add backend API tests`
- `docs: add backend setup documentation`
