from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import contests
from app.api import settings
from app.core.scheduler import ContestScheduler
from app.core.logger import logger
from app.core.database import engine, Base
from app.models import contest, setting

app = FastAPI(title="Contest Calendar API")

# データベーステーブルの作成
Base.metadata.create_all(bind=engine)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターの登録
app.include_router(contests.router, prefix="/api")
app.include_router(settings.router, prefix="/api")

# スケジューラーの初期化
scheduler = ContestScheduler()

@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    scheduler.start()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    scheduler.shutdown()
    logger.info("Application shutdown")

@app.get("/")
async def root():
    return {"message": "Welcome to Contest Calendar API"} 
