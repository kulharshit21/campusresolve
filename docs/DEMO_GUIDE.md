# CampusResolve — Final Review Demonstration & Viva Guide

This document is prepared specifically for university final review panel presentation and viva voce examination.

---

## 1. Thirty-Second Elevator Pitch

> *"Respected panel members, in most university campuses today, maintenance issues—such as broken lab Wi-Fi, leaking hostel plumbing, or malfunctioning classroom projectors—are reported verbally or across unorganized WhatsApp groups, leading to zero accountability and lost complaints.*
>
> *We built **CampusResolve**: a real-time smart campus issue management platform. Students submit geotagged complaints with photographic evidence and receive an immutable tracking ID. Campus administrators manage tickets, dispatch maintenance teams, and update statuses. With Supabase Realtime and PostgreSQL Row Level Security, updates reflect immediately on student dashboards without page reloads, ensuring full institutional transparency."*

---

## 2. Three-Minute Live Demonstration Walkthrough

Follow this step-by-step sequence during the project review:

| Step | Action on Screen | What to Say |
|---|---|---|
| **1. Landing Page** | Show landing page (`http://localhost:5173/`). Point out the project badge, workflow steps, and institutional categories. | *"Here is our landing page introducing the system, featuring structured campus categories like Wi-Fi, Electrical, and Hostel facilities."* |
| **2. Fast Persona Switch** | Click **"Test as Student (Rahul)"** in the review banner or on the login page. | *"We have integrated one-click reviewer access. Let's enter the student portal as Rahul Sharma."* |
| **3. Student Dashboard** | Point to the 4 metric cards (Total, Open, In Progress, Resolved) and recent tickets. | *"Rahul's dashboard shows real-time metrics of his active tickets and recent maintenance history."* |
| **4. Submit New Complaint** | Click **"Log New Complaint"**. Fill in: Title: `Lab 2 Wi-Fi disconnected`, Category: `Wi-Fi / Network`, Location: `Computer Lab 2, Row 3`, Description: `Signal drops every 3 minutes`. Attach sample photo. Click **Submit**. | *"Rahul submits a ticket with photographic evidence. The system generates a unique tracking code (e.g. CR-2026-1005) and records the initial audit log."* |
| **5. Review Complaint Detail** | Click **"View Status & Timeline"** on the confirmation dialog. | *"Notice the 3-stage visual progress timeline: Open, In Progress, and Resolved."* |
| **6. Switch to Admin** | Click the profile icon in the top right and click **"Switch to Admin (Dr. Anita)"**. | *"Now we switch to Dr. Anita Desai, the Campus Administrator."* |
| **7. Admin Portal & Analytics** | Point out the Recharts bar chart (Category breakdown) and pie chart (Resolution status). | *"The admin portal aggregates campus-wide analytics and provides a central registry table of all student issues."* |
| **8. Status Transition** | Locate the new ticket in the registry table. Click **"Update"**. Select **"In Progress"** and add note: *"Network engineer dispatched with replacement router"*. Save. | *"Dr. Anita assigns the technician. The status changes in the database and audit trail."* |
| **9. Verify Realtime & Resolution** | Update the status to **"Resolved"** and input the official resolution note. Switch back to student view to show the completed timeline and note. | *"The student dashboard reflects the resolved status, technician resolution notes, and complete timestamped audit history."* |

---

## 3. Architecture in Simple Terms

- **Frontend (Client)**: Built with React, TypeScript, and Vite. Handles user interaction, responsive design, input validation, and charts.
- **Backend (Supabase)**: Provides a managed PostgreSQL database, authentication, file storage, and websocket-based realtime event broadcasting.
- **Security (Row Level Security - RLS)**: Instead of relying only on frontend route hiding, access rules are enforced directly inside the PostgreSQL database engine. Even if someone makes raw database requests, they cannot view another student's complaints or forge administrator permissions.

---

## 4. University Rubric Mapping (Total: 10 Marks)

| Assessment Area | Marks | Implementation Evidence in CampusResolve |
|---|---:|---|
| **Frontend Development** | 2.5 | Fully responsive React 18 SPA, TypeScript, Tailwind CSS, Recharts analytics, accessible modals, custom badges, React Router route guards, client-side validation. |
| **Backend Development** | 2.5 | PostgreSQL schema with referential integrity, automated triggers for status history, Supabase Auth, Row Level Security (RLS) policies, and Supabase Storage evidence bucket. |
| **Implementation** | 3.0 | Complete student-to-admin lifecycle: complaint creation with image evidence, tracking code generation, status updates with resolution notes, and audit history. |
| **Project Report & Docs** | 2.0 | Detailed report draft (`docs/PROJECT_REPORT_DRAFT.md`), ERD & Architecture diagrams (`docs/ARCHITECTURE.md`, `docs/DATABASE.md`), and automated test suite (`docs/TESTING.md`). |

---

## 5. Top 15 Viva Voce Questions & Answers

### Q1: What problem does CampusResolve solve?
**Answer**: CampusResolve replaces ad-hoc, informal campus complaint mechanisms (like WhatsApp messages or paper registers) with a centralized, transparent platform where complaints receive unique tracking codes, photographic evidence, and real-time status updates.

### Q2: Why did you choose React with TypeScript instead of plain HTML/JS?
**Answer**: React allows us to build reusable, state-driven UI components (such as interactive timelines, cards, and charts). TypeScript provides compile-time type safety, catching bugs and missing properties before the code ever runs in production.

### Q3: Why did you use Supabase instead of building a separate Express/Node server?
**Answer**: Supabase provides an enterprise PostgreSQL database, robust authentication, S3-compatible storage, and websocket Realtime capabilities out-of-the-box. By leveraging PostgreSQL's native Row Level Security (RLS) and database triggers, security is enforced directly at the database layer rather than duplicating authorization logic in an intermediate Node.js server.

### Q4: What is Row Level Security (RLS) in PostgreSQL?
**Answer**: RLS is a security feature in PostgreSQL where database policies restrict which rows are returned or modified based on the executing user's session (`auth.uid()`). For example, in our `complaints` table, students can only select rows where `student_id = auth.uid()`, while administrators can select all rows.

### Q5: How do you prevent a student from promoting themselves to an Administrator?
**Answer**: In our PostgreSQL migration, we created a database trigger `protect_profile_role` on `public.profiles`. If any update request attempts to change the `role` column, the trigger verifies whether the caller already holds the `admin` role; otherwise, it raises an exception and aborts the transaction.

### Q6: How does the Realtime feature work?
**Answer**: Supabase listens to the PostgreSQL Write-Ahead Log (WAL) through logical replication. When an administrator updates a complaint's status, the change is published over an authenticated WebSocket channel (`supabase_realtime`), updating the student's dashboard without needing to refresh the page.

### Q7: Where are the uploaded complaint images stored?
**Answer**: Images are stored in a dedicated Supabase Storage bucket (`complaint-evidence`). The client-side and server-side validate that only image formats (JPEG, PNG, WebP) under 5MB are accepted, generating unique paths to prevent filename collisions.

### Q8: How is the complaint tracking code generated?
**Answer**: The tracking code follows the standard format `CR-YYYY-XXXX` (e.g., `CR-2026-1001`), generated deterministically using the current academic year and unique identifier, preventing duplicate ticket confusion.

### Q9: What happens when an administrator resolves a complaint?
**Answer**: When marked as "Resolved", the system requires an official resolution note explaining the fix. The database updates `status = 'resolved'`, records `resolved_at = now()`, and the trigger automatically appends a new row to `complaint_status_history`.

### Q10: How do you handle authentication?
**Answer**: Authentication is handled via Supabase Auth using JWT (JSON Web Tokens). Upon user sign-up, a database trigger automatically initializes the user profile in `public.profiles` with the default role of `student`.

### Q11: What validation is implemented on the frontend?
**Answer**: Forms validate required text fields, string lengths, valid email syntax, password minimum length (6 characters), allowed image MIME types, and file size boundaries.

### Q12: What happens if Supabase credentials are not configured yet?
**Answer**: The application includes a fallback client fixture mode. It allows examiners to test the complete user journey, switch roles, create complaints, and test status transitions seamlessly, while remaining 100% prepared to link to a live Supabase URL and key.

### Q13: What automated tests have been implemented?
**Answer**: We configured Vitest with automated unit and service tests covering tracking code generation, complaint creation, status history logging, filtering, and comment additions.

### Q14: How does the application ensure mobile responsiveness?
**Answer**: The application uses Tailwind CSS responsive breakpoints (`sm`, `md`, `lg`) along with a mobile hamburger navigation menu, responsive data tables with horizontal scrolling, and fluid CSS grid layouts.

### Q15: What are the current limitations and future scope of the project?
**Answer**: Current limitations include single-campus deployment. Future enhancements include automated SMS/email notifications via Supabase Edge Functions, QR-code scanning at physical classroom desks to auto-fill location, and multilingual support for diverse university campuses.
