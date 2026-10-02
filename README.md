# Destination Cafe — Enterprise CRM & Lead Management Platform

An enterprise-grade SaaS CRM and Lead Management System built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, **Auth.js (NextAuth.js)**, and **Recharts**.

---

## 📌 Executive Overview

**Destination Cafe CRM** provides B2B sales teams and business analysts with an automated platform to manage company lead pipelines, audit data completeness, calculate dynamic lead priority scores, track contact activities, manage tasks/follow-ups, and convert won opportunities into active client projects.

The platform was designed with strict enterprise UI/UX standards—featuring clean near-white surfaces, crisp navy typography, subtle borders, responsive mobile drawer navigation, comprehensive RBAC authorization, and automated security audit logging.

---

## 🎯 Business Problem

B2B lead acquisition pipelines often suffer from:
1. **Unstructured Data & Discrepancies**: Raw intake records frequently contain missing key contact details (e.g., null phone/email, unverified websites) or discrepancies between manually recorded lead scores and algorithmic evaluations.
2. **Inconsistent Scoring**: Subjective score evaluation without standard dimensional criteria (e.g., Digital Presence, Hiring Activity, Tech Stack Fit, Funding/Revenue, Project Urgency, Budget Clarity).
3. **Siloed Follow-ups & Activities**: Lack of cross-team visibility into call logs, email threads, meeting notes, tasks, opportunities, and client deliverables.
4. **Compliance & Audit Blindspots**: Absence of security audit trails tracking who created, updated, or re-scored lead records across organizational roles.

---

## 🚀 The Solution

Destination Cafe CRM addresses these problems through:
- **Exact 26-Field Intake Schema & Data Quality Engine**: Automatic detection of missing key attributes, invalid emails/phones, duplicate records, and score discrepancies.
- **Dual Lead Scoring Engine**: Calculates score dynamically (\(0\text{--}30\)) across 6 explicit 0–5 dimensional metrics while tracking recorded scores and flagging discrepancies.
- **Visual Drag-and-Drop Pipeline Kanban**: Interactive sales stage progression tracking (`NEW` \(\rightarrow\) `CONTACTED` \(\rightarrow\) `QUALIFIED` \(\rightarrow\) `PROPOSAL` \(\rightarrow\) `NEGOTIATION` \(\rightarrow\) `WON` / `LOST`).
- **Comprehensive Operations Hub**: Dedicated modules for Contacts, Activity Timelines, Tasks & Follow-ups, Financial Opportunities, and Project Execution.
- **Enterprise RBAC & Security Audit Trail**: Role-based access control (`ADMIN`, `MANAGER`, `SALES`, `ANALYST`, `VIEWER`) and immutable audit logs capturing User, Action, Entity, Entity ID, Old Value, New Value, and Timestamp.
- **Analytics & Data Quality Dashboards**: Interactive executive overview, lead acquisition trends, pipeline distributions, and system completeness audits using Recharts.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16.3.8 (App Router & Server Actions)
- **Language**: TypeScript 5 (Strict Mode)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM 6.4.0
- **Authentication & RBAC**: Auth.js / NextAuth 4.24
- **State & Form Management**: React Hook Form 7 & Zod 3
- **Visualization**: Recharts 3.10
- **Styling**: Tailwind CSS 4 & Lucide React Icons

---

## 🏗 Architecture & Application Structure

```text
Destination Cafe/
├── prisma/
│   ├── schema.prisma            # PostgreSQL Database Schema
│   ├── seed.ts                  # Idempotent database seed (Roles, Users, Leads, Opportunities)
│   └── migrations/              # Prisma SQL migration history
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # Login page & Auth flow
│   │   ├── (dashboard)/         # Main authenticated App Shell
│   │   │   ├── overview/        # Executive CRM Dashboard
│   │   │   ├── leads/           # Lead Management & Detail (/leads & /leads/[id])
│   │   │   ├── pipeline/        # Drag-and-drop Kanban Board
│   │   │   ├── contacts/        # B2B Contact Directory
│   │   │   ├── crm/activities/  # Activity Log Timeline
│   │   │   ├── tasks/           # Task Management & Follow-ups
│   │   │   ├── opportunities/   # Deal Pipeline & Conversion
│   │   │   ├── projects/        # Active Client Project Tracker
│   │   │   ├── analytics/       # Analytics (/overview, /leads, /data-quality)
│   │   │   ├── data/import/     # CSV File Import Workflow
│   │   │   └── admin/           # Users, Roles, Audit Logs, Settings
│   │   └── api/auth/            # NextAuth API Handler
│   ├── components/              # Modular UI Components (Forms, Tables, Charts, Navigation)
│   ├── lib/
│   │   ├── actions/             # Server Actions (Leads, Pipeline, Tasks, Projects, Audit Logs)
│   │   ├── auth.ts              # Auth.js configuration & RBAC permissions
│   │   ├── data-quality.ts      # Automated Data Quality Validation Engine
│   │   ├── prisma.ts            # Singleton Prisma Client Instance
│   │   └── validations/         # Zod Form & CSV Validation Schemas
│   └── types/                   # Shared TypeScript Types & Interfaces
├── .env.example                 # Environment variables template
├── README.md                    # Platform documentation
└── package.json                 # Dependencies & scripts
```

---

## 🗄 Database Model

The PostgreSQL database (configured via `prisma/schema.prisma`) includes:
- **`Role` & `User`**: User accounts with predefined role privileges (`ADMIN`, `MANAGER`, `SALES`, `ANALYST`, `VIEWER`).
- **`Lead`**: 26-field intake schema store including domain, priority, status, scoring attributes, project allocation status, and user assignment.
- **`LeadScore`**: Historical scoring dimension records for digital presence, hiring activity, tech stack fit, funding/revenue, project urgency, and budget clarity.
- **`Contact`**: Multiple contact persons associated with leads (name, email, phone, designation, notes).
- **`Activity`**: Communication timeline records (calls, emails, meetings, notes, status changes).
- **`Task`**: Assigned action items with due dates and statuses (`TODO`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`).
- **`Opportunity`**: Financial deal tracking across sales stages (`QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`).
- **`Project` & `ProjectMember`**: Project execution workspace linked to Won opportunities and assigned team members.
- **`ImportBatch` & `ImportError`**: Multi-stage CSV import execution logs and validation error records.
- **`AuditLog`**: System-wide security trail tracking changes, previous state, and updated state.

---

## ⚙️ Installation & Environment Setup

### 1. Prerequisites
- Node.js `^20.0.0` or later
- PostgreSQL database running locally (or remote connection URI)

### 2. Environment Variables Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the environment variables:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/destination_cafe?schema=public"
NEXTAUTH_SECRET="super-secret-random-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Destination Cafe CRM"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Apply Database Migrations & Seed Data
```bash
npx prisma migrate dev --name init_crm_schema
npx prisma db seed
```

---

## 🚀 Running Locally

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

The seed script (`npx prisma db seed`) initializes default users across all organizational roles:

| Role | Email | Privileges |
| :--- | :--- | :--- |
| **Admin** | `admin@destinationcafe.com` | Full System Control, Users, Roles & Permissions, Audit Logs, Settings |
| **Manager** | `manager@destinationcafe.com` | Operational Pipeline Oversight, Team Tasks, Audit Logs, Opportunities |
| **Sales** | `sales@destinationcafe.com` | Lead Creation/Editing, Kanban Pipeline, Contacts, Activities, Tasks |
| **Analyst** | `analyst@destinationcafe.com` | Data Quality Engine, Lead Scoring Audits, Analytics, CSV Import |
| **Viewer** | `viewer@destinationcafe.com` | Read-only view of Leads, Dashboard Metrics, and Visualizations |

*(Password is not required in development credentials authentication flow)*

---

## 🧪 Testing & Verification

Run static checks and production builds:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Lint Check
npm run lint

# 3. Prisma Schema Validation
npx prisma validate

# 4. Production Build Verification
npm run build
```

---

## 🚢 Deployment

1. Set production environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
2. Run database migrations: `npx prisma migrate deploy`
3. Build the production application bundle: `npm run build`
4. Start the server: `npm start`

---

## ⚠️ Known Limitations & Context Notes

1. **Destination Cafe Lead Intake Record**:
   - In accordance with raw intake data, the initial **Destination Cafe** lead record contains `null` values for `contactPerson`, `designation`, `phone`, and `email`, and lists website as *"No verified dedicated official website found"*.
   - A **Score Discrepancy** is intentionally registered for Destination Cafe: the intake recorded score is **18/30**, whereas all 6 scoring dimensions are rated `0` (giving a calculated score of **0/30**). The system accurately displays and flags this discrepancy without fabricating missing contact info or artificial performance metrics.
2. **PostgreSQL Database Requirement**: Database operations, audit log insertions, and analytics metrics require a live PostgreSQL database server. Server actions degrade gracefully with error banners if the database connection is offline.
