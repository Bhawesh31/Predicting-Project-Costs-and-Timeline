from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, init_db
from models import Project
from ml import predict_cost, predict_timeline, get_hotspots, train_and_save
from dotenv import load_dotenv
import pandas as pd
import io

load_dotenv()
init_db()

app = FastAPI(title="POWERGRID Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ProjectIn(BaseModel):
    name:               str
    type:               str
    region:             str
    budget_cr:          float
    terrain_score:      float
    duration_months:    int
    vendor_perf_score:  float
    weather_risk_score: float
    permit_delay_days:  int

class ProjectOut(ProjectIn):
    id: int
    class Config:
        from_attributes = True

@app.get("/")
def health():
    return {"status": "POWERGRID API running"}

@app.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@app.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p: raise HTTPException(404, "Project not found")
    return p

@app.post("/projects", response_model=ProjectOut)
def create_project(data: ProjectIn, db: Session = Depends(get_db)):
    p = Project(**data.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p

@app.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectIn, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p: raise HTTPException(404, "Project not found")
    for k, v in data.model_dump().items(): setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p: raise HTTPException(404, "Project not found")
    db.delete(p); db.commit()
    return {"message": f"Project {project_id} deleted"}

@app.get("/predict/{project_id}")
def predict(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p: raise HTTPException(404, "Project not found")
    return {
        "project_id":       project_id,
        "project_name":     p.name,
        "cost_overrun_pct": predict_cost(p),
        "delay_days":       predict_timeline(p),
    }

@app.get("/hotspots")
def hotspots(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return {"hotspots": get_hotspots(projects)}

@app.post("/train")
def train(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    if len(projects) < 5:
        raise HTTPException(400, f"Need at least 5 projects to train. You have {len(projects)}.")
    return train_and_save(projects)

REQUIRED_COLS = [
    "name", "type", "region", "budget_cr", "terrain_score",
    "duration_months", "vendor_perf_score", "weather_risk_score", "permit_delay_days"
]

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content  = await file.read()
    filename = file.filename.lower()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(400, "Only .csv or .xlsx files are supported")
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {str(e)}")

    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Missing columns: {', '.join(missing)}")

    created = 0
    errors  = []
    for i, row in df.iterrows():
        try:
            p = Project(
                name               = str(row["name"]),
                type               = str(row["type"]).lower().replace(" ", "_"),
                region             = str(row["region"]).lower(),
                budget_cr          = float(row["budget_cr"]),
                terrain_score      = float(row["terrain_score"]),
                duration_months    = int(row["duration_months"]),
                vendor_perf_score  = float(row["vendor_perf_score"]),
                weather_risk_score = float(row["weather_risk_score"]),
                permit_delay_days  = int(row["permit_delay_days"]),
            )
            db.add(p)
            created += 1
        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")

    db.commit()
    return {
        "message":    f"Successfully imported {created} projects",
        "created":    created,
        "total_rows": len(df),
        "errors":     errors,
    }