# 👁️ RetinaScope

> **Explainable AI-Assisted Diabetic Retinopathy (DR) Screening & Clinical Decision Support Platform**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v15.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.5-informational.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue.svg)](https://www.postgresql.org/)

---

## 📌 Overview

**RetinaScope** is a full-stack clinical decision support platform designed to streamline diabetic retinopathy screening, triage high-risk patients, visualize explainable AI lesions/GradCAM heatmaps, and empower specialists with interactive review and validation workflows.

### 🌟 Key Capabilities

- 🔍 **Automated Retinal Image Screening**: Rapid multi-scale assessment for Diabetic Retinopathy (DR Grade 0–4: *No DR, Mild, Moderate, Severe, Proliferative*) and Diabetic Macular Edema (DME) risk.
- 🔬 **Explainable AI (XAI)**: Lesion quantification (microaneurysms, hemorrhages, hard/soft exudates) with heatmaps and segmentation mask overlays.
- 🏥 **Clinical Triage & Specialist Queue**: Prioritization matrix (Critical, High, Medium, Low) for ophthalmologist validation and second-look review.
- 🧑‍⚕️ **Patient Management**: Centralized patient profiles, fundus scan archives, longitudinal screening histories, and automated referral suggestions.
- 📄 **Diagnostic Reports & Audit Trails**: Complete diagnostic summaries with specialist notes, decision tracking (`AGREE`, `MODIFY`, `REJECT`), and structured export data.

---

## 🏗️ Architecture & Technology Stack

```
                                  RetinaScope Monorepo
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
       Frontend (Next.js)                                        Backend (Express.js)
 ┌───────────────────────────┐                             ┌───────────────────────────┐
 │ • Next.js 15 (App Router) │                             │ • Node.js & Express (TS)  │
 │ • React 19 & TypeScript   │   REST APIs / Multipart     │ • Prisma ORM & PostgreSQL │
 │ • Tailwind CSS & Radix UI │ ◄─────────────────────────► │ • JWT & Role-Based Auth   │
 │ • Zustand (State Mgmt)    │                             │ • Multer Scan Pipeline    │
 │ • Lucide React Icons      │                             │ • Mock AI Adapter Pattern │
 └───────────────────────────┘                             └───────────────────────────┘
```

| Component | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, Zustand | Responsive clinician and operator dashboards, image viewers, triage lists, and interactive diagnostic consoles. |
| **Backend** | Express.js, TypeScript, Zod, Multer, bcryptjs, jsonwebtoken | RESTful API service for authentication, patient records, multipart image uploads, screening analysis, and triage queues. |
| **Database** | PostgreSQL 16, Prisma ORM | Relational models for users, patients, screenings, AI results, lesions, and specialist reviews. |
| **AI Inference** | Adapter Architecture (`ModelAdapter`) | Decoupled inference contract enabling seamless transitions between mock synthetic generators and production deep-learning microservices. |

---

## 📂 Project Structure

```
Retina-Scope/
├── Frontend/                      # Next.js frontend application
│   ├── app/                       # Next.js App Router (pages, layouts, routes)
│   ├── components/                # Reusable UI & clinical components
│   ├── lib/                       # Utility functions & helpers
│   ├── services/                  # Frontend API client services
│   ├── stores/                    # Zustand state management
│   ├── types/                     # Shared TypeScript frontend definitions
│   └── package.json
│
├── backend/                       # Express REST API backend
│   ├── src/
│   │   ├── controllers/           # Auth, Patient, Screening, Queue, Review, Report
│   │   ├── middleware/            # Auth JWT, Multer Upload, Error Handling
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Business logic & AI model adapters
│   │   ├── schemas/               # Zod validation schemas
│   │   ├── types/                 # Backend TypeScript contracts
│   │   └── server.ts              # Express application entry point
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.ts                # Test dataset seed script
│   ├── tests/                     # Jest & Supertest automated test suite
│   ├── docker-compose.yml         # Local PostgreSQL container definition
│   └── package.json
│
├── .gitignore                     # Global Git ignore rules
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher
- **Docker** *(optional, for running local PostgreSQL)*

---

### 1️⃣ Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start PostgreSQL (via Docker or your local PostgreSQL service):
   ```bash
   docker compose up -d
   ```

5. Run database migrations & seed test dataset:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`.*

---

### 2️⃣ Setting up the Frontend

1. Navigate to the Frontend directory:
   ```bash
   cd ../Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Frontend opens on `http://localhost:3000`.*

---

## 🔑 Default Test Credentials

Seeded test accounts are ready for testing with different access permissions:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@retinascope.health` | `Password123!` | System administration & user management |
| **Specialist** | `specialist@retinascope.health` | `Password123!` | Clinical triage, diagnostic review, and report sign-off |
| **Screening Operator** | `operator@retinascope.health` | `Password123!` | Patient intake, fundus scan upload, and AI pipeline execution |

---

## 📡 Core API Endpoints

| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user and obtain JWT token |
| `GET` | `/api/auth/me` | Bearer Token | Fetch authenticated user profile |
| `POST` | `/api/patients` | Bearer Token | Register a new patient |
| `GET` | `/api/patients` | Bearer Token | Search and list paginated patients |
| `POST` | `/api/screenings` | Bearer Token | Upload fundus scan (`multipart/form-data`) |
| `POST` | `/api/screenings/:id/analyze` | Bearer Token | Trigger automated AI screening analysis |
| `GET` | `/api/screenings/:id/result` | Bearer Token | Fetch structured AI diagnostic result & lesion map |
| `GET` | `/api/queue` | Bearer Token | Access prioritized clinical review queue |
| `POST` | `/api/screenings/:id/review` | Specialist / Admin | Submit specialist clinical validation review |
| `GET` | `/api/reports/:screeningId` | Bearer Token | Fetch consolidated diagnostic report dataset |

---

## 🧪 Testing & Code Quality

Run tests across the project:

```bash
# Backend unit & integration test suite
cd backend
npm test

# Linting
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License.
