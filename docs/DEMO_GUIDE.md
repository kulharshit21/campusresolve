# CampusResolve — Final Review Demonstration & Viva Guide

This document is prepared specifically for university final review panel presentation and viva voce examination.
Production Deployment: **[https://campusresolve-theta.vercel.app](https://campusresolve-theta.vercel.app)**

---

## 1. Thirty-Second Elevator Pitch

> *"Respected panel members, in most university campuses today, maintenance issues—such as broken lab Wi-Fi, leaking hostel plumbing, or malfunctioning classroom projectors—are reported verbally or across unorganized WhatsApp groups, leading to zero accountability and lost complaints.*
>
> *We built **CampusResolve**: a real-time smart campus issue management platform for **Apex Institute of Technology & Engineering**. Students submit geotagged complaints with photographic evidence and receive an immutable tracking ID. Campus administrators manage tickets, dispatch maintenance teams, and update statuses. With automated SLA compliance tracking, department auto-routing, printable UGC grievance dossiers, and real-time database synchronization via Supabase PostgreSQL, CampusResolve ensures full institutional transparency across both desktop and mobile devices."*

---

## 2. Tested Reviewer Credentials

| Persona | Name | Role | Email | Password |
|---|---|---|---|---|
| **Chief Administrator** | **Harshit Kulkarni** | `admin` | `harshitkulkarni608@gmail.com` | `password123` |
| **Campus Administrator** | Dr. Anita Desai | `admin` | `admin.anita@campus.edu` | `admin123` |
| **Student** | Rahul Sharma | `student` | `rahul.student@campus.edu` | `password123` |
| **Student** | Priya Patel | `student` | `priya.student@campus.edu` | `password123` |

*Tip: You can also use the 1-click **Reviewer Persona Switcher** dropdown in the top navigation header on any page to switch identities instantly without logging out!*

---

## 3. Three-Minute Live Demonstration Walkthrough

Follow this step-by-step sequence during the project review:

| Step | Action on Screen | What to Say |
|---|---|---|
| **1. Landing Page** | Show landing page (`https://campusresolve-theta.vercel.app`). Point out the institutional badge, SLA promise, UGC compliance notice, and live metrics ticker (5 Total, 1 Resolved, 94.2% SLA). | *"Here is our landing page for Apex Institute of Technology & Engineering, showcasing live institutional statistics, UGC compliance notices, and instant ticket tracking."* |
| **2. Instant Public Ticket Tracking** | In the "Track Any Ticket Instantly" box on the landing page, enter `CR-2026-1001` and click **Track Ticket**. | *"Even before logging in, students or parents can track any grievance transparently using their unique tracking ID."* |
| **3. Fast Persona Switch** | Click the **Reviewer Persona** pill in the top navbar and select **"Harshit Kulkarni (Chief Admin)"**. | *"We have integrated one-click reviewer access. Let's enter the administrative portal as Chief Administrator Harshit Kulkarni."* |
| **4. Admin Portal & Analytics** | Point out the 4 metric cards, Recharts analytics (Category & Status), SLA breakdown, and the dual responsive view (Table on desktop, Cards on mobile). | *"Chief Admin Harshit has a bird's-eye view of all complaints across departments. The dashboard automatically calculates remaining SLA windows (e.g. 8h urgent vs 72h routine)."* |
| **5. Command Palette (Ctrl+K)** | Press `Ctrl+K` (or `Cmd+K` on Mac, or tap the search icon). Type `Lab` or `CR-2026-1002`. | *"The system features an enterprise Command Palette for instant navigation and grievance lookup."* |
| **6. Official Printable UGC Dossier** | Click into ticket `CR-2026-1001` or `CR-2026-1002`, and click **"Print Official Dossier"**. | *"CampusResolve generates a formal UGC-formatted Grievance Dossier with institutional letterhead, SLA audit history, and signature blocks ready for inspection committees."* |
| **7. Export CSV Audit Report** | On the Admin Dashboard, click **"Export CSV Report"**. | *"Administrators can export the entire grievance audit trail to CSV for institutional accreditation (NAAC/NIRF) reporting."* |
| **8. Switch to Student & Log Complaint** | Switch persona to **Rahul Sharma (Student)**. Click **"Log New Complaint"**. Use the quick campus preset chips (e.g. `CS Dept - Computer Lab 2`), choose `Wi-Fi / Network`, notice the live SLA guarantee banner, attach photo, and submit. | *"Students benefit from location presets, live SLA previews, and real-time character counters."* |
| **9. Verify Status Transition & Audit** | Switch back to Harshit Kulkarni, click **"Update Status"**, select **"Resolved"**, pick a quick resolution template (e.g., *Replaced faulty hardware & verified signal*), and save. | *"The status updates instantaneously with resolution notes and an immutable database audit trail."* |

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
