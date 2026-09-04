# 🌿 MitraCare (SIH 26003) — AI-Powered Cognitive Care & Memory Companion Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Jaswanth-Reddy-2006/Yaad.git)
[![React Native](https://img.shields.io/badge/React_Native-Expo_v57-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14.2_App_Router-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110_Async-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![SQLite](https://img.shields.io/badge/Offline_Cache-SQLite_Sync-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)

**MitraCare** is an integrated, multi-lens digital cognitive care platform designed for elderly individuals experiencing cognitive decline or early-stage dementia, their primary caregivers, and attending clinicians. Built around **SIH 26003 problem understanding guidelines**, MitraCare bridges daily home-based cognitive exercises with real-time caregiver oversight and longitudinal medical telemetry.

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Multi-Lens Ecosystem Architecture](#2-multi-lens-ecosystem-architecture)
3. [Core Capabilities by User Role](#3-core-capabilities-by-user-role)
   - 📱 [Patient Mobile Application](#-patient-mobile-application)
   - 🛡️ [Caregiver Mobile & Web Workspace](#-caregiver-mobile--web-workspace)
   - 🩺 [Doctor & Clinician Longitudinal Portal](#-doctor--clinician-longitudinal-portal)
   - ⚙️ [Platform Administration & Audit Portal](#-platform-administration--audit-portal)
4. [Production Cognitive Games Engine](#4-production-cognitive-games-engine)
5. [Personal Memory Companion Engine](#5-personal-memory-companion-engine)
6. [Offline-First Resilience & Idempotent Sync](#6-offline-first-resilience--idempotent-sync)
7. [System Architecture Diagram](#7-system-architecture-diagram)
8. [Repository Directory Structure](#8-repository-directory-structure)
9. [Getting Started & Setup Guide](#9-getting-started--setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone Repository](#step-1-clone-repository)
   - [Step 2: Backend Setup (FastAPI + Neon DB)](#step-2-backend-setup-fastapi--neon-db)
   - [Step 3: Web App Setup (Next.js 14)](#step-3-web-app-setup-nextjs-14)
   - [Step 4: Mobile App Setup (Expo / React Native)](#step-4-mobile-app-setup-expo--react-native)
10. [Automated Verification & Quality Assurance](#10-automated-verification--quality-assurance)
11. [Ethical Boundaries & Non-Diagnostic Compliance](#11-ethical-boundaries--non-diagnostic-compliance)

---

## 1. Executive Summary & Problem Statement

Cognitive decline affects over 55 million individuals worldwide. Managing dementia requires consistent routine enforcement, objective tracking of cognitive performance trends, and constant communication between family members and doctors. Current solutions suffer from fragmented apps, static dummy interfaces, diagnostic overreach, and complex navigation that confuses elderly users.

### The MitraCare Solution:
* **Single Identity Architecture**: The backend (`FastAPI + Neon PostgreSQL`) is the authoritative source of truth. Frontends (Mobile & Web) are stateful lenses viewing patient data.
* **Zero-Learning Elder Interface**: Large touch targets ($\ge 56\text{px}$), high-contrast accessibility themes, intent-driven voice interaction, and clean 4-card navigation.
* **Database-Driven Caregiver Workspace**: Active-Patient context architecture (`Caregiver Account` $\rightarrow$ `Connected Patients` $\rightarrow$ `One Active Patient at a time`).
* **Longitudinal Telemetry for Clinicians**: 7-day, 30-day, and 90-day time-series analytics tracking domain-specific accuracy (Memory, Attention, Recognition, Recall) without diagnostic labels.
* **100% Vector Icon System**: Zero user-facing emojis anywhere across the platform, using semantic Lucide icons exclusively.

---

## 2. Multi-Lens Ecosystem Architecture

```text
                                  ┌──────────────────────────────────────────┐
                                  │           MitraCare Ecosystem            │
                                  └────────────────────┬─────────────────────┘
                                                       │
         ┌──────────────────────────────┬──────────────┴───────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
  📱 Patient Mobile              🛡️ Caregiver Workspace         🩺 Doctor Portal              ⚙️ Admin Operations
  (Expo / React Native)          (Mobile & Next.js Web)        (Next.js Web Portal)           (Next.js Web Portal)
  ├── 4-Card Primary UI          ├── Active Patient Context    ├── 7D / 30D / 90D Analytics   ├── User RBAC Control
  ├── Elder Accessibility        ├── Reminder Escalation       ├── Domain Performance Breakdown├── System Health Audit
  ├── Intent Voice Engine        ├── Alert Monitor & SOS       ├── Patient Trend Analysis     ├── Connection Logs
  └── Local SQLite Cache         └── Care Plan Management      └── Clinical Report Export     └── Activity Audit
```

---

## 3. Core Capabilities by User Role

### 📱 Patient Mobile Application
* **4-Card Primary Menu**: Instant access to `Play Game`, `Recall Memory`, `Day Schedule`, and `Reminders`.
* **Voice-First Intent Engine**: Natural language voice query parser mapping speech to 5 known intents:
  1. `WHAT_TO_DO_NOW` ("What should I do now?")
  2. `NEXT_REMINDER` ("When is my medicine?")
  3. `TODAY_PLAN` ("What is my plan today?")
  4. `HELP_SOS` ("Emergency help")
  5. `REPEAT` ("Repeat that")
* **Adaptive Difficulty**: Automatic pacing adjustment based on accuracy ($\ge 85\%$ levels up, $<60\%$ levels down).

### 🛡️ Caregiver Mobile & Web Workspace
* **Active Patient Context Switcher**: Seamlessly toggle between multiple linked family members while strictly isolating patient data.
* **Reminder Creation & Escalation**: Schedule medications and activities. Supports automatic status escalation: `DUE` $\rightarrow$ `UNACKNOWLEDGED` (after 15 min) $\rightarrow$ `ESCALATED` (triggers critical caregiver notification).
* **QR & Code Pairing**: Secure 6-character connection code or cryptographic QR payload token.

### 🩺 Doctor & Clinician Longitudinal Portal
* **Longitudinal Time Filters**: View 7-day, 30-day, and 90-day trend lines for patient accuracy, active days, and reminder adherence.
* **Cognitive Domain Analysis**: Aggregated performance metrics broken down by domain (Memory, Attention, Recognition, Recall).
* **Clinical Activity Reports**: Non-diagnostic behavioral summaries formatted for medical review.

### ⚙️ Platform Administration & Audit Portal
* **Role-Based Access Control (RBAC)**: Backend-authoritative permissions enforcing strict boundary controls between `PATIENT`, `CAREGIVER`, `DOCTOR`, and `ADMIN`.
* **System Operations Audit**: Full visibility into user account provisioning, active connections, database connection pools, and event logs.

---

## 4. Production Cognitive Games Engine

MitraCare includes fully functional, accessible cognitive games designed to stimulate short-term memory and visual recognition without causing fatigue.

| Game | Modes / Difficulty | Core Cognitive Objective | Engine Features |
| :--- | :--- | :--- | :--- |
| **Match the Pair** | Easy (8 cards), Medium (12 cards), Hard (16 cards) | Short-term visual recall & pattern matching | Throttled tap execution, hint solver, deterministic shuffle |
| **Match the Triplet** | Easy (9 cards), Medium (12 cards), Hard (18 cards) | Working memory & visual discrimination | 3-card evaluation state machine, undo prevention |
| **Remember Pictures** | Image recall grids | Association & object recognition | Time-gated pattern memorization & prompt recall |

---

## 5. Personal Memory Companion Engine

Caregivers can upload personalized family memories, routine facts, and high-importance person/place references to preserve identity and assist daily orientation.

* **Personal Memories**: Photo assets, captions, and relationship notes (`FAMILY`, `PERSON`, `PLACE`, `OBJECT`, `EVENT`).
* **Routine Facts**: Key patient preferences and daily facts (e.g., favorite tea, grandchild name, morning walk time).
* **Endpoints**: `/api/v1/memories` and `/api/v1/memories/facts`.

---

## 6. Offline-First Resilience & Idempotent Sync

To ensure uninterrupted usage in rural or low-connectivity environments:

1. **Local SQLite Store**: Patient activity results and reminder completions are written immediately to local SQLite database `offline_sync_queue`.
2. **Background Sync Engine**: `SyncService.ts` batches pending events (`GAME_RESULT`, `REMINDER_COMPLETE`, `PROFILE_UPDATE`) and transmits them to `/api/v1/sync`.
3. **Idempotency Guarantee**: Every payload includes a unique `session_id` or `event_id`. Re-transmissions on spotty networks are handled idempotently by FastAPI and Neon PostgreSQL without creating duplicate records.

---

## 7. System Architecture Diagram

```mermaid
graph TD
    subgraph Mobile Client (React Native + Expo)
        A[Patient / Caregiver Mobile UI] --> B[Zustand Stores & Repositories]
        B --> C[SQLite Local Storage]
        B --> D[SyncService Engine]
    end

    subgraph Web Clients (Next.js 14 App Router)
        E[Caregiver Web Dashboard] --> F[Axios API Client]
        G[Doctor Portal] --> F
        H[Admin Operations] --> F
    end

    subgraph Backend Service (FastAPI)
        D -- "REST API (Bearer JWT)" --> I[FastAPI Gateway]
        F -- "REST API (Bearer JWT)" --> I
        I --> J[RBAC & IDOR Middleware]
        J --> K[API Routers (Auth, Patients, Sync, Caregiver, Doctor, Memory, Admin)]
    end

    subgraph Database Layer
        K --> L[(Neon PostgreSQL Cloud DB)]
    end

    C -- "Idempotent Event Flush" --> D
```

---

## 8. Repository Directory Structure

```text
Yaad/
├── app/                        # Expo Router Mobile Screens
│   ├── (patient)/              # Patient Elder Mode & 4-Card Navigation
│   │   ├── games/              # Cognitive Game Screens (Pair, Triplet, Remember)
│   │   ├── my-day.tsx          # Patient Day Schedule View
│   │   ├── recall-memory.tsx   # Memory Companion View
│   │   ├── reminders.tsx       # Patient Reminders View
│   │   └── index.tsx           # Primary 4-Card Home Screen
│   ├── caregiver/              # Caregiver Mobile Workspace
│   └── auth/                   # Authentication & Onboarding Screens
├── web/                        # Next.js 14 Web Application
│   ├── app/
│   │   ├── caregiver/          # Caregiver Web Dashboard & Reports
│   │   ├── doctor/             # Doctor Portal & Longitudinal Analytics
│   │   ├── admin/              # Platform Operations & Audit
│   │   ├── login/              # Shared Web Auth
│   │   └── page.tsx            # Public Marketing Landing Page
├── backend/                    # FastAPI Backend Service
│   ├── app/
│   │   ├── api/v1/             # REST Endpoints (auth, patients, sync, caregiver, doctor, memory, admin)
│   │   ├── core/               # Security, JWT, Password Hashing, Config
│   │   ├── db/                 # Async SQLAlchemy Session & Neon DB Setup
│   │   ├── models/             # SQLAlchemy ORM Models
│   │   └── schemas/            # Pydantic Request/Response Models
│   └── requirements.txt        # Python Backend Dependencies
├── components/                 # Shared React / React Native UI Components
├── constants/                  # Color Theme, Typography, Radius, Translations
├── repositories/               # SQLite & Local Data Storage Repositories
├── services/                   # Network Services, Auth, Sync Engine, Voice Parser
└── store/                      # Zustand State Management Stores
```

---

## 9. Getting Started & Setup Guide

### Prerequisites
* **Node.js**: `v18.x` or `v20.x`
* **npm**: `v9.x` or higher
* **Python**: `v3.10` or higher (Python 3.13 recommended)
* **Expo Go / Emulator**: Expo Go app on mobile or Android Studio / Xcode emulator.

---

### Step 1: Clone Repository

```bash
git clone https://github.com/Jaswanth-Reddy-2006/Yaad.git
cd Yaad
```

---

### Step 2: Backend Setup (FastAPI + Neon DB)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   py -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (create `.env` in `backend/`):
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@ep-sample-12345.neon.tech/neondb?sslmode=require
   SECRET_KEY=your_super_secret_jwt_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   ```

5. Run local uvicorn development server:
   ```bash
   py -m uvicorn app.main:app --reload --port 8000
   ```
   * *Backend API Docs available at:* `http://127.0.0.1:8000/docs`

---

### Step 3: Web App Setup (Next.js 14)

1. Open a new terminal and navigate to `web/`:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Next.js development server:
   ```bash
   npm run dev
   ```
   * *Web Portals available at:* `http://localhost:3000`
   * *Landing Page:* `http://localhost:3000`
   * *Caregiver Web:* `http://localhost:3000/caregiver/dashboard`
   * *Doctor Portal:* `http://localhost:3000/doctor/dashboard`
   * *Admin Operations:* `http://localhost:3000/admin/dashboard`

---

### Step 4: Mobile App Setup (Expo / React Native)

1. Open a new terminal in the project root directory:
   ```bash
   cd Yaad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Expo development server:
   ```bash
   npx expo start
   ```
   * Press `w` to open web preview.
   * Scan QR code with **Expo Go** app on Android/iOS.
   * Press `a` to run on Android Emulator.

---

## 10. Automated Verification & Quality Assurance

Run complete automated static checks, type safety, unit tests, and production builds across the stack:

```bash
# 1. Check Mobile TypeScript compilation (0 errors)
npx tsc --noEmit

# 2. Run Cognitive Game Engine Unit Tests (10/10 passed)
npx jest --passWithNoTests

# 3. Check Web Production Build (20/20 routes rendered)
cd web && npm run build && cd ..

# 4. Check Backend Python Compilation (31 modules verified)
py -c "import glob, py_compile; [py_compile.compile(f, doraise=True) for f in glob.glob('backend/app/**/*.py', recursive=True)]; print('Backend compilation successful.')"
```

---

## 11. Ethical Boundaries & Non-Diagnostic Compliance

> [!IMPORTANT]
> **Clinical Notice**: MitraCare tracks objective behavioral activity engagement, completion consistency, and interaction response speed. **MitraCare does not generate automated medical diagnoses, dementia severity scores, or diagnostic labels.** All insights presented to caregivers and doctors reflect observed application usage data to assist clinical evaluation by qualified healthcare professionals.

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 26003)**. Built with care for elderly individuals, caregivers, and clinicians.
