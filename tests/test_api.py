"""
Basic tests for the POWERGRID Intelligence API.
Run with: pytest tests/
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Must be set before importing anything that reads DATABASE_URL
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from database import Base, get_db  # noqa: E402
from main import app               # noqa: E402

# Create a shared in-memory engine so all connections see the same tables
_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
Base.metadata.create_all(bind=_engine)


def override_get_db():
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "POWERGRID API running"


def test_create_and_list_projects():
    payload = {
        "name": "Test Project Alpha",
        "type": "substation",
        "region": "north",
        "budget_cr": 500.0,
        "terrain_score": 0.3,
        "duration_months": 12,
        "vendor_perf_score": 0.8,
        "weather_risk_score": 0.2,
        "permit_delay_days": 10,
    }
    r = client.post("/projects", json=payload)
    assert r.status_code == 200
    created = r.json()
    assert created["name"] == payload["name"]
    project_id = created["id"]

    r2 = client.get("/projects")
    assert r2.status_code == 200
    ids = [p["id"] for p in r2.json()]
    assert project_id in ids


def test_get_project_not_found():
    r = client.get("/projects/99999")
    assert r.status_code == 404


def test_predict_endpoint():
    payload = {
        "name": "Predict Test Project",
        "type": "overhead_line",
        "region": "east",
        "budget_cr": 800.0,
        "terrain_score": 0.6,
        "duration_months": 20,
        "vendor_perf_score": 0.5,
        "weather_risk_score": 0.7,
        "permit_delay_days": 45,
    }
    created = client.post("/projects", json=payload).json()
    pid = created["id"]

    r = client.get(f"/predict/{pid}")
    assert r.status_code == 200
    data = r.json()
    assert "cost_overrun_pct" in data
    assert "delay_days" in data
    assert isinstance(data["cost_overrun_pct"], (int, float))
    assert isinstance(data["delay_days"], int)


def test_hotspots_returns_list():
    r = client.get("/hotspots")
    assert r.status_code == 200
    assert "hotspots" in r.json()
    assert isinstance(r.json()["hotspots"], list)


def test_update_project():
    payload = {
        "name": "Update Target",
        "type": "underground_cable",
        "region": "west",
        "budget_cr": 300.0,
        "terrain_score": 0.2,
        "duration_months": 10,
        "vendor_perf_score": 0.9,
        "weather_risk_score": 0.1,
        "permit_delay_days": 5,
    }
    created = client.post("/projects", json=payload).json()
    pid = created["id"]

    updated_payload = {**payload, "budget_cr": 350.0}
    r = client.put(f"/projects/{pid}", json=updated_payload)
    assert r.status_code == 200
    assert r.json()["budget_cr"] == 350.0


def test_delete_project():
    payload = {
        "name": "To Be Deleted",
        "type": "substation",
        "region": "south",
        "budget_cr": 100.0,
        "terrain_score": 0.1,
        "duration_months": 6,
        "vendor_perf_score": 0.95,
        "weather_risk_score": 0.05,
        "permit_delay_days": 0,
    }
    created = client.post("/projects", json=payload).json()
    pid = created["id"]

    r = client.delete(f"/projects/{pid}")
    assert r.status_code == 200

    r2 = client.get(f"/projects/{pid}")
    assert r2.status_code == 404
