from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from app.core.database import Base
from sqlalchemy.sql.sqltypes import Integer

class Setting(Base):
    """ユーザーの設定モデル"""
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True)
    notify_before_min = Column(Integer, default=30)
    enabled = Column(Boolean, default=True) 
