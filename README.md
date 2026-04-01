# MediLink Server

A comprehensive healthcare management backend system for managing patients, doctors, appointments, prescriptions, payments, and medical reports.

**Built with**: Node.js • Express • TypeScript • PostgreSQL • Prisma • Stripe • Cloudinary

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Contributing](#contributing)

## Features

- **Multi-Role User System**: Patients, Doctors, Admins, Super Admins
- **Appointment Management**: Booking, scheduling, and status tracking
- **Medical Records**: Prescriptions, medical reports, patient health data
- **Payment Processing**: Stripe integration with webhook handling
- **Doctor Reviews & Ratings**: Patient feedback system
- **Email Notifications**: Appointment confirmations, OTP, alerts
- **File Management**: Cloudinary cloud storage integration
- **OAuth Integration**: Google sign-up/login
- **Type-Safe**: Full TypeScript with Zod validation
- **Error Handling**: Custom error classes and global middleware

## Quick Start

```bash
# Install dependencies
npm install

# Set up .env file (copy from .env.example)
# Required: DATABASE_URL, JWT secrets, API keys for Stripe, Cloudinary, Google OAuth

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

**Available Commands**:

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run studio` - Open Prisma Studio
- `npm run generate` - Generate Prisma Client

## Tech Stack

| Category       | Technologies                   |
| -------------- | ------------------------------ |
| **Core**       | Node.js, Express, TypeScript   |
| **Database**   | PostgreSQL, Prisma ORM         |
| **Auth**       | Better Auth, JWT, Google OAuth |
| **Payments**   | Stripe                         |
| **Storage**    | Cloudinary, Multer             |
| **Documents**  | PDFKit, EJS                    |
| **Validation** | Zod                            |
| **Email**      | Nodemailer                     |
| **Tasks**      | node-cron                      |
| **Dev**        | ESLint, tsx                    |

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Server entry point
└── app/
    ├── config/                     # Config files (env, auth, storage)
    ├── errorHelpers/               # Error handling utilities
    ├── lib/                        # Auth and Prisma instances
    ├── middlewares/                # Global middlewares
    ├── modules/                    # Feature modules (13 modules)
    │   ├── admin, appointment, auth, doctor, doctorSchedule
    │   ├── patient, payment, prescription, review
    │   ├── schedule, specialty, statistics, user
    ├── routers/                    # API routes
    ├── templates/                  # EJS email templates
    ├── types/                      # TypeScript definitions
    └── utils/                      # Helper functions

prisma/
├── schema/                         # Modular schema files
└── migrations/                     # Migration history
```

## API Endpoints

All endpoints (except auth) require JWT or session authentication.

| Module             | Endpoint                                   | Purpose                        |
| ------------------ | ------------------------------------------ | ------------------------------ |
| **Auth**           | `/api/auth`                                | Login, registration, OAuth     |
| **Specialties**    | `/api/specialties`                         | Medical specialties            |
| **Patients**       | `/api/patients`                            | Patient profiles & health data |
| **Doctors**        | `/api/doctors`                             | Doctor profiles & info         |
| **Appointments**   | `/api/appointments`                        | Book & manage appointments     |
| **Schedules**      | `/api/schedules` & `/api/doctor-schedules` | Availability management        |
| **Payments**       | `/api/payments`                            | Process payments               |
| **Prescriptions**  | `/api/prescriptions`                       | Manage prescriptions           |
| **Reviews**        | `/api/reviews`                             | Doctor ratings & reviews       |
| **Statistics**     | `/api/statistics`                          | System analytics               |
| **Users & Admins** | `/api/users`, `/api/admins`                | User management                |

**Webhooks**:

- `POST /webhook` - Stripe payment events

## Development

### Code Quality

- **Linting**: ESLint with TypeScript
- **Type Safety**: Strict TypeScript configuration
- **Validation**: Zod for request validation
- **Error Handling**: Custom `AppError` class, global error middleware
- **Async Operations**: Use `asyncHandler` utility for route handlers

### Database Migrations

```bash
# After modifying schema.prisma
npm run migrate -- --name migration_name

# View database with Prisma Studio
npm run studio
```

### Environment Variables

Configure in `.env` file (see `.env.example`):

- Database URL
- JWT secrets
- API keys: Stripe, Cloudinary, Google OAuth
- Email SMTP credentials
- Frontend & auth URLs
- Super admin credentials

## Contributing

Feel free to open issues or PRs for improvements, bug fixes, or new features!
