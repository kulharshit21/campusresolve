# CampusResolve — Smart Campus Complaint & Issue Management System

> **University Final Review Project — November 2026**  
> *A Real-Time, Production-Style Web Platform for University Facilities & Student Issue Resolution*

[![CI](https://github.com/campusresolve/campusresolve/actions/workflows/ci.yml/badge.svg)](https://github.com/campusresolve/campusresolve/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Project Overview

**CampusResolve** is an institutional web application that replaces informal, untracked campus complaints (such as verbal requests or informal messaging groups) with a centralized digital platform. 

- **Students** submit geotagged issues across categories (Wi-Fi, Electrical, Plumbing, Hostel, Classroom), upload photographic evidence, receive a unique tracking identifier (`CR-YYYY-XXXX`), and monitor resolution progress on a step-by-step timeline.
- **Campus Administrators** manage incoming complaints through a real-time management portal with category analytics, dispatch maintenance staff, update ticket statuses, and log official resolution notes.
- **Real-Time Synchronization**: Built with **Supabase Realtime**, status updates push to active student client dashboards instantly via WebSockets without requiring manual page reloads.

---

## 🚀 Key Features

- **Institutional Design**: Clean, accessible UI designed for academic environments using Tailwind CSS and Lucide icons.
- **Dual Role Dashboards**: Separate, protected portals for **Students** and **Administrators**.
- **Automated Tracking Identifiers**: Generates unique ticket codes (e.g., `CR-2026-1001`).
- **Photographic Evidence Upload**: Supports client-side verified image attachments (JPEG, PNG, WebP &le; 5MB).
- **Progress Lifecycle**: Visual 3-stage progress tracking (`Open` &rarr; `In Progress` &rarr; `Resolved`).
- **Database-Enforced Audit Trail**: PostgreSQL triggers automatically log every status transition with changer identity and timestamps into `complaint_status_history`.
- **Row Level Security (RLS)**: Enforces access control directly inside the database engine.
- **Reviewer Persona Quick-Switch**: Instant 1-click toggling between Student and Administrator accounts for panel demonstrations.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6 |
| **Forms & Validation** | Controlled components, Zod, React Hook Form |
| **Data Visualization** | Recharts (Responsive Category Bar Chart & Status Breakdown Pie Chart) |
| **Backend (BaaS)** | Supabase (PostgreSQL 15+, Supabase Auth, Storage, Realtime Engine) |
| **Security** | PostgreSQL Row Level Security (RLS), Database Triggers, Foreign Key Cascades |
| **Testing** | Vitest, React Testing Library, JSDOM |

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd campusresolve
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

*Note: CampusResolve includes built-in development fixtures, allowing full student and admin workflows to be explored immediately.*

### 3. Build & Run Tests
```bash
# Run unit & service tests
npm run test

# Check TypeScript types
npm run typecheck

# Verify ESLint rules
npm run lint

# Build production bundle
npm run build
```

---

## 🎓 Reviewer Demonstration Walkthrough

1. **Open Landing Page**: Navigate to [http://localhost:5173](http://localhost:5173).
2. **Log in as Student**: Click **"Test as Student (Rahul)"** in the top hero banner.
3. **Submit a Complaint**: Click **"Log New Complaint"**, fill out the campus location, select category, attach an image, and submit.
4. **Inspect Generated Ticket**: Note the tracking ID (e.g. `CR-2026-1005`) and view the initial 3-step progress timeline.
5. **Switch to Administrator**: Click the profile icon in the navigation bar and select **"Switch to Admin (Dr. Anita)"**.
6. **Manage Ticket & Transition Status**: Open the Admin Registry table, click **"Update"** on the ticket, change status to **"In Progress"** or **"Resolved"** with an official resolution note.
7. **Verify Real-Time Audit Log**: Inspect the updated timeline and audit history log.

---

## 📂 Repository Structure

```text
campusresolve/
├── .github/workflows/ci.yml       # GitHub Actions Automated CI Pipeline
├── docs/                          # Comprehensive University Documentation
│   ├── ARCHITECTURE.md            # System architecture, data flow & component design
│   ├── DATABASE.md                # PostgreSQL DDL, ERD diagrams & RLS policies
│   ├── DEMO_GUIDE.md              # 3-minute viva walkthrough & 15 viva Q&As
│   ├── PROJECT_REPORT_DRAFT.md    # University report draft format
│   ├── SETUP.md                   # Installation and Supabase setup guide
│   ├── TEAM_CONTRIBUTIONS.md      # Team roster & Google Sheet registration template
│   └── TESTING.md                 # QA test matrix & verification checklist
├── public/                        # Static assets (logo.svg)
├── src/
│   ├── components/                # Reusable UI & business components
│   │   ├── complaints/            # ComplaintCard, StatusTimeline, CommentThread, FilterBar
│   │   ├── dashboard/             # StatCard, AnalyticsCharts (Recharts)
│   │   ├── layout/                # Navbar, Footer, ProtectedRoute
│   │   └── ui/                    # Button, Card, Badge, Input, Select, Textarea, Modal
│   ├── contexts/                  # AuthContext (Auth session & persona switcher)
│   ├── hooks/                     # Custom React hooks (useAuth)
│   ├── integrations/supabase/     # Supabase client SDK initialization
│   ├── lib/                       # Utility functions, constants, formatting
│   ├── pages/                     # Application views (Student, Admin, Auth, Profile)
│   ├── services/                  # complaintService, storageService
│   ├── test/                      # Vitest test suites
│   ├── types/                     # TypeScript data contracts & models
│   ├── App.tsx                    # React Router configuration
│   └── main.tsx                   # Application DOM mount
├── supabase/
│   ├── migrations/                # 20261113000000_init_campusresolve.sql
│   └── seed.sql                   # Sample seed data for testing
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML entrypoint
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS theme tokens
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler & vendor chunking configuration
```

---

## 👥 University Team Information

- **Project Title**: CampusResolve — A Real-Time Smart Campus Complaint and Issue Management System
- **Academic Review Date**: 16 November 2026
- **Team Size**: Maximum 3 Members *(Refer to `docs/TEAM_CONTRIBUTIONS.md`)*
