# Predicting-Project-Costs-and-Timeline

Developed a predictive system to estimate project costs and timelines using Machine Learning techniques. The model analyzes historical project data, including task duration, resource allocation, and complexity, to generate accurate cost and time predictions. This helps in efficient project planning, budget optimization, and risk reduction.

## Project Structure

```
├── backend/                  # FastAPI Python backend
│   ├── main.py               # API routes (FastAPI app)
│   ├── database.py           # SQLAlchemy DB setup
│   ├── models.py             # ORM models
│   ├── ml.py                 # ML prediction & training logic
│   ├── seed_data.py          # Script to seed demo data & train models
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (DATABASE_URL)
│
└── frontend/                 # React + Vite frontend
    ├── index.html            # HTML entry point
    ├── vite.config.js        # Vite config (proxies /api → backend)
    ├── package.json          # Node dependencies
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Router & navbar
        ├── pages/
        │   ├── Dashboard.jsx     # Overview, risk hotspots, charts
        │   ├── Projects.jsx      # List all projects
        │   ├── ProjectDetail.jsx # View / edit / predict a project
        │   ├── AddProject.jsx    # Create a new project
        │   └── Upload.jsx        # Bulk import via CSV/XLSX
        └── components/
            └── ProjectForm.jsx   # Shared project create/edit form
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**.

Seed demo projects and train the ML models:

```bash
python seed_data.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

