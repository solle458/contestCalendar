from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.setting import Setting
from app.schemas.setting import Setting as SettingSchema, SettingCreate
from app.core.logger import logger

router = APIRouter()

@router.get("/settings", response_model=List[SettingSchema])
async def list_settings(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    ユーザーの設定一覧を取得します。
    """
    logger.info("GET /settings - 設定一覧を取得します")
    try:
        # 本来はユーザーIDに基づいてフィルタリングするべきですが、
        # 簡略化のためすべての設定を返します
        settings = db.query(Setting).all()
        logger.info(f"データベースから {len(settings)} 件の設定を取得しました")
        
        # 設定がない場合はデフォルト設定を作成して返す
        if not settings:
            logger.info("設定がありません。デフォルト設定を作成します")
            default_platforms = ["atcoder", "codeforces", "omc"]
            default_settings = []
            
            for platform in default_platforms:
                setting = Setting(
                    platform=platform,
                    notify_before_min=30,
                    enabled=True
                )
                db.add(setting)
                default_settings.append(setting)
                logger.info(f"デフォルト設定を作成: {platform}")
            
            db.commit()
            settings = default_settings
            logger.info(f"{len(settings)} 件のデフォルト設定を作成しました")
        
        return settings
    except Exception as e:
        logger.error(f"Error in list_settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"設定の取得に失敗しました: {str(e)}")

@router.put("/settings", response_model=SettingSchema)
async def update_setting(
    setting: SettingCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    ユーザーの設定を更新します。
    """
    try:
        # 既存の設定を検索
        db_setting = db.query(Setting).filter(Setting.platform == setting.platform).first()
        
        if db_setting:
            # 既存の設定を更新
            db_setting.notify_before_min = setting.notify_before_min
            db_setting.enabled = setting.enabled
            db.commit()
            db.refresh(db_setting)
            return db_setting
        else:
            # 新しい設定を作成
            new_setting = Setting(
                platform=setting.platform,
                notify_before_min=setting.notify_before_min,
                enabled=setting.enabled
            )
            db.add(new_setting)
            db.commit()
            db.refresh(new_setting)
            return new_setting
    except Exception as e:
        logger.error(f"Error in update_setting: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"設定の更新に失敗しました: {str(e)}") 
