from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Contest(Base):
    __tablename__ = "contests"

    id = Column(String, primary_key=True)  # 例: abc350
    platform = Column(String, nullable=False)  # atcoder, codeforces, omc
    title = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration_min = Column(Integer, nullable=False)
    url = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now()) 
