import os, joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

COST_PATH     = "cost_model.pkl"
TIMELINE_PATH = "timeline_model.pkl"

cost_model     = joblib.load(COST_PATH)     if os.path.exists(COST_PATH)     else None
timeline_model = joblib.load(TIMELINE_PATH) if os.path.exists(TIMELINE_PATH) else None

TYPE_MAP   = {"substation": 0, "overhead_line": 1, "underground_cable": 2}
REGION_MAP = {"north": 0, "south": 1, "east": 2, "west": 3}

def _features(p):
    return pd.DataFrame([{
        "type_enc":    TYPE_MAP.get(p.type.lower(), 0),
        "region_enc":  REGION_MAP.get(p.region.lower(), 0),
        "budget_cr":   p.budget_cr,
        "terrain":     p.terrain_score,
        "duration":    p.duration_months,
        "vendor":      p.vendor_perf_score,
        "weather":     p.weather_risk_score,
        "permit_days": p.permit_delay_days,
    }])

def predict_cost(p):
    if cost_model is None:
        risk = (p.terrain_score*0.3 + p.weather_risk_score*0.2 +
                (p.permit_delay_days/180)*0.3 + (1-p.vendor_perf_score)*0.2)
        return round(risk * 40, 2)
    return round(float(cost_model.predict(_features(p))[0]), 2)

def predict_timeline(p):
    if timeline_model is None:
        return (p.permit_delay_days + int(p.terrain_score*60) +
                int(p.weather_risk_score*45) + int((1-p.vendor_perf_score)*30))
    return int(timeline_model.predict(_features(p))[0])

def get_hotspots(projects):
    results = []
    for p in projects:
        score = min(round(
            p.weather_risk_score*0.25 + (p.permit_delay_days/180)*0.35 +
            (1-p.vendor_perf_score)*0.25 + p.terrain_score*0.15, 3), 1.0)
        if score >= 0.4:
            factors = []
            if p.permit_delay_days > 60:   factors.append(f"Permit delay: {p.permit_delay_days}d")
            if p.weather_risk_score > 0.6: factors.append(f"Weather risk: {p.weather_risk_score}")
            if p.vendor_perf_score  < 0.5: factors.append(f"Poor vendor: {p.vendor_perf_score}")
            if p.terrain_score      > 0.7: factors.append(f"Hard terrain: {p.terrain_score}")
            results.append({
                "project_id":   p.id,
                "project_name": p.name,
                "region":       p.region,
                "type":         p.type,
                "risk_score":   score,
                "risk_level":   "critical" if score>=0.75 else "high" if score>=0.6 else "medium",
                "top_factors":  factors or ["No major individual factors"],
            })
    return sorted(results, key=lambda x: -x["risk_score"])

def train_and_save(projects):
    global cost_model, timeline_model
    rows = []
    for p in projects:
        f = _features(p).iloc[0].to_dict()
        f["cost_overrun"] = max(0, round(
            p.terrain_score*12 + p.weather_risk_score*8 +
            (p.permit_delay_days/30)*5 + (1-p.vendor_perf_score)*10 +
            np.random.normal(0, 2), 2))
        f["delay_days"] = max(0,
            p.permit_delay_days + int(p.terrain_score*45) +
            int(p.weather_risk_score*30) + int((1-p.vendor_perf_score)*20) +
            int(np.random.normal(0, 5)))
        rows.append(f)

    df   = pd.DataFrame(rows)
    COLS = ["type_enc","region_enc","budget_cr","terrain","duration","vendor","weather","permit_days"]
    X    = df[COLS]

    # Train cost model
    X_train, X_test, y_train, y_test = train_test_split(X, df["cost_overrun"], test_size=0.2, random_state=42)
    cost_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    cost_model.fit(X_train, y_train)
    cost_mae = round(mean_absolute_error(y_test, cost_model.predict(X_test)), 2)
    joblib.dump(cost_model, COST_PATH)

    # Train timeline model
    X_train2, X_test2, y_train2, y_test2 = train_test_split(X, df["delay_days"], test_size=0.2, random_state=42)
    timeline_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    timeline_model.fit(X_train2, y_train2)
    timeline_mae = round(mean_absolute_error(y_test2, timeline_model.predict(X_test2)), 2)
    joblib.dump(timeline_model, TIMELINE_PATH)

    return {
        "status": "Models trained and saved",
        "projects_used": len(projects),
        "cost_model_mae": f"{cost_mae}%",
        "timeline_model_mae": f"{timeline_mae} days",
    }