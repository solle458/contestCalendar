from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# データベースURL
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://contest_calendar:contest_calendar@localhost:5432/contest_calendar")

# エンジンの作成
engine = create_engine(DATABASE_URL)

# セッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデルのベースクラス
Base = declarative_base()

# 依存関係注入用の関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
