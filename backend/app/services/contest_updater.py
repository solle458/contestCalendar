from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.contest import Contest
from app.services.contest_fetcher import ContestFetcher
from app.core.logger import logger

class ContestUpdater:
    def __init__(self, db: Session):
        self.db = db
        self.fetcher = ContestFetcher()

    async def update_contests(self) -> tuple[int, int]:
        """
        コンテストデータを更新します。
        戻り値: (更新されたコンテスト数, スキップされたコンテスト数)
        """
        try:
            # 外部APIからコンテスト情報を取得
            new_contests = await self.fetcher.fetch_all_contests()
            
            updated_count = 0
            skipped_count = 0

            for contest_data in new_contests:
                # HttpUrlをstrに変換
                url_str = str(contest_data.url)
                
                # 既存のコンテストを検索
                existing_contest = self.db.query(Contest).filter(
                    Contest.id == contest_data.id,
                    Contest.platform == contest_data.platform
                ).first()

                if existing_contest:
                    # 既存のコンテストの情報を更新
                    existing_contest.title = contest_data.title
                    existing_contest.start_time = contest_data.start_time
                    existing_contest.duration_min = contest_data.duration_min
                    existing_contest.url = url_str
                    updated_count += 1
                else:
                    # 新しいコンテストを追加
                    new_contest = Contest(
                        id=contest_data.id,
                        platform=contest_data.platform,
                        title=contest_data.title,
                        start_time=contest_data.start_time,
                        duration_min=contest_data.duration_min,
                        url=url_str
                    )
                    self.db.add(new_contest)
                    updated_count += 1

            # 古いコンテストを削除（終了後1週間経過したもの）
            one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            # SQLAlchemyでは日時計算を直接行わず、日時比較のみを行う
            old_contests = self.db.query(Contest).filter(
                Contest.start_time < one_week_ago
            ).all()
            for contest in old_contests:
                self.db.delete(contest)
                skipped_count += 1

            self.db.commit()
            logger.info(
                "Contest update completed",
                extra={
                    "updated": updated_count,
                    "skipped": skipped_count
                }
            )
            return updated_count, skipped_count

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to update contests", extra={"error": str(e)})
            raise 
