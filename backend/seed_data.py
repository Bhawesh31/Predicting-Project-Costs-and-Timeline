"""
seed_data.py  —  Run once to load demo projects and train ML models.
Usage:  python seed_data.py
"""
import requests

API = "http://localhost:8000"

PROJECTS = [
    {"name":"PGCIL-NR-4412 Rajasthan-Agra 765kV",    "type":"overhead_line",     "region":"north","budget_cr":2840,"terrain_score":0.7,"duration_months":36,"vendor_perf_score":0.45,"weather_risk_score":0.75,"permit_delay_days":120},
    {"name":"PGCIL-SR-2201 Chennai 400kV Substation", "type":"substation",        "region":"south","budget_cr":1250,"terrain_score":0.3,"duration_months":24,"vendor_perf_score":0.50,"weather_risk_score":0.80,"permit_delay_days":90},
    {"name":"PGCIL-ER-3301 Odisha Coastal 220kV",     "type":"overhead_line",     "region":"east", "budget_cr":980, "terrain_score":0.6,"duration_months":20,"vendor_perf_score":0.40,"weather_risk_score":0.90,"permit_delay_days":150},
    {"name":"PGCIL-WR-3310 Mumbai-Pune UG Cable",     "type":"underground_cable", "region":"west", "budget_cr":3200,"terrain_score":0.5,"duration_months":30,"vendor_perf_score":0.65,"weather_risk_score":0.45,"permit_delay_days":60},
    {"name":"PGCIL-ER-1105 Kolkata Ring Substation",  "type":"substation",        "region":"east", "budget_cr":740, "terrain_score":0.2,"duration_months":18,"vendor_perf_score":0.70,"weather_risk_score":0.50,"permit_delay_days":45},
    {"name":"PGCIL-SR-1880 Bangalore 220kV GIS",      "type":"substation",        "region":"south","budget_cr":890, "terrain_score":0.35,"duration_months":22,"vendor_perf_score":0.75,"weather_risk_score":0.35,"permit_delay_days":30},
    {"name":"PGCIL-WR-2240 Gujarat 400kV Line",       "type":"overhead_line",     "region":"west", "budget_cr":1650,"terrain_score":0.4,"duration_months":28,"vendor_perf_score":0.60,"weather_risk_score":0.55,"permit_delay_days":55},
    {"name":"PGCIL-NR-5502 Himachal 220kV Line",      "type":"overhead_line",     "region":"north","budget_cr":620, "terrain_score":0.8,"duration_months":24,"vendor_perf_score":0.85,"weather_risk_score":0.25,"permit_delay_days":10},
    {"name":"PGCIL-SR-3340 Hyderabad UG Cable Ring",  "type":"underground_cable", "region":"south","budget_cr":1100,"terrain_score":0.2,"duration_months":20,"vendor_perf_score":0.90,"weather_risk_score":0.20,"permit_delay_days":8},
    {"name":"PGCIL-NR-2210 Delhi NCR 400kV Sub",      "type":"substation",        "region":"north","budget_cr":1800,"terrain_score":0.15,"duration_months":26,"vendor_perf_score":0.88,"weather_risk_score":0.30,"permit_delay_days":20},
    {"name":"PGCIL-WR-4450 Pune Industrial 132kV",    "type":"substation",        "region":"west", "budget_cr":430, "terrain_score":0.2,"duration_months":14,"vendor_perf_score":0.92,"weather_risk_score":0.20,"permit_delay_days":5},
    {"name":"PGCIL-ER-2290 Jharkhand Mining Corridor","type":"overhead_line",     "region":"east", "budget_cr":760, "terrain_score":0.55,"duration_months":22,"vendor_perf_score":0.78,"weather_risk_score":0.40,"permit_delay_days":35},
]

def seed():
    print("Connecting to backend...")
    try:
        requests.get(f"{API}/")
        print("Backend is running\n")
    except:
        print("ERROR: Backend not running. Start it first: uvicorn main:app --reload")
        return

    ok = 0
    for p in PROJECTS:
        r = requests.post(f"{API}/projects", json=p)
        if r.status_code == 200:
            print(f"  + {p['name']}")
            ok += 1
        else:
            print(f"  FAILED: {p['name']}")

    print(f"\n{ok}/{len(PROJECTS)} projects created")
    print("\nTraining ML models...")
    r = requests.post(f"{API}/train")
    if r.status_code == 200:
        d = r.json()
        print(f"  {d['status']}")
        print(f"  Cost MAE:     {d['cost_model_mae']}")
        print(f"  Timeline MAE: {d['timeline_model_mae']}")
    else:
        print(f"  Training failed: {r.text}")
    print("\nDone! Open http://localhost:5173")

if __name__ == "__main__":
    seed()