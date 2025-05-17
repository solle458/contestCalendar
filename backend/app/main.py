from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import contests
from app.core.scheduler import ContestScheduler
from app.core.logger import logger

app = FastAPI(title="Contest Calendar API")

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターの登録
app.include_router(contests.router, prefix="/api")

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
