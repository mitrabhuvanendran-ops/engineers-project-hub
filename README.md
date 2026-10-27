# 🛠️ Engineer's Project Hub & AI Technical Assistant (Python & Django)

A clean, modern, and full-stack web application built in **Python using the Django framework** designed for engineering students and professionals. Features an integrated AI assistant that answers frequently asked questions, explains error codes, creates support tickets stored in SQL, logs interactions to MongoDB, monitors system health, and tracks engineering projects.

---

## 📌 Submission Details

- **Task Title**: Personal Engineering Project Hub with Integrated AI Assistant & Error Code Diagnostics
- **Framework**: Python 3.13 & Django 6.1 (Full-Stack MVC Architecture)
- **GitHub Repository**: [https://github.com/mitrabhuvanendran-ops/engineers-project-hub](https://github.com/mitrabhuvanendran-ops/engineers-project-hub)
- **Live Website Link (HTTPS)**: [https://engineers-project-hub.vercel.app](https://engineers-project-hub.vercel.app)

---

## 🌟 Assessment Rubric & Feature Compliance

| Rubric Requirement | Implementation in Engineer's Hub (Django) | Status |
| :--- | :--- | :--- |
| **Initial Login Page** | Dedicated, clean engineering-themed login screen shown initially when visiting the site. Unauthenticated users are gated to `/login/`. | ✅ Implemented |
| **Fresh Workspace for New Users** | New users registering or signing in start with a 100% fresh, clean, and isolated workspace (`0` projects). Only the 1-click evaluation demo button loads pre-populated demo records. | ✅ Implemented |
| **Clean Navigation (No backend diagnostics)** | Sidebar and header contain only clean user-facing navigation (Main Menu, Disciplines, Support & System, and User Profile). All developer test buttons and database setup cards removed. | ✅ Implemented |
| **Responsive website with at least 3 pages** | Multiple responsive pages: **Dashboard**, **Projects Directory**, **Project Workspace**, **FAQ Page**, **Error Codes Page**, **Support Tickets**, **Quick Calc Tool**, and **Health Check Page**. Responsive on mobile and desktop. | ✅ Implemented |
| **Chat widget on every page** | Persistent floating AI Assistant chat widget embedded in `base.html` accessible from every single page. | ✅ Implemented |
| **Minimum 10 FAQs stored in SQL & on FAQ page** | 12 comprehensive FAQs stored in the primary SQL database (`FAQ` model) and displayed with category filtering & live search on `/faqs/`. | ✅ Implemented |
| **Minimum 8 Error Codes (including site-specific code)** | 8 error codes cataloged on `/error-codes/`: `400`, `401`, `403`, `404`, `429`, `500`, `503`, and site-specific `480 ERR_CALC_SYNTAX` (Engineering Formula Syntax & Division-by-Zero Error). | ✅ Implemented |
| **Custom 404 & 500 pages with "Ask the assistant"** | Custom `404.html` and `500.html` error handlers (`handler404`, `handler500`) with direct **"Ask the assistant"** buttons pre-filling context. | ✅ Implemented |
| **AI Assistant answering FAQs, error codes & tickets** | Intelligent matching against SQL FAQs and error codes. When an answer is unknown, the assistant automatically offers to create an official **Support Ticket** in SQL. | ✅ Implemented |
| **Support tickets stored in SQL** | All support tickets submitted through the AI assistant or ticket page are stored in the SQL database (`SupportTicket` model) with auto-generated ticket numbers (`TICK-XXXXXXXX`). | ✅ Implemented |
| **Chat logs and feedback stored in MongoDB** | Chat conversation logs and user satisfaction ratings (thumbs-up/down) are dispatched to MongoDB Atlas via `pymongo` with local fallback. | ✅ Implemented |
| **API keys kept in environment variables** | Zero secrets committed to GitHub repository. Keys read securely from environment variables (`SECRET_KEY`, `MONGODB_URI`). | ✅ Implemented |
| **Request logging & Health check page** | Dedicated `/health/` page showing database status, MongoDB connectivity, and real-time HTTP request logging via Django `RequestLoggingMiddleware`. | ✅ Implemented |
| **Third-party API with time limit & fallback** | Integrates Open-Meteo Global Environmental Telemetry API with a **2.5s timeout** (`requests.get(..., timeout=2.5)`) and an automatic **ISO 2533 Standard Atmosphere fallback**. | ✅ Implemented |
| **README with live link & 1 proposed improvement** | Documented below with live links and 3D CAD WebGL viewer roadmap. | ✅ Implemented |

---

## 💡 One Proposed Improvement for Future Iterations

### Real-Time CAD / 3D STEP & STL File Viewer Integration with WebGL & Three.js

**Proposed Improvement**:
Currently, project files support 2D images, PDF documents, and engineering schematics. A valuable future enhancement is integrating an embedded, client-side **Three.js / WebGL CAD viewer** capable of directly rendering 3D mechanical models (`.STEP`, `.STL`, and `.OBJ` files) in the project workspace.

**Technical Implementation**:
- Add client-side Three.js and STLLoader / OBJLoader to parse 3D models directly in the browser canvas.
- Enable interactive pan, orbit rotation, cross-sectional clipping, and wireframe toggle.
- This will allow mechanical and robotics engineering students to inspect 3D assemblies and mechanical fit tolerances directly inside their project workspace without installing external desktop CAD software.

---

## 🚀 How to Run the Django Application Locally

### 1. Clone the repository
```bash
git clone https://github.com/mitrabhuvanendran-ops/engineers-project-hub.git
cd engineers-project-hub
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run database migrations and seed initial data
```bash
python manage.py migrate
python manage.py shell -c "from hub.assistant import seed_faqs_and_errors; seed_faqs_and_errors()"
```

### 4. Start the development server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000/` in your browser. You will initially be greeted with the Login page. Click **"Continue with Quick Demo Access (1-Click)"** or create a new account to explore!

---

## 🌐 Deployment Architecture

- **Platform Options**: Vercel (via WSGI serverless function in `api/index.py` & `vercel.json`), Render, or Railway (via `Procfile`).
- **Static Assets**: Bundled and served with WhiteNoise (`CompressedStaticFilesStorage`).
- **SQL Database**: SQLite3 (default zero-config) or PostgreSQL via `DATABASE_URL`.
- **NoSQL Logging**: MongoDB Atlas cluster via `MONGODB_URI`.
