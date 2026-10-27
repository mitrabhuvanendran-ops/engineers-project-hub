# 🛠️ Engineer's Project Hub & AI Technical Assistant

A clean, modern, and full-stack web application designed for engineering students and professionals with an integrated AI assistant that answers frequently asked questions, explains error codes, creates support tickets stored in SQL, logs interactions to MongoDB, monitors health, and tracks engineering projects.

---

## 📌 Submission Details

- **Task Title**: Personal Engineering Project Hub with Integrated AI Assistant & Error Code Diagnostics
- **GitHub Repository**: [https://github.com/mitrabhuvanendran-ops/engineers-project-hub](https://github.com/mitrabhuvanendran-ops/engineers-project-hub)
- **Live Website Link (HTTPS)**: [https://engineers-project-hub.vercel.app](https://engineers-project-hub.vercel.app) *(or your deployed Vercel URL)*

---

## 🌟 Rubric & Feature Compliance Overview

| Rubric Requirement | Implementation Details in Engineer's Hub |
| :--- | :--- |
| **Responsive website with at least 3 pages** | ✅ Multiple pages: **Dashboard**, **Projects Directory**, **Project Workspace**, **FAQ Page**, **Error Codes Page**, **Support Tickets**, and **Health Check Page**. Fully responsive on mobile and desktop. |
| **Chat widget on every page** | ✅ Persistent floating AI Assistant chat widget (`AIAssistantWidget`) accessible from the bottom-right corner of every single view. |
| **Minimum 10 FAQs stored in SQL & on FAQ page** | ✅ 11 comprehensive FAQs stored in the Supabase PostgreSQL `faqs` table and displayed with category filtering & live search on `/faqs`. |
| **Minimum 8 Error Codes (including site-specific code)** | ✅ 8 error codes cataloged on `/error-codes`: `400`, `401`, `403`, `404`, `429`, `500`, `503`, and site-specific `480 ERR_CALC_SYNTAX` (Engineering Formula Syntax & Zero Division Error). |
| **Custom 404 & 500 pages with "Ask the assistant"** | ✅ Custom 404 page (triggered on unknown addresses or `/404`) and custom 500 page (`/500`) with direct **"Ask the assistant"** buttons pre-filling context. |
| **AI Assistant answering FAQs, error codes & tickets** | ✅ Intelligent matching against SQL FAQs and error codes. When an answer is unknown, the assistant automatically offers and opens an inline **Support Ticket Form**! |
| **Support tickets stored in SQL** | ✅ All support tickets submitted through the AI assistant or ticket page are stored in the PostgreSQL `public.support_tickets` table. |
| **Chat logs and feedback stored in MongoDB** | ✅ Interaction logs and thumbs-up / thumbs-down ratings are dispatched to MongoDB Atlas via serverless endpoints `/api/chat-logs` and `/api/feedback`. |
| **API keys in environment variables** | ✅ Zero secrets committed to GitHub. All keys read from `process.env` / `import.meta.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `MONGODB_URI`). |
| **Request logging & Health check page** | ✅ Dedicated `/health` page showing system uptime, database ping latency, and real-time request logging table. |
| **Third-party API with time limit & fallback** | ✅ Integrates Open-Meteo Global Atmospheric Telemetry API with a **2500ms AbortController timeout** and an automatic **ISO 2533 Standard Atmosphere offline fallback**. |
| **README with live link & 1 proposed improvement** | ✅ Fully documented below with live link and architectural roadmap improvement. |

---

## 💡 One Proposed Improvement for Future Iterations

### Real-Time CAD / 3D STEP File Viewer Integration with WebGL & Three.js

**Proposed Improvement**:
Currently, project files support 2D images with full-screen lightbox zoom, PDF documents, and engineering schematics. A powerful future enhancement is integrating an embedded, client-side **Three.js / WebGL CAD viewer** capable of directly rendering 3D mechanical models (`.STEP`, `.STL`, and `.OBJ` files) in the project workspace.

**Technical Implementation**:
- Add `three` and `three-stdlib` (STLLoader, OBJLoader) to parse 3D models directly in the browser canvas.
- Enable interactive pan, orbit rotation, cross-sectional clipping, and wireframe toggle.
- This will allow mechanical and robotics engineering students to inspect 3D assemblies and mechanical fit tolerances directly inside their project workspace without installing external desktop CAD software.

---

## 🗄️ Database Architecture

### 1. Relational SQL Database (Supabase PostgreSQL)
The application uses Supabase PostgreSQL for relational integrity, Row Level Security (RLS), and audit trails:
- **`profiles`**: Linked to `auth.users` for user identity.
- **`projects`**: Title, description, discipline category, status, timestamps.
- **`notes`**: Technical design notes with tags and markdown support.
- **`calculations`**: Engineering math formulas, structured input variable JSON, evaluated result, units.
- **`project_files`**: Uploaded drawings, photos, and datasheets metadata.
- **`faqs`**: 11+ frequently asked questions queryable by public users and the AI assistant.
- **`error_codes`**: 8 error codes (400, 401, 403, 404, 429, 500, 503, 480) with descriptions, causes, and solutions.
- **`support_tickets`**: Escalated user inquiries, subjects, descriptions, error codes, and resolution status.

### 2. Document Database (MongoDB Atlas)
- **`chat_logs`**: User questions, assistant answers, matched FAQ IDs, error codes, and session timestamps.
- **`chat_feedback`**: Message ratings (thumbs-up / thumbs-down) and comments for AI continuous learning.

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/mitrabhuvanendran-ops/engineers-project-hub.git
cd engineers-project-hub
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engineers_hub?retryWrites=true&w=majority
```

*(If Supabase credentials are not provided, the app runs in interactive **Local Demo Mode** automatically).*

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Instructions (Vercel & Supabase)

### 1. Execute SQL in Supabase
1. In your Supabase Dashboard, navigate to **SQL Editor** -> **New Query**.
2. Paste the contents of [`supabase_schema.sql`](supabase_schema.sql) and click **Run**.
3. Under **Authentication** -> **Providers** -> **Email**, toggle **OFF** "Confirm email" to enable instant test sign-ups.

### 2. Deploy to Vercel
1. In Vercel, click **Add New...** -> **Project** and import `mitrabhuvanendran-ops/engineers-project-hub`.
2. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `MONGODB_URI` *(optional for Atlas)*
3. Click **Deploy**.

### 3. Add Vercel Domain to Supabase Redirects
- In Supabase, go to **Authentication** -> **URL Configuration**.
- Set **Site URL** to: `https://<your-vercel-domain>.vercel.app`
- Add **Redirect URL**: `https://<your-vercel-domain>.vercel.app/**`

---

## 📄 License
MIT License. Developed for the Software Development Final Assessment.
