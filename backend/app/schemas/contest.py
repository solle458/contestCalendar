from datetime import datetime
from pydantic import BaseModel, HttpUrl

class ContestBase(BaseModel):
    platform: str
    title: str
    start_time: datetime
    duration_min: int
    url: HttpUrl

class ContestCreate(ContestBase):
    id: str

class Contest(ContestBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True 
