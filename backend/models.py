from sqlalchemy import Column, Integer, String, Float
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id                 = Column(Integer, primary_key=True, index=True)
    name               = Column(String,  nullable=False)
    type               = Column(String,  nullable=False)   # substation / overhead_line / underground_cable
    region             = Column(String,  nullable=False)   # north / south / east / west
    budget_cr          = Column(Float,   default=0)        # Budget in Crore INR
    terrain_score      = Column(Float,   default=0.5)      # 0.0 = flat  →  1.0 = very difficult
    duration_months    = Column(Integer, default=12)
    vendor_perf_score  = Column(Float,   default=0.8)      # 0.0 = poor  →  1.0 = excellent
    weather_risk_score = Column(Float,   default=0.3)      # 0.0 = safe  →  1.0 = high risk
    permit_delay_days  = Column(Integer, default=0)