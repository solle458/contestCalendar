import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.contest_updater import ContestUpdater
from app.core.logger import logger

class ContestScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.scheduler.add_job(
            self.update_contests,
            CronTrigger(hour=0, minute=0),  # 毎日0時に実行
            id="update_contests",
            replace_existing=True
        )

    async def update_contests(self):
        """コンテストデータを更新するジョブ"""
        logger.info("Starting scheduled contest update")
        db = SessionLocal()
        try:
            updater = ContestUpdater(db)
            updated, skipped = await updater.update_contests()
            logger.info(
                "Scheduled update completed",
                extra={
                    "updated": updated,
                    "skipped": skipped,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
        except Exception as e:
            logger.error(
                "Scheduled update failed",
                extra={"error": str(e)}
            )
        finally:
            db.close()

    def start(self):
        """スケジューラーを開始"""
        self.scheduler.start()
        logger.info("Contest scheduler started")

    def shutdown(self):
        """スケジューラーを停止"""
        self.scheduler.shutdown()
        logger.info("Contest scheduler stopped") 
