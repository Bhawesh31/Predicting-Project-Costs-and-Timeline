# POWERGRID Intelligence — Predicting Project Costs & Timelines

A full-stack application that predicts **cost overruns** and **schedule delays** for power-grid infrastructure projects using Machine Learning (Gradient Boosting). It also surfaces **risk hotspots** across the project portfolio.

---

## Project Structure

```
.
├── main.py              # FastAPI backend (REST API)
├── database.py          # SQLAlchemy engine & session
├── models.py            # ORM model (Project)
├── ml.py                # ML training & prediction logic
├── seed_data.py         # Script to seed demo data & train models
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (DATABASE_URL)
│
├── index.html           # Vite entry HTML
├── vite.config.js       # Vite + React config (proxy → :8000)
├── package.json         # Frontend dependencies
└── src/
    ├── main.jsx         # React entry point
    ├── App.jsx          # Router (5 pages)
    ├── index.css        # Global design tokens & base styles
    ├── api/
    │   └── index.js     # Axios API client (all endpoints)
    ├── components/
    │   ├── Navbar.jsx
    │   └── Navbar.module.css
    └── pages/
        ├── Dashboard.jsx  # KPI cards + region/type charts
        ├── Projects.jsx   # CRUD table for projects
        ├── Predict.jsx    # Per-project cost & delay prediction
        ├── Hotspots.jsx   # At-risk project list with filters
        └── Upload.jsx     # Bulk CSV / Excel import
```

---

## Quick Start

### 1 — Backend (Python / FastAPI)

```bash
# Create & activate a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### 2 — Seed Demo Data & Train ML Models

In a **second terminal** (while the backend is running):

```bash
python seed_data.py
```

This creates 12 demo projects and trains the Gradient Boosting models.

### 3 — Frontend (React / Vite)

```bash
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` to the FastAPI backend automatically.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a project |
| GET | `/projects/{id}` | Get one project |
| PUT | `/projects/{id}` | Update a project |
| DELETE | `/projects/{id}` | Delete a project |
| GET | `/predict/{id}` | Cost & delay prediction |
| GET | `/hotspots` | At-risk project list |
| POST | `/train` | Retrain ML models |
| POST | `/upload` | Bulk import (CSV / Excel) |

---

## ML Models

- **Cost overrun model** — predicts `%` cost overrun above budget  
- **Timeline delay model** — predicts extra delay in days  
- Both use `GradientBoostingRegressor` (scikit-learn)  
- Features: project type, region, budget, terrain score, duration, vendor performance, weather risk, permit delay  

---

## Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./powergrid.db` | SQLAlchemy DB URL |
