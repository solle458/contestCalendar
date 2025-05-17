from pydantic import BaseModel, Field
from typing import Optional

class SettingBase(BaseModel):
    """設定の基本スキーマ"""
    platform: str
    notify_before_min: int = Field(default=30, ge=5, le=1440)
    enabled: bool = True

class SettingCreate(SettingBase):
    """設定作成用スキーマ"""
    pass

class Setting(SettingBase):
    """設定レスポンス用スキーマ"""
    id: int

    class Config:
        from_attributes = True 
