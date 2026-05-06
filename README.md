# 🏥 MediLink Server

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-008CD1?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-FF4500?style=for-the-badge&logo=auth0&logoColor=white)](https://better-auth.com/)

A enterprise-grade, highly scalable, and modular healthcare backend system designed to power **MediLink**. It handles multi-role authentication, appointment scheduling, doctor availability, real-time medical report generation, Stripe payments, and patient medical files.

---

## 🌐 Live Deployments

- **Frontend Client:** [https://medilink-client-neon.vercel.app](https://medilink-client-neon.vercel.app)
- **Backend API Server:** [https://medilink-server-tau.vercel.app](https://medilink-server-tau.vercel.app)

---

## 📖 Table of Contents

- [🌐 Live Deployments](#-live-deployments)
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📐 Architecture & Core Patterns](#-architecture--core-patterns)
- [📂 Project Structure](#-project-structure)
- [📦 Database Schema (Prisma)](#-database-schema-prisma)
- [📡 API Endpoints Reference](#-api-endpoints-reference)
- [⚡ Quick Start & Setup](#-quick-start--setup)
- [🔧 Environment Variables Configuration](#-environment-variables-configuration)
- [🐳 Production & Scripts](#-production--scripts)

---

## 🚀 Key Features

*   **👥 Multi-Role Authorization System:** Custom authorization, middleware controls, and resource protections tailored for **Patients**, **Doctors**, **Admins**, and **Super Admins**.
*   **📅 Appointment Management & Schedulers:** Seamless flow for scheduling appointments, doctor slot booking, and automated status transitions using `node-cron`.
*   **💳 Secure Payment Processing:** Stripe Checkout API integration with robust webhook handlers verifying signatures and updating payment statuses in real-time.
*   **📝 Electronic Health Records (EHR):** Full-fledged doctor prescription writer, medical report uploads, and digital patient health questionnaires.
*   **🛡️ Strong Type Safety & Payload Validation:** 100% written in TypeScript with runtime payload filtering and validation using **Zod**.
*   **☁️ Cloud File Storage:** Secure document and image uploads directly processed with `Multer` and hosted on `Cloudinary`.
*   **📄 Document Generation:** On-the-fly generation of clean PDF files (such as prescription documents) using `PDFKit` with beautiful EJS styling templates.
*   **🔐 Auth & Identity Management:** Modern session/token authentication with `Better Auth`, including support for Google OAuth, password reset flows, and OTP-based email verification.
*   **📧 Email Notifications:** Automated, responsive email dispatches via `Nodemailer` for OTP validation, registration confirmations, and appointment reminders.

---

## 🛠️ Tech Stack

### Backend Core
*   **Express 5 (ES Modules):** Next-gen Express framework featuring native async/await error catching.
*   **TypeScript:** Strict compilation configs for compile-time type-safety.
*   **TSX:** Advanced watch runner for zero-lag TypeScript hot-reloading.

### Database & ORM
*   **PostgreSQL:** Relational data store for optimal transactional reliability.
*   **Prisma ORM:** Modular multi-file schema management with automated migrations and a type-safe query client.

### Services & Integrations
*   **Better Auth:** State-of-the-art authentication system with built-in support for social OAuth.
*   **Stripe SDK:** Automated secure payment collection and webhooks.
*   **Cloudinary:** Image and medical record PDF management.
*   **PDFKit & EJS:** High-performance dynamic PDF report and prescription creator.
*   **Nodemailer:** Custom SMTP mailing client with responsive EJS layouts.

---

## 📐 Architecture & Core Patterns

MediLink Server employs an advanced modular system designed to keep feature code unified, clean, and extremely easy to scale.

### 1. Unified Feature Modules (`src/app/modules`)
Unlike generic MVC frameworks that split files across global folders, MediLink bundles features into self-contained directory modules. A typical module includes:
-   `*.router.ts` — Exposes API paths and ties validation middlewares.
-   `*.controller.ts` — Handles HTTP requests, parses query parameters, and executes responses.
-   `*.service.ts` — Houses core business logic, DB queries, third-party calls, and transactions.
-   `*.schema.ts` — Defines Zod schemas for input validation.
-   `*.types.ts` — Dedicated TypeScript interfaces.
-   `*.constants.ts` — Magic numbers, defaults, and static settings.

### 2. Global Request Validation
Every POST/PUT request is piped through a global validation middleware utilizing **Zod** schema structures. This prevents dirty or malicious data from reaching the services or the database.

### 3. Graceful Error Handling
We implement a custom `AppError` class derived from the standard `Error` object alongside an `asyncHandler` wrapper to eliminate `try/catch` boilerplate. Unhandled errors are caught globally in the `globalErrorHandler` middleware, which logs errors properly and returns formatted responses.

---

## 📂 Project Structure

```
medilink-server/
├── prisma/
│   ├── schema/                      # Modular .prisma schema files
│   └── migrations/                  # Automated SQL migration history
├── src/
│   ├── app.ts                       # Express application configuration
│   ├── server.ts                    # Server entry point (binds ports, database)
│   └── app/
│       ├── config/                  # Server configuration (Stripe, Cloudinary, Env)
│       ├── errorHelpers/            # Error handling classes and utilities
│       ├── lib/                     # Better Auth instances and Prisma Client initiation
│       ├── middlewares/             # Global middlewares (Auth, Guards, Global Error Handler)
│       ├── routers/                 # Aggregated API route builder
│       ├── templates/               # EJS templates for responsive emails
│       ├── types/                   # App-wide TypeScript definitions
│       ├── utils/                   # Shared utility helpers (asyncHandler, PDF generator, etc.)
│       └── modules/                 # Self-contained feature modules (13 modules)
│           ├── admin/               # Administrative controls
│           ├── appointment/         # Booking and scheduling
│           ├── auth/                # Sign-up, Sign-in, OAuth, OTP
│           ├── doctor/              # Profiles, specialties, ratings
│           ├── doctorSchedule/      # Availability configurations
│           ├── patient/             # Patient profiles and health tracking
│           ├── payment/             # Stripe checkout, invoicing, webhooks
│           ├── prescription/        # Prescription generation and PDF downloads
│           ├── review/              # Rating and feedback management
│           ├── schedule/            # Central master calendar schedules
│           ├── specialty/           # Medical categories
│           ├── statistics/          # System dashboards and KPIs
│           └── user/                # Master user accounts
```

---

## 📦 Database Schema (Prisma)

MediLink leverages Prisma's **modular schema feature**, dividing data models into clear, manageable files inside `prisma/schema/`:

-   `schema.prisma`: Configures the PostgreSQL datasource, client generator, and enables `prismaSchemaFolder`.
-   `enums.prisma`: Contains database-level enums (e.g., `UserStatus`, `AppointmentStatus`, `Gender`).
-   `auth.prisma`: Manages OAuth accounts, user sessions, verification tokens.
-   `user.prisma`, `doctor.prisma`, `patient.prisma`, `admin.prisma`: Handles core profiles.
-   `patientHealthData.prisma`: Records chronic illnesses, allergies, height, weight, and blood group.
-   `appointment.prisma`, `schedule.prisma`: Implements doctor shifts and patient bookings.
-   `prescription.prisma`, `medicalReport.prisma`: Logs medical scripts, treatments, and PDFs.
-   `payment.prisma`: Stores Stripe transaction data, amounts, and invoicing states.
-   `review.prisma`: Houses rating score (1-5) and feedback details.

---

## 📡 API Endpoints Reference

All endpoints (except auth and public resources) require a valid authentication session or JWT.

| Method | Endpoint | Purpose | Access Control |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/signup` | Register a new user | Public |
| **POST** | `/api/v1/auth/login` | Log in and get session | Public |
| **GET** | `/api/v1/specialties` | Fetch medical categories | Public |
| **GET** | `/api/v1/doctors` | Query and filter doctors list | Public |
| **GET** | `/api/v1/patients/profile` | Get logged-in patient details | Patient |
| **POST** | `/api/v1/appointments/book` | Book a doctor availability slot | Patient |
| **POST** | `/api/v1/payments/checkout` | Initialize Stripe checkout session | Patient |
| **GET** | `/api/v1/doctor-schedules` | Manage slots and working hours | Doctor |
| **POST** | `/api/v1/prescriptions` | Issue new patient prescription | Doctor |
| **POST** | `/api/v1/reviews` | Create feedback and rating | Patient |
| **GET** | `/api/v1/statistics` | Retrieve system-wide statistics | Admin / Super Admin |
| **POST** | `/webhook` | Stripe Payment Event Webhook | Stripe Webhook Signer |

---

## ⚡ Quick Start & Setup

### Prerequisites
-   **Node.js** (v18.0.0 or higher)
-   **PostgreSQL** (running locally or in the cloud)
-   **npm** or **bun** package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill out your specific credentials:
```bash
cp .env.example .env
```

### 3. Database Migration
Ensure PostgreSQL is running, then execute Prisma migrations to create tables:
```bash
npm run migrate
```

### 4. Seed Master Data (Optional)
Generate the Prisma Client types:
```bash
npm run generate
```

### 5. Launch Development Server
```bash
npm run dev
```
The server will boot up with hot-reloading active at `http://localhost:5000`.

---

## 🔧 Environment Variables Configuration

To set up the server environment variables, copy the [.env.example](file:///w:/personal-projects/medilink/medilink-server/.env.example) file as a baseline for your `.env` file.

Ensure your `.env` contains the following critical keys:

```ini
# Core Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/medilink?schema=public"

# Better Auth Configuration
BETTER_AUTH_SECRET=your_super_secret_session_key
BETTER_AUTH_URL=http://localhost:5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Dispatcher SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## 🐳 Production & Scripts

The following commands are available for maintenance, testing, and deployments:

-   `npm run dev`: Boots the local environment using `tsx` watch on `server.ts`.
-   `npm run build`: Compiles production ES modules into `dist/` and resolves aliases.
-   `npm start`: Launches the compiled JS server.
-   `npm run lint`: Scans and ensures strict code formatting with ESLint.
-   `npm run studio`: Launches interactive web UI to view and edit database rows.
-   `npm run stripe:webhook`: Proxies real Stripe payment requests to local webhook endpoints.

---

Developed with ❤️ for **MediLink**. License: ISC.
