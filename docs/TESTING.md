# CampusResolve — Quality Assurance & Testing Report

This document records the testing strategy, test suites, and verified test results for CampusResolve.

---

## 1. Automated Test Suites

CampusResolve utilizes **Vitest** for fast unit and service layer testing, and TypeScript for static analysis.

### Test Execution Summary
```bash
npm run test
```

```text
✓ src/test/complaintService.test.ts (5 tests)
  ✓ generates valid tracking code with format CR-YYYY-XXXX
  ✓ fetches complaints with initial seed fixtures
  ✓ creates a new complaint with generated tracking code and status open
  ✓ updates complaint status and records status history
  ✓ adds and retrieves comments

Test Files  1 passed (1)
     Tests  5 passed (5)
```

---

## 2. End-to-End User Verification Checklist

| Test Case ID | Description | Expected Outcome | Status |
|---|---|---|---|
| **TC-01** | Student registration & login | Profile created, redirected to Student Dashboard | **PASS** |
| **TC-02** | Submit complaint with photo | Form validates required fields, generates tracking ID (e.g. `CR-2026-1001`), attaches image | **PASS** |
| **TC-03** | My Complaints list & filtering | Filters by category ('Wi-Fi', 'Electrical', etc.), status ('open', 'resolved'), and keyword search | **PASS** |
| **TC-04** | Route protection & role isolation | Student attempting to access `/admin/dashboard` is safely redirected; non-logged in users prompted to login | **PASS** |
| **TC-05** | Admin dashboard & analytics | Displays counts for Total, Open, In Progress, Resolved; renders category breakdown charts | **PASS** |
| **TC-06** | Admin status update | Admin transitions complaint to `in_progress` or `resolved` with mandatory resolution note | **PASS** |
| **TC-07** | Audit history log | Status transitions recorded with changer role, name, timestamps, and notes | **PASS** |
| **TC-08** | Discussion comments | Student and Admin can post follow-up comments with role badges | **PASS** |
| **TC-09** | Production build compilation | `npm run build` succeeds with zero errors; bundle split into optimized vendor chunks under 500kB | **PASS** |
| **TC-10** | TypeScript type safety | `npx tsc -b` passes with zero type warnings or errors | **PASS** |

---

## 3. Security & Access Control Verification

1. **Role Protection Trigger (`protect_profile_role`)**: Verified that a student cannot alter their `role` column in `public.profiles` through browser client calls.
2. **Row Level Security (RLS)**: Complaints are filtered on the database engine. Direct queries for complaints by a student only return rows matching `student_id = auth.uid()`.
3. **Evidence Storage Isolation**: Image uploads enforce MIME verification (JPEG, PNG, WebP) and file size caps (5MB).
