# CampusResolve — Installation & Setup Guide

This guide walks through cloning, configuring, and running CampusResolve locally and connecting it to Supabase.

---

## 1. Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**: v2.30+

---

## 2. Quick Local Setup

### Step 1: Clone or Navigate to the Repository
```bash
git clone <repository-url>
cd campusresolve
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.
*Note: CampusResolve includes pre-configured local development fixtures, so you can immediately explore and test the student and administrator workflows without configuring an external database first.*

---

## 3. Connecting to a Real Supabase Backend

### Option A: Using Environment Variables (`.env`)
1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set your project URL and publishable/anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Run the SQL schema migration located at `supabase/migrations/20261113000000_init_campusresolve.sql` in your Supabase SQL Editor.
5. Create a storage bucket named `complaint-evidence` in your Supabase Dashboard under Storage.
6. Restart the Vite dev server (`npm run dev`).

### Option B: Using Supabase MCP (Antigravity Integration)
Antigravity can directly apply migrations and configure storage when connected via the Supabase MCP server.

---

## 4. Available NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server with hot module reload (HMR) |
| `npm run build` | Compiles TypeScript and builds optimized production bundles in `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run test` | Runs the automated test suite using Vitest |
| `npm run typecheck` | Validates TypeScript types across the entire project |
| `npm run lint` | Runs ESLint checks |
