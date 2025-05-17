from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contest import Contest
from app.schemas.contest import Contest as ContestSchema
from app.services.contest_updater import ContestUpdater
from app.services.calendar_sync import CalendarSyncService
from app.core.logger import logger
import json

router = APIRouter()

@router.get("/contests", response_model=List[ContestSchema])
async def list_contests(
    platform: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    指定されたプラットフォームの今後のコンテスト一覧を取得します。
    プラットフォームが指定されていない場合は、すべてのコンテストを返します。
    """
    query = db.query(Contest)
    
    if platform:
        query = query.filter(Contest.platform == platform)
    
    # 開始時間が現在以降のコンテストのみを取得
    from datetime import datetime
    query = query.filter(Contest.start_time >= datetime.utcnow())
    
    # 開始時間順にソート
    contests = query.order_by(Contest.start_time).all()
    
    return contests

@router.post("/admin/update-contests")
async def admin_update_contests(db: Session = Depends(get_db)):
    """
    コンテスト情報を手動で更新します。
    外部APIからコンテスト情報を取得し、データベースを更新します。
    """
    try:
        updater = ContestUpdater(db)
        updated, skipped = await updater.update_contests()
        return {
            "success": True,
            "message": "コンテスト情報を更新しました",
            "updated": updated,
            "skipped": skipped
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新に失敗しました: {str(e)}"
        }

@router.post("/sync/calendar")
async def sync_calendar(
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    コンテスト情報をGoogleカレンダーに同期します。
    """
    try:
        # 認証トークンを取得
        access_token = None
        refresh_token = None
        id_token = None
        
        if authorization and authorization.startswith("Bearer "):
            access_token = authorization.split(" ")[1]
            logger.info(f"Access token from header: {access_token[:10]}...")
        
        # リクエストボディからリフレッシュトークンとIDトークンを取得
        try:
            body = await request.json()
            logger.info(f"Request body: {json.dumps(body)}")
            
            refresh_token = body.get("refresh_token")
            id_token = body.get("id_token")
            
            # トークン情報の詳細をログ出力
            logger.info(f"Received tokens for calendar sync:")
            logger.info(f"- Access token: {access_token[:10] if access_token else 'None'}...")
            logger.info(f"- Refresh token: {refresh_token[:10] if refresh_token else 'None'}...")
            logger.info(f"- ID token: {id_token[:10] if id_token else 'None'}...")
        except json.JSONDecodeError:
            # ボディがJSONでない場合は無視
            logger.warning("Request body is not valid JSON")
        
        # カレンダー同期サービスを初期化
        sync_service = CalendarSyncService(
            db, 
            access_token=access_token,
            refresh_token=refresh_token,
            id_token=id_token
        )
        
        # 同期を実行
        result = await sync_service.sync_contests_to_calendar()
        
        return result
    except Exception as e:
        logger.error(f"Error in sync_calendar endpoint: {str(e)}")
        return {
            "success": False,
            "message": f"カレンダー同期に失敗しました: {str(e)}"
        } 
