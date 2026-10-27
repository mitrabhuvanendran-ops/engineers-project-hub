# 🛠️ Engineer's Project Hub

A clean, modern, and full-stack web application designed for engineering students and professionals to manage, calculate, and document all their engineering projects in one place.

![Engineer's Project Hub](https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

### 📊 1. Engineering Dashboard
- **Project Metrics**: Total projects, active projects (In Progress / Not Started), and completed milestones.
- **Discipline Distribution**: Visual breakdown across disciplines (Robotics, Mechanical, Electronics, Software, Civil, Chemical, etc.).
- **Recent Projects**: Instant access to recently modified engineering repositories with relative timestamps and status badges.
- **Quick Create**: One-click action to start a new project.

### 📁 2. Project Directory & Management
- Create, edit, and delete projects with title, objective/description, category, and status.
- Real-time search across titles and descriptions.
- Filter by discipline category (Robotics, Mechanical, Electronics, Software, etc.).
- Filter by workflow status (*Not Started*, *In Progress*, *Completed*).
- Sort by Recently Updated, Oldest, or Alphabetical (A-Z).
- Confirmation modals for safe deletions.

### 🔬 3. Project Workspace (The 4 Core Engineering Sections)
Every project has a dedicated cockpit with 4 specialized sections:

1. **Overview**:
   - Comprehensive project description and objective parameters.
   - Live status switcher with instantaneous persistence.
   - Summary statistics and timestamps (created & last modified).
2. **Notes**:
   - Add, edit, delete, and copy engineering notes.
   - Tagging system (*Design Spec*, *Test Results*, *Bug/Issue*, *Meeting*, *Hardware*, *Firmware*).
3. **Files & Documents**:
   - Drag-and-drop file upload with size formatting (up to 25MB).
   - High-resolution image preview lightbox for CAD drawings, circuit photos, and graphs.
   - Secure download links for schematics, PDFs, datasets, and code files.
4. **Calculations**:
   - Mathematical formula evaluator supporting powers (`^`), trigonometry (`sin`, `cos`, `tan`), roots (`sqrt`), logarithms (`log`, `ln`), and constants (`pi`, `e`).
   - Dynamic input variable mapping (Variable name, numeric value, unit, description).
   - Instant calculation evaluation and result formatting.
   - Built-in engineering templates: *Ohm's Law*, *Electrical Power*, *LED Current Limiter*, *Beam Bending Moment*, *Kinetic Energy*, *DC Motor Power*.

### 🧮 4. Quick Formula Tool
- Standalone engineering calculator accessible directly from the sidebar.
- Evaluate expressions on the fly and optionally save them directly into any active project.

### 🔐 5. Authentication & Security
- User registration, login, and logout powered by **Supabase Auth**.
- **Row Level Security (RLS)** configured on PostgreSQL so users can only access their own projects, notes, calculations, and files.
- Storage RLS restricting file uploads and downloads.
- **Instant Demo Mode**: Test every single feature immediately without needing API keys.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide Icons, JetBrains Mono font
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Deployment**: Vercel ready (`vercel.json` included)
- **Version Control**: Git & GitHub ready

---

## 📁 Project Structure

```
├── public/
│   └── supabase_schema.sql         # SQL schema script for Supabase
├── src/
│   ├── components/
│   │   ├── auth/                   # Authentication modal & sign-in
│   │   ├── common/                 # Reusable Badges, Modals, ConfirmDialogs, Toasts
│   │   ├── dashboard/              # Stat cards, recent projects, discipline breakdown
│   │   ├── layout/                 # Sidebar, Header, and layout wrappers
│   │   ├── projects/               # Project card, filter bar, creation modal
│   │   ├── setup/                  # Supabase database setup guide modal
│   │   └── workspace/              # Overview, Notes, Files, and Calculations tabs
│   ├── constants/                  # Categories, statuses, colors, formula presets
│   ├── context/
│   │   ├── AuthContext.jsx         # Supabase Auth state provider & demo mode
│   │   └── ProjectContext.jsx      # Projects, Notes, Calcs, Files state & CRUD
│   ├── lib/
│   │   ├── calculator.js           # Math formula evaluation engine
│   │   ├── demoData.js             # Realistic engineering starter seed data
│   │   └── supabase.js             # Supabase client & connection health test
│   ├── App.jsx                     # Core application view coordinator
│   ├── index.css                   # Tailwind directives & blueprint styling
│   └── main.jsx                    # React root entry point
├── .env.example                    # Template for Supabase credentials
├── index.html                      # HTML template with Google Fonts
├── package.json                    # Project metadata & dependencies
├── supabase_schema.sql             # Complete PostgreSQL schema & RLS policies
├── tailwind.config.js              # Custom engineering palette & fonts
├── vercel.json                     # Vercel SPA rewrites configuration
└── vite.config.js                  # Vite configuration with chunk splitting
```

---

## ⚡ Quick Start (Running Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app runs immediately in **Demo Mode** with pre-seeded projects, calculations, and notes.

---

## 🗄️ Supabase Backend Setup

To connect your live Supabase database:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Wait a few moments for your database to initialize.

### Step 2: Execute the Database Script
1. In the Supabase Dashboard, go to **SQL Editor** -> **New Query**.
2. Open `supabase_schema.sql` from this repository, paste the entire SQL script, and click **Run**.
3. This creates:
   - `profiles` table (synced with Supabase Auth)
   - `projects` table (with user isolation)
   - `notes` table
   - `calculations` table
   - `project_files` metadata table
   - Row Level Security (RLS) policies for all tables
   - `project-files` Storage bucket with upload/download policies

### Step 3: Configure Environment Variables
1. In your Supabase Dashboard, go to **Project Settings** -> **API**.
2. Copy your **Project URL** and **anon public** API key.
3. Create a `.env` file in the root of the project:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
4. Restart the development server:
```bash
npm run dev
```
The header badge will switch from **Local Demo Mode** to **Live Supabase**!

---

## 🚢 Deployment Guide

### Deploying to Vercel

1. Push your repository to **GitHub**:
```bash
git init
git add .
git commit -m "Initial commit: Engineer's Project Hub"
git branch -M main
git remote add origin https://github.com/your-username/engineers-project-hub.git
git push -u origin main
```

2. Go to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**. Vercel will build and deploy the app in under 1 minute!

---

## 📄 License
MIT License. Built for engineering students and makers worldwide.
