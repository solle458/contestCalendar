from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.contest import Contest
from app.core.logger import logger
import google.oauth2.credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
import json

class CalendarSyncService:
    """
    Googleカレンダーへのコンテスト同期を行うサービスクラス
    """
    
    def __init__(self, db: Session, access_token: Optional[str] = None, refresh_token: Optional[str] = None, id_token: Optional[str] = None):
        self.db = db
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.id_token = id_token
    
    async def sync_contests_to_calendar(self) -> Dict[str, Any]:
        """
        コンテスト情報をGoogleカレンダーに同期します
        """
        try:
            # アクセストークンがない場合はエラー
            if not self.access_token:
                logger.error("No access token provided for calendar sync")
                return {
                    "success": False,
                    "message": "カレンダー同期に失敗しました: アクセストークンがありません",
                    "synced_contests": 0
                }
            
            # 開催予定のコンテストを取得
            now = datetime.utcnow()
            upcoming_contests = self.db.query(Contest).filter(
                Contest.start_time >= now
            ).order_by(Contest.start_time).all()
            
            logger.info(f"Found {len(upcoming_contests)} upcoming contests to sync")
            
            # 環境変数から認証情報を取得
            client_id = os.environ.get("GOOGLE_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
            
            logger.info(f"Using client_id: {client_id[:10]}... and client_secret: {client_secret[:5]}...")
            
            if not client_id or not client_secret:
                logger.error("Missing Google OAuth credentials in environment variables")
                return {
                    "success": False,
                    "message": "カレンダー同期に失敗しました: Google認証情報が設定されていません",
                    "synced_contests": 0
                }
            
            # トークン情報のログ出力
            logger.info(f"Using tokens - access_token: {bool(self.access_token)}, refresh_token: {bool(self.refresh_token)}, id_token: {bool(self.id_token)}")
            
            # モックモードでの動作（テスト用）
            mock_mode = os.environ.get("MOCK_CALENDAR_API", "false").lower() == "true"
            if mock_mode:
                logger.info("Running in mock mode, not actually calling Google Calendar API")
                return {
                    "success": True,
                    "message": f"モックモード: {len(upcoming_contests)}件のコンテストをカレンダーに同期しました",
                    "synced_contests": len(upcoming_contests)
                }
            
            # 認証情報を作成
            try:
                # クライアントIDとシークレットを取得
                client_id = os.environ.get("GOOGLE_CLIENT_ID")
                client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
                
                # 認証情報のデバッグ出力
                logger.info(f"Access token (first 10 chars): {self.access_token[:10] if self.access_token else 'None'}...")
                logger.info(f"Refresh token exists: {bool(self.refresh_token)}")
                logger.info(f"ID token exists: {bool(self.id_token)}")
                
                # アクセストークンとリフレッシュトークンを使用して認証情報を作成
                credentials = None
                
                # トークン情報をデバッグ出力
                token_info = {
                    "token": self.access_token,
                    "client_id": client_id,
                    "client_secret": client_secret[:5] + "..." if client_secret else None,
                }
                
                if self.refresh_token:
                    logger.info("Using refresh token to create credentials")
                    token_info["refresh_token"] = self.refresh_token[:10] + "..." if self.refresh_token else None
                    token_info["token_uri"] = "https://oauth2.googleapis.com/token"
                    
                    credentials = google.oauth2.credentials.Credentials(
                        token=self.access_token,
                        refresh_token=self.refresh_token,
                        token_uri="https://oauth2.googleapis.com/token",
                        client_id=client_id,
                        client_secret=client_secret
                    )
                else:
                    logger.info("Using access token only to create credentials")
                    credentials = google.oauth2.credentials.Credentials(
                        token=self.access_token,
                        client_id=client_id,
                        client_secret=client_secret
                    )
                
                logger.info(f"Created credentials with: {token_info}")
                
                # Google Calendar APIサービスを作成
                logger.info("Building Google Calendar API service")
                service = build('calendar', 'v3', credentials=credentials)
                logger.info("Successfully built Google Calendar API service")
                
                # カレンダーIDを取得（プライマリカレンダーを使用）
                calendar_id = 'primary'
                logger.info(f"Using calendar ID: {calendar_id}")
                
                # カレンダー情報を取得して確認
                try:
                    calendar_info = service.calendars().get(calendarId=calendar_id).execute()
                    logger.info(f"Successfully accessed calendar: {calendar_info.get('summary')}")
                except Exception as e:
                    logger.error(f"Error accessing calendar: {str(e)}")
                    return {
                        "success": False,
                        "message": f"カレンダーへのアクセスに失敗しました: {str(e)}",
                        "synced_contests": 0
                    }
                
                # 同期済みイベント数をカウント
                synced_count = 0
                
                # 処理するコンテストの数を出力
                logger.info(f"Processing {len(upcoming_contests)} upcoming contests")
                
                for contest in upcoming_contests:
                    # イベントの開始時間と終了時間を計算
                    start_time = contest.start_time
                    end_time = start_time + timedelta(minutes=contest.duration_min)
                    
                    # イベント情報を作成
                    event = {
                        'summary': f"[{contest.platform.upper()}] {contest.title}",
                        'description': f"コンテストURL: {contest.url}",
                        'start': {
                            'dateTime': start_time.isoformat(),
                            'timeZone': 'Asia/Tokyo',
                        },
                        'end': {
                            'dateTime': end_time.isoformat(),
                            'timeZone': 'Asia/Tokyo',
                        },
                        'reminders': {
                            'useDefault': True
                        },
                    }
                    
                    try:
                        # 既存のイベントを検索（重複防止）
                        # より厳密な検索条件を設定
                        # タイトルの一部とURLの一部を組み合わせて検索
                        platform_tag = f"[{contest.platform.upper()}]"
                        logger.info(f"Searching for existing event with platform tag: {platform_tag}")
                        
                        # 開始時間の前後1日で検索
                        time_min = (start_time - timedelta(days=1)).isoformat() + 'Z'
                        time_max = (start_time + timedelta(days=1)).isoformat() + 'Z'
                        
                        events_result = service.events().list(
                            calendarId=calendar_id,
                            q=platform_tag,
                            timeMin=time_min,
                            timeMax=time_max,
                            singleEvents=True
                        ).execute()
                        
                        existing_events = events_result.get('items', [])
                        logger.info(f"Found {len(existing_events)} existing events in the time range")
                        
                        # 既存イベントの中から、このコンテストと一致するものを探す
                        is_duplicate = False
                        for existing in existing_events:
                            existing_summary = existing.get('summary', '')
                            existing_desc = existing.get('description', '')
                            
                            # タイトルとURLの両方が一致する場合は重複とみなす
                            if (platform_tag in existing_summary and 
                                contest.title in existing_summary and
                                contest.url in existing_desc):
                                is_duplicate = True
                                logger.info(f"Found duplicate event: {existing_summary}")
                                break
                        
                        if not is_duplicate:
                            # イベントを作成
                            logger.info(f"Creating new event for contest: {contest.title}")
                            try:
                                # イベント情報をログ出力
                                logger.info(f"Event data: {json.dumps(event)}")
                                
                                # イベント作成を試行
                                created_event = service.events().insert(
                                    calendarId=calendar_id,
                                    body=event
                                ).execute()
                                
                                # 作成されたイベントのリンクを表示
                                event_link = created_event.get('htmlLink', 'No link available')
                                logger.info(f"Event created successfully: {event_link}")
                                synced_count += 1
                            except HttpError as error:
                                error_content = error.content.decode() if hasattr(error, 'content') else str(error)
                                logger.error(f"Error creating event for contest {contest.title}: {error_content}")
                                # エラーの詳細情報を出力
                                if hasattr(error, 'resp'):
                                    logger.error(f"Response status: {error.resp.status}")
                                    logger.error(f"Response reason: {error.resp.reason}")
                        else:
                            logger.info(f"Skipping duplicate event for contest: {contest.title}")
                    
                    except HttpError as error:
                        logger.error(f"Error searching for events: {error.content.decode() if hasattr(error, 'content') else str(error)}")
                        if hasattr(error, 'resp'):
                            logger.error(f"Response status: {error.resp.status}")
                            logger.error(f"Response reason: {error.resp.reason}")
                
                return {
                    "success": True,
                    "message": f"{synced_count}件のコンテストをカレンダーに同期しました",
                    "synced_contests": synced_count
                }
                
            except Exception as e:
                logger.error(f"Error creating Google Calendar service: {str(e)}")
                return {
                    "success": False,
                    "message": f"カレンダー同期に失敗しました: Google Calendar APIの初期化エラー: {str(e)}",
                    "synced_contests": 0
                }
            
        except Exception as e:
            logger.error(f"Failed to sync contests to calendar: {str(e)}")
            return {
                "success": False,
                "message": f"カレンダー同期に失敗しました: {str(e)}",
                "synced_contests": 0
            } 
