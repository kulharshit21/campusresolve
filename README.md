# CampusResolve — Smart Campus Complaint & Issue Management System

> **University Final Review Project — November 2026**  
> *A Real-Time, Enterprise Campus Grievance Platform for Apex Institute of Technology & Engineering*  
> **Live Production URL**: [https://campusresolve-theta.vercel.app](https://campusresolve-theta.vercel.app)

[![CI](https://github.com/kulharshit21/campusresolve/actions/workflows/ci.yml/badge.svg)](https://github.com/kulharshit21/campusresolve/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Production-000000.svg)](https://campusresolve-theta.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Project Overview

**CampusResolve** is a web platform that replaces informal, untracked campus complaints (such as verbal requests or informal WhatsApp messages) with a centralized digital grievance management system.

- **Students**: Submit geotagged issues across campus categories (Wi-Fi, Electrical, Plumbing, Hostel, Classroom), upload photographic evidence, select location presets, receive an immutable tracking identifier (`CR-YYYY-XXXX`), and monitor resolution progress on a step-by-step visual timeline.
- **Campus Administrators**: Manage incoming complaints through a real-time management portal with live Recharts analytics, monitor SLA deadlines, dispatch maintenance staff, update ticket statuses, and log official resolution notes.
- **Real-Time Synchronization**: Built with **Supabase Realtime**, status updates push to active student client dashboards instantly via WebSockets without requiring manual page reloads.
- **University Governance Compliance**: Integrates UGC grievance redressing standards, automatic department routing (ICT Infrastructure, Electrical & Power, Estate & Works, Hostel Welfare, Academic Facilities), SLA monitoring, and official printable committee dossiers.

---

## 🔑 Tested Reviewer Accounts (Instant Access)

| Role | Name | Email | Password | Access Note |
|---|---|---|---|---|
| **Chief Administrator** | **Harshit Kulkarni** | `harshitkulkarni608@gmail.com` | `password123` | Full access, analytics, SLA monitoring, official dossier printing |
| **Student** | **Harshit Kulkarni** | `hk5119164@gmail.com` | `password123` | CS Dept student, active complaints & real-time tracking |
| **Student** | **hellofree** | `hellofree00007@gmail.com` | `password123` | Residential student, active hostel grievances |

> **Clean Design & Security**: Admin credentials are kept strictly separate from the frontend. There are no public demo switcher buttons or exposed credentials on the interface. Users authenticate securely via the standard `/login` route; the database role dynamically controls access to the Admin Portal (`/admin/dashboard`) or Student Portal (`/student/dashboard`).

---

## 🚀 Key Enterprise Features

- **Anti-AI Human-Crafted UX**: Designed specifically for institutional operations with University branding, UGC statutory compliance notice, and real-world campus workflows.
- **Instant Public Ticket Lookup**: Anyone can track a complaint on the landing page using its tracking ID (e.g., `CR-2026-1001`) without prior login.
- **Enterprise Command Palette (`Ctrl+K` / `Cmd+K`)**: Global search modal to quickly jump to tickets, campus locations, or departments.
- **Official Printable UGC Grievance Dossier**: 1-click printable committee dossier with academic letterhead, complete audit history, and physical signature lines (`@media print`).
- **SLA Breach Monitoring**: Real-time SLA indicators calculating remaining hours (Urgent 8h, Standard 24h, Routine 72h).
- **Institutional Department Auto-Routing**: Automatic routing based on issue category.
- **CSV Audit Export**: Instant export of all grievance records and audit trails for NAAC/NIRF reporting.
- **Dual Responsive Layout**: Rich sortable data table on desktop, and touch-optimized card deck on mobile/tablet viewports.
- **Notification Drawer**: Sliding notifications panel tracking unread alerts and status updates.
- **Database-Enforced Audit Trail**: PostgreSQL triggers automatically log every status transition with changer identity and timestamps into `complaint_status_history`.
- **Row Level Security (RLS)**: Enforces strict data access rules directly inside PostgreSQL.
- **Serverless API Authentication**: Dedicated `api/auth-signup.ts` endpoint confirming users via Supabase Admin API with zero email bounce risk.

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
git clone https://github.com/kulharshit21/campusresolve.git
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

1. **Open Landing Page**: Navigate to [https://campusresolve-theta.vercel.app](https://campusresolve-theta.vercel.app).
2. **Instant Ticket Tracking**: Enter tracking code `CR-2026-1001` in the public tracking widget to view live ticket progress without logging in.
3. **Log in as Student**: Go to `/login` and sign in with `hk5119164@gmail.com` / `password123`.
4. **Submit a Complaint**: Click **"Report Issue"**, fill out the campus location preset, select category (e.g. *Wi-Fi / Network*), attach photo evidence, and submit.
5. **Inspect Generated Ticket**: Note the unique tracking ID (e.g. `CR-2026-1005`) and inspect the 3-step progress timeline.
6. **Switch to Administrator**: Click profile &rarr; **Sign Out**, then sign in with `harshitkulkarni608@gmail.com` / `password123`.
7. **Manage Ticket & Transition Status**: In the Admin Registry table, click **"Update"** on the ticket, change status to **"In Progress"** or **"Resolved"** with an official resolution note.
8. **Print Official Dossier**: Open any complaint and click **"Print Official Dossier"** to view the formatted committee PDF/print report with academic letterhead.

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

## 👥 University Team Information & Project Deliverables

- **Institution**: SRM Institute of Science and Technology, Kattankulathur
- **Department**: Department of Computing Technologies
- **Course**: 21CSP401L — Full Stack Development Lab (Academic Year 2026–2027)
- **Faculty Guide**: **Mrs. Ramya B**, Assistant Professor
- **Project Title**: **CampusResolve — Centralized Statutory Grievance Redressal and SLA Auditing Engine**

### Presenting Team Members & Architectural Responsibilities

| Speaker | Name | Reg. No. | Architectural Domain & Presentation Scope |
|---|---|---|---|
| **Speaker 1** | **Harshit Aman** | `RA2311003011776` | **Lead Systems Architect**: UGC Statutory Framework (Ref: `GRS-2026-APEX`), Core Architecture, PostgreSQL Row Level Security (RLS), Zero-Knowledge Public Ticket Tracking, & Email Resiliency. |
| **Speaker 2** | **Palchin** | `RA2311003011759` | **Student Lifecycle Engineer**: Student Dashboard, Zod Form Validation, Geotagged Location Presets, Supabase Storage Evidence Pipeline, Realtime Status Timeline & WebSockets. |
| **Speaker 3** | **Harshit R K** | `RA2311003011810` | **Operations & Compliance Lead**: Admin Master Queue, Recharts Operational Analytics, Urgency Triage & SLA Engine, One-Click UGC Grievance Dossier, Global Command Palette (`Ctrl+K`) & Edge Security. |

---

## 📄 Formal Deliverables in Repository

1. **Official 3-Person Viva Voce Presentation Defense Script (PDF)**:
   - File: [`CampusResolve_3_Person_Viva_Presentation_Script.pdf`](./CampusResolve_3_Person_Viva_Presentation_Script.pdf)
   - Publication-grade 14-page script with embedded live screenshots, verbatim dialogue, click-by-click screen actions, architectural takeaways, and anticipated faculty viva voce Q&As.
2. **Official University Project Report (DOCX)**:
   - File: [`CampusResolve_Full_Stack_Project_Report.docx`](./CampusResolve_Full_Stack_Project_Report.docx)
   - Formatted in exact accordance with SRM Department of Computing Technologies guidelines (Times New Roman, 1.0" margins, 350+ paragraphs, 19 tables).
3. **High-Resolution Production Screenshots**:
   - Directory: [`docs/screenshots/`](./docs/screenshots/)
   - Captured directly from the live production deployment (`https://campusresolve-theta.vercel.app`).
